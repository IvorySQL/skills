---
title: Oracle-Compatible Functions and Types
description: Built-in functions / data type mapping
tags: ivorysql, oracle-compat, functions, data-types, nvl, decode, sysdate, type-mapping
---

# Oracle-Compatible Functions and Types

IvorySQL provides a rich set of Oracle-compatible built-in functions and data types in Oracle compatibility mode, enabling Oracle migration without extensive SQL code modifications.

## Complete List of Oracle-Compatible Functions

### Null Handling Functions

| Function | Description | Example | Result |
|------|------|------|------|
| `NVL(expr1, expr2)` | Returns expr2 if expr1 is NULL | `NVL(NULL, 'default')` | default |
| `NVL2(expr1, expr2, expr3)` | Returns expr2 if expr1 is not NULL, otherwise expr3 | `NVL2('X', 'yes', 'no')` | yes |
| `NVL2(NULL, 'yes', 'no')` | Same as above (NULL case) | `NVL2(NULL, 'yes', 'no')` | no |
| `COALESCE(expr1, expr2, ...)` | Returns the first non-NULL expression | `COALESCE(NULL, NULL, 'c')` | c |

```sql
-- NVL usage example
SELECT NVL(commission, 0) FROM employees;

-- NVL2 usage example
SELECT NVL2(commission, 'Has commission', 'No commission') FROM employees;

-- COALESCE for multiple value checks
SELECT COALESCE(phone, mobile, email, 'No contact method') FROM contacts;
```

### Conditional Expression Functions

| Function | Description | Example | Result |
|------|------|------|------|
| `DECODE(expr, s1, r1, s2, r2, ..., default)` | Conditional matching, similar to CASE WHEN | `DECODE(1, 1,'A', 2,'B', 'X')` | A |
| `GREATEST(expr1, expr2, ...)` | Returns the maximum value | `GREATEST(10, 20, 5)` | 20 |
| `LEAST(expr1, expr2, ...)` | Returns the minimum value | `LEAST(10, 20, 5)` | 5 |

```sql
-- DECODE usage example
SELECT DECODE(dept_id,
    10, 'Finance',
    20, 'R&D',
    30, 'Sales',
    'Other'
) AS dept_name FROM employees;

-- GREATEST / LEAST usage examples
SELECT GREATEST(salary, salary * 1.1, salary * 1.2) AS max_salary,
       LEAST(salary, salary * 0.9, salary * 0.8) AS min_salary
FROM employees;
```

### Date/Time Functions

| Function | Description | Example |
|------|------|------|
| `SYSDATE` | Returns current date and time | `SELECT SYSDATE FROM DUAL` |
| `CURRENT_DATE` | Returns session current date | `SELECT CURRENT_DATE FROM DUAL` |
| `CURRENT_TIMESTAMP` | Returns session current timestamp | `SELECT CURRENT_TIMESTAMP FROM DUAL` |
| `ADD_MONTHS(date, n)` | Add/subtract n months from date | `ADD_MONTHS(SYSDATE, 3)` |
| `LAST_DAY(date)` | Returns the last day of the month | `LAST_DAY(SYSDATE)` |
| `MONTHS_BETWEEN(d1, d2)` | Calculates the number of months between two dates | `MONTHS_BETWEEN(DATE '2025-12-01', DATE '2025-01-01')` |
| `NEXT_DAY(date, weekday)` | Returns the next specified weekday after the date | `NEXT_DAY(SYSDATE, 'MONDAY')` |
| `TRUNC(date, fmt)` | Truncates date to specified precision | `TRUNC(SYSDATE, 'MONTH')` |
| `ROUND(date, fmt)` | Rounds date to specified precision | `ROUND(SYSDATE, 'MONTH')` |
| `NEW_TIME(date, tz1, tz2)` | Timezone conversion | `NEW_TIME(SYSDATE, 'EST', 'PST')` |
| `SESSIONTIMEZONE` | Returns session timezone | `SELECT SESSIONTIMEZONE FROM DUAL` |
| `DBTIMEZONE` | Returns database timezone | `SELECT DBTIMEZONE FROM DUAL` |
| `EXTRACT(field FROM date)` | Extracts date field | `EXTRACT(YEAR FROM SYSDATE)` |

```sql
-- SYSDATE example
SELECT SYSDATE AS current_time FROM DUAL;

-- ADD_MONTHS example: calculate date 3 months later
SELECT ADD_MONTHS(SYSDATE, 3) AS three_months_later FROM DUAL;

-- LAST_DAY example: get the last day of the current month
SELECT LAST_DAY(SYSDATE) AS month_end FROM DUAL;

-- MONTHS_BETWEEN example
SELECT MONTHS_BETWEEN(DATE '2025-12-31', DATE '2025-01-01') AS months_diff FROM DUAL;
-- Result: 11.9677...

-- NEXT_DAY example
SELECT NEXT_DAY(SYSDATE, 'FRIDAY') AS next_friday FROM DUAL;

-- TRUNC examples
SELECT TRUNC(SYSDATE, 'YYYY') AS year_start FROM DUAL;     -- Start of year
SELECT TRUNC(SYSDATE, 'MONTH') AS month_start FROM DUAL;   -- Start of month
SELECT TRUNC(SYSDATE, 'DD') AS day_start FROM DUAL;        -- Midnight of the day

-- ROUND example
SELECT ROUND(SYSDATE, 'MONTH') AS rounded_month FROM DUAL;
```

### Conversion Functions

| Function | Description | Example |
|------|------|------|
| `TO_CHAR(expr, fmt)` | Formats number/date to string | `TO_CHAR(SYSDATE, 'YYYY-MM-DD')` |
| `TO_DATE(str, fmt)` | Converts string to date | `TO_DATE('2025-01-15', 'YYYY-MM-DD')` |
| `TO_NUMBER(str, fmt)` | Converts string to numeric | `TO_NUMBER('1,234.56', '9,999.99')` |
| `TO_TIMESTAMP(str, fmt)` | Converts string to timestamp | `TO_TIMESTAMP('2025-01-15 10:30:00', 'YYYY-MM-DD HH24:MI:SS')` |
| `TO_YMINTERVAL(str)` | Converts to year-month interval | `TO_YMINTERVAL('01-03')` |
| `TO_DSINTERVAL(str)` | Converts to day-second interval | `TO_DSINTERVAL('10 05:30:00')` |
| `CAST(expr AS type)` | Type conversion | `CAST('123' AS NUMBER)` |

```sql
-- TO_CHAR date formatting
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') AS full_date FROM DUAL;

-- TO_CHAR number formatting
SELECT TO_CHAR(1234567.89, '999,999,999.99') AS formatted_num FROM DUAL;
SELECT TO_CHAR(1234.5, '$9,999.99') AS currency FROM DUAL;

-- TO_DATE examples
SELECT TO_DATE('2025-06-15', 'YYYY-MM-DD') AS converted_date FROM DUAL;
SELECT TO_DATE('15/JUN/2025', 'DD/MON/YYYY') AS converted_date FROM DUAL;

-- TO_NUMBER examples
SELECT TO_NUMBER('42') AS num FROM DUAL;
SELECT TO_NUMBER('$1,234.56', 'L9,999.99') AS num FROM DUAL;
```

### String Functions

| Function | Description | Example |
|------|------|------|
| `INSTR(str, substr [, start [, occurrence]])` | Find substring position | `INSTR('Hello World', 'o')` -> 5 |
| `SUBSTR(str, start [, len])` | Extract substring | `SUBSTR('Hello', 1, 3)` -> Hel |
| `RPAD(str, len, pad)` | Right padding | `RPAD('Hi', 5, '*')` -> Hi*** |
| `LPAD(str, len, pad)` | Left padding | `LPAD('Hi', 5, '*')` -> ***Hi |
| `RTRIM(str, chars)` | Right trim | `RTRIM('Helloxxx', 'x')` -> Hello |
| `LTRIM(str, chars)` | Left trim | `LTRIM('xxxHello', 'x')` -> Hello |
| `INITCAP(str)` | Capitalize first letter | `INITCAP('hello world')` -> Hello World |
| `TRANSLATE(str, from, to)` | Character-level replacement | `TRANSLATE('ABC', 'ABC', '123')` -> 123 |
| `REPLACE(str, old, new)` | String replacement | `REPLACE('Hello', 'l', 'r')` -> Herro |
| `UPPER(str)` | Convert to uppercase | `UPPER('hello')` -> HELLO |
| `LOWER(str)` | Convert to lowercase | `LOWER('HELLO')` -> hello |
| `LENGTH(str)` | String length | `LENGTH('Hello')` -> 5 |
| `CONCAT(str1, str2)` | Concatenate strings | `CONCAT('Hello', ' World')` |
| `REGEXP_LIKE(str, pattern)` | Regex matching | `REGEXP_LIKE('Hello', '^H')` -> true |
| `REGEXP_SUBSTR(str, pattern)` | Regex extraction | `REGEXP_SUBSTR('abc123', '[0-9]+')` -> 123 |
| `REGEXP_INSTR(str, pattern)` | Regex position | `REGEXP_INSTR('abc123', '[0-9]+')` -> 4 |
| `REGEXP_REPLACE(str, pattern, replace)` | Regex replacement | `REGEXP_REPLACE('abc123', '[0-9]+', 'X')` -> abcX |
| `REGEXP_COUNT(str, pattern)` | Regex match count | `REGEXP_COUNT('a1b2c3', '[0-9]')` -> 3 |

```sql
-- INSTR examples
SELECT INSTR('Hello World Hello', 'Hello') FROM DUAL;        -- 1
SELECT INSTR('Hello World Hello', 'Hello', 2) FROM DUAL;     -- 13 (search from position 2)
SELECT INSTR('Hello World Hello', 'Hello', 1, 2) FROM DUAL;  -- 13 (2nd occurrence)

-- SUBSTR examples
SELECT SUBSTR('Hello World', 1, 5) FROM DUAL;   -- Hello
SELECT SUBSTR('Hello World', 7) FROM DUAL;       -- World
SELECT SUBSTR('Hello World', -5) FROM DUAL;      -- World (from end)

-- LPAD/RPAD examples
SELECT LPAD('42', 5, '0') FROM DUAL;    -- 00042
SELECT RPAD('Hello', 10, '.') FROM DUAL; -- Hello.....

-- TRANSLATE example
SELECT TRANSLATE('123-456-7890', '0123456789-', '###########') FROM DUAL;
-- Result: ###-###-####
```

### System and Environment Functions

| Function | Description | Example |
|------|------|------|
| `SYS_GUID()` | Generates 16-byte RAW format GUID | `SELECT SYS_GUID() FROM DUAL` |
| `SYS_CONTEXT(namespace, param)` | Gets system context attributes | `SYS_CONTEXT('USERENV', 'SESSION_USER')` |
| `USERENV(parameter)` | Gets session environment info | `USERENV('SESSIONID')` |
| `UID` | Current user ID | `SELECT UID FROM DUAL` |
| `USER` | Current username | `SELECT USER FROM DUAL` |
| `SYS_EXTRACT_UTC(timestamp)` | Extracts UTC time | `SYS_EXTRACT_UTC(SYSTIMESTAMP)` |
| `ORA_HASH(expr [, max_bucket [, seed]])` | Hash partitioning function | `ORA_HASH(id, 100)` |

```sql
-- SYS_GUID example
SELECT SYS_GUID() FROM DUAL;
-- Result like: A1B2C3D4E5F6070890A1B2C3D4E5F607

-- SYS_CONTEXT examples
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS username FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS schema FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'IP_ADDRESS') AS ip FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'DB_NAME') AS db_name FROM DUAL;

-- Common USERENV parameters
SELECT USERENV('SESSIONID') AS session_id FROM DUAL;
SELECT USERENV('INSTANCE') AS instance FROM DUAL;
SELECT USERENV('LANGUAGE') AS language FROM DUAL;

-- ORA_HASH example: data sharding
SELECT * FROM large_table WHERE ORA_HASH(id, 9) = 0;  -- assign to bucket 0
```

### Collection Functions

| Function | Description | Example |
|------|------|------|
| `CARDINALITY(collection)` | Returns number of collection elements | `CARDINALITY(varray_col)` |
| `COLLECT(expr)` | Aggregates into a collection | `COLLECT(DISTINCT name)` |
| `SET(collection)` | Deduplicates collection | `SET(varray_col)` |

## Oracle Data Type Mapping Table

### Numeric Types

| Oracle Type | IvorySQL Type | PG Underlying Type | Description |
|------------|-------------|------------|------|
| `NUMBER` | `NUMBER` | `numeric` | General numeric, arbitrary precision |
| `NUMBER(p)` | `NUMBER(p)` | `numeric(p)` | Specified precision |
| `NUMBER(p,s)` | `NUMBER(p,s)` | `numeric(p,s)` | Precision + scale |
| `BINARY_FLOAT` | `REAL` | `real` | Single-precision float (4 bytes) |
| `BINARY_DOUBLE` | `DOUBLE PRECISION` | `double precision` | Double-precision float (8 bytes) |
| `PLS_INTEGER` | `INTEGER` | `integer` | PL/SQL integer type |
| `BINARY_INTEGER` | `INTEGER` | `integer` | PL/SQL binary integer |

### Character Types

| Oracle Type | IvorySQL Type | PG Underlying Type | Description |
|------------|-------------|------------|------|
| `VARCHAR2(n)` | `VARCHAR2` | `character varying` | Variable-length character, empty string -> NULL |
| `NVARCHAR2(n)` | `VARCHAR` | `character varying` | Unicode variable-length character |
| `CHAR(n)` | `CHAR(n)` | `character` | Fixed-length character |
| `NCHAR(n)` | `CHAR(n)` | `character` | Unicode fixed-length character |
| `CLOB` | `CLOB` | `text` | Character large object |
| `NCLOB` | `TEXT` | `text` | Unicode large object |
| `LONG` | `LONG` | `text` | Long text (deprecated) |

### Date/Time Types

| Oracle Type | IvorySQL Type | PG Underlying Type | Description |
|------------|-------------|------------|------|
| `DATE` | `DATE` | `timestamp` | Includes date + time |
| `TIMESTAMP` | `TIMESTAMP` | `timestamp` | Timestamp |
| `TIMESTAMP WITH TIME ZONE` | `TIMESTAMPTZ` | `timestamptz` | Timezone-aware timestamp |
| `TIMESTAMP WITH LOCAL TIME ZONE` | `TIMESTAMPTZ` | `timestamptz` | Local timezone timestamp |
| `INTERVAL YEAR TO MONTH` | `INTERVAL` | `interval` | Year-month interval |
| `INTERVAL DAY TO SECOND` | `INTERVAL` | `interval` | Day-second interval |

### Binary Types

| Oracle Type | IvorySQL Type | PG Underlying Type | Description |
|------------|-------------|------------|------|
| `BLOB` | `BLOB` | `bytea` | Binary large object |
| `RAW(n)` | `RAW` | `bytea` | Raw binary data |
| `LONG RAW` | `BYTEA` | `bytea` | Long binary (deprecated) |

### Special Types

| Oracle Type | IvorySQL Type | Description |
|------------|-------------|------|
| `ROWID` | `ROWID` / `TEXT` | Row identifier |
| `UROWID` | `TEXT` | Universal row identifier |
| `XMLTYPE` | `XML` | XML data |
| `ANYDATA` | `JSONB` | Arbitrary data type |
| `SYS_REFCURSOR` | `REFCURSOR` | Cursor reference |

## Function Usage Examples

### Example 1: Comprehensive Use of Oracle Functions

```sql
-- Calculate employee annual income (including commission), handle NULL with NVL
SELECT ename,
       NVL(comm, 0) AS commission,
       sal * 12 + NVL(comm, 0) AS annual_income
FROM emp;

-- Use DECODE for department grouping
SELECT DECODE(deptno,
    10, 'Accounting',
    20, 'Research',
    30, 'Sales',
    40, 'Operations',
    'Other'
) AS dept_name, COUNT(*) AS cnt
FROM emp
GROUP BY DECODE(deptno, 10, 'Accounting', 20, 'Research', 30, 'Sales', 40, 'Operations', 'Other');
```

### Example 2: Comprehensive Use of Date Functions

```sql
-- Calculate the 5-year anniversary date for employees
SELECT ename, hiredate,
       ADD_MONTHS(hiredate, 60) AS five_year_date
FROM emp;

-- Calculate months of employment
SELECT ename, hiredate,
       TRUNC(MONTHS_BETWEEN(SYSDATE, hiredate)) AS months_employed
FROM emp;

-- Get first and last day of the current month
SELECT TRUNC(SYSDATE, 'MONTH') AS month_first_day,
       LAST_DAY(SYSDATE) AS month_last_day
FROM DUAL;
```

### Example 3: SYS_CONTEXT and USERENV

```sql
-- Get current session information
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user,
       SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema,
       SYS_CONTEXT('USERENV', 'DB_NAME') AS db_name,
       SYS_CONTEXT('USERENV', 'HOST') AS host,
       USERENV('LANGUAGE') AS language
FROM DUAL;
```

## PG Equivalent Function Reference

| Oracle Function | PG Equivalent | Notes |
|------------|--------|------|
| `NVL(a, b)` | `COALESCE(a, b)` | COALESCE is SQL standard |
| `NVL2(a, b, c)` | `CASE WHEN a IS NOT NULL THEN b ELSE c END` | Manual conversion required |
| `DECODE(expr, ...)` | `CASE WHEN expr = ... THEN ... END` | Manual conversion required |
| `SYSDATE` | `now()` / `current_timestamp` | Functionally equivalent |
| `ADD_MONTHS(d, n)` | `d + INTERVAL 'n months'` | Different syntax |
| `LAST_DAY(d)` | `date_trunc('month', d) + INTERVAL '1 month - 1 day'` | Manual conversion required |
| `MONTHS_BETWEEN(d1, d2)` | `EXTRACT(YEAR FROM age(d1, d2)) * 12 + EXTRACT(MONTH FROM age(d1, d2))` | Approximately equivalent |
| `TRUNC(d, fmt)` | `date_trunc(fmt, d)` | Different format string |
| `TO_CHAR(d, fmt)` | `to_char(d, fmt)` | Different format string |
| `TO_DATE(s, fmt)` | `to_date(s, fmt)` | Different format string |
| `INSTR(s, sub)` | `strpos(s, sub)` | Different parameter order |
| `SUBSTR(s, p, l)` | `substring(s, p, l)` | Different function name |
| `SYS_GUID()` | `gen_random_uuid()` | Different return format |
| `GREATEST(a, b)` | `GREATEST(a, b)` | PG native support |
| `LEAST(a, b)` | `LEAST(a, b)` | PG native support |
| `INITCAP(s)` | `initcap(s)` | PG native support |
| `LPAD/RPAD` | `lpad/rpad` | PG native support |
