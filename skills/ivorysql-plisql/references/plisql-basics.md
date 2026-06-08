---
title: PL/iSQL Basics
description: Anonymous blocks / variables / control structures / cursors / exceptions
tags: ivorysql, plisql, anonymous-block, variables, control-structure, cursor, exception, procedure, function, package
---

# PL/iSQL Basics

PL/iSQL is IvorySQL's Oracle PL/SQL compatible procedural language provided in Oracle compatibility mode. It supports core features including anonymous blocks, variable declarations, control structures, cursors, exception handling, stored procedures, functions, and packages.

## Anonymous Block Syntax

An anonymous block is a one-time executed PL/iSQL code block that does not require persistent storage.

### Basic Structure

```sql
[DECLARE
    -- Declaration section (optional)
]
BEGIN
    -- Execution section (required)
[EXCEPTION
    -- Exception handling section (optional)
]
END;
/
```

### Examples

```sql
-- Simplest anonymous block
BEGIN
    NULL;
END;
/

-- Anonymous block with declarations
DECLARE
    v_message VARCHAR2(100) := 'Hello, IvorySQL!';
BEGIN
    DBMS_OUTPUT.PUT_LINE(v_message);
END;
/

-- Anonymous block with exception handling
DECLARE
    v_result NUMBER;
BEGIN
    SELECT salary INTO v_result FROM employees WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE('Salary: ' || v_result);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Employee not found');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Multiple employees found');
END;
/
```

### Label Naming

```sql
<<main_block>>
DECLARE
    v_count NUMBER := 0;
BEGIN
    <<inner_block>>
    DECLARE
        v_count NUMBER := 1;
    BEGIN
        -- Reference outer variable
        DBMS_OUTPUT.PUT_LINE('Outer: ' || main_block.v_count);
        -- Reference inner variable
        DBMS_OUTPUT.PUT_LINE('Inner: ' || v_count);
    END;
END;
/
```

## Variable Declarations

### Basic Type Declarations

```sql
DECLARE
    -- Numeric types
    v_int      NUMBER := 42;
    v_decimal  NUMBER(10,2) := 1234.56;
    v_float    BINARY_FLOAT := 3.14f;
    v_double   BINARY_DOUBLE := 3.14159265358979;

    -- Character types
    v_varchar  VARCHAR2(100) := 'Hello';
    v_char     CHAR(10) := 'Fixed';
    v_clob     CLOB := 'Long text...';

    -- Date types
    v_date     DATE := SYSDATE;
    v_ts       TIMESTAMP := SYSTIMESTAMP;
    v_tstz     TIMESTAMP WITH TIME ZONE := SYSTIMESTAMP;

    -- Boolean type
    v_flag     BOOLEAN := TRUE;

    -- Others
    v_raw      RAW(16) := SYS_GUID();
BEGIN
    NULL;
END;
/
```

### %TYPE Anchored Declarations

Use `%TYPE` to keep variable type consistent with a table column's type:

```sql
DECLARE
    v_name     employees.name%TYPE;
    v_salary   employees.salary%TYPE;
    v_dept_id  employees.dept_id%TYPE;
BEGIN
    SELECT name, salary, dept_id
    INTO v_name, v_salary, v_dept_id
    FROM employees WHERE id = 1;

    DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_salary);
END;
/
```

### %ROWTYPE Row Type Declarations

Use `%ROWTYPE` to declare a record type matching an entire row's structure:

```sql
DECLARE
    v_emp employees%ROWTYPE;
BEGIN
    SELECT * INTO v_emp FROM employees WHERE id = 1;

    DBMS_OUTPUT.PUT_LINE('Name: ' || v_emp.name);
    DBMS_OUTPUT.PUT_LINE('Salary: ' || v_emp.salary);
    DBMS_OUTPUT.PUT_LINE('Dept: ' || v_emp.dept_id);
END;
/
```

### Constant Declarations

```sql
DECLARE
    c_max_salary   CONSTANT NUMBER := 100000;
    c_company_name CONSTANT VARCHAR2(50) := 'IvorySQL Inc.';
    c_pi           CONSTANT NUMBER := 3.14159265;
BEGIN
    DBMS_OUTPUT.PUT_LINE('Company: ' || c_company_name);
    DBMS_OUTPUT.PUT_LINE('Max: ' || c_max_salary);
END;
/
```

### Custom Record Types

```sql
DECLARE
    TYPE emp_info_type IS RECORD (
        emp_id    NUMBER,
        emp_name  VARCHAR2(100),
        salary    NUMBER,
        dept_name VARCHAR2(100)
    );

    v_emp_info emp_info_type;
BEGIN
    SELECT e.id, e.name, e.salary, d.dept_name
    INTO v_emp_info
    FROM employees e
    JOIN departments d ON e.dept_id = d.id
    WHERE e.id = 1;

    DBMS_OUTPUT.PUT_LINE(v_emp_info.emp_name || ' - ' || v_emp_info.dept_name);
END;
/
```

### Collection Types

```sql
DECLARE
    -- Associative array (index table)
    TYPE name_table_type IS TABLE OF VARCHAR2(100) INDEX BY BINARY_INTEGER;
    v_names name_table_type;

    -- Nested table
    TYPE num_list_type IS TABLE OF NUMBER;
    v_nums num_list_type := num_list_type(10, 20, 30);

    -- VARRAY
    TYPE score_array_type IS VARRAY(5) OF NUMBER;
    v_scores score_array_type := score_array_type(85, 92, 78);
BEGIN
    -- Associative array assignment
    v_names(1) := 'Alice';
    v_names(2) := 'Bob';
    v_names(3) := 'Charlie';

    -- Iterate associative array
    FOR i IN 1..v_names.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('Name ' || i || ': ' || v_names(i));
    END LOOP;

    -- Iterate nested table
    FOR i IN 1..v_nums.COUNT LOOP
        DBMS_OUTPUT.PUT_LINE('Num: ' || v_nums(i));
    END LOOP;
END;
/
```

## Control Structures

### IF-THEN-ELSE

```sql
DECLARE
    v_salary NUMBER := 8000;
BEGIN
    IF v_salary > 10000 THEN
        DBMS_OUTPUT.PUT_LINE('High salary');
    ELSIF v_salary > 5000 THEN
        DBMS_OUTPUT.PUT_LINE('Medium salary');
    ELSE
        DBMS_OUTPUT.PUT_LINE('Low salary');
    END IF;
END;
/
```

### CASE Statement

```sql
DECLARE
    v_dept VARCHAR2(10) := 'IT';
    v_bonus NUMBER;
BEGIN
    -- Simple CASE
    CASE v_dept
        WHEN 'IT' THEN v_bonus := 1000;
        WHEN 'HR' THEN v_bonus := 800;
        WHEN 'SALES' THEN v_bonus := 1200;
        ELSE v_bonus := 500;
    END CASE;

    DBMS_OUTPUT.PUT_LINE('Bonus: ' || v_bonus);
END;
/

-- Searched CASE
DECLARE
    v_score NUMBER := 85;
    v_grade VARCHAR2(2);
BEGIN
    CASE
        WHEN v_score >= 90 THEN v_grade := 'A';
        WHEN v_score >= 80 THEN v_grade := 'B';
        WHEN v_score >= 70 THEN v_grade := 'C';
        WHEN v_score >= 60 THEN v_grade := 'D';
        ELSE v_grade := 'F';
    END CASE;

    DBMS_OUTPUT.PUT_LINE('Grade: ' || v_grade);
END;
/
```

### LOOP (Basic Loop)

```sql
DECLARE
    v_count NUMBER := 0;
BEGIN
    LOOP
        v_count := v_count + 1;
        DBMS_OUTPUT.PUT_LINE('Count: ' || v_count);
        EXIT WHEN v_count >= 5;
    END LOOP;
END;
/
```

### WHILE LOOP

```sql
DECLARE
    v_total NUMBER := 0;
    v_count NUMBER := 1;
BEGIN
    WHILE v_count <= 10 LOOP
        v_total := v_total + v_count;
        v_count := v_count + 1;
    END LOOP;

    DBMS_OUTPUT.PUT_LINE('Sum 1-10: ' || v_total);
END;
/
```

### FOR LOOP (Numeric Loop)

```sql
BEGIN
    -- Forward loop
    FOR i IN 1..5 LOOP
        DBMS_OUTPUT.PUT_LINE('i = ' || i);
    END LOOP;

    -- Reverse loop
    FOR i IN REVERSE 1..5 LOOP
        DBMS_OUTPUT.PUT_LINE('i = ' || i);
    END LOOP;
END;
/
```

### Cursor FOR LOOP

```sql
BEGIN
    -- Implicit cursor FOR LOOP
    FOR emp_rec IN (SELECT name, salary FROM employees WHERE dept_id = 10) LOOP
        DBMS_OUTPUT.PUT_LINE(emp_rec.name || ': ' || emp_rec.salary);
    END LOOP;
END;
/
```

### CONTINUE Statement

```sql
BEGIN
    FOR i IN 1..10 LOOP
        IF MOD(i, 2) = 0 THEN
            CONTINUE;  -- Skip even numbers
        END IF;
        DBMS_OUTPUT.PUT_LINE('Odd: ' || i);
    END LOOP;
END;
/
```

### GOTO Statement

```sql
DECLARE
    v_count NUMBER := 0;
BEGIN
    LOOP
        v_count := v_count + 1;
        IF v_count > 3 THEN
            GOTO end_loop;
        END IF;
        DBMS_OUTPUT.PUT_LINE('Count: ' || v_count);
    END LOOP;

    <<end_loop>>
    DBMS_OUTPUT.PUT_LINE('Done');
END;
/
```

## Cursors

### Explicit Cursors

```sql
DECLARE
    CURSOR emp_cur IS
        SELECT id, name, salary FROM employees WHERE dept_id = 10 ORDER BY name;

    v_id     NUMBER;
    v_name   VARCHAR2(100);
    v_salary NUMBER;
BEGIN
    OPEN emp_cur;

    LOOP
        FETCH emp_cur INTO v_id, v_name, v_salary;
        EXIT WHEN emp_cur%NOTFOUND;

        DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_salary);
    END LOOP;

    CLOSE emp_cur;
END;
/
```

### Cursor FOR LOOP (Simplified)

```sql
DECLARE
    CURSOR emp_cur IS
        SELECT id, name, salary FROM employees ORDER BY name;
BEGIN
    FOR emp_rec IN emp_cur LOOP
        DBMS_OUTPUT.PUT_LINE(emp_rec.name || ': ' || emp_rec.salary);
    END LOOP;
    -- Cursor automatically opened and closed
END;
/
```

### Parameterized Cursors

```sql
DECLARE
    CURSOR emp_cur(p_dept_id NUMBER, p_min_salary NUMBER) IS
        SELECT name, salary FROM employees
        WHERE dept_id = p_dept_id AND salary >= p_min_salary;
BEGIN
    FOR emp_rec IN emp_cur(10, 5000) LOOP
        DBMS_OUTPUT.PUT_LINE(emp_rec.name || ': ' || emp_rec.salary);
    END LOOP;
END;
/
```

### Implicit Cursors

```sql
BEGIN
    -- Implicit cursor automatically created by DML statements
    UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 10;

    -- Use SQL% cursor attributes
    DBMS_OUTPUT.PUT_LINE('Updated rows: ' || SQL%ROWCOUNT);

    IF SQL%FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Update successful');
    END IF;
END;
/
```

### Cursor Attributes

| Attribute | Explicit Cursor | Implicit Cursor | Description |
|------|---------|---------|------|
| `%FOUND` | `cursor_name%FOUND` | `SQL%FOUND` | Whether last FETCH returned a row |
| `%NOTFOUND` | `cursor_name%NOTFOUND` | `SQL%NOTFOUND` | Whether last FETCH did not return a row |
| `%ISOPEN` | `cursor_name%ISOPEN` | `SQL%ISOPEN` | Whether cursor is open (implicit cursor always FALSE) |
| `%ROWCOUNT` | `cursor_name%ROWCOUNT` | `SQL%ROWCOUNT` | Number of rows fetched/affected so far |

### REF CURSOR (Dynamic Cursor)

```sql
DECLARE
    TYPE emp_cursor_type IS REF CURSOR RETURN employees%ROWTYPE;
    v_emp_cur emp_cursor_type;
    v_emp     employees%ROWTYPE;
BEGIN
    OPEN v_emp_cur FOR SELECT * FROM employees WHERE dept_id = 10;

    LOOP
        FETCH v_emp_cur INTO v_emp;
        EXIT WHEN v_emp_cur%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(v_emp.name || ': ' || v_emp.salary);
    END LOOP;

    CLOSE v_emp_cur;
END;
/

-- Weakly typed REF CURSOR (no RETURN clause)
DECLARE
    TYPE generic_cursor_type IS REF CURSOR;
    v_cur generic_cursor_type;
    v_name VARCHAR2(100);
    v_val  NUMBER;
BEGIN
    OPEN v_cur FOR SELECT name, salary FROM employees WHERE id = 1;
    FETCH v_cur INTO v_name, v_val;
    DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_val);
    CLOSE v_cur;
END;
/
```

## Exception Handling

### Predefined Exceptions

| Exception Name | SQLCODE | Description |
|--------|---------|------|
| `NO_DATA_FOUND` | +100 | SELECT INTO returned no rows |
| `TOO_MANY_ROWS` | -1422 | SELECT INTO returned multiple rows |
| `ZERO_DIVIDE` | -1476 | Division by zero |
| `DUP_VAL_ON_INDEX` | -1 | Unique index conflict |
| `INVALID_CURSOR` | -1001 | Invalid cursor operation |
| `INVALID_NUMBER` | -1722 | Numeric conversion failed |
| `VALUE_ERROR` | -6502 | Assignment or conversion error |
| `STORAGE_ERROR` | -6503 | Insufficient memory |
| `PROGRAM_ERROR` | -6501 | Internal PL/SQL error |
| `ROWTYPE_MISMATCH` | -6504 | Cursor variable type mismatch |

```sql
DECLARE
    v_name VARCHAR2(100);
BEGIN
    SELECT name INTO v_name FROM employees WHERE id = 99999;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Employee not found');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Multiple employees found');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/
```

### Custom Exceptions

```sql
DECLARE
    -- Declare custom exceptions
    e_salary_too_low EXCEPTION;
    e_invalid_dept   EXCEPTION;

    -- Associate error codes (optional)
    PRAGMA EXCEPTION_INIT(e_salary_too_low, -20001);
    PRAGMA EXCEPTION_INIT(e_invalid_dept, -20002);

    v_salary NUMBER;
    v_dept   NUMBER := 99;
BEGIN
    SELECT salary INTO v_salary FROM employees WHERE id = 1;

    IF v_salary < 3000 THEN
        RAISE e_salary_too_low;
    END IF;

    IF v_dept NOT IN (10, 20, 30) THEN
        RAISE e_invalid_dept;
    END IF;

EXCEPTION
    WHEN e_salary_too_low THEN
        DBMS_OUTPUT.PUT_LINE('Salary is below minimum threshold');
    WHEN e_invalid_dept THEN
        DBMS_OUTPUT.PUT_LINE('Invalid department: ' || v_dept);
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Unexpected error: ' || SQLERRM);
END;
/
```

### RAISE_APPLICATION_ERROR

```sql
DECLARE
    v_salary NUMBER;
BEGIN
    SELECT salary INTO v_salary FROM employees WHERE id = 1;

    IF v_salary < 3000 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Salary ' || v_salary || ' is below minimum 3000');
    END IF;

    IF v_salary > 100000 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Salary exceeds maximum allowed');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error Code: ' || SQLCODE);
        DBMS_OUTPUT.PUT_LINE('Error Msg: ' || SQLERRM);
END;
/
```

### SQLERRM and SQLCODE

```sql
DECLARE
    v_error_code NUMBER;
    v_error_msg  VARCHAR2(4000);
BEGIN
    -- Intentionally trigger error
    INSERT INTO employees (id) VALUES (NULL);
EXCEPTION
    WHEN OTHERS THEN
        v_error_code := SQLCODE;
        v_error_msg  := SQLERRM;

        DBMS_OUTPUT.PUT_LINE('Code: ' || v_error_code);
        DBMS_OUTPUT.PUT_LINE('Message: ' || v_error_msg);

        -- Can also get message for specific error code
        DBMS_OUTPUT.PUT_LINE('Msg for -1: ' || SQLERRM(-1));
END;
/
```

## Stored Procedures

### Create Stored Procedure

```sql
CREATE OR REPLACE PROCEDURE update_salary(
    p_emp_id  IN NUMBER,
    p_raise   IN NUMBER,
    p_status  OUT VARCHAR2
) AS
    v_current_salary NUMBER;
    v_new_salary     NUMBER;
BEGIN
    SELECT salary INTO v_current_salary
    FROM employees WHERE id = p_emp_id;

    v_new_salary := v_current_salary + p_raise;

    UPDATE employees SET salary = v_new_salary WHERE id = p_emp_id;

    p_status := 'SUCCESS: Salary updated from ' || v_current_salary || ' to ' || v_new_salary;

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_status := 'ERROR: Employee not found';
    WHEN OTHERS THEN
        p_status := 'ERROR: ' || SQLERRM;
        ROLLBACK;
END;
/
```

### Call Stored Procedure

```sql
-- Using CALL
CALL update_salary(1001, 500, 'dummy');

-- Using EXEC (inside psql)
-- EXEC update_salary(1001, 500, :status);

-- Called within anonymous block
DECLARE
    v_status VARCHAR2(200);
BEGIN
    update_salary(1001, 500, v_status);
    DBMS_OUTPUT.PUT_LINE(v_status);
END;
/
```

### Parameter Modes

| Mode | Description | Default | Can Assign |
|------|------|--------|---------|
| `IN` | Input parameter (default) | Yes | No |
| `OUT` | Output parameter | No | Yes |
| `IN OUT` | Bidirectional parameter | No | Yes |

## Functions

### Create Function

```sql
CREATE OR REPLACE FUNCTION get_annual_salary(
    p_emp_id IN NUMBER
) RETURN NUMBER AS
    v_salary NUMBER;
    v_commission NUMBER;
BEGIN
    SELECT salary, NVL(commission, 0)
    INTO v_salary, v_commission
    FROM employees WHERE id = p_emp_id;

    RETURN (v_salary * 12) + v_commission;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END;
/
```

### Call Function

```sql
-- Called in SQL
SELECT get_annual_salary(1001) FROM DUAL;

-- Called in PL/iSQL
DECLARE
    v_annual NUMBER;
BEGIN
    v_annual := get_annual_salary(1001);
    DBMS_OUTPUT.PUT_LINE('Annual: ' || v_annual);
END;
/
```

## Package

### Create Package Specification

```sql
CREATE OR REPLACE PACKAGE math_utils AS
    -- Constants
    c_pi CONSTANT NUMBER := 3.14159265358979;

    -- Functions
    FUNCTION circle_area(p_radius IN NUMBER) RETURN NUMBER;
    FUNCTION circle_circumference(p_radius IN NUMBER) RETURN NUMBER;
    FUNCTION factorial(p_n IN NUMBER) RETURN NUMBER;

    -- Procedures
    PROCEDURE print_fibonacci(p_count IN NUMBER);
END math_utils;
/
```

### Create Package Body

```sql
CREATE OR REPLACE PACKAGE BODY math_utils AS

    FUNCTION circle_area(p_radius IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN c_pi * p_radius * p_radius;
    END;

    FUNCTION circle_circumference(p_radius IN NUMBER) RETURN NUMBER IS
    BEGIN
        RETURN 2 * c_pi * p_radius;
    END;

    FUNCTION factorial(p_n IN NUMBER) RETURN NUMBER IS
    BEGIN
        IF p_n <= 1 THEN
            RETURN 1;
        ELSE
            RETURN p_n * factorial(p_n - 1);
        END IF;
    END;

    PROCEDURE print_fibonacci(p_count IN NUMBER) IS
        v_a NUMBER := 0;
        v_b NUMBER := 1;
        v_temp NUMBER;
    BEGIN
        FOR i IN 1..p_count LOOP
            DBMS_OUTPUT.PUT_LINE('F(' || i || ') = ' || v_a);
            v_temp := v_a + v_b;
            v_a := v_b;
            v_b := v_temp;
        END LOOP;
    END;

END math_utils;
/
```

### Using Packages

```sql
-- Call package function
SELECT math_utils.circle_area(5) FROM DUAL;
SELECT math_utils.factorial(10) FROM DUAL;

-- Use in PL/iSQL
DECLARE
    v_area NUMBER;
BEGIN
    v_area := math_utils.circle_area(10);
    DBMS_OUTPUT.PUT_LINE('Area: ' || v_area);
    DBMS_OUTPUT.PUT_LINE('PI: ' || math_utils.c_pi);

    math_utils.print_fibonacci(10);
END;
/
```

### Package Initialization Block

```sql
CREATE OR REPLACE PACKAGE app_config AS
    g_app_name    VARCHAR2(100);
    g_debug_mode  BOOLEAN;
    PROCEDURE reload_config;
END app_config;
/

CREATE OR REPLACE PACKAGE BODY app_config AS

    -- Initialization block (executed when package is first used)
    BEGIN
        SELECT value INTO g_app_name FROM config WHERE key = 'app_name';
        g_debug_mode := FALSE;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            g_app_name := 'DefaultApp';
            g_debug_mode := FALSE;
    END;

    PROCEDURE reload_config IS
    BEGIN
        SELECT value INTO g_app_name FROM config WHERE key = 'app_name';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            g_app_name := 'DefaultApp';
    END;

END app_config;
/
```
