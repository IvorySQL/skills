---
title: Oracle to IvorySQL Migration Details
description: Complete guide for Oracle to IvorySQL migration, covering data type mapping, SQL syntax conversion, stored procedure migration (PL/SQL to PL/iSQL), function compatibility
tags:
  - ivorysql
  - migration
  - oracle
  - data-type-mapping
  - plsql
  - plisql
  - syntax-conversion
---

# Oracle to IvorySQL Migration Details

## Overview

IvorySQL's core value lies in Oracle compatibility, making Oracle to IvorySQL migration smoother. This document details key migration tasks including data type mapping, SQL syntax conversion, and stored procedure migration.

## Data Type Mapping

### Basic Data Types

| Oracle Type | IvorySQL Type | Description |
|------------|--------------|------|
| NUMBER(p,s) | numeric(p,s) | Precision numeric |
| NUMBER | numeric | Unspecified precision numeric |
| NUMBER(p) | integer / bigint | Integer |
| BINARY_FLOAT | real | Single-precision float |
| BINARY_DOUBLE | double precision | Double-precision float |
| VARCHAR2(n) | varchar(n) | Variable-length string |
| NVARCHAR2(n) | varchar(n) | Unicode string |
| CHAR(n) | char(n) | Fixed-length string |
| NCHAR(n) | char(n) | Unicode fixed-length |
| CLOB | text | Large text |
| NCLOB | text | Unicode large text |
| BLOB | bytea | Binary large object |
| RAW(n) | bytea | Raw binary |
| LONG RAW | bytea | Long raw binary |
| LONG | text | Long text |
| DATE | timestamp | Date time (Oracle DATE includes time) |
| TIMESTAMP(p) | timestamp(p) | Timestamp |
| TIMESTAMP(p) WITH TZ | timestamptz(p) | Timestamp with timezone |
| INTERVAL YEAR(p) TO MONTH | interval year(p) | Year-month interval |
| INTERVAL DAY(p) TO SECOND(s) | interval day(p) to second(s) | Day-second interval |
| ROWID | text | Row identifier |
| UROWID | text | Universal row identifier |
| XMLTYPE | xml | XML data |
| BOOLEAN | boolean | Boolean (Oracle 23c+) |

### IvorySQL Oracle-Compatible Types

After enabling `ivorysql.enable_oracle_type = true`, IvorySQL natively supports the following Oracle types:

```sql
-- Enable Oracle-compatible types
SET ivorysql.enable_oracle_type = true;

-- Use Oracle type names directly
CREATE TABLE oracle_compat (
    id NUMBER,
    name VARCHAR2(100),
    description CLOB,
    data BLOB,
    created_date DATE,
    updated_ts TIMESTAMP
);
```

### Handling Special Types

```sql
-- Oracle LONG type -> IvorySQL text
-- LONG cannot be migrated directly and requires special handling
-- Method 1: Use ora2pg for automatic conversion
-- Method 2: Convert it to CLOB on the Oracle side first

-- Oracle: ALTER TABLE t MODIFY long_col CLOB;
-- Then migrate it

-- Oracle RAW type -> IvorySQL bytea
-- Use decode when inserting
INSERT INTO t (raw_col) VALUES (decode('0123ABCD', 'hex'));

-- Oracle DATE -> IvorySQL timestamp
-- Oracle DATE includes a time component and maps to IvorySQL timestamp
-- Set the NLS format
SET ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS';
```

## SQL Syntax Conversion

### SELECT Statements

```sql
-- Oracle: ROWNUM
SELECT * FROM employees WHERE ROWNUM <= 10;
-- IvorySQL (Oracle mode): ROWNUM is supported directly
SELECT * FROM employees WHERE ROWNUM <= 10;
-- IvorySQL (PG mode): Use LIMIT
SELECT * FROM employees LIMIT 10;

-- Oracle: SYSDATE
SELECT SYSDATE FROM DUAL;
-- IvorySQL (Oracle mode): Supported
SELECT SYSDATE FROM DUAL;
-- IvorySQL (PG mode):
SELECT now();

-- Oracle: NVL
SELECT NVL(comm, 0) FROM employees;
-- IvorySQL (Oracle mode): NVL is supported
SELECT NVL(comm, 0) FROM employees;
-- IvorySQL (PG mode): Use COALESCE
SELECT COALESCE(comm, 0) FROM employees;

-- Oracle: DECODE
SELECT DECODE(deptno, 10, 'ACCOUNTING', 20, 'RESEARCH', 'OTHER') FROM employees;
-- IvorySQL (Oracle mode): DECODE is supported
-- IvorySQL (PG mode): Use CASE
SELECT CASE deptno WHEN 10 THEN 'ACCOUNTING' WHEN 20 THEN 'RESEARCH' ELSE 'OTHER' END FROM employees;

-- Oracle: CONNECT BY hierarchical query
SELECT empno, ename, mgr, LEVEL
FROM employees
CONNECT BY PRIOR empno = mgr
START WITH mgr IS NULL;
-- IvorySQL: Use WITH RECURSIVE
WITH RECURSIVE emp_hierarchy AS (
    SELECT empno, ename, mgr, 1 AS LEVEL
    FROM employees WHERE mgr IS NULL
    UNION ALL
    SELECT e.empno, e.ename, e.mgr, h.LEVEL + 1
    FROM employees e JOIN emp_hierarchy h ON e.mgr = h.empno
)
SELECT * FROM emp_hierarchy;
```

### String Functions

```sql
-- Oracle || concatenation -> IvorySQL || concatenation (same syntax)
SELECT first_name || ' ' || last_name FROM employees;

-- Oracle SUBSTR -> IvorySQL SUBSTR (same syntax)
SELECT SUBSTR(ename, 1, 5) FROM employees;

-- Oracle INSTR -> IvorySQL INSTR (supported in Oracle mode)
SELECT INSTR(ename, 'A') FROM employees;

-- Oracle TO_CHAR -> IvorySQL TO_CHAR
SELECT TO_CHAR(hire_date, 'YYYY-MM-DD') FROM employees;
-- Note: Format strings may differ
-- Oracle: YYYY-MM-DD HH24:MI:SS
-- IvorySQL: YYYY-MM-DD HH24:MI:SS (compatible in Oracle mode)
```

### Date Functions

```sql
-- Oracle date arithmetic
SELECT hire_date + 30 FROM employees;  -- Add 30 days
-- IvorySQL (Oracle mode): Supported
SELECT hire_date + 30 FROM employees;
-- IvorySQL (PG mode):
SELECT hire_date + interval '30 days' FROM employees;

-- Oracle ADD_MONTHS
SELECT ADD_MONTHS(hire_date, 6) FROM employees;
-- IvorySQL (Oracle mode): Supported
-- IvorySQL (PG mode):
SELECT hire_date + interval '6 months' FROM employees;

-- Oracle LAST_DAY
SELECT LAST_DAY(hire_date) FROM employees;
-- IvorySQL (Oracle mode): Supported

-- Oracle TRUNC(date)
SELECT TRUNC(hire_date) FROM employees;
-- IvorySQL (Oracle mode): Supported
-- IvorySQL (PG mode):
SELECT date_trunc('day', hire_date) FROM employees;

-- Oracle NEXT_DAY
SELECT NEXT_DAY(hire_date, 'MONDAY') FROM employees;
-- IvorySQL (Oracle mode): Supported
```

### Numeric Functions

```sql
-- Oracle ROUND / TRUNC
SELECT ROUND(123.456, 2), TRUNC(123.456, 2);
-- IvorySQL: Same syntax

-- Oracle CEIL / FLOOR
SELECT CEIL(123.1), FLOOR(123.9);
-- IvorySQL: Same syntax

-- Oracle MOD
SELECT MOD(10, 3);
-- IvorySQL: MOD is supported (the % operator is also supported)
```

## Stored Procedure Migration

### PL/SQL to PL/iSQL

IvorySQL provides the PL/iSQL procedural language, which is compatible with Oracle PL/SQL syntax.

```sql
-- Oracle PL/SQL
CREATE OR REPLACE PROCEDURE get_emp_info(
    p_empno IN NUMBER,
    p_ename OUT VARCHAR2
) AS
BEGIN
    SELECT ename INTO p_ename
    FROM employees
    WHERE empno = p_empno;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_ename := NULL;
END;
/

-- IvorySQL PL/iSQL (Oracle compatibility mode)
CREATE OR REPLACE PROCEDURE get_emp_info(
    p_empno IN NUMBER,
    p_ename OUT VARCHAR2
) AS
BEGIN
    SELECT ename INTO p_ename
    FROM employees
    WHERE empno = p_empno;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_ename := NULL;
END;
/
```

### PL/pgSQL Equivalent

```sql
-- IvorySQL PL/pgSQL syntax
CREATE OR REPLACE PROCEDURE get_emp_info(
    p_empno integer,
    OUT p_ename varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
    SELECT ename INTO p_ename
    FROM employees
    WHERE empno = p_empno;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_ename := NULL;
END;
$$;
```

### Function Migration

```sql
-- Oracle function
CREATE OR REPLACE FUNCTION get_salary(
    p_empno IN NUMBER
) RETURN NUMBER IS
    v_salary NUMBER;
BEGIN
    SELECT sal INTO v_salary
    FROM employees
    WHERE empno = p_empno;
    RETURN v_salary;
END;
/

-- IvorySQL PL/iSQL
CREATE OR REPLACE FUNCTION get_salary(
    p_empno IN NUMBER
) RETURN NUMBER IS
    v_salary NUMBER;
BEGIN
    SELECT sal INTO v_salary
    FROM employees
    WHERE empno = p_empno;
    RETURN v_salary;
END;
/
```

### Package Migration

```sql
-- Oracle Package
CREATE OR REPLACE PACKAGE emp_pkg IS
    PROCEDURE update_salary(p_empno NUMBER, p_new_sal NUMBER);
    FUNCTION get_name(p_empno NUMBER) RETURN VARCHAR2;
END emp_pkg;
/

CREATE OR REPLACE PACKAGE BODY emp_pkg IS
    PROCEDURE update_salary(p_empno NUMBER, p_new_sal NUMBER) IS
    BEGIN
        UPDATE employees SET sal = p_new_sal WHERE empno = p_empno;
        COMMIT;
    END;

    FUNCTION get_name(p_empno NUMBER) RETURN VARCHAR2 IS
        v_name VARCHAR2(100);
    BEGIN
        SELECT ename INTO v_name FROM employees WHERE empno = p_empno;
        RETURN v_name;
    END;
END emp_pkg;
/

-- IvorySQL: Partial package support (simulated through a schema)
-- Convert package procedures into standalone procedures and package functions into standalone functions
CREATE OR REPLACE PROCEDURE emp_pkg_update_salary(p_empno NUMBER, p_new_sal NUMBER) AS
BEGIN
    UPDATE employees SET sal = p_new_sal WHERE empno = p_empno;
    COMMIT;
END;
/

CREATE OR REPLACE FUNCTION emp_pkg_get_name(p_empno NUMBER) RETURN VARCHAR2 IS
    v_name VARCHAR2(100);
BEGIN
    SELECT ename INTO v_name FROM employees WHERE empno = p_empno;
    RETURN v_name;
END;
/
```

### Trigger Migration

```sql
-- Oracle trigger
CREATE OR REPLACE TRIGGER trg_audit_emp
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        INSERT INTO emp_audit (action, empno, ename, action_date)
        VALUES ('INSERT', :NEW.empno, :NEW.ename, SYSDATE);
    ELSIF UPDATING THEN
        INSERT INTO emp_audit (action, empno, ename, action_date)
        VALUES ('UPDATE', :NEW.empno, :NEW.ename, SYSDATE);
    ELSIF DELETING THEN
        INSERT INTO emp_audit (action, empno, ename, action_date)
        VALUES ('DELETE', :OLD.empno, :OLD.ename, SYSDATE);
    END IF;
END;
/

-- IvorySQL trigger
CREATE OR REPLACE FUNCTION trg_audit_emp_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO emp_audit (action, empno, ename, action_date)
        VALUES ('INSERT', NEW.empno, NEW.ename, now());
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO emp_audit (action, empno, ename, action_date)
        VALUES ('UPDATE', NEW.empno, NEW.ename, now());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO emp_audit (action, empno, ename, action_date)
        VALUES ('DELETE', OLD.empno, OLD.ename, now());
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_emp
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW
EXECUTE FUNCTION trg_audit_emp_func();
```

### Exception Handling

```sql
-- Oracle exceptions
EXCEPTION
    WHEN NO_DATA_FOUND THEN ...
    WHEN TOO_MANY_ROWS THEN ...
    WHEN DUP_VAL_ON_INDEX THEN ...
    WHEN OTHERS THEN ...

-- IvorySQL PL/pgSQL equivalents
EXCEPTION
    WHEN no_data_found THEN ...          -- IvorySQL Oracle compatibility
    WHEN too_many_rows THEN ...          -- PG standard
    WHEN unique_violation THEN ...       -- PG: Corresponds to DUP_VAL_ON_INDEX
    WHEN OTHERS THEN ...

-- Error code mapping
-- ORA-00001 -> 23505 (unique_violation)
-- ORA-01403 -> 02000 (no_data_found)
-- ORA-01422 -> 21000 (too_many_rows)
-- ORA-02291 -> 23503 (foreign_key_violation)
-- ORA-02292 -> 23503 (foreign_key_violation)
```

## Synonym Migration

```sql
-- Oracle synonyms
CREATE SYNONYM emp FOR hr.employees;
CREATE PUBLIC SYNONYM dept FOR hr.departments;

-- IvorySQL (with ivorysql.enable_oracle_synonym = true)
CREATE SYNONYM emp FOR hr.employees;
CREATE PUBLIC SYNONYM dept FOR hr.departments;

-- Alternatively, use PG views
CREATE VIEW emp AS SELECT * FROM hr.employees;
```

## Sequence Migration

```sql
-- Oracle sequence
CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1 NOCACHE;
SELECT emp_seq.NEXTVAL FROM DUAL;
SELECT emp_seq.CURRVAL FROM DUAL;

-- IvorySQL
CREATE SEQUENCE emp_seq START WITH 1 INCREMENT BY 1 NO CACHE;
SELECT nextval('emp_seq');
SELECT currval('emp_seq');
```

## Common Migration Issues

### 1. Empty Strings vs. NULL

```sql
-- Oracle: '' is equivalent to NULL
-- PG/IvorySQL: '' is not equivalent to NULL

-- Solution
SET ivorysql.enable_emptystring_to_NULL = true;
```

### 2. Case Sensitivity

```sql
-- Oracle: Identifiers are uppercase by default
-- PG/IvorySQL: Identifiers are lowercase by default

-- Solutions
-- 1. Convert identifiers uniformly to lowercase when exporting from Oracle
-- 2. Use double quotes in IvorySQL to preserve case
-- 3. Enable ivorysql.enable_case_preserve
```

### 3. Implicit Type Conversion

```sql
-- Oracle: Extensive implicit type conversion
-- PG/IvorySQL: Strict type checking

-- Solution: Use explicit type conversion
-- Oracle: WHERE varchar_col = 123
-- IvorySQL: WHERE varchar_col = '123' or WHERE varchar_col::integer = 123
```

### 4. Transaction Behavior

```sql
-- Oracle: DDL is committed automatically
-- IvorySQL: DDL is transactional

-- Note: DDL can be rolled back in IvorySQL
BEGIN;
CREATE TABLE test (id int);
ROLLBACK;  -- The table does not exist
```

