---
title: PostgreSQL Core Configuration Parameters
description: PostgreSQL/IvorySQL core configuration parameter reference, covering connection, memory, WAL, query optimization, and other key configuration items
tags:
  - config
  - postgresql
  - performance
  - tuning
---

# PostgreSQL Core Configuration Parameters

IvorySQL is based on PostgreSQL and inherits all its core configuration parameters. This document organizes the most commonly used parameters and recommended values by functional category.

## Connection Parameters

| Parameter | Default | Recommended | Description |
|------|--------|--------|------|
| `listen_addresses` | `localhost` | `*` | Listen address |
| `port` | `5432` | As needed | Listen port |
| `max_connections` | `100` | `100-500` | Maximum connections |
| `superuser_reserved_connections` | `3` | `3` | Superuser reserved connections |
| `unix_socket_directories` | `/tmp` | `/var/run/ivorysql` | Unix socket directory |
| `authentication_timeout` | `60s` | `60s` | Authentication timeout |
| `ssl` | `off` | `on` | Enable SSL |
| `ssl_cert_file` | `server.crt` | By path | SSL certificate |
| `ssl_key_file` | `server.key` | By path | SSL private key |

```ini
# Connection configuration example
listen_addresses = '*'
port = 5432
max_connections = 200
superuser_reserved_connections = 3
ssl = on
ssl_cert_file = '/etc/ssl/certs/server.crt'
ssl_key_file = '/etc/ssl/private/server.key'
```

### Connection Pool Recommendation

```
max_connections calculation:
  = (Application concurrency / Connection pool reuse ratio) + Reserved connections
  ≈ 200 (typical OLTP scenario)

With PgBouncer:
  PgBouncer pool_size = 20-50
  max_connections = 100-200
```

## Memory Parameters

| Parameter | Default | Recommended | Description |
|------|--------|--------|------|
| `shared_buffers` | `128MB` | 25% of total memory | Shared buffers |
| `effective_cache_size` | `4GB` | 75% of total memory | Query planner cache estimate |
| `work_mem` | `4MB` | `16-64MB` | Sort/hash operation memory |
| `maintenance_work_mem` | `64MB` | `256MB-1GB` | Maintenance operation memory |
| `wal_buffers` | `-1`(auto) | `64MB` | WAL buffer |
| `huge_pages` | `try` | `try` / `on` | Huge page memory |
| `temp_buffers` | `8MB` | `8-32MB` | Temporary table buffer |

```ini
# Memory configuration example (64GB memory server)
shared_buffers = 16GB
effective_cache_size = 48GB
work_mem = 64MB
maintenance_work_mem = 1GB
wal_buffers = 64MB
huge_pages = try
```

### shared_buffers Calculation Reference

| System Memory | shared_buffers | effective_cache_size |
|---------|----------------|---------------------|
| 4 GB | 1 GB | 3 GB |
| 8 GB | 2 GB | 6 GB |
| 16 GB | 4 GB | 12 GB |
| 32 GB | 8 GB | 24 GB |
| 64 GB | 16 GB | 48 GB |
| 128 GB | 32 GB | 96 GB |
| 256 GB | 64 GB | 192 GB |

### work_mem Tuning

```sql
-- Calculate recommended work_mem
-- work_mem = (Total memory - shared_buffers) / (max_connections * 3)
-- Example: 64GB memory, 200 connections:
-- work_mem = (64GB - 16GB) / (200 * 3) ≈ 80MB

-- Check current sort spill to disk
SELECT query, calls,
       round(total_time::numeric, 2) AS total_time,
       rows, temp_blks_written
FROM pg_stat_statements
WHERE temp_blks_written > 0
ORDER BY temp_blks_written DESC
LIMIT 10;

-- Set different work_mem per query
SET LOCAL work_mem = '256MB';  -- Large report queries
SET LOCAL work_mem = '4MB';    -- Simple OLTP queries
```

## WAL Parameters

| Parameter | Default | Recommended | Description |
|------|--------|--------|------|
| `wal_level` | `replica` | `replica` / `logical` | WAL level |
| `max_wal_size` | `1GB` | `2-8GB` | Maximum WAL size |
| `min_wal_size` | `80MB` | `512MB-2GB` | Minimum WAL size |
| `checkpoint_completion_target` | `0.9` | `0.9` | Checkpoint completion target |
| `checkpoint_timeout` | `5min` | `5-15min` | Checkpoint interval |
| `wal_compression` | `off` | `zstd` / `lz4` | WAL compression |
| `wal_writer_delay` | `200ms` | `200ms` | WAL writer delay |
| `commit_delay` | `0` | `0` | Commit delay |
| `fsync` | `on` | `on` | Force flush to disk |
| `synchronous_commit` | `on` | `on` / `remote_apply` | Synchronous commit |

```ini
# WAL configuration example
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_completion_target = 0.9
checkpoint_timeout = 10min
wal_compression = zstd
fsync = on
synchronous_commit = on
```

### WAL Archiving Configuration

```ini
# Archive mode
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/ivorysql/archive/%f'
# Or use rsync
archive_command = 'rsync -a %p backup-server:/archive/%f'
```

## Query Optimization Parameters

| Parameter | Default | Recommended | Description |
|------|--------|--------|------|
| `random_page_cost` | `4.0` | `1.1-1.5`(SSD) | Random page cost |
| `seq_page_cost` | `1.0` | `1.0` | Sequential page cost |
| `effective_io_concurrency` | `1` | `200`(SSD) | IO concurrency |
| `max_parallel_workers_per_gather` | `2` | `4-8` | Parallel query workers |
| `max_parallel_workers` | `8` | `8-16` | Maximum parallel workers |
| `max_parallel_maintenance_workers` | `2` | `4` | Parallel maintenance workers |
| `jit` | `on` | `on`(complex queries) | JIT compilation |
| `default_statistics_target` | `100` | `100-500` | Statistics target |
| `cpu_tuple_cost` | `0.01` | `0.01` | CPU tuple cost |
| `cpu_index_tuple_cost` | `0.005` | `0.005` | CPU index tuple cost |

```ini
# Query optimization configuration example (SSD storage)
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
default_statistics_target = 200
jit = on
```

### Execution Plan Analysis

```sql
-- View query execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE customer_id = 1001;

-- View parallel query usage
SELECT query, calls,
       round(total_time::numeric, 2) AS total_time,
       rows
FROM pg_stat_statements
WHERE query LIKE '%parallel%'
ORDER BY total_time DESC;

-- Manually disable/enable parallel
SET max_parallel_workers_per_gather = 0;  -- Disable parallel
SET max_parallel_workers_per_gather = 8;  -- Enable parallel
```

## Autovacuum Parameters

| Parameter | Default | Recommended | Description |
|------|--------|--------|------|
| `autovacuum` | `on` | `on` | Autovacuum switch |
| `autovacuum_max_workers` | `3` | `3-6` | Autovacuum workers |
| `autovacuum_naptime` | `1min` | `1min` | Autovacuum interval |
| `autovacuum_vacuum_scale_factor` | `0.2` | `0.05-0.1` | Vacuum trigger ratio |
| `autovacuum_analyze_scale_factor` | `0.1` | `0.02-0.05` | Analyze trigger ratio |
| `autovacuum_vacuum_cost_limit` | `200` | `1000-2000` | Vacuum cost limit |
| `autovacuum_vacuum_cost_delay` | `2ms` | `2ms` | Vacuum cost delay |

```ini
# Autovacuum configuration example
autovacuum = on
autovacuum_max_workers = 4
autovacuum_naptime = 1min
autovacuum_vacuum_scale_factor = 0.1
autovacuum_analyze_scale_factor = 0.05
autovacuum_vacuum_cost_limit = 1000
```

### Per-Table Configuration for Large Tables

```sql
-- Lower vacuum threshold for frequently updated large tables
ALTER TABLE large_table SET (
    autovacuum_vacuum_scale_factor = 0.02,
    autovacuum_analyze_scale_factor = 0.01
);

-- Increase vacuum frequency for write-heavy tables
ALTER TABLE hot_table SET (
    autovacuum_vacuum_scale_factor = 0.01,
    autovacuum_analyze_scale_factor = 0.005,
    autovacuum_vacuum_cost_limit = 2000
);
```

## Logging Parameters

| Parameter | Default | Recommended | Description |
|------|--------|--------|------|
| `logging_collector` | `off` | `on` | Enable log collector |
| `log_directory` | `log` | `log` | Log directory |
| `log_filename` | `postgresql-%Y-%m-%d.log` | As needed | Log filename |
| `log_rotation_age` | `1d` | `1d` | Log rotation time |
| `log_min_duration_statement` | `-1` | `1000`(ms) | Slow query threshold |
| `log_checkpoints` | `off` | `on` | Log checkpoints |
| `log_connections` | `off` | `on` | Log connections |
| `log_disconnections` | `off` | `on` | Log disconnections |
| `log_lock_waits` | `off` | `on` | Log lock waits |
| `log_temp_files` | `-1` | `0` | Log temp files |
| `log_line_prefix` | `'%m [%p] '` | `'%t [%p]: db=%d,user=%u,app=%a,client=%h '` | Log prefix |

```ini
# Logging configuration example
logging_collector = on
log_directory = 'log'
log_filename = 'ivorysql-%Y-%m-%d.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_line_prefix = '%t [%p]: db=%d,user=%u,app=%a,client=%h '
```

## Complete Recommended Configuration Template

```ini
# ivorysql.conf / postgresql.conf
# For 64GB memory SSD server

# -- Connection --
listen_addresses = '*'
port = 5432
max_connections = 200

# -- Memory --
shared_buffers = 16GB
effective_cache_size = 48GB
work_mem = 64MB
maintenance_work_mem = 1GB
wal_buffers = 64MB

# -- WAL --
wal_level = replica
max_wal_size = 4GB
min_wal_size = 1GB
checkpoint_completion_target = 0.9
wal_compression = zstd

# -- Optimization --
random_page_cost = 1.1
effective_io_concurrency = 200
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
default_statistics_target = 200

# -- Autovacuum --
autovacuum = on
autovacuum_max_workers = 4
autovacuum_vacuum_scale_factor = 0.1

# -- Logging --
logging_collector = on
log_min_duration_statement = 1000
log_checkpoints = on
log_lock_waits = on
```
