---
name: IvorySQL High Availability and Backup Recovery
name_for_command: ivorysql-ha
description: |
  Complete IvorySQL high availability and backup recovery reference: streaming replication (sync/async), logical replication,
  Patroni high availability cluster, pg_auto_failover, backup recovery (pg_dump/pg_restore/pg_basebackup/PGBackRest),
  WAL archiving, PITR point-in-time recovery.
---

# IvorySQL High Availability and Backup Recovery

## Workflow

Trigger this skill when encountering the following issues:
- Streaming replication / logical replication configuration
- Patroni high availability cluster
- Backup recovery strategy
- Disaster recovery solutions

**Sub-skill routing**:
- Performance tuning → `references/performance-config.md`
- Deployment guide → `ivorysql-deployment`
- Security backup → `ivorysql-security`

IvorySQL inherits the complete high availability and backup recovery capabilities from PostgreSQL.

## High Availability Solutions

| Solution | Complexity | Automatic Failover | Use Case |
|------|--------|:----------:|----------|
| Streaming Replication + Manual Switch | Low | ❌ | Development/testing |
| Streaming Replication + Patroni | Medium | ✅ | Production recommended |
| Streaming Replication + pg_auto_failover | Medium | ✅ | Simple production |
| Logical Replication | Medium | ❌ | Data synchronization/distribution |
| PGBackRest + PITR | Medium | ❌ | Data protection |

> For details: [ha-cluster](references/ha-cluster.md)

## Streaming Replication

### Primary Configuration

```ini
# postgresql.conf
wal_level = replica
max_wal_senders = 10
wal_keep_size = 1GB
synchronous_standby_names = 'replica1,replica2'  # Synchronous replication
# synchronous_standby_names = '*'  # Any standby sync
```

### Standby Configuration

```ini
# postgresql.conf
hot_standby = on

# standby.signal file marks as standby
# primary_conninfo = 'host=primary port=5432 user=replicator password=secret'
```

### Setup Steps

```bash
# 1. Create replication user on primary
psql -c "CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'secret';"

# 2. Base backup
pg_basebackup -h primary -U replicator -D /data/replica -Fp -Xs -P -R

# 3. Start standby
pg_ctl -D /data/replica start

# 4. Verify replication status (execute on primary)
psql -c "SELECT * FROM pg_stat_replication;"
```

## Logical Replication

```sql
-- Publisher side
CREATE PUBLICATION my_pub FOR TABLE employees, departments;

-- Subscriber side
CREATE SUBSCRIPTION my_sub
    CONNECTION 'host=publisher port=5432 dbname=ivorysql'
    PUBLICATION my_pub;
```

## Backup Recovery

> For details: [backup-recovery](references/backup-recovery.md)

### pg_dump / pg_restore

```bash
# Backup database
pg_dump -d ivorysql -F c -f ivorysql_backup.dump

# Backup all databases
pg_dumpall -f all_databases.sql

# Restore
pg_restore -d ivorysql ivorysql_backup.dump
```

### pg_basebackup

```bash
# Physical backup
pg_basebackup -D /backup/ivorysql -Ft -z -P
```

### PITR (Point-in-Time Recovery)

```bash
# 1. Configure WAL archiving
# postgresql.conf
archive_mode = on
archive_command = 'cp %p /archive/%f'

# 2. Base backup
pg_basebackup -D /backup/base -Ft -z

# 3. Restore to specified point in time
# recovery_target_time = '2024-01-15 14:30:00'
```

## Reference Documents

- [High Availability Cluster](references/ha-cluster.md) — Streaming replication, Patroni, automatic failover
- [Backup Recovery](references/backup-recovery.md) — pg_dump/pg_basebackup/PGBackRest/PITR
- [Monitoring and Operations](references/monitoring.md) — Daily monitoring, performance metrics, operational tasks
