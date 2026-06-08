---
name: IvorySQL Oracle Compatibility Features
name_for_command: ivorysql-oracle-compat
description: |
  Complete IvorySQL Oracle compatibility features reference. Covers: dual parser architecture, dual mode switching (oracle/pg),
  21 Oracle compatibility features (VARCHAR2/NUMBER/DUAL/(+)/CONNECT BY/ROWNUM/ROWID/Package/
  %TYPE/%ROWTYPE/OUT parameters/Invisible columns/FORCE VIEW/SYS_GUID/MERGE INTO, etc.),
  Oracle-compatible data type mapping, Oracle built-in function reference (NVL/DECODE/SYSDATE/TO_CHAR/TO_DATE/
  INSTR/SUBSTR/SYS_CONTEXT/USERENV/ADD_MONTHS/LAST_DAY/TRUNC, etc.).
---

# IvorySQL Oracle Compatibility Features

## Workflow

Trigger this skill when users ask the following questions:
- IvorySQL Oracle compatibility mode switching
- Oracle data type mapping (VARCHAR2/NUMBER/DATE)
- Oracle-compatible functions (NVL/DECODE/SYSDATE/TO_CHAR, etc.)
- (+) outer join / CONNECT BY / ROWNUM / ROWID
- MERGE INTO / FORCE VIEW / Invisible columns
- Package / PL/iSQL type anchoring (%TYPE/%ROWTYPE)
- Empty string behavior / NLS parameters

## Mode Switching

### Session-Level Switching

```sql
-- Switch to Oracle compatibility mode
SET ivorysql.compatible_mode = 'oracle';

-- Switch back to PostgreSQL mode
SET ivorysql.compatible_mode = 'pg';

-- Switch parser in psql
\parser oracle   -- Oracle parser
\parser pg      -- PG parser

-- View current mode
SHOW ivorysql.compatible_mode;
SELECT * FROM NLS_SESSION_PARAMETERS;
```

### Mode Selection at Initialization

```bash
# Oracle compatibility mode (default)
initdb -D /data/ivorysql -m oracle   # Default port 1521, default database ivorysql

# PG mode
initdb -D /data/ivorysql -m pg        # Default port 5432, default database postgres
```

## 21 Oracle Compatibility Features Overview

| # | Feature | Typical Use Case |
|---|------|---------|
| 1 | VARCHAR2/NUMBER/DATE types | Oracle-style DDL |
| 2 | DUAL pseudo table | `SELECT SYSDATE FROM DUAL` |
| 3 | (+) outer join | Oracle traditional outer join syntax |
| 4 | CONNECT BY hierarchical query | Organization charts, menu trees |
| 5 | ROWNUM | Pagination, Top-N queries |
| 6 | ROWID row identifier | Fast positioning, deduplication |
| 7 | %TYPE type anchoring | Variable type synchronization with column |
| 8 | %ROWTYPE row type anchoring | Record variable definition |
| 9 | OUT/IN OUT parameters | Stored procedure multiple return values |
| 10 | Package (Package) | Program unit encapsulation |
| 11 | Invisible columns | Sensitive field hiding |
| 12 | FORCE VIEW | Front-end interface definition |
| 13 | Empty string = NULL | Oracle empty string semantics |
| 14 | SYS_GUID | RAW format globally unique ID |
| 15 | NLS parameters | Date/number format localization |
| 16 | NVL/DECODE functions | Null handling/conditional decoding |
| 17 | SYSDATE/SYSTIMESTAMP | Oracle-style time functions |
| 18 | MERGE INTO | Merge insert/update |
| 19 | LIKE operator alignment | Oracle LIKE semantics |
| 20 | Nested subprograms | Sub-function/sub-procedure definition |
| 21 | GB18030 encoding | Chinese national standard support |

## Oracle-Compatible Data Type Mapping

| Oracle Type | IvorySQL Oracle Mode | PG Native | Description |
|------------|---------------------|---------|------|
| VARCHAR2(n) | VARCHAR2(n) | VARCHAR(n) | Variable-length string |
| NVARCHAR2(n) | NVARCHAR2(n) | VARCHAR(n) | Unicode string |
| NUMBER | NUMBER | NUMERIC | Arbitrary precision value |
| NUMBER(p,s) | NUMBER(p,s) | NUMERIC(p,s) | Fixed-point number |
| BINARY_FLOAT | BINARY_FLOAT | REAL | Single-precision float |
| BINARY_DOUBLE | BINARY_DOUBLE | DOUBLE PRECISION | Double-precision float |
| DATE | DATE (with time) | TIMESTAMP | Oracle DATE includes time |
| TIMESTAMP(p) | TIMESTAMP(p) | TIMESTAMP(p) | Timestamp |
| TIMESTAMPTZ | TIMESTAMPTZ | TIMESTAMPTZ | Timestamp with timezone |
| BLOB | BLOB | BYTEA | Binary large object |
| CLOB | CLOB | TEXT | Character large object |
| RAW(n) | RAW(n) | BYTEA | Fixed-length binary |
| ROWID | ROWID | TID | Row identifier |
| %TYPE | Supported | Supported | Type anchoring |
| %ROWTYPE | Supported | Supported | Row type anchoring |

## Oracle-Compatible Built-in Functions Reference

### Null Handling

```sql
-- NVL(expr1, expr2): returns expr2 when expr1 is NULL
SELECT name, NVL(bonus, 0) AS bonus FROM employees;

-- NVL2(expr, not_null, is_null): returns not_null if expr is not NULL, otherwise is_null
SELECT name, NVL2(bonus, bonus * 1.1, 0) AS adjusted_bonus FROM employees;

-- COALESCE: returns first non-NULL value (PG standard, Oracle compatible)
SELECT name, COALESCE(bonus, commission, 0) AS incentive FROM employees;

-- NULLIF(expr1, expr2): returns NULL if expr1=expr2, otherwise expr1
SELECT NULLIF(a, b) FROM t;  -- returns NULL when a=b
```

### Conditional Expressions

```sql
-- DECODE(expr, when1, then1, when2, then2, ..., default)
SELECT name,
       DECODE(department,
              'IT',     'Tech Dept',
              'HR',     'Human Resources',
              'Sales',  'Sales Dept',
              'Other') AS dept_cn
FROM employees;

-- CASE WHEN (PG standard, also supported by Oracle)
SELECT name,
       CASE department
           WHEN 'IT' THEN 'Tech Dept'
           WHEN 'HR' THEN 'Human Resources'
           ELSE 'Other'
       END AS dept_cn
FROM employees;

-- Nested DECODE
SELECT DECODE(SIGN(salary - 10000),
              1, 'High income',
              0, 'Medium',
              -1, 'Low income',
              'Unknown') AS salary_level
FROM employees;
```

### Date Functions

```sql
-- SYSDATE: returns current date and time in Oracle mode
SELECT SYSDATE FROM DUAL;  -- 2026-04-20 15:54:00

-- SYSTIMESTAMP: timestamp with timezone
SELECT SYSTIMESTAMP FROM DUAL;

-- ADD_MONTHS(date, n): add/subtract n months
SELECT ADD_MONTHS(SYSDATE, 6) FROM DUAL;   -- Half year later
SELECT ADD_MONTHS(SYSDATE, -12) FROM DUAL; -- One year ago

-- LAST_DAY(date): returns last day of month
SELECT LAST_DAY(SYSDATE) FROM DUAL;  -- Last day of current month
SELECT LAST_DAY(TO_DATE('2025-02-15', 'YYYY-MM-DD')) FROM DUAL;  -- 2025-02-28

-- MONTHS_BETWEEN(d1, d2): returns number of months between two dates
SELECT MONTHS_BETWEEN(SYSDATE, hire_date) AS months_worked
FROM employees;

-- NEXT_DAY(date, weekday): returns next specified weekday
SELECT NEXT_DAY(SYSDATE, 'MONDAY') FROM DUAL;
SELECT NEXT_DAY(SYSDATE, 1) FROM DUAL;  -- 1=Sun, 2=Mon, ...

-- TRUNC(date): truncate date to specified precision
SELECT TRUNC(SYSDATE) FROM DUAL;                    -- Today 00:00:00
SELECT TRUNC(SYSDATE, 'MM') FROM DUAL;              -- First of month
SELECT TRUNC(SYSDATE, 'YYYY') FROM DUAL;             -- First of year
SELECT TRUNC(SYSDATE, 'IW') FROM DUAL;               -- First day of week

-- ROUND(date): round date
SELECT ROUND(SYSDATE, 'DD') FROM DUAL;  -- Tomorrow or today (split at noon)

-- EXTRACT (PG standard)
SELECT EXTRACT(YEAR FROM hire_date) FROM employees;
SELECT EXTRACT(MONTH FROM hire_date) FROM employees;
SELECT EXTRACT(DAY FROM hire_date) FROM employees;
SELECT EXTRACT(WEEK FROM hire_date) FROM employees;
```

### Type Conversion Functions

```sql
-- TO_CHAR: convert to string
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT TO_CHAR(12345.67, '99,999.99') FROM DUAL;
SELECT TO_CHAR(0.25, '00.00%') FROM DUAL;
SELECT TO_CHAR(SYSDATE, '"Today is "YYYY" year "MM" month "DD" day"') FROM DUAL;

-- TO_DATE: string to date
SELECT TO_DATE('2025-01-15', 'YYYY-MM-DD') FROM DUAL;
SELECT TO_DATE('15/JAN/2025', 'DD/MON/YYYY') FROM DUAL;
SELECT TO_DATE('20250115', 'YYYYMMDD') FROM DUAL;

-- TO_NUMBER: string to numeric
SELECT TO_NUMBER('12345.67') FROM DUAL;
SELECT TO_NUMBER('$1,234.56', '$9,999.99') FROM DUAL;

-- TO_TIMESTAMP: string to timestamp
SELECT TO_TIMESTAMP('2025-01-15 10:30:00', 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;

-- CAST (SQL standard, supported in both modes)
SELECT CAST('123' AS INTEGER) FROM DUAL;
SELECT CAST(3.14159 AS VARCHAR2(10)) FROM DUAL;

-- :: syntax (PG extension)
SELECT '2025-01-15'::DATE;
SELECT '123'::INTEGER;
SELECT '{"a":1}'::JSONB;
```

### String Functions

```sql
-- INSTR(str, substr, start, n): returns substring position (1-based)
SELECT INSTR('Hello World', 'o') FROM DUAL;           -- 5
SELECT INSTR('Hello World', 'o', 6) FROM DUAL;        -- 8 (start from 6th char)
SELECT INSTR('A,B,C,D', ',', 1, 2) FROM DUAL;        -- 5 (2nd comma position)

-- SUBSTR(str, start, len): extract substring (1-based)
SELECT SUBSTR('Hello World', 1, 5) FROM DUAL;       -- Hello
SELECT SUBSTR('Hello World', 7) FROM DUAL;            -- World
SELECT SUBSTR('Hello', -3) FROM DUAL;                -- llo (from end)

-- LPAD / RPAD: padding
SELECT LPAD('Hello', 10, '*') FROM DUAL;  -- '*****Hello'
SELECT RPAD('Hello', 10, '*') FROM DUAL;  -- 'Hello*****'

-- LTRIM / RTRIM / TRIM: trimming
SELECT TRIM('  Hello  ') FROM DUAL;       -- 'Hello'
SELECT LTRIM('***Hello***', '*') FROM DUAL; -- 'Hello***'
SELECT RTRIM('***Hello***', '*') FROM DUAL; -- '***Hello'
SELECT TRIM(BOTH '*' FROM '**Hello**') FROM DUAL; -- 'Hello'

-- INITCAP: capitalize first letter
SELECT INITCAP('hello world') FROM DUAL;  -- 'Hello World'
SELECT INITCAP('john doe') FROM DUAL;     -- 'John Doe'

-- TRANSLATE: character-by-character replacement
SELECT TRANSLATE('Hello', 'el', '31') FROM DUAL;  -- 'H311o'

-- LENGTH / LENGTHB: character length / byte length
SELECT LENGTH('Hello') FROM DUAL;        -- 5
SELECT LENGTH('China') FROM DUAL;         -- 5 (characters)

-- REPLACE: replace
SELECT REPLACE('Hello World', 'World', 'IvorySQL') FROM DUAL; -- 'Hello IvorySQL'

-- CONCAT: concatenate (max 2 arguments)
SELECT CONCAT('Hello', ' World') FROM DUAL;

-- ||: string concatenation (supported in both modes)
SELECT 'Hello' || ' ' || 'World' FROM DUAL;

-- REGEXP_COUNT / REGEXP_INSTR / REGEXP_SUBSTR / REGEXP_REPLACE
SELECT REGEXP_COUNT('Hello World', 'o') FROM DUAL;       -- 2
SELECT REGEXP_REPLACE('Hello World', 'World', 'IvorySQL') FROM DUAL;  -- 'Hello IvorySQL'
```

### Numeric Functions

```sql
-- ROUND / TRUNC: rounding / truncation
SELECT ROUND(3.14159, 2) FROM DUAL;  -- 3.14
SELECT TRUNC(3.14159, 2) FROM DUAL;  -- 3.14
SELECT ROUND(3.14159) FROM DUAL;     -- 3
SELECT TRUNC(3.14159) FROM DUAL;     -- 3

-- CEIL / FLOOR: ceiling / floor
SELECT CEIL(3.14) FROM DUAL;   -- 4
SELECT FLOOR(3.14) FROM DUAL;  -- 3

-- ABS: absolute value
SELECT ABS(-10) FROM DUAL;  -- 10

-- MOD: modulo
SELECT MOD(10, 3) FROM DUAL;  -- 1

-- POWER / SQRT: power / square root
SELECT POWER(2, 10) FROM DUAL;  -- 1024
SELECT SQRT(16) FROM DUAL;     -- 4

-- SIGN: sign function
SELECT SIGN(-10) FROM DUAL;  -- -1

-- GREATEST / LEAST: max / min
SELECT GREATEST(1, 5, 3) FROM DUAL;  -- 5
SELECT LEAST(1, 5, 3) FROM DUAL;      -- 1
```

### System Functions

```sql
-- SYS_GUID(): generates 16-byte RAW format GUID
SELECT SYS_GUID() FROM DUAL;  -- e.g., 0123456789ABCDEF0123456789ABCDEF

-- SYS_CONTEXT: get system context information
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'CURRENT_USER') FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'HOST') FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'IP_ADDRESS') FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'DB_NAME') FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'LANGUAGE') FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'SCHEMA') FROM DUAL;

-- USERENV (legacy Oracle compatibility)
SELECT USERENV('SESSION_USER') FROM DUAL;
SELECT USERENV('CURRENT_USER') FROM DUAL;
SELECT USERENV('LANGUAGE') FROM DUAL;

-- UID / USER: current user information
SELECT UID, USER FROM DUAL;

-- ROWIDTOCHAR / CHARTOROWID
SELECT ROWIDTOCHAR(ROWID) FROM employees;
SELECT CHARTOROWID('AAAABbAAEAAAAInAAA') FROM DUAL;

-- ROWNUM: row number (Oracle mode)
SELECT ROWNUM, name, salary
FROM employees
ORDER BY salary DESC;  -- Sort first then assign ROWNUM (note the order)

-- ROW_NUMBER() OVER(): standard window function row number (supported in both modes)
SELECT ROW_NUMBER() OVER (ORDER BY salary DESC) AS rank,
       name, salary
FROM employees;
```

### Aggregate and Window Functions

```sql
-- LISTAGG: string aggregation (Oracle 11gR2+)
SELECT department,
       LISTAGG(name, ', ') WITHIN GROUP (ORDER BY name) AS members
FROM employees
GROUP BY department;

-- PIVOT / UNPIVOT (Oracle mode)
SELECT * FROM (
    SELECT department, job, salary FROM employees
) PIVOT (
    AVG(salary) FOR job IN ('Manager', 'Engineer', 'Clerk')
);
```

## (+) Outer Join Syntax

```sql
-- Left outer join: + on right table
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id = d.id(+);

-- Right outer join: + on left table
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id(+) = d.id;

-- Multi-condition outer join
SELECT e.name, d.dept_name, j.title
FROM employees e, departments d, jobs j
WHERE e.dept_id = d.id(+)
  AND e.job_id = j.id(+);
```

## CONNECT BY Hierarchical Query

```sql
-- Basic hierarchical query
SELECT LEVEL,
       LPAD(' ', 2 * (LEVEL - 1)) || name AS org_tree,
       id, manager_id,
       CONNECT_BY_ROOT name AS top_mgr,
       SYS_CONNECT_BY_PATH(name, ' > ') AS path
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id
ORDER SIBLINGS BY name;

-- CONNECT_BY_ISLEAF: whether leaf node
SELECT id, name, LEVEL, CONNECT_BY_ISLEAF AS is_leaf
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- NOCYCLE: prevent cycles
SELECT id, name, LEVEL, CONNECT_BY_ISCYCLE AS has_cycle
FROM employees
START WITH manager_id IS NULL
CONNECT BY NOCYCLE PRIOR id = manager_id;
```

## MERGE INTO

```sql
MERGE INTO employees e
USING emp_updates u
ON (e.id = u.id)
WHEN MATCHED THEN
    UPDATE SET e.salary = u.new_salary,
               e.department = u.new_dept
    WHERE u.effective_date <= SYSDATE
WHEN NOT MATCHED THEN
    INSERT (id, name, salary, department)
    VALUES (u.id, u.name, u.new_salary, u.new_dept)
    WHERE u.status = 'ACTIVE';
```

## FORCE VIEW

```sql
-- Create view before base table exists
CREATE FORCE VIEW future_view AS
    SELECT * FROM future_table;

-- View becomes available after base table is created
CREATE TABLE future_table (
    id NUMBER,
    name VARCHAR2(100)
);
```

## Invisible Columns

```sql
CREATE TABLE users (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(100),
    password VARCHAR2(255) INVISIBLE,
    api_key VARCHAR2(64) INVISIBLE
);

-- SELECT * does not show invisible columns
INSERT INTO users (id, name, password) VALUES (1, 'Alice', 'hash123');
SELECT * FROM users;  -- Returns only id, name

-- Explicitly query invisible columns
SELECT id, name, password FROM users;

-- Modify column visibility
ALTER TABLE users MODIFY password VISIBLE;
ALTER TABLE users MODIFY password INVISIBLE;
```

## NLS Parameters

```sql
-- Date format
ALTER SESSION SET NLS_DATE_FORMAT = 'YYYY-MM-DD HH24:MI:SS';
ALTER SESSION SET NLS_TIMESTAMP_FORMAT = 'YYYY-MM-DD HH24:MI:SS.FF';

-- Number format
ALTER SESSION SET NLS_NUMERIC_CHARACTERS = '.,';

-- Language
ALTER SESSION SET NLS_LANGUAGE = 'SIMPLIFIED CHINESE';

-- View current settings
SELECT * FROM NLS_SESSION_PARAMETERS;
SELECT * FROM NLS_DATABASE_PARAMETERS;
```

## Oracle vs PG Mode Behavior Differences

| Feature | Oracle Mode | PG Mode |
|------|------------|---------|
| Identifier case | Preserved | Lowercase |
| Empty string | Equals NULL | Independent value |
| DATE | Includes time | Date only |
| NVL/DECODE/SYSDATE | Available | Not available |
| DUAL | Available | Not available |
| (+) outer join | Available | Not available |
| CONNECT BY | Available | Not available |
| ROWNUM | Available | Use LIMIT |
| VARCHAR2/NUMBER | Available | Use VARCHAR/NUMERIC |

## Reference Documents

- [Dual Mode Design](references/compat-mode.md) — Dual parser, dual port, GUC parameters
- [Oracle-Compatible Syntax](references/oracle-syntax.md) — DUAL/CONNECT BY/MERGE/FORCE VIEW
- [Functions and Types](references/oracle-functions.md) — Oracle functions and data type mapping
