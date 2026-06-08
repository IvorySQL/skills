---
title: psql Command Line Reference
description: IvorySQL psql command line tool complete reference, including connection, meta-commands, parser switching, and export/import
tags:
  - tools
  - psql
  - cli
  - reference
---

# psql Command Line Reference

## Connection

### Basic Connection

```bash
# Connect to local default database
psql

# Specify user and database
psql -U sysadmin -d mydb

# Specify host and port
psql -h ivorysql-host -p 1521 -U sysadmin -d mydb

# Use connection string
psql "postgresql://sysadmin:password@ivorysql-host:1521/mydb"

# Use service name (~/.pg_service.conf)
psql service=ivorysql_prod
```

### Connection Parameters

| Parameter | Description | Example |
|------|------|------|
| `-h HOST` | Host address | `-h localhost` |
| `-p PORT` | Port | `-p 1521` |
| `-U USER` | Username | `-U sysadmin` |
| `-d DB` | Database name | `-d mydb` |
| `-w` | No password prompt | |
| `-W` | Force password prompt | |
| `-c SQL` | Execute single SQL | `-c "SELECT 1"` |
| `-f FILE` | Execute SQL file | `-f script.sql` |
| `-o FILE` | Output to file | `-o result.txt` |
| `-F SEP` | Field separator | `-F ','` |
| `-A` | Unaligned mode | |
| `-t` | Show data only | |
| `-q` | Quiet mode | |
| `-1` | Execute in single transaction | |
| `-v VAR=VAL` | Set variable | `-v ON_ERROR_STOP=1` |
| `--set=VAR=VAL` | Same as -v | |

### Environment Variables

| Variable | Description |
|------|------|
| `PGHOST` | Default host |
| `PGPORT` | Default port |
| `PGUSER` | Default user |
| `PGDATABASE` | Default database |
| `PGPASSWORD` | Default password |
| `PGSERVICE` | Default service name |
| `PGSSLMODE` | SSL mode |
| `PGCONNECT_TIMEOUT` | Connection timeout (seconds) |

### .pgpass File

```
# ~/.pgpass
# Format: hostname:port:database:username:password
localhost:5432:*:sysadmin:my_password
ivorysql-host:1521:mydb:app_user:app_password
*:*:*:readonly:read_password

# Permission settings
chmod 600 ~/.pgpass
```

## Meta-Commands

### General Meta-Commands

| Command | Description |
|------|------|
| `\q` | Quit psql |
| `\c[onnect] [DB]` | Connect to another database |
| `\! [CMD]` | Execute shell command |
| `\cd [DIR]` | Change directory |
| `\set [VAR VAL]` | Set variable |
| `\unset VAR` | Delete variable |
| `\echo [TEXT]` | Output text |
| `\qecho [TEXT]` | Output to query output channel |
| `\o [FILE]` | Redirect output |
| `\i FILE` | Execute SQL file |
| `\ir FILE` | Execute SQL file (relative path) |
| `\e` | Edit query buffer |
| `\w FILE` | Write query buffer to file |
| `\r` | Reset query buffer |
| `\p` | Show query buffer |
| `\s [FILE]` | Show/save command history |
| `\?` | Help |
| `\h [SQL]` | SQL command help |

### Information Query Meta-Commands

| Command | Description |
|------|------|
| `\l` | List databases |
| `\l+` | List databases (with size) |
| `\dn` | List schemas |
| `\dn+` | List schemas (with privileges) |
| `\dt` | List tables |
| `\dt+` | List tables (with size) |
| `\dt schema.*` | List tables in specified schema |
| `\di` | List indexes |
| `\di+` | List indexes (with size) |
| `\dv` | List views |
| `\ds` | List sequences |
| `\df` | List functions |
| `\df+` | List functions (with source code) |
| `\dm` | List materialized views |
| `\d TABLE` | View table structure |
| `\d+ TABLE` | View table structure (with size/description) |
| `\d INDEX` | View index definition |
| `\d VIEW` | View view definition |
| `\d FUNCTION` | View function definition |
| `\du` | List roles |
| `\dp` | List privileges |
| `\dd` | View object description |
| `\dT` | List data types |
| `\dx` | List extensions |
| `\dx+` | List extensions (with version) |

### Format Control

| Command | Description |
|------|------|
| `\a` | Toggle aligned/unaligned mode |
| `\C [TITLE]` | Set table title |
| `\f [SEP]` | Set field separator |
| `\H` | Toggle HTML output mode |
| `\T [ATTR]` | Set HTML table attributes |
| `\x` | Toggle expanded display mode |
| `\pset [OPT VAL]` | Set print options |

### pset Options

| Option | Values | Description |
|------|------|------|
| `format` | `aligned` / `unaligned` / `html` / `asciidoc` / `latex` / `wrapped` | Output format |
| `border` | `0` / `1` / `2` | Border style |
| `expanded` | `on` / `off` / `auto` | Expanded display |
| `columns` | Number | Display width |
| `linestyle` | `ascii` / `old-ascii` / `unicode` | Line style |
| `null` | String | NULL display |
| `fieldsep` | String | Field separator |
| `recordsep` | String | Record separator |
| `title` | String | Table title |
| `tuples_only` | `on` / `off` | Show data only |
| `pager` | `on` / `off` / `always` | Pager |

## Parser Switching (\parser)

IvorySQL-specific `\parser` command for switching SQL parsers in psql:

```sql
-- View current parser
\parser

-- Switch to Oracle parser
\parser oracle

-- Switch to PG parser
\parser pg
```

### Usage Examples

```sql
-- Switch to Oracle mode
\parser oracle

-- Execute Oracle syntax
SELECT SYSDATE FROM DUAL;
SELECT * FROM employees WHERE ROWNUM <= 10;
SELECT NVL(comm, 0) FROM employees;

-- Switch back to PG mode
\parser pg

-- Execute PG syntax
SELECT current_timestamp;
SELECT * FROM employees LIMIT 10;
SELECT COALESCE(comm, 0) FROM employees;
```

### Relationship Between \parser and compatible_mode

| Setting | Effect |
|------|------|
| `\parser oracle` + `SET ivorysql.compatible_mode = oracle` | Full Oracle compatibility |
| `\parser oracle` + `SET ivorysql.compatible_mode = pg` | Oracle syntax parsing, but types/functions follow PG |
| `\parser pg` + `SET ivorysql.compatible_mode = oracle` | PG syntax parsing, but types/functions follow Oracle |
| `\parser pg` + `SET ivorysql.compatible_mode = pg` | Pure PG mode |

## Export and Import

### COPY Command

```sql
-- Export as CSV
COPY employees TO '/tmp/employees.csv' WITH CSV HEADER;

-- Export specified columns
COPY employees(empno, ename, sal) TO '/tmp/emp_partial.csv' WITH CSV HEADER;

-- Export with custom delimiter
COPY employees TO '/tmp/employees.tsv' WITH (FORMAT csv, DELIMITER E'\t', HEADER);

-- Import from CSV
COPY employees FROM '/tmp/employees.csv' WITH CSV HEADER;

-- Import with error handling
COPY employees FROM '/tmp/employees.csv' WITH CSV HEADER
    ON_ERROR STOP;

-- Export with compression using program
COPY employees TO PROGRAM 'gzip > /tmp/employees.csv.gz' WITH CSV HEADER;
```

### \copy Meta-Command

```sql
-- \copy executes on client side, does not require superuser privileges
\copy employees TO '/tmp/employees.csv' WITH CSV HEADER
\copy employees FROM '/tmp/employees.csv' WITH CSV HEADER

-- Specify delimiter
\copy employees TO '/tmp/employees.tsv' WITH (DELIMITER E'\t', HEADER)

-- Export query results
\copy (SELECT empno, ename, sal FROM employees WHERE deptno = 10) TO '/tmp/dept10.csv' WITH CSV HEADER
```

### \copy vs COPY

| Feature | COPY | \copy |
|------|------|-------|
| Execution Location | Server side | Client side |
| File Path | Server file system | Client file system |
| Permission Requirement | Superuser | Regular user |
| Performance | Faster | Slightly slower (network transfer) |
| Large Files | Recommended | Available |

### Export in Different Formats

```bash
# CSV format
psql -h localhost -U sysadmin -d mydb -c "COPY employees TO STDOUT WITH CSV HEADER" > employees.csv

# TSV format
psql -h localhost -U sysadmin -d mydb -c "COPY employees TO STDOUT WITH (DELIMITER E'\t', HEADER)" > employees.tsv

# Plain text
psql -h localhost -U sysadmin -d mydb -c "SELECT * FROM employees;" -A -F',' -o employees.txt

# HTML format
psql -h localhost -U sysadmin -d mydb -H -c "SELECT * FROM employees;" -o employees.html

# JSON format (requires PG 12+)
psql -h localhost -U sysadmin -d mydb -c "SELECT json_agg(t) FROM (SELECT * FROM employees) t;" -t -o employees.json
```

## Batch Processing and Scripting

```bash
# Execute SQL file
psql -h localhost -U sysadmin -d mydb -f script.sql

# Execute multiple SQL statements
psql -h localhost -U sysadmin -d mydb << EOF
SET ivorysql.compatible_mode = oracle;
SELECT SYSDATE FROM DUAL;
SELECT * FROM employees WHERE ROWNUM <= 5;
EOF

# Execute in single transaction
psql -1 -f script.sql

# Stop on error
psql -v ON_ERROR_STOP=1 -f script.sql

# Quiet mode
psql -q -c "VACUUM ANALYZE;"
```

### Script Template

```sql
-- script.sql
\set ON_ERROR_STOP on
\timing on

\echo 'Starting migration...'

BEGIN;

-- DDL
CREATE TABLE IF NOT EXISTS new_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- DML
INSERT INTO new_table (name) VALUES ('test');

COMMIT;

\echo 'Migration complete.'

-- Verification
SELECT count(*) FROM new_table;
```

## Notes

1. **\parser is an IvorySQL-specific command**: Standard PostgreSQL psql does not support this command
2. **COPY permissions**: Server-side COPY requires superuser privileges; regular users should use `\copy`
3. **Encoding issues**: Pay attention to file encoding during import/export; UTF-8 is recommended
4. **Large file import**: For bulk data import, it is recommended to disable indexes and constraints first, then rebuild after import
5. **ON_ERROR_STOP**: It is recommended to set `ON_ERROR_STOP=1` during script execution to prevent continued execution after errors
6. **\parser switching**: After switching the parser, all subsequent SQL in the current session will use the new parser
