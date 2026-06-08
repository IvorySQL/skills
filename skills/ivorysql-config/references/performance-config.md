---
title: IvorySQL Performance Configuration
description: Memory configuration, WAL configuration, query optimization parameters, autovacuum
tags: ivorysql, config, performance, memory, wal, autovacuum
---

# IvorySQL Performance Configuration

## Memory Parameter Tuning

### Shared Buffers (shared_buffers)

```ini
# Recommended as 25% of system memory, but not exceeding 8GB
shared_buffers = 4GB          # Linux
shared_buffers = 2GB          # Smaller memory systems
```

### Work Memory (work_mem)

```ini
# Memory used per sort/hash operation
# Total usage = work_mem × parallel operations × concurrent connections
work_mem = 32MB               # General OLTP
work_mem = 64MB               # Analytical queries
```

### Maintenance Work Memory (maintenance_work_mem)

```ini
# Used by VACUUM, CREATE INDEX, ALTER TABLE, etc.
maintenance_work_mem = 512MB
```

### Effective Cache Size (effective_cache_size)

```ini
# Query planner's cache estimate, does not affect actual allocation
# Recommended as 75% of system memory
effective_cache_size = 12GB
```

## WAL Configuration

### Basic WAL Configuration

```ini
wal_level = replica                     # Supports streaming replication
max_wal_size = 2GB                      # Maximum WAL size
min_wal_size = 512MB                    # Minimum WAL size
wal_compression = zstd                  # WAL compression (PG 18)
checkpoint_completion_target = 0.9      # Checkpoint spread writes
```

### Archiving Configuration

```ini
archive_mode = on
archive_command = 'cp %p /archive/%f'
# Or use pgBackRest / Barman
```

## Query Optimization Parameters

### Parallel Queries

```ini
max_parallel_workers_per_gather = 4     # Parallelism per query
max_parallel_workers = 8                # System maximum parallel workers
parallel_tuple_cost = 0.01              # Parallel tuple cost
parallel_setup_cost = 100               # Parallel startup cost
```

### Optimizer Costs

```ini
# SSD storage
random_page_cost = 1.1
seq_page_cost = 1.0

# HDD storage
random_page_cost = 4.0
seq_page_cost = 1.0

effective_io_concurrency = 200          # SSD
effective_io_concurrency = 2            # HDD
```

### JIT Compilation

```ini
jit = on                               # Enable JIT
jit_above_cost = 100000                # JIT enable cost threshold
```

## Autovacuum

```ini
autovacuum = on                         # Enable autovacuum
autovacuum_max_workers = 3              # Vacuum worker count
autovacuum_naptime = 1min               # Check interval
autovacuum_vacuum_scale_factor = 0.1    # Change ratio to trigger vacuum
autovacuum_analyze_scale_factor = 0.05  # Change ratio to trigger analyze
autovacuum_vacuum_cost_limit = 2000     # Vacuum cost limit
```

## Connection Pool Recommendation

For production environments, it is recommended to use a connection pool:

- **pgbouncer**: Lightweight connection pool, supports session/transaction/statement modes
- **pgpool-II**: Connection pool + load balancing + replication

```ini
# pgbouncer.ini typical configuration
[databases]
ivorysql = host=127.0.0.1 port=5432 dbname=ivorysql

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```
