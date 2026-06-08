---
title: IvorySQL Migration Tools Guide
description: Complete guide for IvorySQL database migration tools, covering ora2pg, pgloader, custom scripts, and IvorySQL migration assistant
tags:
  - ivorysql
  - migration
  - tools
  - ora2pg
  - pgloader
  - script
---

# IvorySQL Migration Tools Guide

## Overview

Database migration cannot be done without professional tools. This document introduces commonly used IvorySQL migration tools: ora2pg (the preferred choice for Oracle migration), pgloader (for MySQL/general migration), and custom script solutions.

## Tool Comparison

| Tool | Source | Target | Features | Use Case |
|------|--------|--------|----------|----------|
| ora2pg | Oracle | PG/IvorySQL | Schema + data + code migration | Preferred for Oracle migration |
| pgloader | MySQL/SQLite/CSV | PG/IvorySQL | Schema + data migration | MySQL migration |
| AWS DMS | Multiple | Multiple | CDC real-time sync | Cloud migration |
| Custom scripts | Any | Any | Flexible customization | Special requirements |

## ora2pg

### Installation

```bash
# CentOS/RHEL
yum install -y perl-DBI perl-DBD-Oracle perl-DBD-Pg perl-ExtUtils-MakeMaker
yum install -y ora2pg

# Or install from CPAN
cpan install Ora2Pg

# Install from source
git clone https://github.com/darold/ora2pg.git
cd ora2pg
perl Makefile.PL
make && make install
```

### Basic Configuration

```ini
; ora2pg.conf - Basic configuration
; Oracle connection
ORACLE_DSN  dbi:Oracle:host=oracle-host;sid=ORCL;port=1521
ORACLE_USER schema_owner
ORACLE_PWD  password

; Target IvorySQL connection
PG_DSN      dbi:Pg:host=ivorysql-host;port=1521;dbname=app_db
PG_USER     ivorysql
PG_PWD      ivorysql_password

; Schema configuration
SCHEMA      APP_SCHEMA
EXPORT_SCHEMA 1
PG_SCHEMA   app_schema

; Output configuration
OUTPUT      /tmp/migration/output.sql
OUTPUT_DIR  /tmp/migration

; Type configuration
TYPE        TABLE

; Data type mapping
DATA_TYPE   NUMBER:numeric
DATA_TYPE   VARCHAR2:varchar
DATA_TYPE   DATE:timestamp

; Performance configuration
JOBS        8
PARALLEL_TABLES 4
```

### Schema Migration

```bash
# Export table structure
ora2pg -c ora2pg.conf --no_blob_export --schema_only --type TABLE > tables.sql

# Export indexes
ora2pg -c ora2pg.conf --type INDEX > indexes.sql

# Export constraints
ora2pg -c ora2pg.conf --type CONSTRAINT > constraints.sql

# Export sequences
ora2pg -c ora2pg.conf --type SEQUENCE > sequences.sql

# Export views
ora2pg -c ora2pg.conf --type VIEW > views.sql

# Export triggers
ora2pg -c ora2pg.conf --type TRIGGER > triggers.sql

# Export synonyms
ora2pg -c ora2pg.conf --type SYNONYM > synonyms.sql

# Export all schema at once
ora2pg -c ora2pg.conf --schema_only > full_schema.sql
```

### Data Migration

```bash
# Export data (COPY format, fastest)
ora2pg -c ora2pg.conf --type COPY --no_schema_export > data_copy.sql

# Export data (INSERT format)
ora2pg -c ora2pg.conf --type INSERT --no_schema_export > data_insert.sql

# Parallel export
ora2pg -c ora2pg.conf --type COPY --jobs 8 --no_schema_export > data_parallel.sql

# Export specific tables
ora2pg -c ora2pg.conf --type COPY --allow TABLE1,TABLE2 > partial_data.sql

# Exclude large tables
ora2pg -c ora2pg.conf --type COPY --exclude BIG_TABLE1,BIG_TABLE2 > data_no_big.sql

# Direct import to IvorySQL (skip file)
ora2pg -c ora2pg.conf --type COPY --no_schema_export | \
    psql -h ivorysql-host -p 1521 -U ivorysql -d app_db
```

### Code Migration

```bash
# Export functions
ora2pg -c ora2pg.conf --type FUNCTION > functions.sql

# Export stored procedures
ora2pg -c ora2pg.conf --type PROCEDURE > procedures.sql

# Export packages
ora2pg -c ora2pg.conf --type PACKAGE > packages.sql

# PL/SQL to PL/pgSQL automatic conversion
ora2pg -c ora2pg.conf --plsql_pgsql --type PROCEDURE > procedures_pg.sql

# Export all code
ora2pg -c ora2pg.conf --type FUNCTION --type PROCEDURE --type PACKAGE > all_code.sql
```

### Custom Data Type Mapping

```ini
; ora2pg.conf - Advanced type mapping
DATA_TYPE   NUMBER:numeric
DATA_TYPE   NUMBER(.*):integer     ; NUMBER with precision<=10 mapped to integer
DATA_TYPE   VARCHAR2:varchar
DATA_TYPE   NVARCHAR2:varchar
DATA_TYPE   CLOB:text
DATA_TYPE   BLOB:bytea
DATA_TYPE   RAW:bytea
DATA_TYPE   LONG:text
DATA_TYPE   LONG RAW:bytea
DATA_TYPE   DATE:timestamp
DATA_TYPE   TIMESTAMP:timestamptz

; Rename tables/columns
REPLACE_TABLE  OLD_NAME:NEW_NAME
REPLACE_COLUMN  TABLE.OLD_COL:NEW_COL
```

### Migration Assessment

```bash
# Generate migration assessment report
ora2pg -c ora2pg.conf --estimate_cost --type TABLE > assessment.txt

# Assessment report includes:
# - Migration complexity level (A-E)
# - Migration cost per table
# - List of incompatible features
# - Estimated effort

# Check only incompatible items
ora2pg -c ora2pg.conf --check_only > incompatibilities.txt
```

## pgloader

### Installation

```bash
# Ubuntu/Debian
apt-get install -y pgloader

# CentOS/RHEL (from source)
yum install -y sbcl libsqlite3-dev libfdtd-dev
git clone https://github.com/dimitri/pgloader.git
cd pgloader
make
make install
```

### MySQL to IvorySQL Migration

```lisp
;; mysql_to_ivorysql.load
LOAD DATABASE
    FROM mysql://user:password@mysql-host:3306/app_db
    INTO postgresql://ivorysql:password@ivorysql-host:5432/app_db

WITH include drop, create tables, create indexes, reset sequences,
     data only,
     prefetch rows = 10000,
     batch rows = 5000

SET maintenance_work_mem to '512MB',
    work_mem to '128MB'

CAST type varchar to text,
     type tinyint to smallint,
     type double to double precision,
     type int unsigned to bigint

ALTER SCHEMA 'app_db' RENAME TO 'public'

BEFORE LOAD DO
    $$ CREATE EXTENSION IF NOT EXISTS pgcrypto; $$

AFTER LOAD DO
    $$ ANALYZE; $$
;
```

```bash
# Execute migration
pgloader mysql_to_ivorysql.load

# Command-line method
pgloader mysql://user:password@mysql-host:3306/app_db \
         postgresql://ivorysql:password@ivorysql-host:5432/app_db
```

### CSV Import

```lisp
;; csv_to_ivorysql.load
LOAD CSV
    FROM '/path/to/data.csv'
    INTO postgresql://ivorysql:password@ivorysql-host:5432/app_db

WITH fields optionally enclosed by '"',
     fields terminated by ','

TARGET TABLE target_table

SET work_mem to '128MB'
;
```

### SQLite Migration

```bash
pgloader sqlite:///path/to/database.db \
         postgresql://ivorysql:password@ivorysql-host:5432/app_db
```

## Custom Migration Scripts

### Python Migration Script

```python
#!/usr/bin/env python3
"""Oracle to IvorySQL migration script using cx_Oracle and psycopg2"""

import cx_Oracle
import psycopg2
from psycopg2.extras import execute_values

# Oracle connection
ora_conn = cx_Oracle.connect('user/password@oracle-host:1521/ORCL')
ora_cur = ora_conn.cursor()

# IvorySQL connection
pg_conn = psycopg2.connect(
    host='ivorysql-host',
    port=1521,
    database='app_db',
    user='ivorysql',
    password='ivorysql_password'
)
pg_cur = pg_conn.cursor()

# Table list
tables = ['EMPLOYEES', 'DEPARTMENTS', 'SALARY_GRADES']

for table in tables:
    print(f"Migrating table: {table}")

    # Read from Oracle
    ora_cur.execute(f"SELECT * FROM {table}")
    columns = [desc[0].lower() for desc in ora_cur.description]
    rows = ora_cur.fetchall()

    if not rows:
        print(f"  Table {table} is empty, skipping")
        continue

    # Write to IvorySQL
    table_lower = table.lower()
    cols_str = ', '.join(columns)
    placeholders = ', '.join(['%s'] * len(columns))

    insert_sql = f"INSERT INTO {table_lower} ({cols_str}) VALUES %s"

    # Bulk insert using execute_values
    execute_values(pg_cur, insert_sql, rows, page_size=1000)
    pg_conn.commit()

    print(f"  Migrated {len(rows)} rows from {table}")

# Close connections
ora_cur.close()
ora_conn.close()
pg_cur.close()
pg_conn.close()

print("Migration completed!")
```

### Shell Script (Incremental Sync)

```bash
#!/bin/bash
# incremental_sync.sh - Incremental data sync script

SOURCE_HOST="oracle-host"
TARGET_HOST="ivorysql-host"
TARGET_PORT=1521
DB_NAME="app_db"
SYNC_TABLES="employees departments salary_grades"
LAST_SYNC_FILE="/var/tmp/last_sync_timestamp"

# Get last sync time
if [ -f "$LAST_SYNC_FILE" ]; then
    LAST_SYNC=$(cat "$LAST_SYNC_FILE")
else
    LAST_SYNC="1970-01-01 00:00:00"
fi

echo "Syncing changes since: $LAST_SYNC"

for table in $SYNC_TABLES; do
    echo "Syncing table: $table"

    # Export incremental data from source
    sqlplus -s user/password@${SOURCE_HOST}/ORCL <<EOF > /tmp/${table}_increment.csv
SET HEADING OFF
SET FEEDBACK OFF
SET PAGESIZE 0
SET LINESIZE 32767
SET COLSEP '|'
SELECT * FROM ${table}
WHERE last_modified > TO_TIMESTAMP('${LAST_SYNC}', 'YYYY-MM-DD HH24:MI:SS');
EXIT
EOF

    # Import to IvorySQL
    if [ -s /tmp/${table}_increment.csv ]; then
        psql -h ${TARGET_HOST} -p ${TARGET_PORT} -U ivorysql -d ${DB_NAME} -c "
            COPY ${table} FROM '/tmp/${table}_increment.csv'
            WITH (FORMAT csv, DELIMITER '|');
        "
        echo "  Synced $(wc -l < /tmp/${table}_increment.csv) rows"
    else
        echo "  No changes"
    fi
done

# Update sync timestamp
date '+%Y-%m-%d %H:%M:%S' > "$LAST_SYNC_FILE"
echo "Sync completed at $(cat $LAST_SYNC_FILE)"
```

### Data Validation Script

```python
#!/usr/bin/env python3
"""Data validation between Oracle and IvorySQL"""

import cx_Oracle
import psycopg2

def validate_table(ora_cur, pg_cur, table_name):
    """Validate row counts and checksums"""
    # Row count comparison
    ora_cur.execute(f"SELECT COUNT(*) FROM {table_name}")
    ora_count = ora_cur.fetchone()[0]

    pg_cur.execute(f"SELECT COUNT(*) FROM {table_name.lower()}")
    pg_count = pg_cur.fetchone()[0]

    status = "OK" if ora_count == pg_count else "MISMATCH"
    print(f"  {table_name}: Oracle={ora_count}, IvorySQL={pg_count} [{status}]")

    return ora_count == pg_count

# Connections
ora_conn = cx_Oracle.connect('user/password@oracle-host:1521/ORCL')
pg_conn = psycopg2.connect(host='ivorysql-host', port=1521,
                          database='app_db', user='ivorysql', password='xxx')

ora_cur = ora_conn.cursor()
pg_cur = pg_conn.cursor()

tables = ['EMPLOYEES', 'DEPARTMENTS', 'SALARY_GRADES']

all_ok = True
for table in tables:
    if not validate_table(ora_cur, pg_cur, table):
        all_ok = False

if all_ok:
    print("\nAll tables validated successfully!")
else:
    print("\nSome tables have mismatches!")

ora_cur.close()
pg_cur.close()
```

## IvorySQL Migration Assistant

IvorySQL may provide an official migration assistant tool:

```bash
# Install migration assistant (if available)
# yum install -y ivorysql-migration-assistant

# Run assessment
# ivorysql-migrate assess --source oracle://host/ORCL --target ivorysql://host/app_db

# Execute migration
# ivorysql-migrate run --config migration.yaml

# Validate migration
# ivorysql-migrate validate --config migration.yaml
```

## Migration Best Practices

1. **Migrate schema first, then data**: Complete all DDL migration first, verify correctness before migrating data
2. **Batch large tables**: Use batch export/import for large tables to avoid oversized single transactions
3. **Disable constraints and indexes**: Disable foreign keys and indexes during data import, rebuild after import completes
4. **Verify data integrity**: Validate row counts and checksums after each batch of data is imported
5. **Keep source read-only**: After switchover, keep the source database in read-only mode for a period of time
6. **Document all changes**: Record all manual modifications and adaptations
7. **Establish rollback plans**: Every change should have a rollback path
