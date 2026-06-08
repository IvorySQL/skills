---
name: IvorySQL PL/iSQL Programming
name_for_command: ivorysql-plisql
description: |
  Complete IvorySQL PL/iSQL procedural language reference: PL/iSQL basic syntax, data types, control structures,
  cursors, error handling, stored procedures, functions, packages (Package), triggers, %TYPE/%ROWTYPE,
  OUT parameters, nested subprograms. Compatible with Oracle PL/SQL syntax.
---

# IvorySQL PL/iSQL Programming

## Workflow

Trigger this skill when encountering the following issues:
- Stored procedure/function writing
- PL/SQL → PL/iSQL conversion
- Package development
- Trigger creation
- Cursor and error handling

**Sub-skill routing**:
- SQL syntax → `ivorysql-sql`
- Oracle compatibility features → `ivorysql-oracle-compat`
- Migration issues → `ivorysql-migration`

PL/iSQL is IvorySQL's dedicated procedural language for Oracle PL/SQL compatibility, supporting Oracle-style stored procedures, functions, packages, triggers, and other programming objects.

## PL/iSQL vs PL/pgSQL

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Syntax style | Oracle PL/SQL | PostgreSQL |
| Anonymous block | `DECLARE ... BEGIN ... END;` | `DO $$ ... $$` |
| Variable declaration | `v_name VARCHAR2(100);` | `v_name VARCHAR(100);` |
| Assignment | `:=` or `SELECT INTO` | `:=` or `SELECT INTO` |
| Conditional statements | IF/ELSIF/ELSE/END IF | IF/ELSIF/ELSE/END IF |
| Loops | LOOP/WHILE/FOR | LOOP/WHILE/FOR |
| Cursors | Oracle style | PG style |
| Exceptions | EXCEPTION WHEN ... | EXCEPTION WHEN ... |
| Package | Supported | Not supported |
| %TYPE | Supported | Supported |
| %ROWTYPE | Supported | Supported |
| OUT parameters | Supported | Supported |

> For details: [plisql-basics](references/plisql-basics.md)

## Anonymous Blocks

```sql
-- PL/iSQL anonymous block (Oracle style)
DECLARE
    v_name VARCHAR2(100);
    v_salary NUMBER(10,2);
BEGIN
    SELECT name, salary INTO v_name, v_salary
    FROM employees WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE('Name: ' || v_name || ', Salary: ' || v_salary);
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('No data found');
END;
/

-- PG style anonymous block
DO $$
DECLARE
    v_name VARCHAR(100);
BEGIN
    SELECT name INTO v_name FROM employees WHERE id = 1;
    RAISE NOTICE 'Name: %', v_name;
END;
$$;
```

## Stored Procedures

```sql
-- Oracle-style stored procedure
CREATE OR REPLACE PROCEDURE update_salary(
    p_emp_id IN NUMBER,
    p_new_salary IN NUMBER
) IS
BEGIN
    UPDATE employees SET salary = p_new_salary WHERE id = p_emp_id;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END update_salary;
/

-- Call stored procedure
CALL update_salary(1, 10000);
-- or
EXEC update_salary(1, 10000);
```

## Functions

```sql
-- Oracle-style function
CREATE OR REPLACE FUNCTION get_emp_name(
    p_emp_id IN NUMBER
) RETURN VARCHAR2 IS
    v_name VARCHAR2(100);
BEGIN
    SELECT name INTO v_name FROM employees WHERE id = p_emp_id;
    RETURN v_name;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END get_emp_name;
/

-- Call function
SELECT get_emp_name(1) FROM DUAL;
```

## Package

```sql
-- Package specification
CREATE OR REPLACE PACKAGE emp_mgmt AS
    FUNCTION get_name(p_id NUMBER) RETURN VARCHAR2;
    PROCEDURE update_salary(p_id NUMBER, p_salary NUMBER);
END emp_mgmt;

-- Package body
CREATE OR REPLACE PACKAGE BODY emp_mgmt AS
    FUNCTION get_name(p_id NUMBER) RETURN VARCHAR2 IS
        v_name VARCHAR2(100);
    BEGIN
        SELECT name INTO v_name FROM employees WHERE id = p_id;
        RETURN v_name;
    END get_name;

    PROCEDURE update_salary(p_id NUMBER, p_salary NUMBER) IS
    BEGIN
        UPDATE employees SET salary = p_salary WHERE id = p_id;
    END update_salary;
END emp_mgmt;
/

-- Call functions/procedures in package
SELECT emp_mgmt.get_name(1) FROM DUAL;
CALL emp_mgmt.update_salary(1, 10000);
```

## %TYPE and %ROWTYPE

```sql
-- %TYPE: anchor column type
DECLARE
    v_name employees.name%TYPE;
    v_salary employees.salary%TYPE;
BEGIN
    SELECT name, salary INTO v_name, v_salary FROM employees WHERE id = 1;
END;
/

-- %ROWTYPE: anchor row type
DECLARE
    v_emp employees%ROWTYPE;
BEGIN
    SELECT * INTO v_emp FROM employees WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE('Name: ' || v_emp.name);
END;
/
```

## OUT / IN OUT Parameters

```sql
-- Procedure with OUT parameters
CREATE OR REPLACE PROCEDURE get_emp_info(
    p_id IN NUMBER,
    p_name OUT VARCHAR2,
    p_salary OUT NUMBER
) IS
BEGIN
    SELECT name, salary INTO p_name, p_salary
    FROM employees WHERE id = p_id;
END get_emp_info;
/

-- Call procedure with OUT parameters
DECLARE
    v_name VARCHAR2(100);
    v_salary NUMBER;
BEGIN
    get_emp_info(1, v_name, v_salary);
    DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_salary);
END;
/
```

## Nested Subprograms

```sql
CREATE OR REPLACE PROCEDURE process_order(p_order_id NUMBER) IS
    -- Nested function
    FUNCTION calculate_total(p_id NUMBER) RETURN NUMBER IS
        v_total NUMBER;
    BEGIN
        SELECT SUM(price * quantity) INTO v_total
        FROM order_items WHERE order_id = p_id;
        RETURN v_total;
    END calculate_total;

    -- Nested procedure
    PROCEDURE update_order_total(p_id NUMBER, p_total NUMBER) IS
    BEGIN
        UPDATE orders SET total_amount = p_total WHERE id = p_id;
    END update_order_total;
BEGIN
    update_order_total(p_order_id, calculate_total(p_order_id));
END process_order;
/
```

## Reference Documents

- [PL/iSQL Basics](references/plisql-basics.md) — Complete syntax reference, control structures, cursors, error handling
- [PL/iSQL Advanced](references/plisql-advanced.md) — Packages, triggers, dynamic SQL, batch operations
