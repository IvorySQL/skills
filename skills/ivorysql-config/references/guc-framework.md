---
title: IvorySQL GUC Parameter Framework Details
description: Complete description of the GUC (Grand Unified Configuration) parameter framework, including parameter setting methods, scope, priority, and Oracle compatibility GUC parameter list
tags:
  - ivorysql
  - config
  - guc
  - parameters
  - oracle-compat
---

# IvorySQL GUC Parameter Framework Details

## Overview

GUC (Grand Unified Configuration) is the unified parameter configuration framework for PostgreSQL/IvorySQL, managing all configurable parameters for database instance runtime. IvorySQL extends the PostgreSQL GUC framework with Oracle compatibility parameters, using the `ivorysql.` prefix namespace to provide Oracle behavior compatibility configuration.

## Parameter Setting Methods

### 1. postgresql.conf File Configuration

The main configuration file, read at database startup:

```ini
# postgresql.conf example
listen_addresses = '*'
port = 5432
max_connections = 200
shared_buffers = 4GB

# IvorySQL Oracle compatibility parameters
ivorysql.enable_oracle_compatible = true
ivorysql.port = 1521
ivorysql.listen_mode = '*'
```

After modification, restart or reload is required:

```bash
# Reload configuration (no restart needed, only for SIGHUP type parameters)
pg_ctl reload -D /var/lib/ivorysql/data

# Or execute in SQL
SELECT pg_reload_conf();
```

### 2. ALTER SYSTEM Command

Writes parameter changes to `postgresql.auto.conf`, with higher priority than `postgresql.conf`:

```sql
-- Set parameter (automatically persisted to postgresql.auto.conf)
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET ivorysql.enable_oracle_compatible = true;

-- Set parameter with specified scope
ALTER SYSTEM SET work_mem = '64MB';

-- Reset parameter
ALTER SYSTEM RESET work_mem;
ALTER SYSTEM RESET ALL;

-- Apply configuration changes
SELECT pg_reload_conf();
```

### 3. SET Command (Session Level)

Only effective for the current session, reverts to default after session ends:

```sql
-- Session-level settings
SET work_mem = '256MB';
SET search_path = 'oracle_schema, public';
SET ivorysql.enable_oracle_compatible = true;

-- Set transaction-level parameters
SET LOCAL statement_timeout = '30s';

-- View current values
SHOW work_mem;
SHOW all;

-- Reset session parameters
RESET work_mem;
RESET ALL;
```

### 4. Command-Line Parameters

Specify at startup via command line:

```bash
# Start with parameters
postgres -D /var/lib/ivorysql/data \
  -p 5432 \
  -c shared_buffers=4GB \
  -c ivorysql.port=1521

# Using pg_ctl
pg_ctl start -D /var/lib/ivorysql/data \
  -o "-p 5432 -c ivorysql.enable_oracle_compatible=true"
```

### 5. Environment Variables

Some parameters can be set via environment variables:

```bash
export PGPORT=5432
export PGDATA=/var/lib/ivorysql/data
export PGHOST=localhost
export PGDATABASE=postgres
export PGUSER=postgres
```

## Parameter Scope and Context

The `context` of a GUC parameter determines when it can be modified and whether modification requires a restart:

| Context Type | Description | Modification Method |
|-----------|------|---------|
| `internal` | Internal parameter, determined at compile time | Cannot modify |
| `postmaster` | Requires database restart | Modify postgresql.conf + restart |
| `sighup` | Requires reload | Modify postgresql.conf + `pg_ctl reload` |
| `backends` | Effective for new connections | Modify postgresql.conf + reload, only new connections |
| `superuser` | Superuser can modify online | `SET` / `ALTER SYSTEM` |
| `user` | Regular users can modify their own session | `SET` |

### View Parameter Context

```sql
-- View parameter context type
SELECT name, setting, context, source
FROM pg_settings
WHERE name LIKE 'ivorysql%'
ORDER BY name;

-- View all parameters requiring restart
SELECT name, setting, context
FROM pg_settings
WHERE context = 'postmaster'
ORDER BY name;
```

## Parameter Priority

Priority from low to high:

```
Compile-time defaults < postgresql.conf < postgresql.auto.conf < Command-line parameters < Session SET command
```

### Priority Example

```sql
-- View parameter source
SELECT name, setting, source
FROM pg_settings
WHERE name = 'work_mem';

-- Possible source values:
-- default        - Compile default
-- configuration file - postgresql.conf
-- database       - ALTER DATABASE SET
-- user           - ALTER USER/ROLE SET
-- client         - Client connection parameter
-- override       - Command-line -c parameter
-- session        - SET command
```

### Scope Priority

```
Global (postgresql.conf) < Database-level (ALTER DATABASE SET) < Role-level (ALTER ROLE SET) < Session-level (SET)
```

```sql
-- Database-level settings
ALTER DATABASE mydb SET work_mem = '64MB';

-- Role-level settings
ALTER ROLE app_user SET search_path = 'app_schema, public';

-- Session-level settings (highest priority)
SET work_mem = '128MB';
```

## IvorySQL Oracle Compatibility GUC Parameters

### Core Oracle Compatibility Parameters

| Parameter Name | Default | Context | Description |
|--------|--------|--------|------|
| `ivorysql.enable_oracle_compatible` | `false` | postmaster | Enable Oracle compatibility mode |
| `ivorysql.port` | `1521` | postmaster | Oracle compatibility listen port |
| `ivorysql.listen_mode` | `*` | postmaster | Oracle port listen mode |
| `ivorysql.database_mode` | `pg` | sighup | Database mode (pg/oracle) |
| `ivorysql.statement_level` | `pg` | user | Statement-level compatibility mode |
| `ivorysql.nls_date_format` | `YYYY-MM-DD` | user | NLS date format |
| `ivorysql.nls_timestamp_format` | `YYYY-MM-DD HH24:MI:SS` | user | NLS timestamp format |
| `ivorysql.nls_timestamp_tz_format` | `YYYY-MM-DD HH24:MI:SS.FFTZH:TZM` | user | NLS timezone timestamp format |
| `ivorysql.nls_numeric_characters` | `.,` | user | NLS numeric separator |
| `ivorysql.max_identifier_length` | `63` | postmaster | Maximum identifier length |
| `ivorysql.enable_emptystring_to_NULL` | `false` | user | Empty string to NULL (Oracle behavior) |

### NLS Parameters

```sql
-- Set NLS date format
SET ivorysql.nls_date_format = 'YYYY-MM-DD';
SET ivorysql.nls_timestamp_format = 'YYYY-MM-DD HH24:MI:SS';

-- Global configuration
ALTER SYSTEM SET ivorysql.nls_date_format = 'YYYY-MM-DD';
SELECT pg_reload_conf();
```

### Statement-Level Compatibility Parameters

```sql
-- Switch to Oracle compatibility mode
SET ivorysql.statement_level = 'oracle';

-- Use Oracle syntax in Oracle mode
SELECT SYSDATE FROM DUAL;
SELECT ROWNUM, empno FROM emp WHERE ROWNUM <= 10;

-- Switch back to PG mode
SET ivorysql.statement_level = 'pg';
```

### Data Type Compatibility Parameters

| Parameter Name | Default | Description |
|--------|--------|------|
| `ivorysql.enable_oracle_type` | `false` | Enable Oracle data types |
| `ivorysql.enable_oracle_function` | `false` | Enable Oracle functions |
| `ivorysql.enable_oracle_package` | `false` | Enable Oracle packages |
| `ivorysql.enable_oracle_synonym` | `false` | Enable Oracle synonyms |
| `ivorysql.enable_case_preserve` | `false` | Case preservation |

### Complete IvorySQL GUC Parameter List Query

```sql
-- View all IvorySQL-specific parameters
SELECT name, setting, unit, category, short_desc, context
FROM pg_settings
WHERE name LIKE 'ivorysql%'
ORDER BY category, name;

-- View all Oracle compatibility related parameters and their current values
SELECT name, setting, source, context
FROM pg_settings
WHERE name LIKE '%oracle%' OR name LIKE '%nls%'
ORDER BY name;
```

## Parameter Configuration Best Practices

### 1. Layered Management

```ini
# postgresql.conf - Basic configuration
shared_buffers = 4GB
max_connections = 200
ivorysql.enable_oracle_compatible = true
ivorysql.port = 1521

# postgresql.auto.conf - Dynamic adjustments via ALTER SYSTEM
# Automatically managed by ALTER SYSTEM, do not edit manually
```

### 2. Parameter Change Checking

```sql
-- Check pending restart parameter changes
SELECT name, setting, pending_restart
FROM pg_settings
WHERE pending_restart = true;

-- IvorySQL 4+ usage
SELECT * FROM pg_file_settings
WHERE applied = false;
```

### 3. Configuration File Difference Comparison

```sql
-- View all non-default parameters
SELECT name, setting, source, boot_val
FROM pg_settings
WHERE setting != boot_val
ORDER BY name;
```

## Common Issues

### Q: Parameter changes not taking effect?

Check the parameter's `context` type. `postmaster` type requires restart, `sighup` type requires reload.

```sql
SELECT name, context FROM pg_settings WHERE name = 'your_param';
```

### Q: How to confirm parameter source?

```sql
SELECT name, setting, source, sourcefile, sourceline
FROM pg_settings
WHERE name = 'ivorysql.enable_oracle_compatible';
```

### Q: Relationship between ivorysql.auto.conf and postgresql.auto.conf?

IvorySQL uses `postgresql.auto.conf` (consistent with PG) to store `ALTER SYSTEM` parameter changes. Additionally, Oracle compatibility-related configuration may also be stored in `ivorysql.conf` (if it exists).
