---
title: MySQL/PostgreSQL Migration to IvorySQL
description: MySQL to IvorySQL and PostgreSQL to IvorySQL migration guide
tags: ivorysql, migration, mysql, postgresql, pgloader
---

# MySQL/PostgreSQL Migration to IvorySQL

## PostgreSQL to IvorySQL

IvorySQL is 100% compatible with PostgreSQL, making migration straightforward.

### Migration Steps

```bash
# 1. Install IvorySQL (compatible with PG data directory)
# IvorySQL can directly use PG's data directory

# 2. Or use pg_dump/pg_restore
pg_dump -h pg_host -d mydb -F c -f mydb.dump
pg_restore -h ivorysql_host -d ivorysql mydb.dump

# 3. Verify
psql -h ivorysql_host -d ivorysql -c "SELECT version();"
```

### Notes

- IvorySQL default database name is `ivorysql` (instead of `postgres`)
- Oracle compatibility mode can be optionally enabled
- All PG extensions can continue to be used

## MySQL to IvorySQL

### Data Type Mapping

| MySQL Type | IvorySQL Type | Notes |
|------------|--------------|-------|
| TINYINT | SMALLINT | PG has no TINYINT |
| SMALLINT | SMALLINT | Direct mapping |
| MEDIUMINT | INTEGER | Direct mapping |
| INT / INTEGER | INTEGER | Direct mapping |
| BIGINT | BIGINT | Direct mapping |
| FLOAT | REAL | Direct mapping |
| DOUBLE | DOUBLE PRECISION | Direct mapping |
| DECIMAL(p,s) | NUMERIC(p,s) | Direct mapping |
| CHAR(n) | CHAR(n) | Direct mapping |
| VARCHAR(n) | VARCHAR(n) | Direct mapping |
| TINYTEXT | TEXT | Direct mapping |
| TEXT | TEXT | Direct mapping |
| MEDIUMTEXT | TEXT | Direct mapping |
| LONGTEXT | TEXT | Direct mapping |
| BLOB | BYTEA | Different type name |
| DATETIME | TIMESTAMP | Direct mapping |
| DATE | DATE | Direct mapping |
| TIME | TIME | Direct mapping |
| TIMESTAMP | TIMESTAMPTZ | Watch out for timezone |
| ENUM | VARCHAR + CHECK | PG has no ENUM |
| SET | VARCHAR[] | PG has no SET |
| JSON | JSONB | JSONB recommended |
| AUTO_INCREMENT | SERIAL / IDENTITY | Different syntax |

### SQL Syntax Differences

| MySQL | IvorySQL | Description |
|-------|----------|-------------|
| `LIMIT n` | `LIMIT n` | Same |
| `LIMIT n OFFSET m` | `LIMIT n OFFSET m` | Same |
| `INSERT IGNORE` | `ON CONFLICT DO NOTHING` | Different syntax |
| `REPLACE INTO` | `INSERT ... ON CONFLICT DO UPDATE` | Different syntax |
| `ON DUPLICATE KEY` | `ON CONFLICT` | Different syntax |
| `GROUP_CONCAT` | `STRING_AGG` | Different function name |
| `IFNULL(a, b)` | `COALESCE(a, b)` | Different function name |
| `NOW()` | `NOW()` / `CURRENT_TIMESTAMP` | Same |
| `UNIX_TIMESTAMP()` | `EXTRACT(EPOCH FROM ...)` | Different function |
| `` `column` `` | `"column"` | Backtick to double quote |
| `CONCAT_WS` | `CONCAT_WS` | Same |

### Migration with pgLoader

```bash
# Install
apt install -y pgloader

# Migrate entire database
pgloader mysql://root:password@mysql_host/mydb \
         postgresql://ivorysql:password@ivorysql_host/ivorysql

# Using configuration file
cat > pgloader.load << EOF
LOAD DATABASE
    FROM mysql://root:password@mysql_host/mydb
    INTO postgresql://ivorysql:password@ivorysql_host/ivorysql

WITH include drop, create tables, create indexes, reset sequences,
     downcase identifiers

SET maintenance_work_mem to '512MB', work_mem to '64MB'

CAST type datetime to timestamptz using zero-dates-to-null,
     type tinyint to smallint,
     type enum to varchar using enum-to-string

EXCLUDING TABLE NAMES MATCHING 'tmp_.*'
EOF

pgloader pgloader.load
```
