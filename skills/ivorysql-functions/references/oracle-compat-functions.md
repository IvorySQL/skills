---
title: Oracle Compatible Functions Details
description: NVL/NVL2/DECODE/SYS_GUID/SYS_CONTEXT/USERENV/GREATEST/LEAST, etc.
tags: ivorysql, oracle-compat, functions, nvl, nvl2, decode, sys_guid, sys_context, userenv
---

# Oracle Compatible Functions Details

IvorySQL provides a series of Oracle compatible functions in Oracle mode, covering null handling, conditional expressions, system information retrieval, unique identifier generation, and more.

## Null Handling Functions

### NVL

`NVL(expr1, expr2)` - Returns expr2 if expr1 is NULL; otherwise returns expr1.

```sql
-- Basic usage
SELECT NVL(NULL, 'default') FROM DUAL;           -- default
SELECT NVL('value', 'default') FROM DUAL;        -- value
SELECT NVL(NULL, 0) FROM DUAL;                   -- 0

-- Practical use: handle columns that may be NULL
SELECT name, NVL(commission, 0) AS comm
FROM employees;

-- Expression with NULL handling
SELECT name, salary + NVL(bonus, 0) AS total_comp
FROM employees;

-- Nested
SELECT NVL(phone, NVL(mobile, NVL(email, 'No contact method'))) AS contact
FROM contacts;

-- PG equivalent
SELECT COALESCE(phone, mobile, email, 'No contact method') AS contact
FROM contacts;
```

### NVL2

`NVL2(expr1, expr2, expr3)` - Returns expr2 if expr1 is not NULL; otherwise returns expr3.

```sql
-- Basic usage
SELECT NVL2('X', 'yes', 'no') FROM DUAL;    -- yes
SELECT NVL2(NULL, 'yes', 'no') FROM DUAL;   -- no

-- Practical use: return different descriptions based on value presence
SELECT name,
       NVL2(commission, 'Has commission: ' || commission, 'No commission') AS comm_status
FROM employees;

-- Practical use: conditional calculation
SELECT name,
       NVL2(bonus, salary + bonus, salary * 1.1) AS total_pay
FROM employees;

-- PG equivalent
SELECT name,
       CASE WHEN commission IS NOT NULL
            THEN 'Has commission: ' || commission
            ELSE 'No commission'
       END AS comm_status
FROM employees;
```

### COALESCE

`COALESCE(expr1, expr2, ...)` - Returns the first non-NULL expression (SQL standard, supported by both PG and Oracle).

```sql
-- Multi-value fallback
SELECT COALESCE(phone, mobile, email, 'No contact method') AS contact
FROM contacts;

-- Compare with NVL
SELECT NVL(NULL, 'default'), COALESCE(NULL, 'default');
-- Both are functionally equivalent, but COALESCE supports multiple parameters

-- Numeric default
SELECT name, COALESCE(salary, 0) AS salary
FROM employees;
```

## Conditional Expression Functions

### DECODE

`DECODE(expr, search1, result1, search2, result2, ..., default)` - Compares expr against each search value and returns the corresponding result.

```sql
-- Basic usage
SELECT DECODE(1, 1, 'One', 2, 'Two', 'Other') FROM DUAL;  -- One
SELECT DECODE(3, 1, 'One', 2, 'Two', 'Other') FROM DUAL;  -- Other

-- String matching
SELECT DECODE(dept_name,
    'Engineering', 'Engineering Dept',
    'Sales', 'Sales Dept',
    'Marketing', 'Marketing Dept',
    'Other Dept'
) AS dept_label
FROM departments;

-- Numeric ranges (requires a workaround)
SELECT DECODE(
    SIGN(salary - 10000),
    1, 'High salary',
    0, 'High salary',
    -1, DECODE(
        SIGN(salary - 5000),
        1, 'Medium',
        0, 'Medium',
        -1, 'Low salary'
    )
) AS salary_level
FROM employees;

-- Pivot rows to columns with DECODE
SELECT dept_id,
       SUM(DECODE(job_id, 'IT_PROG', salary, 0)) AS it_total,
       SUM(DECODE(job_id, 'SA_REP', salary, 0)) AS sales_total,
       SUM(DECODE(job_id, 'ST_CLERK', salary, 0)) AS clerk_total
FROM employees
GROUP BY dept_id;

-- PG equivalent (CASE WHEN)
SELECT CASE dept_name
    WHEN 'Engineering' THEN 'Engineering Dept'
    WHEN 'Sales' THEN 'Sales Dept'
    WHEN 'Marketing' THEN 'Marketing Dept'
    ELSE 'Other Dept'
END AS dept_label
FROM departments;
```

### GREATEST

`GREATEST(expr1, expr2, ...)` - Returns the maximum value among all expressions.

```sql
-- Numeric comparison
SELECT GREATEST(10, 20, 5, 15) FROM DUAL;       -- 20

-- String comparison (lexicographic)
SELECT GREATEST('Apple', 'Banana', 'Cherry') FROM DUAL;  -- Cherry

-- Date comparison
SELECT GREATEST(DATE '2025-01-01', DATE '2025-06-15', DATE '2025-03-20') FROM DUAL;
-- 2025-06-15

-- Practical use: get maximum across multiple columns
SELECT name,
       GREATEST(score1, score2, score3) AS best_score
FROM exam_results;

-- Note: returns NULL if any argument is NULL
SELECT GREATEST(10, NULL, 20);  -- NULL

-- Use COALESCE to handle NULL
SELECT GREATEST(COALESCE(score1, 0), COALESCE(score2, 0), COALESCE(score3, 0))
FROM exam_results;
```

### LEAST

`LEAST(expr1, expr2, ...)` - Returns the minimum value among all expressions.

```sql
-- Numeric comparison
SELECT LEAST(10, 20, 5, 15) FROM DUAL;       -- 5

-- String comparison
SELECT LEAST('Apple', 'Banana', 'Cherry') FROM DUAL;  -- Apple

-- Date comparison
SELECT LEAST(DATE '2025-01-01', DATE '2025-06-15', DATE '2025-03-20') FROM DUAL;
-- 2025-01-01

-- Practical use: get earliest date
SELECT name,
       LEAST(hire_date, contract_date, start_date) AS earliest_date
FROM employees;

-- Note: same as GREATEST, any NULL returns NULL
SELECT LEAST(10, NULL, 20);  -- NULL
```

## System and Environment Functions

### SYS_GUID

`SYS_GUID()` - Generates a 16-byte globally unique identifier (RAW format).

```sql
-- Generate GUID
SELECT SYS_GUID() FROM DUAL;
-- Result like: A1B2C3D4E5F6070890A1B2C3D4E5F607

-- Each call produces a different value
SELECT SYS_GUID() FROM DUAL;
SELECT SYS_GUID() FROM DUAL;
-- Results differ

-- Use as default for primary key
CREATE TABLE sessions (
    id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
    user_id NUMBER,
    created_at DATE DEFAULT SYSDATE
);

-- Convert to readable format
SELECT LOWER(SYS_GUID()) AS guid FROM DUAL;

-- PG equivalent
SELECT gen_random_uuid();
-- Result like: 550e8400-e29b-41d4-a716-446655440000
```

### SYS_CONTEXT

`SYS_CONTEXT(namespace, parameter [, length])` - Returns the value of the parameter in the specified namespace.

```sql
-- Common USERENV namespace parameters
SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') AS session_user FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA') AS current_schema FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'CURRENT_USER') AS current_user FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'DB_NAME') AS db_name FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'HOST') AS host FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'IP_ADDRESS') AS ip FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'OS_USER') AS os_user FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'TERMINAL') AS terminal FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'LANGUAGE') AS language FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'SESSIONID') AS session_id FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'INSTANCE') AS instance FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'ISDBA') AS is_dba FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'MODULE') AS module FROM DUAL;
SELECT SYS_CONTEXT('USERENV', 'ACTION') AS action FROM DUAL;

-- Custom application context
CREATE CONTEXT app_ctx USING ctx_pkg;

-- Set context in PL/iSQL
-- DBMS_SESSION.SET_CONTEXT('app_ctx', 'user_role', 'admin');

-- Query custom context
SELECT SYS_CONTEXT('app_ctx', 'user_role') AS user_role FROM DUAL;
```

### USERENV

`USERENV(parameter)` - Returns session environment information (simplified version of SYS_CONTEXT).

```sql
-- Common parameters
SELECT USERENV('SESSIONID') AS session_id FROM DUAL;
SELECT USERENV('INSTANCE') AS instance FROM DUAL;
SELECT USERENV('LANGUAGE') AS language FROM DUAL;
SELECT USERENV('ISDBA') AS is_dba FROM DUAL;
SELECT USERENV('TERMINAL') AS terminal FROM DUAL;

-- USERENV vs SYS_CONTEXT
-- USERENV('SESSIONID') is equivalent to SYS_CONTEXT('USERENV', 'SESSIONID')
-- SYS_CONTEXT is recommended for its richer functionality
```

### UID and USER

```sql
-- UID: current user ID
SELECT UID FROM DUAL;

-- USER: current username
SELECT USER FROM DUAL;

-- Practical use: audit fields
CREATE TABLE audit_log (
    id NUMBER GENERATED ALWAYS AS IDENTITY,
    action VARCHAR2(50),
    table_name VARCHAR2(100),
    action_time DATE DEFAULT SYSDATE,
    action_user VARCHAR2(100) DEFAULT USER
);
```

## Math Functions (Oracle Compatible)

### ORA_HASH

`ORA_HASH(expr [, max_bucket [, seed]])` - Hash function for data bucketing and partitioning.

```sql
-- Basic usage: hash into buckets 0-99
SELECT ORA_HASH(id, 99) AS bucket FROM employees;

-- With seed value
SELECT ORA_HASH(id, 99, 12345) AS bucket FROM employees;

-- Data sharding: split data into 10 parts
SELECT * FROM large_table WHERE ORA_HASH(id, 9) = 0;   -- Part 0
SELECT * FROM large_table WHERE ORA_HASH(id, 9) = 1;   -- Part 1

-- Random sampling: approximately 10% of data
SELECT * FROM orders WHERE ORA_HASH(order_id, 9) = 0;

-- PG equivalent
SELECT * FROM large_table WHERE abs(hashtext(id::text)) % 10 = 0;
```

## Other Oracle Compatible Functions

### NANVL

`NANVL(expr1, expr2)` - Returns expr2 if expr1 is NaN.

```sql
SELECT NANVL(1.0/0.0, 0) FROM DUAL;  -- Returns 0 for NaN
```

### LNNVL

`LNNVL(condition)` - Returns TRUE if the condition is FALSE or NULL.

```sql
-- Find employees where commission is NULL or less than 500
SELECT * FROM employees WHERE LNNVL(commission >= 500);

-- Equivalent to
SELECT * FROM employees WHERE commission IS NULL OR commission < 500;
```

### NULLIF

`NULLIF(expr1, expr2)` - Returns NULL if expr1 = expr2; otherwise returns expr1 (SQL standard).

```sql
SELECT NULLIF(10, 10) FROM DUAL;   -- NULL
SELECT NULLIF(10, 20) FROM DUAL;   -- 10

-- Practical use: avoid division by zero
SELECT revenue / NULLIF(quarters, 0) AS avg_revenue
FROM financials;
```

### COALESCE

`COALESCE(expr1, expr2, ...)` - Returns the first non-NULL expression (SQL standard).

```sql
-- Multi-value fallback
SELECT COALESCE(work_phone, cell_phone, home_phone, 'No phone') AS phone
FROM contacts;

-- Compared to NVL: COALESCE supports multiple parameters, NVL only two
-- COALESCE is SQL standard, recommended for use
```

### VSIZE

`VSIZE(expr)` - Returns the internal byte size of the expression.

```sql
SELECT VSIZE('Hello') FROM DUAL;        -- 5
SELECT VSIZE(12345) FROM DUAL;          -- Internal storage size
SELECT VSIZE(SYSDATE) FROM DUAL;        -- Date storage size
```

### DUMP

`DUMP(expr [, return_format [, start_pos [, length]]])` - Returns the internal representation of the expression.

```sql
SELECT DUMP('Hello') FROM DUAL;
-- Returns type code, length, and internal byte representation

-- return_format: 8=octal, 10=decimal, 16=hexadecimal, 17=character
SELECT DUMP('Hello', 16) FROM DUAL;
```

## Comprehensive Examples

### Example 1: Employee Salary Report

```sql
SELECT
    e.name,
    e.salary,
    NVL(e.commission, 0) AS commission,
    e.salary * 12 + NVL(e.commission, 0) AS annual_income,
    NVL2(e.commission, 'Has commission', 'No commission') AS comm_status,
    DECODE(
        SIGN(e.salary - 10000),
        1, 'High salary',
        0, 'High salary',
        -1, DECODE(SIGN(e.salary - 5000), 1, 'Medium', 0, 'Medium', -1, 'Low salary')
    ) AS salary_grade,
    GREATEST(e.salary, e.salary * 1.1) AS max_possible,
    SYS_CONTEXT('USERENV', 'SESSION_USER') AS report_user,
    SYSDATE AS report_date
FROM employees e
ORDER BY e.salary DESC;
```

### Example 2: Data Audit Trigger

```sql
CREATE OR REPLACE TRIGGER audit_emp_trg
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
DECLARE
    v_action VARCHAR2(20);
BEGIN
    IF INSERTING THEN
        v_action := 'INSERT';
    ELSIF UPDATING THEN
        v_action := 'UPDATE';
    ELSIF DELETING THEN
        v_action := 'DELETE';
    END IF;

    INSERT INTO audit_log (
        action, table_name, record_id,
        old_data, new_data,
        action_user, action_time
    ) VALUES (
        v_action, 'EMPLOYEES',
        NVL(:NEW.id, :OLD.id),
        NVL2(:OLD.id, :OLD.name || ':' || :OLD.salary, NULL),
        NVL2(:NEW.id, :NEW.name || ':' || :NEW.salary, NULL),
        USER, SYSDATE
    );
END;
/
```

### Example 3: GUID Primary Key Table

```sql
-- Use SYS_GUID as primary key
CREATE TABLE orders (
    order_id RAW(16) DEFAULT SYS_GUID() PRIMARY KEY,
    customer_id NUMBER NOT NULL,
    order_date DATE DEFAULT SYSDATE,
    status VARCHAR2(20) DEFAULT 'PENDING',
    total_amount NUMBER(12,2)
);

-- GUID auto-generated on insert
INSERT INTO orders (customer_id, total_amount)
VALUES (1001, 999.99);

-- Query
SELECT order_id, customer_id, order_date, status
FROM orders
WHERE customer_id = 1001;
```
