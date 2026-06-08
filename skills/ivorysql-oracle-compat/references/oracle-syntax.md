---
title: Oracle-Compatible Syntax
description: DUAL/(+)/CONNECT BY/MERGE/Package/Force View/Invisible Column/ROWID
tags: ivorysql, oracle, syntax, dual, outer-join, connect-by, merge, package, force-view, invisible-column, rowid
---

# Oracle-Compatible Syntax

IvorySQL supports a variety of Oracle-specific syntax features in Oracle compatibility mode, making Oracle SQL code migration smoother.

## DUAL Pseudo Table

DUAL is Oracle's built-in pseudo table, commonly used for expression calculations that do not require actual table data. IvorySQL automatically creates the DUAL table in Oracle mode.

### Basic Usage

```sql
-- Calculate expressions
SELECT 1 + 1 FROM DUAL;

-- Get system date
SELECT SYSDATE FROM DUAL;

-- Call functions
SELECT NVL(NULL, 'default') FROM DUAL;
SELECT SYS_GUID() FROM DUAL;

-- Get sequence next value
SELECT my_seq.NEXTVAL FROM DUAL;
SELECT my_seq.CURRVAL FROM DUAL;
```

### DUAL vs PG Table-less Query Comparison

```sql
-- Oracle style (using DUAL)
SELECT SYSDATE FROM DUAL;
SELECT 1 + 1 AS result FROM DUAL;

-- PG style (no FROM clause needed)
SELECT now();
SELECT 1 + 1 AS result;
```

### Notes

- DUAL table is automatically available in Oracle mode
- DUAL table does not exist in PG mode; you need to switch modes or create it
- DUAL table has only one row and one column, ensuring queries return only one row

## (+) Outer Join Syntax

Oracle uses the `(+)` operator to denote outer joins. IvorySQL supports this syntax in Oracle mode.

### Left Outer Join

```sql
-- Oracle (+) syntax: left outer join
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id = d.id(+);

-- Equivalent standard SQL syntax
SELECT e.name, d.dept_name
FROM employees e LEFT JOIN departments d ON e.dept_id = d.id;
```

### Right Outer Join

```sql
-- Oracle (+) syntax: right outer join
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id(+) = d.id;

-- Equivalent standard SQL syntax
SELECT e.name, d.dept_name
FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id;
```

### Multi-Condition Outer Join

```sql
-- Outer join with additional conditions
SELECT e.name, d.dept_name, j.job_title
FROM employees e, departments d, jobs j
WHERE e.dept_id = d.id(+)
  AND e.job_id = j.id(+)
  AND e.status = 'ACTIVE';

-- Equivalent standard SQL syntax
SELECT e.name, d.dept_name, j.job_title
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
LEFT JOIN jobs j ON e.job_id = j.id
WHERE e.status = 'ACTIVE';
```

### (+) Syntax Rules

| Rule | Description |
|------|------|
| Which side to place `(+)` | Place it on the side lacking data (the side to be padded with NULL) |
| Cannot use on both sides | `a.id(+) = b.id(+)` is invalid; it cannot represent a full outer join |
| Incompatible with `OR` | Cannot use `(+)` in `OR` conditions |
| Incompatible with `IN` | Cannot use `(+)` in `IN` subqueries |

## CONNECT BY Hierarchical Query

CONNECT BY is Oracle-specific syntax for hierarchical queries, used to handle tree-structured data.

### Basic Syntax

```sql
SELECT [LEVEL], column_list
FROM table_name
[START WITH condition]
CONNECT BY [NOCYCLE] PRIOR parent_col = child_col
[ORDER SIBLINGS BY column_list];
```

### Example: Employee Organization Structure

```sql
-- Query organization tree
SELECT LEVEL,
       LPAD(' ', (LEVEL - 1) * 2) || name AS org_chart,
       id, manager_id
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id
ORDER SIBLINGS BY name;
```

Sample output:

```
LEVEL | ORG_CHART        | ID | MANAGER_ID
------+------------------+----+-----------
  1   | CEO              |  1 | NULL
  2   |   VP Engineering |  2 | 1
  3   |     Dev Lead     |  5 | 2
  3   |     QA Lead      |  6 | 2
  2   |   VP Sales       |  3 | 1
  3   |     Sales Mgr    |  7 | 3
```

### CONNECT BY Pseudo-Columns and Operators

| Pseudo-Column/Operator | Description | Example |
|------------|------|------|
| `LEVEL` | Current hierarchy depth | `SELECT LEVEL, ...` |
| `PRIOR` | Reference parent row | `CONNECT BY PRIOR id = parent_id` |
| `CONNECT_BY_ROOT` | Returns root row value | `CONNECT_BY_ROOT name AS root_name` |
| `SYS_CONNECT_BY_PATH(col, sep)` | Returns path from root to current | `SYS_CONNECT_BY_PATH(name, '/')` |
| `CONNECT_BY_ISLEAF` | Whether it is a leaf node | `CONNECT_BY_ISLEAF` |
| `CONNECT_BY_ISCYCLE` | Whether a cycle is produced | `CONNECT BY NOCYCLE ...` |

### Advanced Examples

```sql
-- Use SYS_CONNECT_BY_PATH to display full path
SELECT id, name,
       SYS_CONNECT_BY_PATH(name, ' -> ') AS path
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Use CONNECT_BY_ROOT to get root node
SELECT id, name,
       CONNECT_BY_ROOT name AS top_manager
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Use NOCYCLE to prevent circular references
SELECT id, name, LEVEL,
       CONNECT_BY_ISCYCLE AS has_cycle
FROM employees
START WITH manager_id IS NULL
CONNECT BY NOCYCLE PRIOR id = manager_id;

-- Use CONNECT_BY_ISLEAF to find all leaf nodes
SELECT id, name
FROM employees
WHERE CONNECT_BY_ISLEAF = 1
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;
```

## MERGE INTO Syntax

MERGE INTO performs INSERT or UPDATE operations based on conditions (i.e., "Upsert").

### Basic Syntax

```sql
MERGE INTO target_table t
USING source_table s
ON (t.key = s.key)
WHEN MATCHED THEN
    UPDATE SET t.col1 = s.col1, t.col2 = s.col2
    [WHERE condition]
WHEN NOT MATCHED THEN
    INSERT (col1, col2, col3)
    VALUES (s.col1, s.col2, s.col3)
    [WHERE condition];
```

### Example: Sync Employee Data

```sql
-- Merge data from new_employees table into employees table
MERGE INTO employees e
USING new_employees n
ON (e.id = n.id)
WHEN MATCHED THEN
    UPDATE SET e.salary = n.salary,
               e.dept_id = n.dept_id
WHEN NOT MATCHED THEN
    INSERT (id, name, salary, dept_id)
    VALUES (n.id, n.name, n.salary, n.dept_id);
```

### Conditional MERGE

```sql
MERGE INTO employees e
USING salary_updates s
ON (e.id = s.emp_id)
WHEN MATCHED THEN
    UPDATE SET e.salary = s.new_salary
    WHERE s.effective_date <= SYSDATE
WHEN NOT MATCHED THEN
    INSERT (id, name, salary)
    VALUES (s.emp_id, s.emp_name, s.new_salary)
    WHERE s.status = 'ACTIVE';
```

### MERGE vs PG INSERT ON CONFLICT Comparison

```sql
-- Oracle MERGE syntax
MERGE INTO employees e
USING (SELECT * FROM new_employees) n
ON (e.id = n.id)
WHEN MATCHED THEN UPDATE SET e.salary = n.salary
WHEN NOT MATCHED THEN INSERT (id, name, salary) VALUES (n.id, n.name, n.salary);

-- PG equivalent syntax
INSERT INTO employees (id, name, salary)
SELECT id, name, salary FROM new_employees
ON CONFLICT (id) DO UPDATE SET salary = EXCLUDED.salary;
```

## FORCE VIEW

FORCE VIEW allows creating a view even when the underlying table does not exist. The view will be validated on first query.

### Basic Syntax

```sql
CREATE FORCE VIEW view_name AS
SELECT column_list FROM table_name [WHERE condition];
```

### Example

```sql
-- Create view before the underlying table exists
CREATE FORCE VIEW future_report_view AS
SELECT dept_name, COUNT(*) AS emp_count, AVG(salary) AS avg_salary
FROM departments d
JOIN employees e ON d.id = e.dept_id
GROUP BY dept_name;

-- Create underlying tables later
CREATE TABLE departments (id NUMBER, dept_name VARCHAR2(100));
CREATE TABLE employees (id NUMBER, dept_id NUMBER, salary NUMBER);

-- Now the view can be queried normally
SELECT * FROM future_report_view;
```

### Notes

- FORCE VIEW performs syntax checks only at creation time, not object existence checks
- Querying the view will fail if the underlying objects still do not exist
- Suitable for scenarios where interfaces are defined before implementation during development

## Package Creation and Usage

Package is Oracle's program organization unit that encapsulates related procedures, functions, variables, and cursors together. IvorySQL supports full Package functionality.

### Creating a Package Specification

```sql
CREATE OR REPLACE PACKAGE emp_pkg AS
    -- Public variables
    g_default_salary CONSTANT NUMBER := 5000;

    -- Public types
    TYPE emp_record_type IS RECORD (
        id      NUMBER,
        name    VARCHAR2(100),
        salary  NUMBER
    );

    -- Public cursor
    CURSOR emp_cursor RETURN emp_record_type;

    -- Public procedures
    PROCEDURE update_salary(
        p_emp_id  IN NUMBER,
        p_raise   IN NUMBER
    );

    PROCEDURE delete_employee(
        p_emp_id IN NUMBER
    );

    -- Public functions
    FUNCTION get_salary(
        p_emp_id IN NUMBER
    ) RETURN NUMBER;

    FUNCTION get_employee_count RETURN NUMBER;
END emp_pkg;
/
```

### Creating a Package Body

```sql
CREATE OR REPLACE PACKAGE BODY emp_pkg AS

    -- Private variables
    v_audit_enabled BOOLEAN := TRUE;

    -- Private functions
    FUNCTION log_change(
        p_emp_id  IN NUMBER,
        p_action  IN VARCHAR2
    ) RETURN BOOLEAN IS
    BEGIN
        INSERT INTO audit_log (emp_id, action, action_time)
        VALUES (p_emp_id, p_action, SYSDATE);
        RETURN TRUE;
    END;

    -- Implement cursor
    CURSOR emp_cursor RETURN emp_record_type IS
        SELECT id, name, salary FROM employees ORDER BY name;

    -- Implement procedures
    PROCEDURE update_salary(
        p_emp_id  IN NUMBER,
        p_raise   IN NUMBER
    ) AS
    BEGIN
        UPDATE employees
        SET salary = salary + p_raise
        WHERE id = p_emp_id;

        IF v_audit_enabled THEN
            log_change(p_emp_id, 'SALARY_UPDATE');
        END IF;

        COMMIT;
    END;

    PROCEDURE delete_employee(
        p_emp_id IN NUMBER
    ) AS
    BEGIN
        DELETE FROM employees WHERE id = p_emp_id;
        log_change(p_emp_id, 'DELETE');
        COMMIT;
    END;

    -- Implement functions
    FUNCTION get_salary(
        p_emp_id IN NUMBER
    ) RETURN NUMBER AS
        v_salary NUMBER;
    BEGIN
        SELECT salary INTO v_salary
        FROM employees
        WHERE id = p_emp_id;
        RETURN v_salary;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RETURN NULL;
    END;

    FUNCTION get_employee_count RETURN NUMBER AS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM employees;
        RETURN v_count;
    END;

END emp_pkg;
/
```

### Using a Package

```sql
-- Call a procedure in the package
CALL emp_pkg.update_salary(1001, 500);

-- Call a function in the package
SELECT emp_pkg.get_salary(1001) FROM DUAL;
SELECT emp_pkg.get_employee_count FROM DUAL;

-- Access constants in the package
SELECT emp_pkg.g_default_salary FROM DUAL;

-- Drop the package
DROP PACKAGE emp_pkg;
```

## Invisible Columns

IvorySQL supports invisible columns in Oracle mode. Invisible columns are not shown in `SELECT *`.

### Basic Syntax

```sql
-- Create table with invisible columns
CREATE TABLE users (
    id       SERIAL PRIMARY KEY,
    name     VARCHAR2(100),
    password VARCHAR2(255) INVISIBLE,
    salt     VARCHAR2(64)  INVISIBLE
);

-- Modify column visibility
ALTER TABLE users MODIFY password INVISIBLE;
ALTER TABLE users MODIFY password VISIBLE;
```

### Behavior Characteristics

```sql
-- Insert data (explicitly specify invisible columns)
INSERT INTO users (id, name, password, salt)
VALUES (1, 'Alice', 'hashed_pwd', 'abc123');

-- SELECT * does not return invisible columns
SELECT * FROM users;
-- Result: id | name
--       1  | Alice

-- Explicitly query invisible columns
SELECT id, name, password FROM users;
-- Result: id | name  | password
--       1  | Alice | hashed_pwd
```

## ROWID Pseudo Column

ROWID is a unique identifier for each row in Oracle. IvorySQL supports the ROWID pseudo column in Oracle mode.

### Basic Usage

```sql
-- Query ROWID
SELECT ROWID, id, name FROM employees;

-- Use ROWID for fast row positioning
SELECT * FROM employees WHERE ROWID = 'AAAWmeAAEAAAAInAAA';

-- Use ROWID for deduplication
DELETE FROM employees
WHERE ROWID NOT IN (
    SELECT MIN(ROWID)
    FROM employees
    GROUP BY id
);
```

### Notes

- IvorySQL's ROWID is a simulated implementation and differs from Oracle's format
- ROWID is not guaranteed to be stable across VACUUM operations
- It is not recommended to use ROWID as a persistent row identifier

## Comprehensive Examples

### Example 1: Using Multiple Oracle-Compatible Syntax Features

```sql
-- Create an application using Oracle features
SET ivorysql.compatible_mode TO oracle;
\parser oracle

-- Create tables
CREATE TABLE departments (
    id     NUMBER PRIMARY KEY,
    name   VARCHAR2(100)
);

CREATE TABLE employees (
    id        NUMBER PRIMARY KEY,
    name      VARCHAR2(100),
    salary    NUMBER,
    dept_id   NUMBER,
    manager_id NUMBER,
    hire_date DATE DEFAULT SYSDATE
);

-- Use CONNECT BY to query organization structure
SELECT LEVEL,
       LPAD(' ', 2 * (LEVEL - 1)) || name AS hierarchy
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Use (+) outer join
SELECT e.name, d.name AS dept
FROM employees e, departments d
WHERE e.dept_id = d.id(+);

-- Use MERGE to sync data
MERGE INTO employees e
USING temp_employees t
ON (e.id = t.id)
WHEN MATCHED THEN
    UPDATE SET e.salary = t.salary
WHEN NOT MATCHED THEN
    INSERT (id, name, salary, dept_id, manager_id)
    VALUES (t.id, t.name, t.salary, t.dept_id, t.manager_id);
```

### Example 2: Package with DUAL

```sql
-- Create utility package
CREATE OR REPLACE PACKAGE date_utils AS
    FUNCTION get_business_days(
        p_start DATE,
        p_end   DATE
    ) RETURN NUMBER;
END date_utils;
/

CREATE OR REPLACE PACKAGE BODY date_utils AS
    FUNCTION get_business_days(
        p_start DATE,
        p_end   DATE
    ) RETURN NUMBER AS
        v_count NUMBER := 0;
        v_date  DATE := p_start;
    BEGIN
        WHILE v_date <= p_end LOOP
            IF TO_CHAR(v_date, 'DY') NOT IN ('SAT', 'SUN') THEN
                v_count := v_count + 1;
            END IF;
            v_date := v_date + 1;
        END LOOP;
        RETURN v_count;
    END;
END date_utils;
/

-- Call package function via DUAL
SELECT date_utils.get_business_days(
    DATE '2025-01-01',
    DATE '2025-01-31'
) AS business_days FROM DUAL;
```
