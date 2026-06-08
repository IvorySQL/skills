---
title: IvorySQL Backup and Recovery
description: Complete IvorySQL backup and recovery guide, covering pg_basebackup, pg_dump/pg_restore, WAL archiving, PITR point-in-time recovery, and PGBackRest
tags:
  - ivorysql
  - backup
  - recovery
  - pg_dump
  - pg_basebackup
  - pitr
  - pgbackrest
  - wal
---

# IvorySQL Backup and Recovery

## Overview

Backup is the last line of defense for data security. IvorySQL inherits PostgreSQL's complete backup and recovery system, providing logical backup (pg_dump), physical backup (pg_basebackup), WAL archiving, and point-in-time recovery (PITR) solutions.

## Backup Method Comparison

| Method | Type | Consistency | Recovery Granularity | Downtime | Use Case |
|------|------|--------|---------|---------|---------|
| pg_dump | Logical | Yes | Single database/table | None | Small database migration |
| pg_basebackup | Physical | Yes | Entire instance | None | Base backup + PITR |
| pgBackRest | Physical | Yes | Incremental + PITR | None | Enterprise backup |
| Filesystem snapshot | Physical | Requires freeze | Entire instance | Brief | LVM/ZFS environments |

## pg_dump / pg_restore

### Logical Backup

```bash
# Backup single database
pg_dump -h localhost -U ivorysql -Fc postgres > postgres.dump

# Backup as plain SQL
pg_dump -h localhost -U ivorysql -Fp postgres > postgres.sql

# Backup as directory format (parallel)
pg_dump -h localhost -U ivorysql -Fd postgres -j 4 -f /backup/postgres_dir

# Backup single table
pg_dump -h localhost -U ivorysql -t employees -Fc postgres > employees.dump

# Backup multiple tables
pg_dump -h localhost -U ivorysql -t employees -t departments -Fc postgres > tables.dump

# Backup entire schema
pg_dump -h localhost -U ivorysql -n app_schema -Fc postgres > app_schema.dump

# Exclude tables
pg_dump -h localhost -U ivorysql -T temp_* -Fc postgres > postgres_no_temp.dump

# Backup data only
pg_dump -h localhost -U ivorysql --data-only -Fc postgres > data_only.dump

# Backup schema only
pg_dump -h localhost -U ivorysql --schema-only -Fc postgres > schema_only.dump
```

### Backup All Databases

```bash
# Use pg_dumpall to backup global objects and all databases
pg_dumpall -h localhost -U ivorysql --globals-only > globals.sql
pg_dumpall -h localhost -U ivorysql > all_databases.sql

# Backup each database separately
for db in $(psql -h localhost -U ivorysql -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false"); do
    pg_dump -h localhost -U ivorysql -Fc "$db" > "/backup/${db}_$(date +%Y%m%d).dump"
done
```

### Logical Recovery

```bash
# Restore from custom format
pg_restore -h localhost -U ivorysql -d postgres postgres.dump

# Restore from plain SQL
psql -h localhost -U ivorysql -d postgres < postgres.sql

# Parallel restore
pg_restore -h localhost -U ivorysql -d postgres -j 4 /backup/postgres_dir

# Restore data only
pg_restore -h localhost -U ivorysql -d postgres --data-only postgres.dump

# Restore schema only
pg_restore -h localhost -U ivorysql -d postgres --schema-only postgres.dump

# Restore to new database
createdb -h localhost -U ivorysql postgres_restored
pg_restore -h localhost -U ivorysql -d postgres_restored postgres.dump

# View backup contents
pg_restore --list postgres.dump
```

### Restore Specific Tables

```bash
# List tables in backup
pg_restore --list postgres.dump | grep "TABLE DATA"

# Restore specific table
pg_restore -h localhost -U ivorysql -d postgres \
    -t employees \
    postgres.dump

# Restore specific OID entries
pg_restore -h localhost -U ivorysql -d postgres \
    -L restore.list \
    postgres.dump
```

## pg_basebackup

### Base Backup

```bash
# Create base backup
pg_basebackup \
    -h localhost \
    -U replicator \
    -D /backup/base_$(date +%Y%m%d) \
    -Fp -Xs -P -R

# Parameter explanation:
# -Fp  Plain format
# -Xs  Stream WAL
# -P   Show progress
# -R   Create standby.signal (for standby node)
```

### Compressed Backup

```bash
# gzip compression
pg_basebackup \
    -h localhost -U replicator \
    -D /backup/base_$(date +%Y%m%d) \
    -Ft -z -Xs -P

# -Ft  tar format
# -z   gzip compression

# lz4 compression (PG15+)
pg_basebackup \
    -h localhost -U replicator \
    -D /backup/base_$(date +%Y%m%d) \
    -Ft --compress=lz4 -Xs -P

# zstd compression
pg_basebackup \
    -h localhost -U replicator \
    -D /backup/base_$(date +%Y%m%d) \
    -Ft --compress=zstd:6 -Xs -P
```

### Incremental Backup (PG17+)

```bash
# Create incremental backup
pg_basebackup \
    -h localhost -U replicator \
    -D /backup/incr_$(date +%Y%m%d) \
    -Fp -Xs -P \
    --incremental=/backup/base_20250115/backup_manifest
```

## WAL Archiving

### Configure WAL Archiving

```ini
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/ivorysql/archive/%f'
```

### Advanced Archiving Script

```bash
# /usr/local/bin/archive_wal.sh
#!/bin/bash
ARCHIVE_DIR="/var/lib/ivorysql/archive"
WAL_FILE="$1"
WAL_PATH="$2"

# Ensure archive directory exists
mkdir -p "$ARCHIVE_DIR"

# Copy WAL file
cp "$WAL_PATH" "$ARCHIVE_DIR/$WAL_FILE"

# Verify copy
if [ $? -eq 0 ]; then
    # Optional: sync to remote storage
    # aws s3 cp "$ARCHIVE_DIR/$WAL_FILE" s3://ivorysql-archive/
    exit 0
else
    exit 1
fi
```

```ini
# postgresql.conf
archive_command = '/usr/local/bin/archive_wal.sh %f %p'
```

### Archive Recovery Configuration

```ini
# postgresql.conf (during recovery)
restore_command = 'cp /var/lib/ivorysql/archive/%f %p'
```

## PITR Point-in-Time Recovery

### Prerequisites

- Base backup (pg_basebackup)
- WAL archive logs

### Recovery Steps

```bash
# 1. Stop database
pg_ctl stop -D /var/lib/ivorysql/data -m fast

# 2. Backup current data (for safety)
mv /var/lib/ivorysql/data /var/lib/ivorysql/data.corrupted

# 3. Restore base backup
tar xf /backup/base_20250115.tar -C /var/lib/ivorysql/data

# 4. Configure recovery target
```

```ini
# postgresql.conf or postgresql.auto.conf
restore_command = 'cp /var/lib/ivorysql/archive/%f %p'
recovery_target_time = '2025-01-15 14:30:00+08'
recovery_target_action = 'promote'
```

```bash
# 5. Create recovery.signal
touch /var/lib/ivorysql/data/recovery.signal

# 6. Start database
pg_ctl start -D /var/lib/ivorysql/data

# 7. Verify recovery point
psql -c "SELECT now(), pg_last_xact_replay_timestamp();"
```

### Recovery Target Options

```ini
# Recover to specified time
recovery_target_time = '2025-01-15 14:30:00+08'

# Recover to specified transaction ID
recovery_target_xid = '1234567'

# Recover to specified LSN
recovery_target_lsn = '0/50000060'

# Recover to earliest consistent point
recovery_target = 'immediate'

# Recovery target action
recovery_target_action = 'promote'     # Promote to Primary after recovery
recovery_target_action = 'pause'       # Pause after recovery, can continue
recovery_target_action = 'shutdown'    # Shutdown after recovery
```

## PGBackRest

### Installation

```bash
# RPM
yum install -y pgbackrest

# Source
./configure --prefix=/usr/local
make && make install
```

### Configuration

```ini
; /etc/pgbackrest/pgbackrest.conf
[global]
repo1-path=/var/lib/pgbackrest
repo1-retention-full=7
repo1-retention-diff=30
repo1-cipher-type=aes-256-cbc
repo1-cipher-pass=your_encryption_key
process-max=4
log-level-console=info
log-level-file=detail
start-fast=y
stop-auto=y
delta=y

[ivorysql]
pg1-path=/var/lib/ivorysql/data
pg1-port=5432
pg1-user=ivorysql
```

### Execute Backup

```bash
# Full backup
pgbackrest --stanza=ivorysql backup --type=full

# Differential backup
pgbackrest --stanza=ivorysql backup --type=diff

# Incremental backup
pgbackrest --stanza=ivorysql backup --type=incr

# View backups
pgbackrest --stanza=ivorysql info
```

### Recovery

```bash
# Recover latest backup
pgbackrest --stanza=ivorysql restore

# Recover to specified time
pgbackrest --stanza=ivorysql restore --type=time --target="2025-01-15 14:30:00+08"

# Recover to specified backup
pgbackrest --stanza=ivorysql restore --set=20250115-100000F

# Recover to different directory
pgbackrest --stanza=ivorysql restore --pg1-path=/var/lib/ivorysql/restored

# Verify backup (without actual recovery)
pgbackrest --stanza=ivorysql restore --type=none --set=20250115-100000F
```

### S3 Remote Storage

```ini
; /etc/pgbackrest/pgbackrest.conf
[global]
repo1-type=s3
repo1-s3-bucket=ivorysql-backup
repo1-s3-endpoint=s3.amazonaws.com
repo1-s3-region=us-east-1
repo1-s3-key=ACCESS_KEY
repo1-s3-key-secret=SECRET_KEY
repo1-path=/ivorysql-backup
repo1-retention-full=7
```

## Backup Strategy Recommendations

### Small Database (< 100GB)

```
- Daily pg_dump logical backup
- Weekly pg_basebackup physical backup
- WAL archiving enabled
```

### Medium Database (100GB - 1TB)

```
- pgBackRest full backup: Weekly
- pgBackRest differential backup: Daily
- pgBackRest incremental backup: Every 6 hours
- WAL archiving: Continuous
```

### Large Database (> 1TB)

```
- pgBackRest full backup: Monthly
- pgBackRest differential backup: Weekly
- pgBackRest incremental backup: Daily
- WAL archiving: Continuous, stored to S3
- Filesystem snapshot: Daily (if supported)
```

## Backup Verification

```bash
# Verify pg_dump backup
pg_restore --list backup.dump > /dev/null && echo "OK"

# Verify pgBackRest backup
pgbackrest --stanza=ivorysql verify

# Regular recovery testing
# Restore backup in test environment and verify data integrity
pgbackrest --stanza=ivorysql restore --pg1-path=/tmp/test-restore
psql -h /tmp -d postgres -c "SELECT count(*) FROM critical_table;"
```
