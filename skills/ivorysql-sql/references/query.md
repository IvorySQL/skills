---
title: IvorySQL Query
description: SELECT/JOIN/CTE/Window Functions/EXPLAIN
tags: ivorysql, query, select, join, cte, window-function, explain, rollup, cube
---

# IvorySQL Query

## SELECT Basics

### Basic SELECT

```sql
-- Query all columns
SELECT * FROM employees;

-- Query specified columns
SELECT name, salary FROM employees;

-- Column aliases
SELECT name AS employee_name, salary * 12 AS annual_salary
FROM employees;

-- Remove duplicates
SELECT DISTINCT department FROM employees;

-- Conditional filtering
SELECT name, salary FROM employees WHERE salary > 5000;
SELECT name FROM employees WHERE department = 'IT' AND salary > 8000;
```

### WHERE Conditions

```sql
-- Comparison operators
SELECT * FROM employees WHERE salary >= 8000;
SELECT * FROM employees WHERE name != 'admin';

-- BETWEEN
SELECT * FROM employees WHERE salary BETWEEN 5000 AND 10000;

-- IN
SELECT * FROM employees WHERE department IN ('IT', 'HR', 'Finance');

-- LIKE / ILIKE (case-insensitive)
SELECT * FROM employees WHERE name LIKE 'Zhang%';
SELECT * FROM employees WHERE email ILIKE '%@GMAIL.COM';

-- IS NULL / IS NOT NULL
SELECT * FROM employees WHERE bonus IS NULL;
SELECT * FROM employees WHERE phone IS NOT NULL;

-- Compound conditions
SELECT * FROM employees
WHERE (department = 'IT' OR department = 'HR')
AND salary > 6000
AND hire_date >= '2024-01-01';
```

### ORDER BY Sorting

```sql
-- Ascending (default)
SELECT * FROM employees ORDER BY salary;

-- Descending
SELECT * FROM employees ORDER BY salary DESC;

-- Multi-column sorting
SELECT * FROM employees ORDER BY department, salary DESC;

-- NULL value sorting
SELECT * FROM employees ORDER BY bonus DESC NULLS LAST;
SELECT * FROM employees ORDER BY bonus ASC NULLS FIRST;

-- Sort by expression
SELECT * FROM employees ORDER BY LENGTH(name);
SELECT * FROM employees ORDER BY salary * 12;
```

### LIMIT / OFFSET Pagination

```sql
-- Limit number of rows
SELECT * FROM employees LIMIT 10;

-- Pagination
SELECT * FROM employees ORDER BY id LIMIT 10 OFFSET 0;   -- Page 1
SELECT * FROM employees ORDER BY id LIMIT 10 OFFSET 10;  -- Page 2
SELECT * FROM employees ORDER BY id LIMIT 10 OFFSET 20;  -- Page 3

-- LIMIT ALL (return all rows)
SELECT * FROM employees LIMIT ALL;

-- FETCH FIRST syntax (SQL standard)
SELECT * FROM employees ORDER BY salary DESC FETCH FIRST 10 ROWS ONLY;
SELECT * FROM employees ORDER BY salary DESC OFFSET 5 ROWS FETCH NEXT 10 ROWS ONLY;
```

### Aggregate Functions

```sql
-- Basic aggregation
SELECT COUNT(*) AS total FROM employees;
SELECT AVG(salary) AS avg_sal FROM employees;
SELECT SUM(salary) AS total_sal FROM employees;
SELECT MAX(salary) AS max_sal, MIN(salary) AS min_sal FROM employees;

-- GROUP BY
SELECT department, COUNT(*) AS cnt, AVG(salary) AS avg_sal
FROM employees GROUP BY department;

-- HAVING (filter grouped results)
SELECT department, COUNT(*) AS cnt, AVG(salary) AS avg_sal
FROM employees
GROUP BY department
HAVING COUNT(*) > 5 AND AVG(salary) > 6000;

-- Common aggregate functions
-- COUNT, SUM, AVG, MAX, MIN
-- BIT_AND, BIT_OR, BOOL_AND, BOOL_OR
-- ARRAY_AGG, STRING_AGG, JSON_AGG, JSONB_AGG
SELECT department, STRING_AGG(name, ', ') AS names FROM employees GROUP BY department;
SELECT department, ARRAY_AGG(name) AS names FROM employees GROUP BY department;
SELECT department, JSON_AGG(name) AS names FROM employees GROUP BY department;
```

## JOIN Queries

### Join Types Overview

| Type | Syntax | Description |
|------|------|------|
| Inner Join | INNER JOIN / JOIN | Returns only matching rows |
| Left Outer Join | LEFT JOIN / LEFT OUTER JOIN | Returns all left table rows; NULL for unmatched right table rows |
| Right Outer Join | RIGHT JOIN / RIGHT OUTER JOIN | Returns all right table rows; NULL for unmatched left table rows |
| Full Outer Join | FULL JOIN / FULL OUTER JOIN | Returns all rows from both tables; NULL where no match |
| Cross Join | CROSS JOIN | Cartesian product |
| Natural Join | NATURAL JOIN | Automatically joins by columns with the same name |

### Inner Join (INNER JOIN)

```sql
-- Basic inner join
SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;

-- JOIN is shorthand for INNER JOIN
SELECT e.name, d.dept_name
FROM employees e JOIN departments d ON e.dept_id = d.id;

-- Multi-table join
SELECT e.name, d.dept_name, p.project_name
FROM employees e
JOIN departments d ON e.dept_id = d.id
JOIN projects p ON e.project_id = p.id;

-- Using USING (when column names are the same)
SELECT e.name, dept_name
FROM employees e JOIN departments d USING (dept_id);
```

### Left Outer Join (LEFT JOIN)

```sql
-- Basic left outer join
SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- Query employees without a department
SELECT e.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;

-- Multi-table left outer join
SELECT e.name, d.dept_name, p.project_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
LEFT JOIN projects p ON e.project_id = p.id;
```

### Right Outer Join (RIGHT JOIN)

```sql
-- Basic right outer join
SELECT e.name, d.dept_name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id;

-- Query departments without employees
SELECT d.dept_name
FROM employees e
RIGHT JOIN departments d ON e.dept_id = d.id
WHERE e.id IS NULL;
```

### Full Outer Join (FULL JOIN)

```sql
-- Full outer join
SELECT e.name, d.dept_name
FROM employees e
FULL JOIN departments d ON e.dept_id = d.id;

-- Find unmatched rows
SELECT e.name, d.dept_name
FROM employees e
FULL JOIN departments d ON e.dept_id = d.id
WHERE e.id IS NULL OR d.id IS NULL;
```

### Cross Join (CROSS JOIN)

```sql
-- Cartesian product
SELECT * FROM colors CROSS JOIN sizes;

-- Equivalent syntax
SELECT * FROM colors, sizes;

-- Generate date series
SELECT d.day
FROM generate_series('2025-01-01'::DATE, '2025-01-31'::DATE, '1 day') AS d(day)
CROSS JOIN departments;
```

### Self Join

```sql
-- Self join for employees and managers
SELECT e.name AS employee, m.name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

### LATERAL Join

```sql
-- LATERAL subqueries can reference columns from the left table
SELECT e.name, top_salaries.*
FROM employees e
CROSS JOIN LATERAL (
    SELECT salary, department
    FROM salaries s
    WHERE s.emp_id = e.id
    ORDER BY salary DESC
    LIMIT 3
) top_salaries;

-- LATERAL with functions
SELECT e.name, recent_orders.*
FROM employees e
LEFT JOIN LATERAL unnest(e.recent_order_ids) AS recent_orders(order_id) ON true;
```

## CTE (Common Table Expressions)

### Standard CTE

```sql
-- Single CTE
WITH dept_avg AS (
    SELECT department, AVG(salary) AS avg_sal
    FROM employees GROUP BY department
)
SELECT e.name, e.salary, d.avg_sal
FROM employees e
JOIN dept_avg d ON e.department = d.department
WHERE e.salary > d.avg_sal;

-- Multiple CTEs
WITH
high_salary AS (
    SELECT * FROM employees WHERE salary > 10000
),
dept_count AS (
    SELECT department, COUNT(*) AS cnt
    FROM employees GROUP BY department
)
SELECT h.name, h.salary, d.cnt
FROM high_salary h
JOIN dept_count d ON h.department = d.department;

-- DML in CTE (data-modifying CTE)
WITH moved AS (
    DELETE FROM employees WHERE is_active = false RETURNING *
)
INSERT INTO emp_archive SELECT * FROM moved;
```

### Recursive CTE

```sql
-- Recursive organization chart query
WITH RECURSIVE org_tree AS (
    -- Anchor query: top-level managers
    SELECT id, name, manager_id, 1 AS level, name::TEXT AS path
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- Recursive query: subordinate employees
    SELECT e.id, e.name, e.manager_id, t.level + 1, t.path || ' > ' || e.name
    FROM employees e
    JOIN org_tree t ON e.manager_id = t.id
)
SELECT id, name, level, path FROM org_tree ORDER BY path;

-- Recursive department hierarchy
WITH RECURSIVE dept_hierarchy AS (
    SELECT id, name, parent_id, 1 AS level, name::TEXT AS path
    FROM departments
    WHERE parent_id IS NULL

    UNION ALL

    SELECT d.id, d.name, d.parent_id, h.level + 1, h.path || ' > ' || d.name
    FROM departments d
    JOIN dept_hierarchy h ON d.parent_id = h.id
)
SELECT * FROM dept_hierarchy;

-- Generate date series
WITH RECURSIVE dates AS (
    SELECT '2025-01-01'::DATE AS day
    UNION ALL
    SELECT day + 1 FROM dates WHERE day < '2025-01-31'
)
SELECT day FROM dates;

-- Generate number series
WITH RECURSIVE nums AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM nums WHERE n < 100
)
SELECT n FROM nums;

-- Bill of Materials (BOM) expansion
WITH RECURSIVE bom AS (
    SELECT component_id, parent_id, quantity, 1 AS level
    FROM bill_of_materials
    WHERE parent_id IS NULL  -- Top-level components

    UNION ALL

    SELECT b.component_id, b.parent_id, b.quantity, bom.level + 1
    FROM bill_of_materials b
    JOIN bom ON b.parent_id = bom.component_id
)
SELECT * FROM bom;
```

## Window Functions

Window functions perform calculations across a set of related rows (a window) without collapsing rows (unlike GROUP BY).

### Syntax

```sql
function_name() OVER (
    [PARTITION BY expression [, ...]]
    [ORDER BY expression [ASC|DESC] [NULLS {FIRST|LAST}] [, ...]]
    [frame_clause]
)
```

### Ranking Functions

```sql
-- RANK: same value gets the same rank, with gaps
SELECT name, salary,
    RANK() OVER (ORDER BY salary DESC) AS rank
FROM employees;
-- Result: 1, 2, 2, 4, 5 (with gaps)

-- DENSE_RANK: same value gets the same rank, no gaps
SELECT name, salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank
FROM employees;
-- Result: 1, 2, 2, 3, 4 (no gaps)

-- ROW_NUMBER: unique row number
SELECT name, salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num
FROM employees;
-- Result: 1, 2, 3, 4, 5 (unique)

-- PERCENT_RANK: percentile ranking
SELECT name, salary,
    PERCENT_RANK() OVER (ORDER BY salary DESC) AS pct_rank
FROM employees;

-- NTILE: divide into buckets
SELECT name, salary,
    NTILE(4) OVER (ORDER BY salary DESC) AS quartile
FROM employees;
```

### Partitioned Aggregation

```sql
-- Calculate by department partition
SELECT name, department, salary,
    SUM(salary) OVER (PARTITION BY department) AS dept_total,
    AVG(salary) OVER (PARTITION BY department) AS dept_avg,
    COUNT(*) OVER (PARTITION BY department) AS dept_count
FROM employees;

-- Running aggregation
SELECT name, hire_date, salary,
    SUM(salary) OVER (ORDER BY hire_date) AS running_total
FROM employees;

-- Running aggregation (by department)
SELECT name, department, hire_date, salary,
    SUM(salary) OVER (
        PARTITION BY department
        ORDER BY hire_date
    ) AS dept_running_total
FROM employees;
```

### Window Frames

```sql
-- ROWS frame definition
SELECT name, salary, hire_date,
    SUM(salary) OVER (
        ORDER BY hire_date
        ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
    ) AS moving_sum
FROM employees;

-- RANGE frame definition (based on value range)
SELECT name, salary,
    AVG(salary) OVER (
        ORDER BY salary
        RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING
    ) AS nearby_avg
FROM employees;

-- Cumulative sum
SELECT name, salary,
    SUM(salary) OVER (
        ORDER BY hire_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_sum
FROM employees;
```

### LAG / LEAD

```sql
-- LAG: value from N rows before
SELECT name, salary, hire_date,
    LAG(salary, 1) OVER (ORDER BY hire_date) AS prev_salary,
    LAG(salary, 2) OVER (ORDER BY hire_date) AS prev_2_salary
FROM employees;

-- LEAD: value from N rows after
SELECT name, salary, hire_date,
    LEAD(salary, 1) OVER (ORDER BY hire_date) AS next_salary
FROM employees;

-- LAG/LEAD with default value
SELECT name, salary,
    LAG(salary, 1, 0) OVER (ORDER BY hire_date) AS prev_salary
FROM employees;

-- Calculate month-over-month growth rate
SELECT name, salary,
    salary - LAG(salary, 1) OVER (ORDER BY hire_date) AS salary_change,
    ROUND(
        (salary - LAG(salary, 1) OVER (ORDER BY hire_date)) * 100.0
        / NULLIF(LAG(salary, 1) OVER (ORDER BY hire_date), 0),
        2
    ) AS growth_rate
FROM employees;
```

### FIRST_VALUE / LAST_VALUE / NTH_VALUE

```sql
-- Highest salary within a department
SELECT name, department, salary,
    FIRST_VALUE(salary) OVER (
        PARTITION BY department ORDER BY salary DESC
    ) AS dept_max_sal
FROM employees;

-- LAST_VALUE requires careful frame range
SELECT name, department, salary,
    LAST_VALUE(salary) OVER (
        PARTITION BY department ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS dept_min_sal
FROM employees;

-- NTH_VALUE
SELECT name, department, salary,
    NTH_VALUE(salary, 2) OVER (
        PARTITION BY department ORDER BY salary DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    ) AS dept_second_sal
FROM employees;
```

## GROUP BY Extensions

### ROLLUP

ROLLUP generates hierarchical aggregation rows from the finest granularity to the grand total.

```sql
-- Summarize by department and year (with subtotals and grand total)
SELECT department, EXTRACT(YEAR FROM hire_date) AS year, SUM(salary) AS total
FROM employees
GROUP BY ROLLUP (department, year)
ORDER BY department, year;

-- Example result:
-- IT       | 2024 | 50000   -- Department + year subtotal
-- IT       | 2025 | 30000   -- Department + year subtotal
-- IT       |      | 80000   -- Department subtotal (year is NULL)
-- HR       | 2024 | 40000
-- HR       | 2025 | 20000
-- HR       |      | 60000   -- Department subtotal
--          |      | 140000  -- Grand total (both department and year are NULL)

-- Three-level ROLLUP
SELECT region, department, job_title, SUM(salary) AS total
FROM employees
GROUP BY ROLLUP (region, department, job_title);
```

### CUBE

CUBE generates all possible grouping combinations.

```sql
-- Summarize by all combinations of department and year
SELECT department, EXTRACT(YEAR FROM hire_date) AS year, SUM(salary) AS total
FROM employees
GROUP BY CUBE (department, year)
ORDER BY department, year;

-- Example result (includes year-only groupings not present in ROLLUP):
-- IT       | 2024 | 50000
-- IT       | 2025 | 30000
-- IT       |      | 80000   -- Department subtotal
-- HR       | 2024 | 40000
-- HR       | 2025 | 20000
-- HR       |      | 60000   -- Department subtotal
--          | 2024 | 90000   -- Year subtotal (not in ROLLUP)
--          | 2025 | 50000   -- Year subtotal
--          |      | 140000  -- Grand total

-- Three-dimensional CUBE
SELECT region, department, job_title, SUM(salary) AS total
FROM employees
GROUP BY CUBE (region, department, job_title);
```

### GROUPING SETS

GROUPING SETS allows precise control over which groupings are needed.

```sql
-- Specify grouping combinations
SELECT department, job_title, SUM(salary) AS total
FROM employees
GROUP BY GROUPING SETS (
    (department, job_title),  -- By department and job title
    (department),             -- By department only
    (job_title),              -- By job title only
    ()                        -- Grand total
)
ORDER BY department, job_title;

-- Equivalent to ROLLUP(a, b)
GROUP BY GROUPING SETS ((a, b), (a), ())

-- Equivalent to CUBE(a, b)
GROUP BY GROUPING SETS ((a, b), (a), (b), ())

-- Mixed usage
SELECT region, department, job_title, SUM(salary) AS total
FROM employees
GROUP BY GROUPING SETS (
    (region, department),
    (region, job_title),
    ()
);
```

### GROUPING Function

The GROUPING function is used to distinguish actual NULL values from NULL placeholders generated by ROLLUP/CUBE in super-aggregated rows.

```sql
-- Use GROUPING to identify super-aggregated rows
SELECT
    COALESCE(department, 'All Departments') AS dept,
    COALESCE(EXTRACT(YEAR FROM hire_date)::TEXT, 'All Years') AS year,
    SUM(salary) AS total,
    GROUPING(department) AS is_dept_total,
    GROUPING(EXTRACT(YEAR FROM hire_date)) AS is_year_total
FROM employees
GROUP BY ROLLUP (department, EXTRACT(YEAR FROM hire_date));

-- GROUPING return values:
-- 0 = This column is an actual grouping column
-- 1 = This column is a super-aggregated row (NULL placeholder)

-- Use GROUPING_ID (combined GROUPING)
SELECT
    department,
    EXTRACT(YEAR FROM hire_date) AS year,
    SUM(salary) AS total,
    GROUPING(department) + GROUPING(EXTRACT(YEAR FROM hire_date)) * 2 AS grouping_id
FROM employees
GROUP BY ROLLUP (department, EXTRACT(YEAR FROM hire_date));
```

## Set Operations

```sql
-- UNION (merge with deduplication)
SELECT name FROM employees UNION SELECT name FROM contractors;

-- UNION ALL (merge without deduplication, better performance)
SELECT name FROM employees UNION ALL SELECT name FROM contractors;

-- INTERSECT (intersection)
SELECT name FROM employees INTERSECT SELECT name FROM contractors;

-- INTERSECT ALL (intersection preserving duplicates)
SELECT name FROM employees INTERSECT ALL SELECT name FROM contractors;

-- EXCEPT (difference: in left table but not in right table)
SELECT name FROM employees EXCEPT SELECT name FROM contractors;

-- EXCEPT ALL (difference preserving duplicates)
SELECT name FROM employees EXCEPT ALL SELECT name FROM contractors;

-- Combining set operations
SELECT name FROM employees WHERE department = 'IT'
UNION ALL
SELECT name FROM contractors WHERE department = 'IT'
ORDER BY name;
```

## Subqueries

```sql
-- Scalar subquery
SELECT name,
       (SELECT dept_name FROM departments WHERE id = e.dept_id) AS dept_name
FROM employees e;

-- IN subquery
SELECT * FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE region = 'East China');

-- NOT IN subquery
SELECT * FROM employees
WHERE dept_id NOT IN (SELECT id FROM departments WHERE region = 'East China');

-- EXISTS subquery
SELECT * FROM departments d
WHERE EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.id);

-- NOT EXISTS subquery
SELECT * FROM departments d
WHERE NOT EXISTS (SELECT 1 FROM employees e WHERE e.dept_id = d.id);

-- ANY / ALL
SELECT * FROM employees WHERE salary > ALL (
    SELECT salary FROM employees WHERE dept_id = 5
);
SELECT * FROM employees WHERE salary > ANY (
    SELECT salary FROM employees WHERE dept_id = 5
);

-- Row expression subquery
SELECT * FROM employees
WHERE (department, salary) IN (
    SELECT department, MAX(salary) FROM employees GROUP BY department
);
```

## EXPLAIN / EXPLAIN ANALYZE

### EXPLAIN

```sql
-- View execution plan
EXPLAIN SELECT * FROM employees WHERE salary > 5000;

-- View execution plan (with detailed cost estimates)
EXPLAIN (COSTS, BUFFERS) SELECT * FROM employees WHERE salary > 5000;

-- JSON format
EXPLAIN (FORMAT JSON) SELECT * FROM employees WHERE salary > 5000;

-- YAML format
EXPLAIN (FORMAT YAML) SELECT * FROM employees WHERE salary > 5000;

-- TEXT format (default)
EXPLAIN (FORMAT TEXT) SELECT * FROM employees WHERE salary > 5000;
```

### EXPLAIN ANALYZE

```sql
-- Actually execute and return runtime statistics
EXPLAIN ANALYZE SELECT * FROM employees WHERE salary > 5000;

-- Include buffer statistics
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM employees WHERE salary > 5000;

-- Include WAL statistics
EXPLAIN (ANALYZE, BUFFERS, WAL) SELECT * FROM employees WHERE salary > 5000;

-- Include detailed timing
EXPLAIN (ANALYZE, TIMING) SELECT * FROM employees WHERE salary > 5000;

-- Include scan settings
EXPLAIN (ANALYZE, SETTINGS) SELECT * FROM employees WHERE salary > 5000;
```

### Interpreting EXPLAIN Output

```
EXPLAIN SELECT e.name, d.dept_name
FROM employees e JOIN departments d ON e.dept_id = d.id
WHERE e.salary > 5000;

-- Example output:
-- Hash Join  (cost=13.15..33.45 rows=200 width=72)
--   Hash Cond: (e.dept_id = d.id)
--   ->  Seq Scan on employees e  (cost=0.00..18.50 rows=200 width=40)
--         Filter: (salary > 5000)
--   ->  Hash  (cost=1.10..1.10 rows=10 width=40)
--         ->  Seq Scan on departments d  (cost=0.00..1.10 rows=10 width=40)
```

**Key Metrics:**
- `cost=13.15..33.45`: Startup cost..Total cost (relative values, not time)
- `rows=200`: Estimated number of rows returned
- `width=72`: Estimated average bytes per row
- `Seq Scan`: Sequential scan (full table scan)
- `Index Scan`: Index scan
- `Bitmap Scan`: Bitmap scan
- `Hash Join`: Hash join
- `Nested Loop`: Nested loop join
- `Merge Join`: Merge join

### Common Execution Plan Nodes

| Node | Description | Applicable Scenario |
|------|------|------|
| Seq Scan | Sequential scan | Small tables or no suitable index |
| Index Scan | Index scan | Selective index available |
| Index Only Scan | Index-only scan | Index covers query columns |
| Bitmap Heap Scan | Bitmap heap scan | Moderate selectivity |
| Bitmap Index Scan | Bitmap index scan | Used with Bitmap Heap |
| Hash Join | Hash join | Equi-join, large tables |
| Nested Loop | Nested loop | Small table driving large table |
| Merge Join | Merge join | Joining already sorted data |
| Sort | Sorting | ORDER BY |
| HashAggregate | Hash aggregation | GROUP BY |
| GroupAggregate | Group aggregation | Sorted GROUP BY |
| Limit | Limiting | LIMIT |

### Optimization Suggestions

```sql
-- Discover Seq Scan but index exists -> may need ANALYZE
ANALYZE employees;

-- View statistics
SELECT * FROM pg_stats WHERE tablename = 'employees';

-- View index usage
SELECT schemaname, relname, indexrelname, idx_scan
FROM pg_stat_user_indexes
WHERE relname = 'employees';

-- View table size
SELECT pg_size_pretty(pg_relation_size('employees'));
SELECT pg_size_pretty(pg_total_relation_size('employees'));  -- Including indexes and TOAST

-- Disable specific scan method (for debugging only)
SET enable_seqscan = off;
EXPLAIN SELECT * FROM employees WHERE id = 1;
SET enable_seqscan = on;  -- Restore
```
