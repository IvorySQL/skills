---
title: IvorySQL Dual Port Configuration Details
description: Detailed explanation of IvorySQL dual port architecture, including PG port (5432) and Oracle compatibility port (1521) configuration, listen_mode parameter, compile options, and network architecture
tags:
  - ivorysql
  - config
  - dual-port
  - oracle-port
  - listen-mode
  - oraport
---

# IvorySQL Dual Port Configuration Details

## Overview

One of IvorySQL's core features is the dual port architecture: simultaneously providing a PostgreSQL native port (default 5432) and an Oracle compatibility port (default 1521). Through dual ports, IvorySQL can serve both PostgreSQL clients and Oracle-compatible clients on the same database instance, achieving transparent Oracle protocol compatibility.

## Dual Port Architecture

```
                    +---------------------------+
                    |     IvorySQL Instance     |
                    |                           |
PG Client ----5432-->|  PG Protocol Handler     |
 (psql, JDBC)       |                           |
                    |  Shared Storage Engine    |
                    |                           |
Oracle Client--1521-->| Oracle Compat Protocol   |
 (OCI, Pro*C)       |    Handler                |
                    +---------------------------+
```

### Port Feature Comparison

| Feature | PG Port (5432) | Oracle Port (1521) |
|------|---------------|-------------------|
| Default port number | 5432 | 1521 |
| Protocol | PostgreSQL Wire Protocol | Oracle Compatible Protocol |
| Clients | psql, pgAdmin, JDBC(PG) | OCI, Pro*C, JDBC(Oracle) |
| Compatibility Mode | PostgreSQL Standard | Oracle Compatibility |
| SQL Dialect | PostgreSQL | Oracle Compatible Syntax |
| Data Types | PG Native Types | Oracle Compatible Types |

## Configuration Methods

### 1. postgresql.conf Configuration

```ini
# PG port configuration
listen_addresses = '*'
port = 5432

# Oracle compatibility port configuration
ivorysql.port = 1521
ivorysql.listen_mode = '*'

# Enable Oracle compatibility mode
ivorysql.enable_oracle_compatible = true
```

### 2. Command-Line Parameters

```bash
# Listen on both PG and Oracle ports simultaneously
postgres -D /var/lib/ivorysql/data \
  -p 5432 \
  -c ivorysql.port=1521 \
  -c ivorysql.listen_mode='*'

# Using pg_ctl
pg_ctl start -D /var/lib/ivorysql/data \
  -o "-p 5432 -c ivorysql.port=1521"
```

### 3. ALTER SYSTEM Configuration

```sql
-- Oracle port requires restart to take effect
ALTER SYSTEM SET ivorysql.port = 1521;
ALTER SYSTEM SET ivorysql.listen_mode = '*';

-- View current configuration
SHOW ivorysql.port;
SHOW ivorysql.listen_mode;
```

## listen_mode Parameter Details

`ivorysql.listen_mode` controls the listening behavior of the Oracle port:

| Value | Description |
|----|------|
| `*` | Listen on all network interfaces (consistent with listen_addresses) |
| `localhost` | Listen on local loopback only |
| Specific IP | Listen on specified IP address |
| Empty string | Do not start Oracle port listener |

### Configuration Examples

```ini
# Oracle port listens on all interfaces
ivorysql.listen_mode = '*'

# Local access only
ivorysql.listen_mode = 'localhost'

# Listen on specific network interface
ivorysql.listen_mode = '192.168.1.100'

# Disable Oracle port
ivorysql.listen_mode = ''
```

## Compile Options

### --with-oraport Compile Option

IvorySQL can enable Oracle port support via the `--with-oraport` option at compile time:

```bash
# Configure compile options
./configure \
  --prefix=/usr/local/ivorysql \
  --with-oraport=1521 \
  --with-openssl \
  --with-readline \
  --with-zlib

# Compile and install
make -j$(nproc)
make install
```

### Compile Option Verification

```bash
# Check compile configuration
pg_config --configure

# Confirm output includes --with-oraport
```

### Without Oracle Port

If compiled without `--with-oraport`, IvorySQL will run as a standard PostgreSQL only, without dual port capabilities:

```bash
# Standard PG mode compilation (no dual port)
./configure \
  --prefix=/usr/local/ivorysql \
  --with-openssl \
  --with-readline \
  --with-zlib
```

## Network Connection Verification

### Verify PG Port

```bash
# Connect to PG port using psql
psql -h localhost -p 5432 -U postgres -d postgres

# Check port using netstat
netstat -tlnp | grep 5432

# Check using ss
ss -tlnp | grep 5432
```

### Verify Oracle Port

```bash
# Test Oracle port using tnsping
tnsping localhost:1521/ivorysql

# Check using netstat
netstat -tlnp | grep 1521

# Test connection using curl
curl -v telnet://localhost:1521
```

### Connection Test SQL

```sql
-- Connect via PG port
-- psql -p 5432
SELECT inet_server_port() AS current_port;
-- Result: 5432

-- Connect via Oracle port
-- Result: 1521
SELECT inet_server_port() AS current_port;
```

## Firewall and Security Configuration

### Open Ports

```bash
# firewalld
firewall-cmd --permanent --add-port=5432/tcp
firewall-cmd --permanent --add-port=1521/tcp
firewall-cmd --reload

# iptables
iptables -A INPUT -p tcp --dport 5432 -j ACCEPT
iptables -A INPUT -p tcp --dport 1521 -j ACCEPT

# Save rules
service iptables save
```

### pg_hba.conf Configuration

Both ports share the same `pg_hba.conf`, applying to connections on both ports:

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# Both PG and Oracle port connections use the same authentication rules
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             192.168.1.0/24          scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

## Dual Port Behavior Differences

### SQL Syntax Differences

When connecting through different ports, SQL parsing behavior differs:

```sql
-- Connect via PG port (5432)
SELECT CURRENT_DATE;          -- PG syntax
SELECT now()::date;           -- PG type casting

-- Connect via Oracle port (1521)
SELECT SYSDATE FROM DUAL;     -- Oracle syntax
SELECT TO_CHAR(hire_date, 'YYYY-MM-DD') FROM emp;  -- Oracle function
```

### Data Type Mapping

| Oracle Port Type | PG Port Type | Description |
|----------------|------------|------|
| NUMBER | numeric | Numeric type |
| VARCHAR2 | varchar | Character type |
| DATE | timestamp | Date and time |
| CLOB | text | Large text |
| BLOB | bytea | Binary large object |

### Automatic Session Parameter Switching

When connecting via the Oracle port, the following parameters are automatically set to Oracle-compatible values:

```sql
-- Parameters automatically set for Oracle port connections
ivorysql.statement_level = 'oracle'
ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS'
ivorysql.enable_emptystring_to_NULL = true
```

## High Availability Dual Port Configuration

### Patroni Configuration

```yaml
# patroni.yml
scope: ivorysql-cluster
name: node1

restapi:
  listen: 0.0.0.0:8008

bootstrap:
  dcs:
    postgresql:
      parameters:
        listen_addresses: '*'
        port: 5432
        ivorysql.port: 1521
        ivorysql.listen_mode: '*'
        ivorysql.enable_oracle_compatible: true

postgresql:
  listen: 0.0.0.0:5432
  data_dir: /var/lib/ivorysql/data
  parameters:
    ivorysql.port: 1521
    ivorysql.listen_mode: '*'
```

### PgBouncer Configuration

```ini
; pgbouncer.ini
[databases]
; PG port proxy
ivorysql_pg = host=127.0.0.1 port=5432 dbname=postgres
; Oracle port proxy
ivorysql_ora = host=127.0.0.1 port=1521 dbname=postgres

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
```

## Troubleshooting

### Oracle Port Not Starting

```bash
# Check logs
tail -f /var/lib/ivorysql/data/log/postgresql-*.log | grep -i oracle

# Common errors:
# "could not create Oracle-compatible listener" - Port in use
# "ivorysql.listen_mode is empty" - Listen mode not configured
```

### Port Conflicts

```bash
# Check port usage
lsof -i :1521
lsof -i :5432

# Change port
ALTER SYSTEM SET ivorysql.port = 1522;
-- Requires restart
pg_ctl restart -D /var/lib/ivorysql/data
```
