---
name: IvorySQL SQL Syntax Reference
name_for_command: ivorysql-sql
description: |
  Complete IvorySQL SQL syntax reference: DDL/DML/queries/data types/operators.
  Includes comparison of PostgreSQL native syntax and Oracle-compatible syntax.
---

# IvorySQL SQL Syntax Reference

IvorySQL inherits the complete SQL syntax from PostgreSQL, while extending Oracle-specific syntax through Oracle compatibility mode.

## Workflow

Trigger this skill when encountering the following issues:
- IvorySQL SQL syntax queries
- Data type selection (PG native vs Oracle-compatible)
- DDL/DML statement writing
- Oracle migration syntax conversion

**Sub-skill routing**:
- PL/iSQL procedures → `ivorysql-plisql`
- Oracle compatibility features → `ivorysql-oracle-compat`
- Function reference → `ivorysql-functions`
- Migration issues → `ivorysql-migration`

## Data Types

### PostgreSQL Native Data Types

| Category | Types |
|------|------|
| Integer | SMALLINT, INTEGER, BIGINT |
| Auto-increment integer | SMALLSERIAL, SERIAL, BIGSERIAL |
| Fixed-point | NUMERIC(p,s), DECIMAL(p,s) |
| Floating-point | REAL, DOUBLE PRECISION |
| Auto-increment identity | GENERATED ALWAYS AS IDENTITY |
| Character | CHARACTER(n), CHARACTER VARYING(n), TEXT |
| Binary | BYTEA |
| Date/Time | DATE, TIME, TIMESTAMP, TIMESTAMPTZ, INTERVAL |
| Boolean | BOOLEAN |
| JSON | JSON, JSONB |
| UUID | UUID |
| Geometric | POINT, LINE, CIRCLE, POLYGON, etc. |
| Network address | INET, CIDR, MACADDR |
| Array | Any type[] |
| Range | INT4RANGE, NUMRANGE, TSRANGE, etc. |
| Bit string | BIT(n), BIT VARYING(n) |

### Oracle-Compatible Data Types (Oracle Mode)

| Oracle Type | Description | PG Equivalent |
|-------------|------|-------------|
| VARCHAR2(n) | Variable-length string | VARCHAR(n) |
| NVARCHAR2(n) | National character set string | VARCHAR(n) |
| NUMBER(p,s) | Fixed-point/floating-point | NUMERIC(p,s) |
| NUMBER | Unlimited precision numeric | NUMERIC |
| DATE | Date and time (with time) | TIMESTAMP |
| BLOB | Binary large object | BYTEA |
| CLOB | Character large object | TEXT |
| RAW(n) | Raw binary | BYTEA |
| ROWID | Row identifier | TID |

> For details: [data-types](references/data-types.md)

## DDL (Data Definition Language)

### Database/Schema Management

```sql
-- Create database
CREATE DATABASE mydb;

-- Create schema
CREATE SCHEMA myschema;

-- Switch database (IvorySQL default database is ivorysql)
\c ivorysql
```

### Table Management

```sql
-- Create table (PG syntax)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    salary NUMERIC(10,2),
    hire_date DATE DEFAULT CURRENT_DATE
);

-- Create table (Oracle-compatible syntax)
CREATE TABLE employees (
    id NUMBER GENERATED ALWAYS AS IDENTITY,
    name VARCHAR2(100) NOT NULL,
    salary NUMBER(10,2),
    hire_date DATE DEFAULT SYSDATE
);

-- Invisible column (Oracle-compatible)
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name VARCHAR2(100),
    secret_key VARCHAR2(64) INVISIBLE
);

-- Partitioned table
CREATE TABLE orders (
    id BIGINT,
    order_date DATE,
    amount NUMERIC(10,2)
) PARTITION BY RANGE (order_date);

CREATE TABLE orders_2024_q1 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-04-01');
```

### Index Management

```sql
-- B-tree index
CREATE INDEX idx_emp_name ON employees(name);

-- Unique index
CREATE UNIQUE INDEX idx_emp_id ON employees(id);

-- Partial index
CREATE INDEX idx_active_emp ON employees(name) WHERE active = true;

-- Expression index
CREATE INDEX idx_lower_name ON employees(LOWER(name));

-- GIN index (JSONB/full-text search)
CREATE INDEX idx_data_gin ON documents USING GIN(data_jsonb);
```

> For details: [ddl](references/ddl.md)

## DML (Data Manipulation Language)

```sql
-- INSERT
INSERT INTO employees (name, salary) VALUES ('Zhang San', 8000);

-- INSERT multiple rows
INSERT INTO employees (name, salary) VALUES
    ('Zhang San', 8000), ('Li Si', 9000), ('Wang Wu', 7500);

-- UPDATE
UPDATE employees SET salary = salary * 1.1 WHERE department = 'IT';

-- DELETE
DELETE FROM employees WHERE active = false;

-- MERGE INTO (Oracle-compatible)
MERGE INTO target t
USING source s ON (t.id = s.id)
WHEN MATCHED THEN UPDATE SET t.name = s.name
WHEN NOT MATCHED THEN INSERT (id, name) VALUES (s.id, s.name);

-- RETURNING
INSERT INTO employees (name) VALUES ('Zhao Liu') RETURNING id;
```

> For details: [dml](references/dml.md)

## Queries

### Basic Queries

```sql
-- Standard query
SELECT name, salary FROM employees WHERE salary > 5000 ORDER BY salary DESC;

-- Pagination
SELECT * FROM employees ORDER BY id LIMIT 10 OFFSET 20;

-- Aggregation
SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department;
```

### Oracle-Compatible Queries

```sql
-- DUAL pseudo table
SELECT SYSDATE FROM DUAL;
SELECT NVL(NULL, 'default') FROM DUAL;

-- (+) outer join
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id = d.dept_id(+);

-- Equivalent to
SELECT e.name, d.dept_name
FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id;

-- ROWNUM
SELECT * FROM employees WHERE ROWNUM <= 10;

-- Equivalent to
SELECT * FROM employees LIMIT 10;
```

### Advanced Queries

```sql
-- CTE (Common Table Expression)
WITH dept_avg AS (
    SELECT department, AVG(salary) as avg_sal
    FROM employees
    GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e JOIN dept_avg d ON e.department = d.department;

-- Window functions
SELECT name, salary,
    RANK() OVER (ORDER BY salary DESC) as rank,
    SUM(salary) OVER (PARTITION BY department) as dept_total
FROM employees;

-- JSON query
SELECT data->>'name' as name, data->'age' as age
FROM users WHERE data @> '{"active": true}';
```

> For details: [query](references/query.md)

## Operators

| Category | Operators |
|------|--------|
| Arithmetic | `+` `-` `*` `/` `%` `^` |
| Comparison | `=` `<>` `!=` `>` `<` `>=` `<=` |
| Logical | `AND` `OR` `NOT` |
| String concatenation | `\|\|` |
| Pattern matching | `LIKE` `ILIKE` `SIMILAR TO` `~` `~*` |
| JSON | `->` `->>` `#>` `#>>` `@>` `<@` `?` `?\|` `?&` |
| Range | `@>` `<@` `&&` `<<` `>>` `-|-` |
| Bit | `&` `\|` `#` `~` `<<` `>>` |

## Reference Documents

- [Data Types](references/data-types.md) — PG native + Oracle-compatible data types
- [DDL](references/ddl.md) — Database/schema/table/index/view/sequence management
- [DML](references/dml.md) — INSERT/UPDATE/DELETE/MERGE/RETURNING
- [Queries](references/query.md) — SELECT/JOIN/CTE/window functions/JSON queries
- [Oracle-Compatible Syntax](references/sql-basics.md) — DUAL/(+) outer join/CONNECT BY/ROWNUM, etc.
