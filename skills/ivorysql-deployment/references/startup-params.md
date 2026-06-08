---
title: Initialization and Startup Management
description: IvorySQL database initialization and startup management, including initdb mode selection, pg_ctl operations, and mode differences
tags:
  - deployment
  - initdb
  - startup
  - management
---

# Initialization and Startup Management

## initdb Initialization

### Basic Commands

```bash
# Initialize as Oracle compatible mode
initdb -m oracle -D /var/lib/ivorysql/data

# Initialize as PostgreSQL mode (default)
initdb -m pg -D /var/lib/ivorysql/data

# Without -m defaults to pg mode
initdb -D /var/lib/ivorysql/data
```

### Full Initialization Options

```bash
initdb \
    -m oracle \
    -D /var/lib/ivorysql/data \
    --encoding=UTF-8 \
    --locale=en_US.UTF-8 \
    --lc-collate=en_US.UTF-8 \
    --lc-ctype=en_US.UTF-8 \
    -U sysadmin \
    --pwprompt \
    --auth-local=scram-sha-256 \
    --auth-host=scram-sha-256 \
    --waldir=/var/lib/ivorysql/wal \
    --data-checksums
```

### initdb Parameters Explained

| Parameter | Description | Default |
|------|------|--------|
| `-m MODE` | Compatibility mode: `oracle` / `pg` | `pg` |
| `-D DIR` | Data directory | Required or PGDATA |
| `-E ENCODING` | Encoding | `UTF8` |
| `--locale=LOCALE` | Locale setting | System default |
| `--lc-collate` | Collation locale | Same as --locale |
| `--lc-ctype` | Character classification locale | Same as --locale |
| `-U NAME` | Superuser name | `postgres` |
| `--pwprompt` | Interactive password prompt | No password |
| `--pwfile=FILE` | Read password from file | No password |
| `--auth-local=METHOD` | Local authentication method | `peer` |
| `--auth-host=METHOD` | Remote authentication method | `scram-sha-256` |
| `--waldir=DIR` | WAL directory | Inside data directory |
| `--data-checksums` | Enable data checksums | Disabled |
| `-k` | Same as --data-checksums | Disabled |
| `--no-locale` | Use C locale | No |
| `--icu-locale=LOCALE` | ICU locale | No |
| `--icu-rules=RULES` | ICU collation rules | None |

### Oracle Mode vs PG Mode Initialization Differences

| Item | `-m oracle` | `-m pg` |
|------|-------------|---------|
| `ivorysql.compatible_mode` | `oracle` | `pg` |
| Default port | 1521 | 5432 |
| Pre-created schemas | `sys`, `ora`, `public`, `pg_catalog` | `public`, `pg_catalog` |
| Pre-created roles | `SYS`, `SYSTEM` | None |
| Date format | `YYYY-MM-DD HH24:MI:SS` | `YYYY-MM-DD HH:MI:SS` |
| Identifier case | Case-insensitive uppercase | Case-insensitive lowercase |
| Empty string | Converted to NULL | Preserved as empty string |
| Default authentication | `scram-sha-256` | `scram-sha-256` |
| DUAL table | Created | Not created |
| Oracle functions | Available | Not available |
| Oracle data types | Available | Not available |

### Directory Structure After Initialization

```
/var/lib/ivorysql/data/
├── base/                  # Data files
│   ├── 1/                 # pg_catalog
│   ├── 13486/             # ora schema (oracle mode)
│   └── 16384/             # User databases
├── global/                # Global data
│   ├── pg_control         # Control file
│   └── pg_filenode.map
├── pg_commit_ts/
├── pg_dynshmem/
├── pg_logical/
├── pg_multixact/
├── pg_notify/
├── pg_replslot/
├── pg_stat/
├── pg_stat_tmp/
├── pg_subtrans/
├── pg_tblspc/
├── pg_twophase/
├── pg_wal/                # WAL logs
│   └── 000000010000000000000001
├── pg_xact/
├── postgresql.conf        # Main configuration file
├── postgresql.auto.conf   # Auto configuration
├── pg_hba.conf            # Client authentication
├── pg_ident.conf          # Username mapping
└── postmaster.opts        # Startup options
```

## pg_ctl Startup Management

### Start

```bash
# Basic startup
pg_ctl -D /var/lib/ivorysql/data start

# Specify log file
pg_ctl -D /var/lib/ivorysql/data -l /var/log/ivorysql/ivorysql.log start

# Specify port
pg_ctl -D /var/lib/ivorysql/data -o "-p 1521" start

# Specify runtime parameters
pg_ctl -D /var/lib/ivorysql/data -o "-c ivorysql.compatible_mode=oracle -c max_connections=200" start

# Wait for startup to complete
pg_ctl -D /var/lib/ivorysql/data -w start

# Timeout wait (seconds)
pg_ctl -D /var/lib/ivorysql/data -t 60 -w start
```

### Stop

```bash
# Smart stop (wait for all connections to close)
pg_ctl -D /var/lib/ivorysql/data stop -m smart

# Fast stop (interrupt queries, default mode)
pg_ctl -D /var/lib/ivorysql/data stop -m fast

# Immediate stop (requires crash recovery, use with caution)
pg_ctl -D /var/lib/ivorysql/data stop -m immediate
```

### Stop Mode Comparison

| Mode | Behavior | Data Safety | Recovery | Use Case |
|------|------|---------|------|---------|
| `smart` | Waits for connections to close | Safe | None needed | Planned maintenance |
| `fast` | Interrupts queries, rolls back transactions | Safe | None needed | Emergency stop |
| `immediate` | Force termination | May lose data | Requires crash recovery | Last resort |

### Restart and Reload

```bash
# Restart
pg_ctl -D /var/lib/ivorysql/data restart

# Fast restart
pg_ctl -D /var/lib/ivorysql/data restart -m fast

# Reload configuration (parameters that don't require restart)
pg_ctl -D /var/lib/ivorysql/data reload

# Check status
pg_ctl -D /var/lib/ivorysql/data status
```

### Promote Standby

```bash
# Promote standby to primary
pg_ctl -D /var/lib/ivorysql/data promote

# Promote with wait
pg_ctl -D /var/lib/ivorysql/data -w promote
```

## systemd Service Management

### Standard Service Commands

```bash
# Start
sudo systemctl start ivorysql-3

# Stop
sudo systemctl stop ivorysql-3

# Restart
sudo systemctl restart ivorysql-3

# Reload configuration
sudo systemctl reload ivorysql-3

# Check status
sudo systemctl status ivorysql-3

# Enable on boot
sudo systemctl enable ivorysql-3

# Disable on boot
sudo systemctl disable ivorysql-3
```

### View Logs

```bash
# systemd logs
sudo journalctl -u ivorysql-3 -f

# Last 100 lines
sudo journalctl -u ivorysql-3 -n 100

# Specified time range
sudo journalctl -u ivorysql-3 --since "2024-01-01" --until "2024-01-02"
```

## Direct postgres Startup

```bash
# Foreground startup (for debugging)
postgres -D /var/lib/ivorysql/data

# Background startup
postgres -D /var/lib/ivorysql/data &

# Startup with parameters
postgres -D /var/lib/ivorysql/data \
    -p 1521 \
    -c ivorysql.compatible_mode=oracle \
    -c max_connections=200 \
    -c shared_buffers=1GB

# Single-user mode (for recovery/repair)
postgres --single -D /var/lib/ivorysql/data postgres
```

## Runtime Parameter Modification

### Parameters That Don't Require Restart

```sql
-- Session level
SET work_mem = '64MB';
SET ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS';

-- Global level
ALTER SYSTEM SET work_mem = '64MB';
SELECT pg_reload_conf();
```

### Parameters That Require Restart

```sql
-- Requires restart after modification
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET max_connections = 300;
ALTER SYSTEM SET wal_level = logical;

-- Check which parameters require restart
SELECT name, setting, pending_restart
FROM pg_settings
WHERE pending_restart = true;
```

### Parameter Priority

```
1. postgres command-line arguments (highest)
2. postgresql.auto.conf (written by ALTER SYSTEM)
3. postgresql.conf
4. Command-line -c arguments
5. Compile-time defaults (lowest)
```

## Health Checks

```bash
# Use pg_isready
pg_isready -h localhost -p 5432

# Check Oracle port
pg_isready -h localhost -p 1521

# Specify database
pg_isready -h localhost -p 5432 -d mydb

# Use in scripts
if pg_isready -h localhost -p 5432; then
    echo "Database is ready"
else
    echo "Database is not ready"
fi
```

```sql
-- SQL health checks
SELECT pg_is_in_recovery();  -- Whether standby
SELECT version();             -- Version info
SELECT now();                 -- Time check
SELECT count(*) FROM pg_stat_activity;  -- Active connections
```

## Notes

1. **initdb can only be executed once**: After data directory initialization, it cannot be re-executed. To reinitialize, delete the data directory first.
2. **-m parameter is irreversible**: After initialization, the mode cannot be switched by simply changing parameters; reinitialization is required.
3. **Stop mode selection**: Use `fast` mode for production environments, avoid `immediate` which leads to crash recovery.
4. **Separate WAL directory**: For high I/O scenarios, place the WAL directory on a separate disk.
5. **Data checksums**: Enable `--data-checksums` in production to detect storage-level data corruption.
