---
title: IvorySQL Oracle Compatible SQL
description: SQL syntax differences in Oracle compatibility mode: DUAL/(+)/CONNECT BY/MERGE/ROWNUM etc.
tags: ivorysql, sql, oracle-compat, dual, connect-by, merge
---

# Oracle Compatible SQL

## DUAL Pseudo Table

```sql
-- Oracle style
SELECT SYSDATE FROM DUAL;
SELECT NVL(NULL, 'default') FROM DUAL;
SELECT 1+1 FROM DUAL;
```

## (+) Outer Join

```sql
-- Oracle legacy outer join
SELECT e.name, d.dept_name
FROM employees e, departments d
WHERE e.dept_id = d.id(+);

-- Equivalent standard SQL
SELECT e.name, d.dept_name
FROM employees e LEFT JOIN departments d ON e.dept_id = d.id;
```

## CONNECT BY Hierarchical Query

```sql
SELECT id, name, manager_id, LEVEL,
    SYS_CONNECT_BY_PATH(name, '/') AS path
FROM employees
START WITH manager_id IS NULL
CONNECT BY PRIOR id = manager_id
ORDER SIBLINGS BY name;
```

## MERGE INTO

```sql
MERGE INTO employees e
USING (SELECT id, name, salary FROM new_employees) n
ON (e.id = n.id)
WHEN MATCHED THEN
    UPDATE SET e.salary = n.salary
WHEN NOT MATCHED THEN
    INSERT (id, name, salary) VALUES (n.id, n.name, n.salary);
```

## ROWNUM

IvorySQL does not directly support ROWNUM, recommended alternatives:

```sql
-- Alternative 1: LIMIT
SELECT * FROM employees LIMIT 10;

-- Alternative 2: ROW_NUMBER()
SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (ORDER BY id) AS rn
    FROM employees
) t WHERE rn <= 10;
```

## Invisible Columns

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    secret VARCHAR(255) INVISIBLE
);

-- SELECT * does not show the secret column
-- Must be specified explicitly
SELECT id, name, secret FROM users;
```

## Force View

```sql
-- View can be created even when referenced objects do not exist
CREATE FORCE VIEW future_view AS
SELECT * FROM not_exist_table;
```
