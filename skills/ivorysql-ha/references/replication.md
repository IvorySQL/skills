---
title: IvorySQL High Availability Architecture
description: Detailed explanation of IvorySQL HA architecture, covering streaming replication, logical replication, Patroni cluster, PgPool-II connection pooling and load balancing
tags:
  - ivorysql
  - ha
  - replication
  - streaming
  - logical
  - patroni
  - pgpool
---

# IvorySQL High Availability Architecture

## Overview

IvorySQL inherits PostgreSQL's high availability capabilities, providing multiple HA solutions: streaming replication for physical-level synchronization, logical replication for selective data synchronization, Patroni for automatic failover, and PgPool-II for connection pooling and load balancing.

## High Availability Architecture Overview

```
                    Application Layer
                         |
                    PgPool-II / HAProxy
                   /       |        \
             Primary    Standby1   Standby2
             (RW)       (RO)       (RO)
                 \       |        /
              Shared Storage / WAL Archiving
```

## Streaming Replication

### Architecture Principles

```
Primary Node                    Standby Node
+------------------+           +------------------+
| WAL Sender       |----WAL--->| WAL Receiver     |
|                  |  Stream   |                  |
| shared_buffers   |           | redo + apply    |
| Data Files       |           | Data Files      |
+------------------+           +------------------+
```

### Primary Node Configuration

```ini
# postgresql.conf (Primary)
listen_addresses = '*'
port = 5432
ivorysql.port = 1521
ivorysql.listen_mode = '*'

# WAL Configuration
wal_level = replica
max_wal_senders = 10
max_replication_slots = 10
wal_keep_size = 1GB

# Synchronous replication (optional)
synchronous_commit = on
synchronous_standby_names = 'ANY 1 (standby1, standby2)'

# Hot standby
hot_standby = on
hot_standby_feedback = on

# WAL archiving
archive_mode = on
archive_command = 'cp %p /var/lib/ivorysql/archive/%f'
```

```conf
# pg_hba.conf (Primary)
# Allow replication connections
host    replication     replicator      192.168.1.0/24          scram-sha-256
```

### Create Replication User

```sql
-- Create on primary node
CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replication_password';
```

### Standby Node Configuration

```bash
# Create base backup using pg_basebackup
pg_basebackup \
    -h primary-host \
    -U replicator \
    -D /var/lib/ivorysql/standby-data \
    -Fp -Xs -P -R

# -R option automatically creates standby.signal and postgresql.auto.conf
```

```ini
# postgresql.conf (Standby)
primary_conninfo = 'host=primary-host port=5432 user=replicator password=replication_password'
primary_slot_name = 'standby1'
hot_standby = on
```

### Synchronous vs Asynchronous Replication

| Feature | Synchronous | Asynchronous |
|------|---------|---------|
| Data safety | Zero data loss | May lose small amount of data |
| Write latency | Increases network RTT | No additional latency |
| Availability | Standby failure affects writes | Standby failure has no impact |
| Use case | Finance/core business | Reports/read scaling |

```ini
# Synchronous replication configuration
synchronous_commit = on
synchronous_standby_names = 'FIRST 1 (standby1, standby2)'

# Asynchronous replication configuration
synchronous_commit = off
# Do not set synchronous_standby_names
```

### Replication Slots

```sql
-- Create replication slot (prevents WAL cleanup)
SELECT pg_create_physical_replication_slot('standby1');

-- View replication slots
SELECT slot_name, slot_type, active FROM pg_replication_slots;

-- Delete replication slot
SELECT pg_drop_replication_slot('standby1');
```

### Monitor Replication Status

```sql
-- View replication status on primary
SELECT pid, usename, client_addr, state,
       sent_lsn, write_lsn, flush_lsn, replay_lsn,
       (sent_lsn - replay_lsn) AS replication_lag
FROM pg_stat_replication;

-- View replication delay (time)
SELECT now() - pg_last_xact_replay_timestamp() AS replication_delay;

-- View receiver status on standby
SELECT status, sender_host, sender_port, received_lsn, latest_end_lsn
FROM pg_stat_wal_receiver;
```

### Cascading Replication

```
Primary -> Standby1 -> Standby3
                 \-> Standby4
```

```ini
# Standby1 configuration (also acts as cascade primary)
# In addition to standby configuration, also needs
wal_keep_size = 1GB
max_wal_senders = 5

# Standby3 configuration
primary_conninfo = 'host=standby1-host port=5432 user=replicator'
```

## Logical Replication

### Architecture Principles

```
Publisher                       Subscriber
+------------------+           +------------------+
| Publication      |---DDL---->| Subscription     |
| (Table/Schema)   |  Logical  | (Table/Schema)   |
| WAL logical decode| Decode   | Apply Worker     |
+------------------+           +------------------+
```

### Publisher Configuration

```ini
# postgresql.conf (Publisher)
wal_level = logical
max_replication_slots = 10
max_wal_senders = 10
```

```sql
-- Create publication (entire schema)
CREATE PUBLICATION my_pub FOR ALL TABLES;

-- Create publication (specific tables)
CREATE PUBLICATION my_pub FOR TABLE employees, departments;

-- Create publication (all tables in schema)
CREATE PUBLICATION my_pub FOR TABLES IN SCHEMA app_schema;

-- View publications
SELECT * FROM pg_publication;
SELECT * FROM pg_publication_tables;
```

### Subscriber Configuration

```sql
-- Create subscription
CREATE SUBSCRIPTION my_sub
    CONNECTION 'host=publisher-host port=5432 dbname=mydb user=replicator password=xxx'
    PUBLICATION my_pub;

-- Specify replication slot
CREATE SUBSCRIPTION my_sub
    CONNECTION 'host=publisher-host port=5432 dbname=mydb user=replicator'
    PUBLICATION my_pub
    WITH (create_slot = true, slot_name = 'my_sub_slot');

-- View subscription status
SELECT * FROM pg_stat_subscription;

-- Disable/enable subscription
ALTER SUBSCRIPTION my_sub DISABLE;
ALTER SUBSCRIPTION my_sub ENABLE;

-- Refresh publication
ALTER SUBSCRIPTION my_sub REFRESH PUBLICATION;

-- Delete subscription
DROP SUBSCRIPTION my_sub;
```

### Logical Replication Limitations

- Does not replicate DDL changes (manual schema sync required)
- Does not replicate sequence values (manual sync required)
- Does not replicate large objects (except BYTEA)
- TRUNCATE requires additional options
- Primary key must exist

```sql
-- Enable TRUNCATE replication
CREATE PUBLICATION my_pub FOR TABLE employees WITH (publish = 'insert, update, delete, truncate');

-- Sequence synchronization
-- Get current value on publisher
SELECT last_value FROM emp_seq;
-- Set on subscriber
SELECT setval('emp_seq', <value>);
```

## Patroni Cluster

### Architecture Principles

```
         +----------+
         |   etcd   |  DCS (Distributed Configuration Store)
         +----------+
          /    |    \
   Patroni-1  Patroni-2  Patroni-3
   (Primary)  (Standby)  (Standby)
```

### Install Patroni

```bash
# pip install
pip install patroni[etcd]

# RPM install
yum install -y patroni patroni-etcd
```

### Patroni Configuration

```yaml
# /etc/patroni/config.yml (node1)
scope: ivorysql-cluster
name: node1

restapi:
  listen: 0.0.0.0:8008
  connect_address: node1:8008

etcd:
  hosts: etcd1:2379,etcd2:2379,etcd3:2379

bootstrap:
  dcs:
    ttl: 30
    loop_wait: 10
    retry_timeout: 10
    maximum_lag_on_failover: 1048576
    postgresql:
      use_pg_rewind: true
      use_slots: true
      parameters:
        wal_level: replica
        hot_standby: "on"
        max_wal_senders: 10
        max_replication_slots: 10
        wal_log_hints: "on"
        ivorysql.enable_oracle_compatible: "true"
        ivorysql.port: "1521"
        ivorysql.listen_mode: "*"

postgresql:
  listen: 0.0.0.0:5432
  connect_address: node1:5432
  data_dir: /var/lib/ivorysql/data
  bin_dir: /usr/ivorysql/5/bin
  pgpass: /tmp/pgpass0
  authentication:
    replication:
      username: replicator
      password: replication_password
    superuser:
      username: ivorysql
      password: superuser_password
    rewind:
      username: rewind_user
      password: rewind_password
  parameters:
    shared_buffers: "2GB"
    max_connections: "200"
    ivorysql.enable_oracle_compatible: "true"
    ivorysql.port: "1521"

tags:
  nofailover: false
  noloadbalance: false
  clonefrom: false
```

### Start Patroni

```bash
# Start Patroni service
patroni /etc/patroni/config.yml &

# Or use systemd
systemctl start patroni
systemctl enable patroni
```

### Cluster Management

```bash
# View cluster status
patronictl -c /etc/patroni/config.yml list

# View cluster configuration
patronictl -c /etc/patroni/config.yml show-config

# Manual failover
patronictl -c /etc/patroni/config.yml failover

# Planned switchover
patronictl -c /etc/patroni/config.yml switchover

# Specify new primary
patronictl -c /etc/patroni/config.yml switchover --master node1 --candidate node2

# Reload configuration
patronictl -c /etc/patroni/config.yml reload node1

# Reinitialize node
patronictl -c /etc/patroni/config.yml reinit ivorysql-cluster node3

# Pause/resume automatic failover
patronictl -c /etc/patroni/config.yml pause
patronictl -c /etc/patroni/config.yml resume
```

## PgPool-II

### Installation

```bash
# RPM install
yum install -y pgpool-II pgpool-II-extensions

# Source compilation
./configure --prefix=/usr/local/pgpool2
make && make install
```

### Configuration

```ini
; pgpool.conf
; Basic configuration
listen_addresses = '*'
port = 9999

; Backend node configuration
backend_hostname0 = 'node1'
backend_port0 = 5432
backend_weight0 = 1
backend_data_directory0 = '/var/lib/ivorysql/data'
backend_flag0 = 'ALLOW_TO_FAILOVER'

backend_hostname1 = 'node2'
backend_port1 = 5432
backend_weight1 = 1
backend_data_directory1 = '/var/lib/ivorysql/data'
backend_flag1 = 'ALLOW_TO_FAILOVER'

backend_hostname2 = 'node3'
backend_port2 = 5432
backend_weight2 = 1
backend_data_directory2 = '/var/lib/ivorysql/data'
backend_flag2 = 'ALLOW_TO_FAILOVER'

; Connection pool
num_init_children = 50
max_pool = 4
child_life_time = 300
connection_life_time = 0
child_max_connections = 0

; Load balancing
load_balance_mode = on
ignore_leading_white_space = on

; Replication mode
replication_mode = off
master_slave_mode = on
master_slave_sub_mode = 'stream'

; Health check
health_check_period = 10
health_check_timeout = 20
health_check_user = 'pgpool'
health_check_password = 'pgpool_password'
health_check_max_retries = 3

; Failover
failover_command = '/usr/local/bin/failover.sh %d %h %p %D %H %P %m %M'
follow_master_command = '/usr/local/bin/follow_master.sh %d %h %p %D %H %m %M'

; Watchdog
use_watchdog = on
wd_hostname = 'node1'
wd_port = 9000

; Other nodes
wd_life_point = 3
wd_interval = 10

; PCP configuration
pcp_listen_addresses = '*'
pcp_port = 9898
```

### PgPool-II Management

```bash
# Start
pgpool -n -d &

# View node status
pcp_node_info -h localhost -p 9898 -U pgpool

# Attach node
pcp_attach_node -h localhost -p 9898 -U pgpool -n 2

# Detach node
pcp_detach_node -h localhost -p 9898 -U pgpool -n 2

# Stop
pgpool -m smart stop
```

## Failover Solution Comparison

| Solution | Automatic Failover | Read/Write Split | Connection Pool | Complexity |
|------|------------|---------|--------|--------|
| Streaming replication + manual switch | No | Application level | External required | Low |
| Patroni | Yes | Requires HAProxy | External required | Medium |
| PgPool-II | Yes | Yes | Yes | High |
| Patroni + PgPool-II | Yes | Yes | Yes | High |
| Patroni + HAProxy | Yes | Yes | External required | Medium |

## Recommended Architectures

### Small Deployment (2 nodes)

```
App -> HAProxy -> Primary (RW)
                 Standby (RO)
           etcd (co-located)
```

### Medium Deployment (3 nodes)

```
App -> HAProxy -> Primary (RW)
                 Standby1 (RO)
                 Standby2 (RO)
          etcd Cluster (3 nodes)
```

### Large Deployment

```
App -> PgPool-II -> Primary (RW)
    (Connection Pool+LB)  Standby1 (RO)
                          Standby2 (RO)
         Patroni (Automatic failover)
         etcd Cluster (3 nodes)
         WAL Archiving -> Object Storage
```
