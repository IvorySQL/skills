---
title: IvorySQL DML
description: INSERT/UPDATE/DELETE/MERGE/SELECT
tags: ivorysql, dml, insert, update, delete, merge, returning, dual, connect-by
---

# IvorySQL DML

## INSERT

### Basic INSERT

```sql
-- Single row insert
INSERT INTO employees (name, salary) VALUES ('Zhang San', 8000);

-- Multiple rows insert
INSERT INTO employees (name, salary) VALUES
    ('Zhang San', 8000), ('Li Si', 9000), ('Wang Wu', 7500);

-- Insert with specified column order
INSERT INTO employees (salary, name) VALUES (8000, 'Zhang San');
```

### INSERT FROM Query

```sql
-- Insert from another table
INSERT INTO emp_archive SELECT * FROM employees WHERE is_active = false;

-- Insert with specified columns
INSERT INTO emp_archive (id, name, salary)
SELECT id, name, salary FROM employees WHERE is_active = false;

-- Cross-table insert
INSERT INTO summary (dept, total, avg_sal)
SELECT department, COUNT(*), AVG(salary)
FROM employees GROUP BY department;
```

### INSERT ... ON CONFLICT (UPSERT)

```sql
-- Update on conflict
INSERT INTO employees (id, name, salary) VALUES (1, 'Zhang San', 8500)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        salary = EXCLUDED.salary;

-- Ignore on conflict
INSERT INTO employees (id, name, salary) VALUES (1, 'Zhang San', 8500)
    ON CONFLICT (id) DO NOTHING;

-- Specify unique constraint name
INSERT INTO employees (id, name, email) VALUES (1, 'Zhang San', 'zhang@test.com')
    ON CONFLICT ON CONSTRAINT employees_email_key DO UPDATE SET
        email = EXCLUDED.email;

-- Partial unique index conflict
INSERT INTO employees (id, name, email) VALUES (1, 'Zhang San', 'zhang@test.com')
    ON CONFLICT (email) WHERE email IS NOT NULL DO UPDATE SET
        email = EXCLUDED.email;
```

### RETURNING Clause

```sql
-- Return inserted row
INSERT INTO employees (name) VALUES ('Zhao Liu') RETURNING id, name;

-- Return auto-increment ID
INSERT INTO employees (name) VALUES ('Zhao Liu') RETURNING id;

-- Return all columns
INSERT INTO employees (name, salary) VALUES ('Zhao Liu', 7000) RETURNING *;

-- Insert result into another table
WITH ins AS (
    INSERT INTO employees (name) VALUES ('Zhao Liu') RETURNING id
)
INSERT INTO audit_log (emp_id, action) SELECT id, 'INSERT' FROM ins;
```

## UPDATE

### Basic UPDATE

```sql
-- Single column update
UPDATE employees SET salary = 9000 WHERE name = 'Zhang San';

-- Multiple columns update
UPDATE employees
SET salary = salary * 1.1,
    updated_at = CURRENT_TIMESTAMP
WHERE department = 'IT';

-- Full table update (use with caution)
UPDATE employees SET is_active = true;
```

### Correlated UPDATE

```sql
-- Correlated update using FROM clause
UPDATE employees SET salary = dept_avg.new_salary
FROM (
    SELECT department, AVG(salary) * 1.1 AS new_salary
    FROM employees GROUP BY department
) dept_avg
WHERE employees.department = dept_avg.department;

-- Update by joining another table
UPDATE orders SET status = 'shipped'
FROM shipments
WHERE orders.id = shipments.order_id
AND shipments.ship_date IS NOT NULL;
```

### Subquery UPDATE

```sql
-- Using subquery
UPDATE employees SET salary = (
    SELECT AVG(salary) * 1.1 FROM employees e2 WHERE e2.department = employees.department
)
WHERE department = 'IT';

-- Using EXISTS
UPDATE employees SET is_active = false
WHERE NOT EXISTS (
    SELECT 1 FROM departments WHERE departments.id = employees.dept_id
);
```

### UPDATE ... RETURNING

```sql
-- Return updated rows
UPDATE employees SET salary = 9000 WHERE id = 1
RETURNING id, name, salary;

-- Return values before update
UPDATE employees SET salary = 9000 WHERE id = 1
RETURNING id, name, salary AS new_salary;
```

## DELETE

### Basic DELETE

```sql
-- Conditional delete
DELETE FROM employees WHERE is_active = false;

-- Delete all data
DELETE FROM temp_data;

-- Delete using subquery
DELETE FROM employees WHERE department IN (
    SELECT name FROM departments WHERE is_closed = true
);
```

### Correlated DELETE

```sql
-- Delete using USING clause
DELETE FROM orders USING customers
WHERE orders.customer_id = customers.id
AND customers.is_blacklisted = true;

-- Delete using subquery
DELETE FROM employees WHERE dept_id IN (
    SELECT id FROM departments WHERE region = 'Closed Region'
);
```

### DELETE ... RETURNING

```sql
-- Return deleted rows
DELETE FROM employees WHERE id = 100 RETURNING *;

-- Return specific columns
DELETE FROM employees WHERE is_active = false
RETURNING id, name;

-- Archive deleted rows
WITH deleted AS (
    DELETE FROM employees WHERE is_active = false RETURNING *
)
INSERT INTO emp_archive SELECT * FROM deleted;
```

### TRUNCATE

```sql
-- Quickly empty table (not rollbackable, faster than DELETE)
TRUNCATE TABLE temp_data;

-- Cascading empty (tables referenced by foreign keys are also emptied)
TRUNCATE TABLE departments CASCADE;

-- Restart auto-increment sequences
TRUNCATE TABLE employees RESTART IDENTITY;
```

## MERGE INTO (Oracle Compatible)

MERGE INTO is an Oracle-specific DML statement used to conditionally execute INSERT or UPDATE operations. IvorySQL supports this syntax in Oracle mode.

### Basic Syntax

```sql
MERGE INTO target_table t
USING source_table s
ON (t.key_column = s.key_column)
WHEN MATCHED THEN
    UPDATE SET t.col1 = s.col1, t.col2 = s.col2
WHEN NOT MATCHED THEN
    INSERT (col1, col2) VALUES (s.col1, s.col2);
```

### Complete Example

```sql
-- Switch to Oracle mode
SET ivorysql.compatible_mode = 'oracle';

-- Employee data synchronization
MERGE INTO employees t
USING emp_staging s
ON (t.id = s.id)
WHEN MATCHED THEN
    UPDATE SET t.name = s.name,
               t.salary = s.salary,
               t.department = s.department
WHEN NOT MATCHED THEN
    INSERT (id, name, salary, department)
    VALUES (s.id, s.name, s.salary, s.department);

-- Using query as data source
MERGE INTO products t
USING (
    SELECT product_id, new_price, new_stock
    FROM price_updates
    WHERE update_date = TRUNC(SYSDATE)
) s
ON (t.id = s.product_id)
WHEN MATCHED THEN
    UPDATE SET t.price = s.new_price, t.stock = s.stock + s.new_stock
WHEN NOT MATCHED THEN
    INSERT (id, price, stock) VALUES (s.product_id, s.new_price, s.new_stock);

-- Update only (no insert)
MERGE INTO employees t
USING salary_adjustments s
ON (t.id = s.emp_id)
WHEN MATCHED THEN
    UPDATE SET t.salary = t.salary * (1 + s.adjust_rate / 100);

-- Insert only (no update)
MERGE INTO new_employees t
USING candidates s
ON (t.email = s.email)
WHEN NOT MATCHED THEN
    INSERT (name, email, hire_date)
    VALUES (s.name, s.email, SYSDATE);
```

### MERGE vs ON CONFLICT Comparison

```sql
-- Oracle mode MERGE INTO
MERGE INTO employees t
USING (SELECT 1 AS id, 'Zhang San' AS name, 9000 AS salary FROM DUAL) s
ON (t.id = s.id)
WHEN MATCHED THEN UPDATE SET t.salary = s.salary
WHEN NOT MATCHED THEN INSERT (id, name, salary) VALUES (s.id, s.name, s.salary);

-- PG mode ON CONFLICT (equivalent)
INSERT INTO employees (id, name, salary) VALUES (1, 'Zhang San', 9000)
ON CONFLICT (id) DO UPDATE SET salary = EXCLUDED.salary;
```

## Oracle Mode Specific Query Syntax

### DUAL Pseudo Table

DUAL is an Oracle-specific pseudo table used for queries that do not need an actual table reference. IvorySQL Oracle mode supports DUAL.

```sql
-- Using DUAL for calculations
SELECT 1 + 1 FROM DUAL;
SELECT 10 * 5 / 2 FROM DUAL;

-- Get system date
SELECT SYSDATE FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;

-- Call functions
SELECT NVL(NULL, 'default') FROM DUAL;
SELECT SYS_GUID() FROM DUAL;
SELECT USER FROM DUAL;
SELECT DECODE(1, 1, 'One', 2, 'Two', 'Other') FROM DUAL;

-- Generate sequence values
SELECT emp_seq.NEXTVAL FROM DUAL;
```

### (+) Outer Join Syntax

Oracle's `(+)` outer join syntax is Oracle-specific. IvorySQL Oracle mode supports this syntax.

```sql
-- Left outer join (+ on right table column)
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id = d.dept_id(+);
-- Equivalent to:
-- SELECT e.name, d.dept_name FROM employees e LEFT JOIN departments d ON e.dept_id = d.dept_id;

-- Right outer join (+ on left table column)
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id(+) = d.dept_id;
-- Equivalent to:
-- SELECT e.name, d.dept_name FROM employees e RIGHT JOIN departments d ON e.dept_id = d.dept_id;

-- Multi-table outer join
SELECT e.name, d.dept_name, p.project_name
FROM employees e, departments d, projects p
WHERE e.dept_id = d.dept_id(+)
AND e.project_id = p.project_id(+);

-- Note: (+) cannot appear on both sides of the join condition simultaneously
-- The following is incorrect:
-- WHERE e.dept_id(+) = d.dept_id(+)  -- Error
```

### CONNECT BY Hierarchical Query

CONNECT BY is Oracle-specific hierarchical query syntax for handling tree-structured data. IvorySQL Oracle mode supports this syntax.

```sql
-- Basic hierarchical query
SELECT id, name, manager_id, LEVEL
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Specify starting condition
SELECT id, name, manager_id, LEVEL
FROM employees
START WITH id = 1
CONNECT BY PRIOR id = manager_id;

-- Use LEVEL to indent and display hierarchy
SELECT LPAD(' ', (LEVEL-1)*2) || name AS org_chart, LEVEL
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Filter specific levels
SELECT id, name, LEVEL
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id
AND department = 'IT';  -- Filter join condition

-- Use WHERE to filter results
SELECT id, name, LEVEL
FROM employees
WHERE LEVEL <= 3
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Using PRIOR expressions
SELECT id, name, manager_id,
       PRIOR name AS manager_name,
       LEVEL,
       SYS_CONNECT_BY_PATH(name, '/') AS path
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Using CONNECT_BY_ROOT to get root node
SELECT id, name, CONNECT_BY_ROOT name AS root_name, LEVEL
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Using CONNECT_BY_ISLEAF to identify leaf nodes
SELECT id, name, LEVEL,
       CONNECT_BY_ISLEAF AS is_leaf
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Using NOCYCLE to prevent loops
SELECT id, name, LEVEL,
       CONNECT_BY_ISCYCLE AS has_cycle
FROM employees
START WITH manager_id IS NULL
CONNECT BY NOCYCLE PRIOR id = manager_id;

-- Hierarchical query sorting
SELECT id, name, LEVEL
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id
ORDER SIBLINGS BY name;
```

### Recursive CTE vs CONNECT BY Comparison

```sql
-- CONNECT BY approach (Oracle style)
SELECT id, name, LEVEL, SYS_CONNECT_BY_PATH(name, '/') AS path
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id;

-- Recursive CTE approach (PG standard)
WITH RECURSIVE org_tree AS (
    SELECT id, name, manager_id, 1 AS LEVEL, name::TEXT AS path
    FROM employees WHERE manager_id IS NULL
    UNION ALL
    SELECT e.id, e.name, e.manager_id, t.LEVEL + 1, t.path || '/' || e.name
    FROM employees e JOIN org_tree t ON e.manager_id = t.id
)
SELECT * FROM org_tree;
```

## Transaction Control

### Basic Transaction Operations

```sql
-- Begin transaction
BEGIN;
-- or
START TRANSACTION;

-- Commit
COMMIT;

-- Rollback
ROLLBACK;
```

### Savepoints

```sql
BEGIN;
INSERT INTO orders (id, amount) VALUES (1, 100);
SAVEPOINT sp1;

INSERT INTO order_items (order_id, item) VALUES (1, 'A');
SAVEPOINT sp2;

INSERT INTO order_items (order_id, item) VALUES (1, 'B');
-- Problem found, rollback to savepoint
ROLLBACK TO SAVEPOINT sp2;

-- Release savepoint
RELEASE SAVEPOINT sp1;

COMMIT;
```

### Transaction Isolation Levels

```sql
-- Set transaction isolation level
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- Default
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

-- Read-only transaction
SET TRANSACTION READ ONLY;

-- Read-write transaction
SET TRANSACTION READ WRITE;

-- Set transaction isolation level (session-level)
SET SESSION CHARACTERISTICS AS TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

### Transaction Isolation Level Comparison

| Level | Dirty Read | Non-repeatable Read | Phantom Read | Description |
|------|:----:|:---------:|:----:|------|
| READ UNCOMMITTED | Impossible | Possible | Possible | In PG, equivalent to READ COMMITTED |
| READ COMMITTED (Default) | Impossible | Possible | Possible | Each statement sees latest committed data |
| REPEATABLE READ | Impossible | Impossible | Possible (won't happen in PG) | Consistent snapshot within transaction |
| SERIALIZABLE | Impossible | Impossible | Impossible | Fully serialized, may fail serialization |

### Locks

```sql
-- Row-level locks
SELECT * FROM employees WHERE id = 1 FOR UPDATE;       -- Exclusive lock
SELECT * FROM employees WHERE id = 1 FOR NO KEY UPDATE; -- Weak exclusive lock
SELECT * FROM employees WHERE id = 1 FOR SHARE;         -- Shared lock
SELECT * FROM employees WHERE id = 1 FOR KEY SHARE;     -- Weak shared lock

-- Skip locked rows (common in concurrent processing)
SELECT * FROM task_queue WHERE status = 'pending'
    LIMIT 1 FOR UPDATE SKIP LOCKED;

-- Table-level locks
LOCK TABLE employees IN EXCLUSIVE MODE;
LOCK TABLE employees IN SHARE MODE;

-- Advisory locks (application-level locks)
SELECT pg_advisory_lock(12345);    -- Acquire advisory lock
SELECT pg_advisory_unlock(12345);  -- Release advisory lock
SELECT pg_try_advisory_lock(12345); -- Try to acquire, don't wait

-- Oracle compatible lock syntax
LOCK TABLE employees IN ROW SHARE MODE;
LOCK TABLE employees IN ROW EXCLUSIVE MODE;
LOCK TABLE employees IN SHARE UPDATE EXCLUSIVE MODE;
LOCK TABLE employees IN SHARE ROW EXCLUSIVE MODE;
```
