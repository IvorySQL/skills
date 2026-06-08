---
title: IvorySQL SQL Basics
description: Keywords/Identifiers/Literals/Character Sets/Type Conversion
tags: ivorysql, sql-basics, keywords, identifiers, literals, charset, type-cast
---

# IvorySQL SQL Basics

## Keywords

IvorySQL inherits the PostgreSQL keyword system and additionally introduces Oracle-specific keywords in Oracle compatibility mode. Keywords are divided into Reserved Words and Non-Reserved Words.

### Reserved Words

Reserved words cannot be used as unquoted identifiers; doing so will cause a syntax error.

**SQL Standard Reserved Words (Commonly Used):**

| Category | Keyword Examples |
|----------|-----------------|
| DML | SELECT, INSERT, UPDATE, DELETE, MERGE |
| DDL | CREATE, ALTER, DROP, TRUNCATE, RENAME |
| DCL | GRANT, REVOKE |
| Query Clauses | FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET |
| Joins | JOIN, INNER, LEFT, RIGHT, FULL, CROSS, NATURAL, ON |
| Set Operations | UNION, INTERSECT, EXCEPT, ALL |
| Transactions | BEGIN, COMMIT, ROLLBACK, SAVEPOINT |
| Logic | AND, OR, NOT, IN, EXISTS, BETWEEN, LIKE, IS, ANY, ALL |
| Data Types | INTEGER, VARCHAR, CHAR, DATE, TIMESTAMP, BOOLEAN, NUMERIC |
| Constraints | PRIMARY, UNIQUE, FOREIGN, REFERENCES, CHECK, NOT, NULL |
| Others | AS, CASE, WHEN, THEN, ELSE, END, DEFAULT, DISTINCT, INTO, VALUES, SET |

**Additional Reserved Words in Oracle Mode:**

| Keyword | Description |
|---------|-------------|
| DUAL | Oracle pseudo-table name |
| CONNECT | Hierarchical query keyword |
| PRIOR | Hierarchical query direction indicator |
| MERGE | Merge operation |
| PACKAGE | Package definition |
| BODY | Package body definition |
| VARCHAR2 | Oracle character type |
| NUMBER | Oracle numeric type |
| SYSDATE | Current date and time |
| ROWID | Row identifier pseudo-column |
| ROWNUM | Row number pseudo-column |
| NVL | Null replacement function |
| DECODE | Conditional expression function |
| TRUNC | Truncation function |
| NVL2 | Two-parameter null replacement |
| ROWIDTOCHAR | Convert ROWID to character |
| CHARTOROWID | Convert character to ROWID |

### Non-Reserved Words

Non-reserved words have special meanings in specific contexts but can still be used as unquoted identifiers (not recommended).

| Keyword | Contextual Meaning |
|---------|-------------------|
| INVISIBLE | Column attribute, marks an invisible column |
| VISIBLE | Column attribute, marks a visible column |
| FORCE | View creation option |
| CYCLE | Sequence cycle option |
| IDENTITY | Identity column |
| PARTITION | Partition keyword |
| CONCURRENTLY | Concurrent index creation |
| MATERIALIZED | Materialized view |
| RECURSIVE | Recursive CTE |
| TEMPORARY | Temporary objects |
| EXTERNAL | External objects |

### Using Keywords as Identifiers

```sql
-- Reserved words must be double-quoted
CREATE TABLE "select" (id INTEGER);  -- Legal but not recommended

-- Non-reserved words can be used without quotes (but not recommended)
CREATE TABLE partition (id INTEGER);  -- Legal but easily confused

-- Best practice: avoid using keywords as identifiers
CREATE TABLE partition_info (id INTEGER);  -- Recommended
```

## Identifiers

### Naming Rules

- Length: maximum 63 bytes (adjustable via the `NAMEDATALEN` compile-time option)
- Characters: letters, digits, underscores; the first character must be a letter or underscore
- Unquoted identifiers are automatically case-normalized
- Double-quoted identifiers preserve original case

### PostgreSQL Mode

In PG mode, unquoted identifiers are automatically converted to lowercase.

```sql
-- The following two statements create tables with the same name (both become lowercase mytable)
CREATE TABLE MyTable (id INTEGER);
CREATE TABLE mytable (id INTEGER);
-- Error: table already exists

-- Double quotes preserve case
CREATE TABLE "MyTable" (id INTEGER);
-- Now MyTable and mytable are two different tables

-- The same rules apply during queries
SELECT * FROM mytable;      -- Queries mytable
SELECT * FROM "MyTable";    -- Queries MyTable (case-sensitive exact match)
```

### Oracle Mode

In Oracle mode, identifier case is preserved (note: Oracle database's default behavior is to convert unquoted identifiers to uppercase, but IvorySQL Oracle mode preserves original case to maintain compatibility with the PG ecosystem).

```sql
-- Case is preserved in Oracle mode
CREATE TABLE MyTable (id INTEGER);  -- Stored as MyTable

-- Double-quoted identifiers are also case-sensitive
CREATE TABLE "MyTable" (id INTEGER);

-- Tables with different cases
CREATE TABLE employees (id INTEGER);  -- Stored as employees
CREATE TABLE Employees (id INTEGER);  -- Stored as Employees (different from employees)
```

### Mode Comparison

| Feature | IvorySQL PG Mode | IvorySQL Oracle Mode | PostgreSQL | Oracle |
|---------|-----------------|---------------------|------------|--------|
| Unquoted identifiers | Converted to lowercase | Case preserved | Converted to lowercase | Converted to uppercase |
| Double-quoted identifiers | Case preserved | Case preserved | Case preserved | Case preserved |
| Maximum length | 63 bytes | 63 bytes | 63 bytes | 30 bytes (before 12c) / 128 bytes (12c+) |

### Identifier Best Practices

```sql
-- Recommended: use snake_case without quotes
CREATE TABLE employee_salary (
    employee_id INTEGER PRIMARY KEY,
    base_salary NUMERIC(10,2),
    bonus_amount NUMERIC(10,2)
);

-- Avoid: mixed case
CREATE TABLE EmployeeSalary (...);  -- Converted to employeesalary in PG mode

-- Avoid: using double quotes to preserve case (increases maintenance burden)
CREATE TABLE "EmployeeSalary" (...);  -- Must be quoted when querying
```

## Literals

### Literal Types Overview

| Type | Syntax | Example | Description |
|------|--------|---------|-------------|
| Integer | `digits` | `42`, `-7`, `+100` | Standard integer |
| Floating-point | `digits.digits` | `3.14`, `-.001` | Decimal number |
| Scientific notation | `digits e digits` | `1.5e-3`, `2E5` | Exponential notation |
| String | `'text'` | `'hello'`, `'It''s ok'` | Single-quoted; internal single quotes escaped by doubling |
| Dollar-quoted string | `$$text$$` or `$tag$text$tag$` | `$$O'Brien$$`, `$func$SELECT$func$` | Avoids escaping; commonly used in function bodies |
| Bit string | `B'bits'` or `X'hex'` | `B'1010'`, `X'1FF'` | Binary/hexadecimal bit string |
| Boolean | `TRUE`/`FALSE` | `TRUE`, `FALSE` | Boolean value |
| NULL | `NULL` | `NULL` | Null value |
| Date | `DATE 'date'` | `DATE '2025-01-01'` | Date literal |
| Time | `TIME 'time'` | `TIME '12:30:00'` | Time literal |
| Timestamp | `TIMESTAMP 'ts'` | `TIMESTAMP '2025-01-01 12:00:00'` | Timestamp literal |
| Timestamp with time zone | `TIMESTAMP WITH TIME ZONE 'ts'` | `TIMESTAMP WITH TIME ZONE '2025-01-01 12:00:00+08'` | Timestamp with time zone |
| Interval | `INTERVAL 'duration'` | `INTERVAL '1 day'`, `INTERVAL '2 hours 30 minutes'` | Time interval |
| Array | `ARRAY[...]` | `ARRAY[1,2,3]`, `ARRAY['a','b']` | Array literal |
| JSON | With type prefix | `'{"key":"val"}'::jsonb` | JSON literal |

### String Literals in Detail

```sql
-- Standard string
SELECT 'Hello, World!';

-- String containing a single quote (escaped by doubling)
SELECT 'It''s a beautiful day';

-- Dollar-quoted string (no escaping needed)
SELECT $$It's a "beautiful" day$$;

-- Tagged dollar quoting (useful for nested function bodies)
SELECT $func$SELECT * FROM users WHERE name = 'test'$func$;

-- E-escape strings (support C-style escape sequences)
SELECT E'Hello\nWorld';  -- Contains a newline
SELECT E'Tab\there';     -- Contains a tab
```

### Oracle Mode Special Behavior

```sql
-- In Oracle mode, empty strings are equivalent to NULL
-- PG mode
SELECT '' = '';          -- TRUE (empty string equals empty string)
SELECT '' IS NULL;       -- FALSE

-- Oracle mode
SELECT '' IS NULL;       -- TRUE (empty string treated as NULL)
SELECT '' = '';          -- NULL (comparing NULL with NULL returns NULL)

-- When inserting data
-- PG mode
INSERT INTO users (name) VALUES ('');   -- Inserts an empty string

-- Oracle mode
INSERT INTO users (name) VALUES ('');   -- Inserts NULL
```

### Date and Time Literals

```sql
-- Standard date
SELECT DATE '2025-01-15';

-- Standard timestamp
SELECT TIMESTAMP '2025-01-15 10:30:00';

-- Timestamp with time zone
SELECT TIMESTAMP WITH TIME ZONE '2025-01-15 10:30:00+08:00';

-- Interval literals
SELECT INTERVAL '1 year 2 months 3 days';
SELECT INTERVAL '2 hours 30 minutes';
SELECT INTERVAL '1:30' HOUR TO MINUTE;

-- Oracle mode date format
SELECT TO_DATE('2025-01-15', 'YYYY-MM-DD') FROM DUAL;
SELECT TO_DATE('15-JAN-2025', 'DD-MON-YYYY') FROM DUAL;
```

## Character Set Support

### Supported Character Sets

| Character Set | Description | Applicable Scenario |
|---------------|-------------|---------------------|
| UTF-8 | Unicode variable-length encoding, 1-4 bytes | Recommended; supports all languages |
| GB18030 | Chinese national standard encoding | Chinese environment compatibility |
| EUC_CN | Extended Unix Encoding - Chinese | Legacy Chinese systems |
| LATIN1 | ISO 8859-1 Western European languages | Western European languages |
| SQL_ASCII | No encoding conversion | Compatibility mode; not recommended |

### Character Set Configuration

```sql
-- Specify character set when creating a database
CREATE DATABASE mydb
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'zh_CN.UTF-8'
    LC_CTYPE = 'zh_CN.UTF-8'
    TEMPLATE = template0;

-- View the current database character set
SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = current_database();

-- View client encoding
SHOW client_encoding;

-- Set client encoding
SET client_encoding = 'UTF8';
SET client_encoding = 'GB18030';
```

### Collation

```sql
-- Specify column-level collation
CREATE TABLE users (
    name VARCHAR(100) COLLATE "zh_CN.utf8"
);

-- Specify collation in queries
SELECT * FROM users ORDER BY name COLLATE "zh_CN.utf8";

-- Use ICU collation (requires compilation support)
SELECT * FROM users ORDER BY name COLLATE "zh-Hans-CN-x-icu";

-- How collation affects comparisons
SELECT 'a' < 'A';  -- Depends on the collation
SELECT 'a' COLLATE "C" < 'A' COLLATE "C";  -- TRUE (C collation is byte-value based)
SELECT 'a' COLLATE "zh_CN.utf8" < 'A' COLLATE "zh_CN.utf8";  -- FALSE (Chinese collation is case-insensitive)
```

## Type Conversion

### Conversion Methods

IvorySQL supports three type conversion methods:

#### 1. CAST Syntax (SQL Standard)

```sql
CAST(expression AS target_type)

-- Examples
SELECT CAST('123' AS INTEGER);
SELECT CAST(3.14 AS NUMERIC(10,2));
SELECT CAST('2025-01-01' AS DATE);
SELECT CAST(123 AS VARCHAR(10));
SELECT CAST(salary AS VARCHAR2(20));  -- Oracle mode
```

#### 2. `::` Syntax (PostgreSQL Extension)

```sql
expression::target_type

-- Examples
SELECT '123'::INTEGER;
SELECT '2025-01-01'::DATE;
SELECT 3.14::NUMERIC(10,2);
SELECT CURRENT_TIMESTAMP::DATE;
SELECT '{"key":"val"}'::JSONB;
```

#### 3. Function-Style Conversion

```sql
target_type(expression)

-- Examples
SELECT INTEGER '123';
SELECT DATE '2025-01-01';
SELECT NUMERIC '3.14';
```

#### 4. Oracle Compatibility Conversion Functions

```sql
-- TO_DATE: string to date
SELECT TO_DATE('2025-01-15', 'YYYY-MM-DD') FROM DUAL;
SELECT TO_DATE('15/01/2025', 'DD/MM/YYYY') FROM DUAL;

-- TO_NUMBER: string to numeric
SELECT TO_NUMBER('12345') FROM DUAL;
SELECT TO_NUMBER('12,345.67', '99,999.99') FROM DUAL;

-- TO_CHAR: numeric/date to string
SELECT TO_CHAR(12345, '99,999') FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY"Year"MM"Month"DD"Day"') FROM DUAL;

-- TO_TIMESTAMP: string to timestamp
SELECT TO_TIMESTAMP('2025-01-15 10:30:00', 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;

-- NUMTODSINTERVAL: numeric to interval
SELECT NUMTODSINTERVAL(120, 'MINUTE') FROM DUAL;
```

### Implicit Type Conversion

```sql
-- String and numeric
SELECT '123' + 456;       -- 579 (string implicitly converted to integer)
SELECT 3.14 > '2';        -- TRUE

-- String and date
SELECT DATE '2025-01-01' + 1;  -- 2025-01-02 (integer implicitly converted to days)

-- Note: implicit conversion may lead to unexpected results
SELECT '123abc' + 0;      -- Error: cannot convert
```

### Common Type Conversion Table

| Source Type | Target Type | Conversion Method | Example |
|-------------|-------------|-------------------|---------|
| VARCHAR to INTEGER | CAST/:: | `CAST('123' AS INTEGER)` |
| VARCHAR to DATE | CAST/::/TO_DATE | `TO_DATE('2025-01-01','YYYY-MM-DD')` |
| VARCHAR to NUMERIC | CAST/::/TO_NUMBER | `TO_NUMBER('123.45')` |
| INTEGER to VARCHAR | CAST/::/TO_CHAR | `TO_CHAR(12345, '99999')` |
| DATE to VARCHAR | CAST/::/TO_CHAR | `TO_CHAR(SYSDATE, 'YYYY-MM-DD')` |
| TIMESTAMP to DATE | CAST/:: | `CURRENT_TIMESTAMP::DATE` |
| JSONB to TEXT | CAST/:: | `json_col::TEXT` |
| TEXT to JSONB | CAST/:: | `'{"a":1}'::JSONB` |

## Summary of Oracle Mode Special Behaviors

### Identifier Case Preservation

```sql
-- Switch to Oracle mode
SET ivorysql.compatible_mode = 'oracle';

-- Create a table
CREATE TABLE Employees (Id NUMBER, Name VARCHAR2(100));
-- Stored as Employees (case preserved)

-- PG mode comparison
SET ivorysql.compatible_mode = 'pg';
CREATE TABLE Employees (Id INTEGER, Name VARCHAR(100));
-- Stored as employees (converted to lowercase)
```

### Empty Strings Treated as NULL

```sql
-- Oracle mode
SET ivorysql.compatible_mode = 'oracle';

-- Empty string behavior
SELECT LENGTH('') FROM DUAL;          -- NULL (not 0)
SELECT '' IS NULL;                      -- TRUE
SELECT COALESCE('', 'N/A') FROM DUAL;  -- N/A

-- PG mode comparison
SET ivorysql.compatible_mode = 'pg';
SELECT LENGTH('');           -- 0
SELECT '' IS NULL;           -- FALSE
SELECT COALESCE('', 'N/A');  -- '' (the empty string itself)
```

### Other Oracle Mode Special Behaviors

```sql
-- DUAL pseudo-table
SELECT 1+1 FROM DUAL;
SELECT SYSDATE FROM DUAL;

-- ROWNUM pseudo-column
SELECT * FROM employees WHERE ROWNUM <= 10;

-- DECODE function
SELECT DECODE(status, 1, 'Active', 2, 'Inactive', 'Unknown') FROM users;

-- NVL/NVL2 functions
SELECT NVL(bonus, 0) FROM employees;
SELECT NVL2(bonus, bonus * 0.1, 0) FROM employees;

-- SYSDATE
SELECT SYSDATE FROM DUAL;  -- Equivalent to CURRENT_TIMESTAMP in Oracle mode

-- TRUNC function (date truncation)
SELECT TRUNC(SYSDATE, 'MONTH') FROM DUAL;
SELECT TRUNC(SYSDATE, 'YEAR') FROM DUAL;
```
