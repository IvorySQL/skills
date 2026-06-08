---
name: IvorySQL Data Migration
name_for_command: ivorysql-migration
description: |
  Complete IvorySQL data migration guide: Oracle to IvorySQL (data type mapping, function replacement, syntax conversion,
  PL/SQL → PL/iSQL), MySQL to IvorySQL, PostgreSQL to IvorySQL (drop-in replacement),
  migration tools (ora2pg, pgLoader), migration validation.
---

# IvorySQL Data Migration

## Workflow

Trigger this skill when encountering the following issues:
- Oracle → IvorySQL migration
- MySQL → IvorySQL migration
- PG → IvorySQL migration (drop-in replacement)
- Migration tools (ora2pg/pgLoader)
- Data type mapping and syntax conversion

**Sub-skill routing**:
- SQL syntax → `ivorysql-sql`
- PL/iSQL → `ivorysql-plisql`
- Oracle compatibility features → `ivorysql-oracle-compat`

IvorySQL supports data migration from Oracle, MySQL, PostgreSQL and other databases, with Oracle migration being the core scenario.

## Migration Overview

| Source Database | Difficulty | Key Challenges | Recommended Tools |
|----------|------|----------|----------|
| PostgreSQL | ★☆☆ | Almost none (drop-in) | pg_dump/pg_restore |
| Oracle | ★★★ | Significant syntax differences, PL/SQL conversion | ora2pg, manual conversion |
| MySQL | ★★☆ | Moderate syntax differences | pgLoader, manual conversion |

> For details: [oracle-migration](references/oracle-migration.md)

## PostgreSQL Migration (Drop-in Replacement)

IvorySQL is 100% compatible with PostgreSQL, and pg_dump/pg_restore can be used directly for migration.

```bash
# Backup PG database
pg_dump -h pg_host -d mydb -F c -f mydb.dump

# Restore to IvorySQL
pg_restore -h ivorysql_host -d ivorysql mydb.dump

# Verify
psql -h ivorysql_host -d ivorysql -c "SELECT count(*) FROM my_table;"
```

## Oracle Migration

### Migration Steps

1. **Assessment**: Analyze Oracle database objects and dependencies
2. **Schema Conversion**: Data types, functions, syntax conversion
3. **Data Migration**: Use ora2pg or ETL tools
4. **PL/SQL Conversion**: Leverage PL/iSQL compatibility
5. **Application Adaptation**: Connection strings, drivers, SQL statement adjustments
6. **Testing and Validation**: Functional testing, performance testing

### Data Type Mapping

| Oracle | IvorySQL (Oracle Mode) | Description |
|--------|----------------------|------|
| VARCHAR2 | VARCHAR2 | Direct mapping |
| NUMBER | NUMBER | Direct mapping |
| DATE | DATE (→ TIMESTAMP) | Oracle DATE includes time |
| BLOB | BLOB (→ BYTEA) | Direct mapping |
| CLOB | CLOB (→ TEXT) | Direct mapping |
| RAW | RAW (→ BYTEA) | Direct mapping |

> For details: [oracle-migration](references/oracle-migration.md)

## MySQL Migration

### Data Type Mapping

| MySQL | IvorySQL | Description |
|-------|----------|------|
| TINYINT | SMALLINT | PG has no TINYINT |
| INT | INTEGER | Direct mapping |
| BIGINT | BIGINT | Direct mapping |
| VARCHAR | VARCHAR | Direct mapping |
| TEXT | TEXT | Direct mapping |
| DATETIME | TIMESTAMP | Direct mapping |
| ENUM | VARCHAR + CHECK | PG has no ENUM type |
| AUTO_INCREMENT | SERIAL / IDENTITY | PG-style auto-increment |
| LIMIT n | LIMIT n | Same syntax |

> For details: [mysql-pg-migration](references/mysql-pg-migration.md)

## Migration Tools

### ora2pg (Oracle → IvorySQL)

```bash
# Install
yum install -y ora2pg

# Configure ora2pg.conf
ORACLE_DSN  dbi:Oracle:host=oracle_host;sid=ORCL
ORACLE_USER username
ORACLE_PWD  password
SCHEMA      my_schema
TYPE        TABLE
OUTPUT      output.sql

# Export table structure
ora2pg -c ora2pg.conf -t TABLE -o tables.sql

# Export data
ora2pg -c ora2pg.conf -t COPY -o data.sql

# Export stored procedures
ora2pg -c ora2pg.conf -t PROCEDURE -o procedures.sql
```

### pgLoader (MySQL → IvorySQL)

```bash
# Install
apt install -y pgloader

# Migrate
pgloader mysql://user:pass@mysql_host/mydb \
         postgresql://user:pass@ivorysql_host/ivorysql
```

## Reference Documents

- [Oracle Migration](references/oracle-migration.md) — Complete Oracle → IvorySQL migration guide
- [MySQL/PG Migration](references/pg-migration.md) — MySQL/PG → IvorySQL migration guide
- [Migration Validation](references/migration-tools.md) — Post-migration verification and testing
