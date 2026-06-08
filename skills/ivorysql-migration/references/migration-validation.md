---
title: IvorySQL Migration Validation
description: Post-migration data validation, functional testing, and performance testing
tags: ivorysql, migration, validation, testing
---

# IvorySQL Migration Validation

## Data Validation

### Row Count Comparison

```sql
-- Execute on both source and target databases
SELECT 'table_name' as tbl, COUNT(*) as cnt FROM table_name
UNION ALL
SELECT 'another_table', COUNT(*) FROM another_table;
```

### Data Sampling Validation

```sql
-- Random sample comparison
SELECT md5(string_agg(row_text, '' ORDER BY id))
FROM (
    SELECT id, name || salary::text || hire_date::text as row_text
    FROM employees ORDER BY id
) t;
```

### Checksum Comparison

```sql
-- Full table checksum
SELECT sum(hashtext(t.*::text)) as checksum FROM employees t;
```

## Functional Validation

### SQL Compatibility Testing

```sql
-- Oracle compatible function testing
SELECT NVL(NULL, 'default') FROM DUAL;
SELECT DECODE(1, 1, 'one', 2, 'two', 'other') FROM DUAL;
SELECT SYSDATE FROM DUAL;
SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;
SELECT SYS_GUID() FROM DUAL;

-- PL/iSQL testing
-- Execute migrated stored procedures and functions
CALL my_migrated_procedure(1);
SELECT my_migrated_function(1) FROM DUAL;
```

### Application Layer Testing

1. Connection testing: Can the application connect normally?
2. CRUD testing: Create, read, update, delete operations
3. Transaction testing: Transaction commit/rollback
4. Concurrency testing: Multi-connection concurrent operations
5. Boundary testing: Large data volumes, NULL values, special characters

## Performance Validation

### Benchmark Testing

```sql
-- Simple query performance
EXPLAIN ANALYZE SELECT * FROM employees WHERE salary > 5000;

-- Join query performance
EXPLAIN ANALYZE SELECT e.*, d.* FROM employees e JOIN departments d ON e.dept_id = d.id;

-- Aggregation query performance
EXPLAIN ANALYZE SELECT department, AVG(salary) FROM employees GROUP BY department;
```

### Comparison Metrics

| Metric | Source Database | IvorySQL | Difference |
|--------|----------------|----------|------------|
| Simple query QPS | - | - | - |
| Complex query latency | - | - | - |
| Write TPS | - | - | - |
| Connection count | - | - | - |
