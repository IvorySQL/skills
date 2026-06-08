---
title: IvorySQL PL/iSQL Advanced Features
description: Package, triggers, dynamic SQL, bulk operations, DBMS_OUTPUT
tags: ivorysql, plisql, advanced, package, trigger, dynamic-sql, bulk
---

# IvorySQL PL/iSQL Advanced Features

## Package

### Package Specification

```sql
CREATE OR REPLACE PACKAGE emp_pkg AS
    -- Public variables
    c_default_bonus CONSTANT NUMBER := 0.1;

    -- Public types
    TYPE emp_list IS TABLE OF VARCHAR2(100) INDEX BY BINARY_INTEGER;

    -- Public cursor specification
    CURSOR emp_cursor RETURN employees%ROWTYPE;

    -- Public function declarations
    FUNCTION get_name(p_id NUMBER) RETURN VARCHAR2;
    FUNCTION get_salary(p_id NUMBER) RETURN NUMBER;

    -- Public procedure declarations
    PROCEDURE update_salary(p_id NUMBER, p_new_salary NUMBER);
    PROCEDURE delete_employee(p_id NUMBER);

    -- Overloaded procedures
    PROCEDURE hire(p_name VARCHAR2, p_salary NUMBER);
    PROCEDURE hire(p_name VARCHAR2, p_salary NUMBER, p_dept VARCHAR2);
END emp_pkg;
/
```

### Package Body

```sql
CREATE OR REPLACE PACKAGE BODY emp_pkg AS
    -- Private variables
    v_audit_enabled BOOLEAN := TRUE;

    -- Cursor implementation
    CURSOR emp_cursor RETURN employees%ROWTYPE IS
        SELECT * FROM employees ORDER BY id;

    -- Function implementations
    FUNCTION get_name(p_id NUMBER) RETURN VARCHAR2 IS
        v_name VARCHAR2(100);
    BEGIN
        SELECT name INTO v_name FROM employees WHERE id = p_id;
        RETURN v_name;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN RETURN NULL;
    END get_name;

    FUNCTION get_salary(p_id NUMBER) RETURN NUMBER IS
        v_salary NUMBER;
    BEGIN
        SELECT salary INTO v_salary FROM employees WHERE id = p_id;
        RETURN v_salary;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN RETURN NULL;
    END get_salary;

    -- Procedure implementations
    PROCEDURE update_salary(p_id NUMBER, p_new_salary NUMBER) IS
    BEGIN
        UPDATE employees SET salary = p_new_salary WHERE id = p_id;
        IF v_audit_enabled THEN
            INSERT INTO salary_audit(emp_id, old_salary, new_salary, change_date)
            SELECT id, salary, p_new_salary, SYSDATE
            FROM employees WHERE id = p_id;
        END IF;
    END update_salary;

    PROCEDURE delete_employee(p_id NUMBER) IS
    BEGIN
        DELETE FROM employees WHERE id = p_id;
    END delete_employee;

    -- Overloaded procedure implementations
    PROCEDURE hire(p_name VARCHAR2, p_salary NUMBER) IS
    BEGIN
        hire(p_name, p_salary, 'Unassigned');
    END hire;

    PROCEDURE hire(p_name VARCHAR2, p_salary NUMBER, p_dept VARCHAR2) IS
    BEGIN
        INSERT INTO employees (name, salary, department, hire_date)
        VALUES (p_name, p_salary, p_dept, SYSDATE);
    END hire;

BEGIN
    -- Initialization code (executed when package is first used)
    NULL;
END emp_pkg;
/
```

### Using Packages

```sql
-- Call package function
SELECT emp_pkg.get_name(1) FROM DUAL;

-- Call package procedure
CALL emp_pkg.update_salary(1, 12000);
CALL emp_pkg.hire('New Employee', 8000);
CALL emp_pkg.hire('New Employee', 8000, 'IT');

-- Use package constant
SELECT emp_pkg.c_default_bonus FROM DUAL;
```

## Triggers

```sql
-- DML Trigger
CREATE OR REPLACE TRIGGER trg_audit_salary
BEFORE UPDATE OF salary ON employees
FOR EACH ROW
BEGIN
    IF :OLD.salary != :NEW.salary THEN
        INSERT INTO salary_audit(emp_id, old_salary, new_salary, change_date)
        VALUES (:OLD.id, :OLD.salary, :NEW.salary, SYSDATE);
    END IF;
END;
/

-- Statement-level trigger
CREATE OR REPLACE TRIGGER trg_log_delete
AFTER DELETE ON employees
BEGIN
    INSERT INTO operation_log(operation, op_time) VALUES ('DELETE', SYSDATE);
END;
/

-- INSTEAD OF trigger (for views)
CREATE OR REPLACE TRIGGER trg_view_insert
INSTEAD OF INSERT ON emp_dept_view
FOR EACH ROW
BEGIN
    INSERT INTO employees(id, name, dept_id) VALUES (:NEW.id, :NEW.name, :NEW.dept_id);
END;
/
```

## DBMS_OUTPUT

```sql
-- Enable output
-- Execute in psql: \set ECHO_HIDDEN on

-- Basic output
BEGIN
    DBMS_OUTPUT.PUT_LINE('Hello from PL/iSQL');
    DBMS_OUTPUT.PUT('Output without newline');
    DBMS_OUTPUT.NEW_LINE;  -- Newline
END;
/

-- Debug output
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM employees;
    DBMS_OUTPUT.PUT_LINE('Total employees: ' || v_count);
END;
/
```

## Bulk Operations

```sql
-- FORALL bulk DML
DECLARE
    TYPE id_array IS TABLE OF NUMBER INDEX BY BINARY_INTEGER;
    TYPE salary_array IS TABLE OF NUMBER INDEX BY BINARY_INTEGER;
    v_ids id_array;
    v_salaries salary_array;
BEGIN
    -- Populate arrays
    FOR i IN 1..100 LOOP
        v_ids(i) := i;
        v_salaries(i) := 5000 + i * 100;
    END LOOP;

    -- Bulk update
    FORALL i IN 1..v_ids.COUNT
        UPDATE employees SET salary = v_salaries(i) WHERE id = v_ids(i);
END;
/

-- BULK COLLECT bulk query
DECLARE
    TYPE name_array IS TABLE OF VARCHAR2(100) INDEX BY BINARY_INTEGER;
    v_names name_array;
BEGIN
    SELECT name BULK COLLECT INTO v_names
    FROM employees WHERE department = 'IT';

    FOR i IN 1..v_names.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE(v_names(i));
    END LOOP;
END;
/
```

## Stored Procedure and Function Attributes

```sql
-- EDITIONABLE / NONEDITIONABLE (Oracle compatible)
CREATE OR REPLACE EDITIONABLE FUNCTION my_func RETURN NUMBER IS
BEGIN
    RETURN 1;
END;
/

-- Function execution permissions
CREATE OR REPLACE FUNCTION secure_func()
RETURNS NUMBER
SECURITY DEFINER  -- Execute with definer's permissions
LANGUAGE plisql
AS $$
BEGIN
    RETURN 1;
END;
$$;
```
