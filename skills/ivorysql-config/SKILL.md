---
name: IvorySQL System Configuration
name_for_command: ivorysql-config
description: |
  Complete IvorySQL system configuration reference: GUC parameter framework, compatibility mode configuration, dual port configuration,
  connection parameters, memory parameters, WAL configuration, query optimization parameters, logging configuration, Oracle compatibility parameters.
---

# IvorySQL System Configuration

IvorySQL inherits PostgreSQL's GUC (Grand Unified Configuration) framework and extends it with Oracle compatibility-related parameters.

## Workflow

Trigger this skill when encountering the following issues:
- GUC parameter configuration and tuning
- Compatibility mode (oracle/pg) switching
- Dual port (5432/1521) configuration
- Connection parameters, memory parameter optimization
- WAL, logging configuration

**Sub-skill routing**:
- Performance tuning → `references/performance-config.md`
- High availability configuration → `ivorysql-ha`
- Security configuration → `ivorysql-security`

## Configuration Files

| File | Location | Description |
|------|------|------|
| postgresql.conf | $PGDATA/ | Main configuration file |
| pg_hba.conf | $PGDATA/ | Client authentication configuration |
| pg_ident.conf | $PGDATA/ | Username mapping |
| postgresql.auto.conf | $PGDATA/ | Automatically written by ALTER SYSTEM |

## Compatibility Mode Configuration

> For details: [compatible-config](references/compatible-config.md)

### Core Compatibility Parameters

| Parameter | Default | Description |
|------|--------|------|
| ivorysql.compatible_mode | oracle | Compatibility mode (oracle/pg) |
| ivorysql.port | 1521 | Oracle compatibility port |
| ivorysql.charset | - | Character set |

### Mode Switching

```sql
-- Session level
SET ivorysql.compatible_mode TO oracle;
SET ivorysql.compatible_mode TO pg;

-- Database level
ALTER DATABASE mydb SET ivorysql.compatible_mode TO oracle;

-- User level
ALTER ROLE myuser SET ivorysql.compatible_mode TO pg;
```

## Connection Configuration

| Parameter | Default | Description |
|------|--------|------|
| listen_addresses | 'localhost' | Listen address |
| port | 5432 | PG native port |
| max_connections | 100 | Maximum connections |
| superuser_reserved_connections | 3 | Superuser reserved connections |
| tcp_keepalives_idle | 0 | TCP keepalive idle time |
| tcp_keepalives_interval | 0 | TCP keepalive interval |
| tcp_keepalives_count | 0 | TCP keepalive count |

## Memory Configuration

| Parameter | Default | Description | Recommended |
|------|--------|------|--------|
| shared_buffers | 128MB | Shared buffers | 25% of system memory |
| effective_cache_size | 4GB | Query planner cache estimate | 75% of system memory |
| work_mem | 4MB | Sort/hash operation memory | 16-64MB |
| maintenance_work_mem | 64MB | Maintenance operation memory | 256MB-1GB |
| wal_buffers | -1(auto) | WAL buffer | 64MB |
| huge_pages | try | Huge page memory | try/on |

## WAL Configuration

| Parameter | Default | Description |
|------|--------|------|
| wal_level | replica | WAL level (minimal/replica/logical) |
| max_wal_size | 1GB | Maximum WAL size |
| min_wal_size | 80MB | Minimum WAL size |
| wal_compression | off | WAL compression |
| checkpoint_completion_target | 0.9 | Checkpoint completion target |
| archive_mode | off | Archive mode |

## Query Optimization

> For details: [performance-config](references/performance-config.md)

| Parameter | Default | Description |
|------|--------|------|
| effective_io_concurrency | 1 | Concurrent IO count |
| random_page_cost | 4.0 | Random page cost |
| seq_page_cost | 1.0 | Sequential page cost |
| max_parallel_workers_per_gather | 2 | Parallel workers per gather |
| max_parallel_workers | 8 | Maximum parallel workers |
| jit | on | JIT compilation |
| enable_seqscan | on | Sequential scan |
| enable_indexscan | on | Index scan |
| enable_hashjoin | on | Hash join |

## Logging Configuration

| Parameter | Default | Description |
|------|--------|------|
| logging_collector | off | Log collector |
| log_directory | log | Log directory |
| log_filename | postgresql-%Y-%m-%d.log | Log filename |
| log_min_duration_statement | -1 | Log slow query threshold (ms) |
| log_statement | none | Log statement type (none/dml/ddl/all) |
| log_connections | off | Log connections |
| log_disconnections | off | Log disconnections |

## Reference Documents

- [Compatibility Mode Configuration](references/compatible-config.md) — Oracle/PG dual mode parameters
- [Performance Configuration](references/performance-config.md) — Memory, WAL, query optimization parameters
- [Connection and Security Configuration](references/connection-config.md) — Connection pool, authentication, SSL configuration
