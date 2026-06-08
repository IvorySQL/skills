---
title: IvorySQL Compatibility Mode Configuration
description: Detailed explanation of Oracle/PG dual mode parameters, GUC framework, dual port configuration
tags: ivorysql, config, compatible-mode, guc, dual-port
---

# IvorySQL Compatibility Mode Configuration

## ivorysql.compatible_mode

Controls the compatibility mode for the current session, affecting SQL parsing, functions, data types, and other behaviors.

### Setting Methods

```sql
-- Session level
SET ivorysql.compatible_mode TO oracle;
SET ivorysql.compatible_mode TO pg;

-- Database level
ALTER DATABASE mydb SET ivorysql.compatible_mode TO oracle;

-- User level
ALTER ROLE myuser SET ivorysql.compatible_mode TO pg;

-- Configuration file
-- postgresql.conf
ivorysql.compatible_mode = oracle
```

### Mode Behavior Differences

| Behavior | oracle mode | pg mode |
|------|------------|---------|
| Identifier case | Preserve case (unquoted to uppercase) | Convert to lowercase |
| Empty string | Treated as NULL | Empty string |
| DATE type | Includes time | Date only |
| VARCHAR2 | Available | Not available |
| NUMBER | Available | Not available |
| SYSDATE | Available | Not available |
| NVL/DECODE | Available | Not available |
| DUAL | Available | Not available |
| (+) outer join | Available | Not available |
| CONNECT BY | Available | Not available |
| ROWNUM | Available | Not available |

## Dual Port Configuration

### Enable Oracle Port at Compile Time

```bash
./configure --prefix=/usr/local/ivorysql --with-oraport=1521
make && make install
```

### Port Configuration

```ini
# postgresql.conf
port = 5432                    # PG native port
ivorysql.port = 1521           # Oracle compatibility port
listen_addresses = '*'         # Listen on all addresses
```

### Connection Methods

```bash
# Connect via PG port
psql -h localhost -p 5432 -U ivorysql -d ivorysql

# Connect via Oracle compatibility port
psql -h localhost -p 1521 -U ivorysql -d ivorysql
```

### Relationship Between Connection Port and Mode

| Connection Port | Default Parser | Can Switch |
|----------|-----------|---------|
| 5432 (PG) | PG Parser | Yes, via SET |
| 1521 (Oracle) | Oracle Parser | Yes, via SET |

## initdb Mode Selection

```bash
# Oracle compatibility mode (default)
initdb -D /data/ivorysql -m oracle

# Pure PG mode
initdb -D /data/ivorysql -m pg

# Default is oracle if not specified
initdb -D /data/ivorysql
```

### Initialization Mode Differences

| Item | -m oracle | -m pg |
|------|-----------|-------|
| Default database | ivorysql | ivorysql |
| ivorysql_ora plugin | Auto-installed | Not installed |
| Default parser | Oracle Parser | PG Parser |
| Default compatibility mode | oracle | pg |

## psql Parser Switching

Use the `\parser` command in the psql client to switch the current session's parser:

```sql
-- View current parser
\parser

-- Switch parser
\parser  -- Execute again to switch
```

## Case Configuration

```sql
-- -C parameter controls case conversion
-- Set at compile time or connection time

-- Oracle mode: unquoted identifiers converted to uppercase
CREATE TABLE MyTable (Id NUMBER);
-- Actually stored as MYTABLE (ID NUMBER)

-- PG mode: unquoted identifiers converted to lowercase
CREATE TABLE MyTable (Id INTEGER);
-- Actually stored as mytable (id INTEGER)

-- Use double quotes to preserve case (applies to both modes)
CREATE TABLE "MyTable" ("Id" INTEGER);
```
