---
title: IvorySQL Compatibility Mode Switching
description: Dual mode switching / GUC parameters / parser switching / initdb mode
tags: ivorysql, compatible-mode, oracle, pg, parser, guc, initdb
---

# IvorySQL Compatibility Mode Switching

The greatest feature of IvorySQL is its ability to simultaneously support both Oracle and PostgreSQL database behaviors. Through the compatibility mode switching mechanism, users can flexibly switch between Oracle compatibility mode and PostgreSQL native mode to adapt to different application scenarios and migration needs.

## Choosing a Mode During Initialization

When initializing the data directory with `initdb`, you can select the default compatibility mode using the `-m` parameter:

```bash
# Oracle compatibility mode (default)
initdb -D /data/ivorysql_ora -m oracle

# PostgreSQL native mode
initdb -D /data/ivorysql_pg -m pg

# Default is Oracle mode when not specified
initdb -D /data/ivorysql_default
```

### Impact of initdb Mode Selection

| Item | `-m oracle` | `-m pg` |
|--------|------------|---------|
| Default compatibility mode | oracle | pg |
| Default database | ivorysql | postgres |
| Default listening port | 1521 | 5432 |
| Default parser | Oracle Parser | PG Parser |
| Auto-load compatibility functions | Yes | No |
| DUAL pseudo table | Auto-created | Not created |
| Oracle system views | Auto-created | Not created |
| Empty string behavior | Equals NULL | Empty string |

## Session-Level Switching

In an active session, you can dynamically switch the compatibility mode using the `SET` command:

```sql
-- Switch to Oracle compatibility mode
SET ivorysql.compatible_mode TO oracle;

-- Switch back to PostgreSQL mode
SET ivorysql.compatible_mode TO pg;

-- View current mode
SHOW ivorysql.compatible_mode;
```

### Scope of Session-Level Switching

Session-level switching only affects the current connection and does not impact other sessions or global settings. After switching, subsequent SQL statements will be parsed and executed according to the new mode.

```sql
-- Demo: switching modes in the same session
SET ivorysql.compatible_mode TO oracle;
SELECT SYSDATE FROM DUAL;  -- Available in Oracle mode

SET ivorysql.compatible_mode TO pg;
SELECT current_timestamp;  -- Equivalent in PG mode
```

## \parser Command in psql

IvorySQL enhances the psql client with the `\parser` meta-command for switching the SQL parser:

```sql
-- Switch to Oracle parser
\parser oracle

-- Switch to PG parser
\parser pg

-- View current parser
\parser
```

### Relationship Between Parser and Compatibility Mode

Parser switching and compatibility mode switching are independent operations, but they are typically used together:

| Scenario | compatible_mode | parser | Description |
|------|----------------|--------|------|
| Full Oracle compatibility | oracle | oracle | Oracle syntax + Oracle behavior |
| Full PG native | pg | pg | PostgreSQL native syntax and behavior |
| Mixed mode (not recommended) | oracle | pg | May cause unexpected behavior |

> **Best Practice**: Keep `compatible_mode` and `parser` consistent to avoid parsing errors caused by inconsistencies.

## Database-Level Switching

You can set the default compatibility mode for an entire database:

```sql
-- Set database default to Oracle mode
ALTER DATABASE mydb SET ivorysql.compatible_mode TO oracle;

-- Set database default to PG mode
ALTER DATABASE mydb SET ivorysql.compatible_mode TO pg;
```

New connections to the database will automatically use the configured mode, but it can still be overridden by session-level SET.

## Role-Level Switching

You can set the default compatibility mode for a specific user/role:

```sql
-- Set role default to PG mode
ALTER ROLE app_user SET ivorysql.compatible_mode TO pg;

-- Set role default to Oracle mode
ALTER ROLE oracle_user SET ivorysql.compatible_mode TO oracle;
```

Role-level settings take precedence over database-level settings.

## Configuration File Settings

Set global defaults in `ivorysql.conf` (or `postgresql.conf`):

```ini
# Global default compatibility mode
ivorysql.compatible_mode = oracle

# or
ivorysql.compatible_mode = pg
```

## Priority Order

The effective priority order for compatibility mode (highest to lowest):

1. **Session-level** `SET ivorysql.compatible_mode`
2. **Role-level** `ALTER ROLE ... SET`
3. **Database-level** `ALTER DATABASE ... SET`
4. **Configuration file** `ivorysql.conf`
5. **initdb initial value** `-m` parameter

## Oracle Mode vs PG Mode Behavior Differences

| Feature | Oracle Mode | PG Mode |
|------|------------|---------|
| Default database | ivorysql | postgres |
| Identifier case | Preserved (uppercase when unquoted) | Converted to lowercase |
| Empty string | Equals NULL | Empty string (distinct from NULL) |
| Compatibility functions | Auto-loaded (NVL/DECODE, etc.) | Requires manual extension creation |
| Parser | Oracle Parser | PG Parser |
| DUAL table | Supported | Not supported |
| (+) outer join | Supported | Not supported |
| CONNECT BY | Hierarchical query supported | Not supported |
| MERGE INTO | Supported | Uses INSERT ... ON CONFLICT |
| SYSDATE | Returns current date and time | Not available, use now() |
| VARCHAR2 | Supported, empty string treated as NULL | Not supported, use VARCHAR |
| NUMBER | Supported | Not supported, use NUMERIC |
| DATE type | Includes date + time | Date only |
| Package | Supported | Not supported |
| %TYPE/%ROWTYPE | Supported | Supported (slightly different syntax) |
| ROWID pseudo column | Supported | Not supported |
| Invisible columns | Supports INVISIBLE | Not supported |
| FORCE VIEW | Supported | Not supported |
| String concatenation | \|\| operator | \|\| operator |
| Date arithmetic | Add/subtract days directly with +/- | Requires INTERVAL |
| Quote style | Single-quoted strings, double-quoted identifiers | Single-quoted strings, double-quoted identifiers |

## GUC Parameter List

IvorySQL adds the following GUC (Grand Unified Configuration) parameters related to compatibility mode:

### Core Compatibility Parameters

| Parameter | Type | Default | Description |
|--------|------|--------|------|
| `ivorysql.compatible_mode` | enum | oracle | Compatibility mode selection (oracle/pg) |
| `ivorysql.port` | integer | 1521 (oracle) / 5432 (pg) | Listening port |
| `ivorysql.enable_oracle_parser` | bool | on | Whether to enable Oracle parser |

### Database Behavior Parameters

| Parameter | Type | Default | Description |
|--------|------|--------|------|
| `ivorysql.identifier_case_switch` | enum | normal | Identifier case handling |
| `ivorysql.enable_emptystring_to_null` | bool | on (oracle) | Convert empty string to NULL |
| `ivorysql.enable_oracle_os_user` | bool | off | Oracle OS user authentication |
| `ivorysql.nls_date_format` | string | YYYY-MM-DD HH24:MI:SS | NLS date format |
| `ivorysql.nls_timestamp_format` | string | YYYY-MM-DD HH24:MI:SS.FF | NLS timestamp format |
| `ivorysql.nls_timestamp_tz_format` | string | YYYY-MM-DD HH24:MI:SS.FFTZHTZM | NLS timezone-aware timestamp format |
| `ivorysql.nls_numeric_characters` | string | ., | NLS numeric separators |

### Parser Parameters

| Parameter | Type | Default | Description |
|--------|------|--------|------|
| `ivorysql.parser_type` | enum | oracle | Current parser type |
| `ivorysql.enable_binary_compat` | bool | on | Binary compatibility mode |

### Security Parameters

| Parameter | Type | Default | Description |
|--------|------|--------|------|
| `ivorysql.enable_oracle_role` | bool | off | Oracle role compatibility |
| `ivorysql.edb_redwood_date` | bool | on | DATE type mapped to TIMESTAMP |

## Code Examples

### Example 1: Initialize and Switch Modes

```bash
# Initialize Oracle mode data directory
initdb -D /data/ivorysql -m oracle

# Start IvorySQL
pg_ctl -D /data/ivorysql -l logfile start

# Connect (default Oracle mode)
psql -d ivorysql -p 1521
```

### Example 2: Dynamic Switching in psql

```sql
-- View current mode
SHOW ivorysql.compatible_mode;

-- Use Oracle syntax
SET ivorysql.compatible_mode TO oracle;
\parser oracle

SELECT NVL(NULL, 'Hello') FROM DUAL;
SELECT SYSDATE FROM DUAL;

-- Switch to PG syntax
SET ivorysql.compatible_mode TO pg;
\parser pg

SELECT COALESCE(NULL, 'Hello');
SELECT now();
```

### Example 3: Setting Different Modes for Different Users

```sql
-- Create two users
CREATE USER oracle_app WITH PASSWORD 'oracle123';
CREATE USER pg_app WITH PASSWORD 'pg123';

-- oracle_app uses Oracle mode
ALTER ROLE oracle_app SET ivorysql.compatible_mode TO oracle;

-- pg_app uses PG mode
ALTER ROLE pg_app SET ivorysql.compatible_mode TO pg;

-- Each user automatically uses their own mode after connecting
```

### Example 4: NLS Format Settings

```sql
-- Set date display format
SET ivorysql.nls_date_format TO 'YYYY-MM-DD HH24:MI:SS';

-- Set numeric separators (European style: comma as decimal point)
SET ivorysql.nls_numeric_characters TO ',.';

-- See the effect
SELECT SYSDATE FROM DUAL;
```

### Example 5: Empty String Behavior Differences

```sql
-- Oracle mode: empty string equals NULL
SET ivorysql.compatible_mode TO oracle;

CREATE TABLE test_empty (col VARCHAR2(10));
INSERT INTO test_empty VALUES ('');
SELECT * FROM test_empty WHERE col IS NULL;  -- Returns the inserted row

-- PG mode: empty string is NOT NULL
SET ivorysql.compatible_mode TO pg;

CREATE TABLE test_pg (col VARCHAR(10));
INSERT INTO test_pg VALUES ('');
SELECT * FROM test_pg WHERE col IS NULL;  -- Does NOT return the row
SELECT * FROM test_pg WHERE col = '';     -- Returns the row
```
