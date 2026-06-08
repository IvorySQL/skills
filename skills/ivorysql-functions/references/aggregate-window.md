---
title: IvorySQL Aggregate and Window Functions
description: Aggregate functions, window functions, GROUPING SETS reference
tags: ivorysql, functions, aggregate, window, grouping
---

# IvorySQL Aggregate and Window Functions

## Aggregate Functions

### Basic Aggregation

| Function | Description | Example |
|------|------|------|
| COUNT(*) | Total rows | COUNT(*) → 100 |
| COUNT(expr) | Non-NULL rows | COUNT(salary) → 95 |
| COUNT(DISTINCT expr) | Distinct rows | COUNT(DISTINCT dept) → 5 |
| SUM(expr) | Sum | SUM(salary) → 850000 |
| AVG(expr) | Average | AVG(salary) → 8500 |
| MAX(expr) | Maximum | MAX(salary) → 20000 |
| MIN(expr) | Minimum | MIN(salary) → 3000 |

### Statistical Aggregation

| Function | Description |
|------|------|
| STDDEV(expr) / STDDEV_SAMP(expr) | Sample standard deviation |
| STDDEV_POP(expr) | Population standard deviation |
| VARIANCE(expr) / VAR_SAMP(expr) | Sample variance |
| VAR_POP(expr) | Population variance |
| COVAR_SAMP(expr1, expr2) | Sample covariance |
| COVAR_POP(expr1, expr2) | Population covariance |
| CORR(expr1, expr2) | Correlation coefficient |
| REGR_SLOPE / REGR_INTERCEPT | Linear regression |

### Collection Aggregation

| Function | Description | Example |
|------|------|------|
| STRING_AGG(expr, delim) | String concatenation | STRING_AGG(name, ', ') → 'Alice, Bob, Carol' |
| ARRAY_AGG(expr) | Array aggregation | ARRAY_AGG(name) → {Alice,Bob,Carol} |
| JSON_AGG(expr) | JSON array aggregation | JSON_AGG(name) → ["Alice","Bob"] |
| JSONB_AGG(expr) | JSONB array aggregation | Same as JSON_AGG but returns JSONB |
| JSON_OBJECT_AGG(key, value) | JSON object aggregation | JSON_OBJECT_AGG(name, salary) → {"Alice":8000} |
| BOOL_AND(expr) | All true | BOOL_AND(salary > 0) → true |
| BOOL_OR(expr) | Any true | BOOL_OR(salary > 10000) → true |

### Ordered-Set Aggregation

| Function | Description |
|------|------|
| PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY expr) | Continuous percentile |
| PERCENTILE_DISC(fraction) WITHIN GROUP (ORDER BY expr) | Discrete percentile |
| MODE() WITHIN GROUP (ORDER BY expr) | Mode |
| RANK() WITHIN GROUP (ORDER BY expr) | Hypothetical rank |

### GROUPING SETS

```sql
-- GROUPING SETS
SELECT department, region, SUM(salary)
FROM employees
GROUP BY GROUPING SETS (
    (department, region),
    (department),
    (region),
    ()
);

-- ROLLUP (equivalent to GROUPING SETS with progressive rollup)
SELECT department, region, SUM(salary)
FROM employees
GROUP BY ROLLUP (department, region);

-- CUBE (all combinations)
SELECT department, region, SUM(salary)
FROM employees
GROUP BY CUBE (department, region);
```

## Window Functions

### Syntax

```sql
function_name(expr) OVER (
    [PARTITION BY expr_list]
    [ORDER BY expr_list [ASC|DESC] [NULLS {FIRST|LAST}]]
    [frame_clause]
)
```

### Window Frames

```sql
-- ROWS frame (physical rows)
ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW

-- RANGE frame (logical rows)
RANGE BETWEEN INTERVAL '1 day' PRECEDING AND CURRENT ROW
RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
```

### Ranking Functions

| Function | Description | Example Effect |
|------|------|----------|
| ROW_NUMBER() | Row number | 1, 2, 3, 4, 5 |
| RANK() | Ranking (with gaps) | 1, 2, 2, 4, 5 |
| DENSE_RANK() | Ranking (no gaps) | 1, 2, 2, 3, 4 |
| PERCENT_RANK() | Percentile ranking | 0, 0.25, 0.25, 0.75, 1 |
| CUME_DIST() | Cumulative distribution | 0.2, 0.6, 0.6, 0.8, 1 |
| NTILE(n) | Bucketing | 1,1,2,2,3 |

### Offset Functions

| Function | Description | Example |
|------|------|------|
| LAG(expr, offset, default) | Get previous value | LAG(salary, 1) OVER (ORDER BY hire_date) |
| LEAD(expr, offset, default) | Get next value | LEAD(salary, 1) OVER (ORDER BY hire_date) |
| FIRST_VALUE(expr) | First value in partition | FIRST_VALUE(salary) OVER (PARTITION BY dept ORDER BY hire_date) |
| LAST_VALUE(expr) | Last value in partition | LAST_VALUE(salary) OVER (...) |
| NTH_VALUE(expr, n) | Nth value in partition | NTH_VALUE(salary, 2) OVER (...) |

### Aggregate Window Functions

All aggregate functions can be used as window functions:

```sql
SELECT name, salary, department,
    SUM(salary) OVER (PARTITION BY department) as dept_total,
    AVG(salary) OVER (PARTITION BY department) as dept_avg,
    SUM(salary) OVER (ORDER BY hire_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total
FROM employees;
```
