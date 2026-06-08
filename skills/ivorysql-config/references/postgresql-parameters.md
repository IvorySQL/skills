---
title: IvorySQL PostgreSQL Core Parameter Tuning
description: IvorySQL/PostgreSQL core parameter tuning guide, covering configuration recommendations and performance optimization for key parameters such as shared_buffers, effective_cache_size, work_mem, max_connections
tags:
  - ivorysql
  - config
  - performance
  - tuning
  - parameters
---

# IvorySQL PostgreSQL Core Parameter Tuning

## Overview

IvorySQL is based on the PostgreSQL kernel, and its core parameter tuning principles are consistent with PostgreSQL. Proper parameter configuration is the foundation of database performance. This document details the meaning of key parameters, recommended configurations, and tuning methods.

## Memory Parameters

### shared_buffers

Database shared buffer size, which determines the data cache capacity. This is the most critical tuning parameter.

```ini
# Recommended value: 25% of total system memory
# Dedicated database server
shared_buffers = 4GB          # 16GB memory
shared_buffers = 8GB          # 32GB memory
shared_buffers = 16GB         # 64GB memory
shared_buffers = 32GB         # 128GB memory
```

**Notes:**
- Exceeding 40% of system memory typically does not provide additional benefits
- Linux systems need to ensure sufficient shared memory segments
- Modification requires a database restart

```bash
# Linux shared memory configuration
# Check
cat /proc/sys/kernel/shmmax
cat /proc/sys/kernel/shmall

# Set (temporary)
sysctl -w kernel.shmmax=68719476736
sysctl -w kernel.shmall=16777216

# Permanent
echo "kernel.shmmax = 68719476736" >> /etc/sysctl.conf
echo "kernel.shmall = 16777216" >> /etc/sysctl.conf
sysctl -p
```

### effective_cache_size

The query optimizer's estimate of the system's available cache, which affects query plan selection.

```ini
# Recommended value: 50% - 75% of total system memory
effective_cache_size = 12GB   # 16GB memory
effective_cache_size = 24GB   # 32GB memory
effective_cache_size = 48GB   # 64GB memory
```

**Notes:**
- This parameter does not actually allocate memory; it is only used for optimizer estimation
- Should include OS filesystem cache + shared_buffers
- Setting too low may cause the optimizer to choose sequential scans instead of index scans

### work_mem

The memory each query operation (sorting, hashing, etc.) can use.

```ini
# The default value of 4MB is usually too small
# Recommended calculation formula:
# work_mem = (total memory - shared_buffers) / (max_connections * 3)

# OLTP systems
work_mem = 16MB

# OLAP / Data warehouse
work_mem = 64MB

# Mixed workload
work_mem = 32MB
```

**Tuning basis:**

```sql
-- Check for sort spills to disk
SELECT datname, sums.blks_read, sums.blks_hit,
       round(sums.blks_hit::numeric / (sums.blks_read + sums.blks_hit) * 100, 2) AS cache_hit_ratio
FROM (SELECT datname, sum(blks_read) AS blks_read, sum(blks_hit) AS blks_hit
      FROM pg_stat_database GROUP BY datname) sums
ORDER BY cache_hit_ratio;

-- Check temporary file usage (sort/hash spills)
SELECT datname, temp_files, temp_bytes
FROM pg_stat_database
WHERE temp_files > 0
ORDER BY temp_bytes DESC;
```

### maintenance_work_mem

Memory used for maintenance operations (VACUUM, CREATE INDEX, ALTER TABLE).

```ini
# Default 64MB
# Recommended values
maintenance_work_mem = 512MB    # General servers
maintenance_work_mem = 1GB      # Large servers
maintenance_work_mem = 2GB      # Very large databases
```

### huge_pages

Enable huge page memory to reduce TLB misses.

```ini
# Recommended for Linux
huge_pages = try     # Attempt to use huge pages, fallback if failed
huge_pages = on      # Force huge pages, startup fails if unavailable
```

```bash
# Configure Linux huge pages
# Calculate required number of huge pages
# Huge pages = (shared_buffers + overhead) / huge page size
# Example: shared_buffers=8GB, huge page size=2MB
# Required = 8GB / 2MB = 4096 + extra ≈ 4500

echo 4500 > /proc/sys/vm/nr_hugepages
echo "vm.nr_hugepages = 4500" >> /etc/sysctl.conf
```

## Connection Parameters

### max_connections

Maximum number of concurrent connections.

```ini
# OLTP systems
max_connections = 200

# High concurrency systems (with connection pool)
max_connections = 100

# Using a connection pool (recommended)
max_connections = 100    # PgBouncer frontend can handle thousands of connections
```

**Important notes:**
- Each connection consumes approximately 5-10MB of memory
- Too many connections can lead to context switching overhead
- Production environments are recommended to use a connection pool (PgBouncer/Odyssey)

### superuser_reserved_connections

Number of connections reserved for superusers.

```ini
superuser_reserved_connections = 3
```

## WAL Parameters

### wal_buffers

WAL buffer size.

```ini
# Default -1 (auto-calculated, 1/32 of shared_buffers)
# Manual setting
wal_buffers = 64MB       # Heavy write workload
wal_buffers = 16MB       # General workload
```

### checkpoint_completion_target

Checkpoint completion target, controls checkpoint write speed.

```ini
checkpoint_completion_target = 0.9   # Recommended, spreads writes evenly
```

### max_wal_size / min_wal_size

WAL file size limits.

```ini
# Default
max_wal_size = 1GB
min_wal_size = 80MB

# Large databases
max_wal_size = 4GB
min_wal_size = 1GB

# Bulk write scenarios
max_wal_size = 8GB
min_wal_size = 2GB
```

### wal_level

WAL level, which affects replication capabilities.

```ini
wal_level = replica       # Streaming replication (recommended)
wal_level = logical       # Logical replication
wal_level = minimal       # Minimal logging (archiving only, no replication)
```

## Query Optimization Parameters

### random_page_cost

Random page access cost estimation.

```ini
# SSD/NVMe storage
random_page_cost = 1.1

# Mechanical hard drives
random_page_cost = 4.0    # Default

# In-memory databases
random_page_cost = 1.0
```

### effective_io_concurrency

Concurrent I/O operation count.

```ini
# SSD
effective_io_concurrency = 200

# Mechanical hard drives
effective_io_concurrency = 2
```

### jit

JIT compilation.

```ini
# OLAP complex queries
jit = on

# OLTP simple queries
jit = off
```

### max_parallel_workers_per_gather

Maximum parallel workers per Gather node.

```ini
# Default 2
max_parallel_workers_per_gather = 4    # 4+ cores
max_parallel_workers_per_gather = 8    # 16+ cores

# Total parallel workers
max_parallel_workers = 8
max_parallel_maintenance_workers = 4
```

## Logging Parameters

```ini
# Logging level
log_min_duration_statement = 1000    # Log slow queries exceeding 1 second
log_statement = 'ddl'                 # Log DDL statements
log_connections = on                  # Log connections
log_disconnections = on               # Log disconnections
log_lock_waits = on                   # Log lock waits
log_temp_files = 0                    # Log all temporary files
log_checkpoints = on                  # Log checkpoints

# Log format
log_line_prefix = '%t [%p]: db=%d,user=%u,app=%a,client=%h '

# Log collection
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_truncate_on_rotation = on
```

## Autovacuum Parameters

```ini
# autovacuum configuration
autovacuum = on
autovacuum_max_workers = 4            # Adjust based on table count
autovacuum_naptime = 1min             # Check interval
autovacuum_vacuum_scale_factor = 0.1  # 10% row change triggers VACUUM
autovacuum_analyze_scale_factor = 0.05 # 5% row change triggers ANALYZE
autovacuum_vacuum_cost_limit = 2000   # Increase vacuum speed
```

### Large Table Tuning

```sql
-- Set more aggressive autovacuum for frequently updated large tables
ALTER TABLE big_table SET (
    autovacuum_vacuum_scale_factor = 0.01,
    autovacuum_analyze_scale_factor = 0.01,
    autovacuum_vacuum_cost_delay = 2
);
```

## Complete Recommended Configuration Templates

### 16GB Memory OLTP Server

```ini
# Memory
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 32MB
maintenance_work_mem = 512MB

# Connection
max_connections = 100

# WAL
wal_buffers = 64MB
max_wal_size = 2GB
min_wal_size = 512MB
checkpoint_completion_target = 0.9

# Query optimization
random_page_cost = 1.1              # SSD
effective_io_concurrency = 200      # SSD

# Parallel
max_parallel_workers_per_gather = 4
max_parallel_workers = 8

# Logging
log_min_duration_statement = 500

# Autovacuum
autovacuum_max_workers = 4
autovacuum_vacuum_cost_limit = 2000
```

### 64GB Memory OLAP Server

```ini
# Memory
shared_buffers = 16GB
effective_cache_size = 48GB
work_mem = 128MB
maintenance_work_mem = 2GB

# Connection
max_connections = 50

# WAL
wal_buffers = 64MB
max_wal_size = 4GB
min_wal_size = 1GB

# Query optimization
random_page_cost = 1.1
effective_io_concurrency = 200
jit = on

# Parallel
max_parallel_workers_per_gather = 8
max_parallel_workers = 16
max_parallel_maintenance_workers = 4

# Logging
log_min_duration_statement = 5000
```

## Performance Monitoring SQL

```sql
-- Cache hit ratio (should be > 99%)
SELECT sum(blks_hit) / (sum(blks_hit) + sum(blks_read)) AS cache_hit_ratio
FROM pg_stat_database;

-- Index usage ratio
SELECT schemaname, relname, idx_scan,
       round(idx_scan::numeric / (seq_scan + idx_scan) * 100, 2) AS idx_ratio
FROM pg_stat_user_tables
WHERE seq_scan + idx_scan > 0
ORDER BY idx_ratio ASC
LIMIT 20;

-- Dead tuple monitoring
SELECT schemaname, relname, n_live_tup, n_dead_tup,
       round(n_dead_tup::numeric / NULLIF(n_live_tup + n_dead_tup, 0) * 100, 2) AS dead_ratio
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Checkpoint frequency
SELECT * FROM pg_stat_bgwriter;
```
