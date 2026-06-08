---
title: Other Functions Details
description: JSON/XML/aggregate/window/range/full-text search/geometry functions
tags: ivorysql, functions, json, xml, aggregate, window, range, fulltext, geometry
---

# Other Functions Details

In addition to string, datetime, and Oracle compatible functions, IvorySQL provides a rich set of JSON/XML, aggregate, window, range, full-text search, and geometry functions.

## JSON Functions

### JSON Creation and Parsing

| Function | Description | Example |
|------|------|------|
| `to_json(any)` | Convert to JSON | `to_json(row(1, 'hello'))` |
| `to_jsonb(any)` | Convert to JSONB | `to_jsonb(row(1, 'hello'))` |
| `row_to_json(record)` | Row to JSON | `row_to_json(t)` |
| `json_build_object(key, val, ...)` | Build JSON object | `json_build_object('name', 'Alice', 'age', 30)` |
| `jsonb_build_object(key, val, ...)` | Build JSONB object | `jsonb_build_object('name', 'Alice')` |
| `json_build_array(val, ...)` | Build JSON array | `json_build_array(1, 2, 3)` |
| `jsonb_build_array(val, ...)` | Build JSONB array | `jsonb_build_array(1, 2, 3)` |
| `json_object(text[])` | Create from key-value array | `json_object('{a, 1, b, 2}')` |

```sql
-- Create JSON object
SELECT json_build_object(
    'name', 'Alice',
    'age', 30,
    'skills', json_build_array('SQL', 'PL/SQL', 'Java')
);

-- Row to JSON
SELECT row_to_json(employees) FROM employees WHERE id = 1;

-- Query result to JSON array
SELECT json_agg(row_to_json(t))
FROM (SELECT name, salary FROM employees WHERE dept_id = 10) t;
```

### JSON Query and Extraction

| Function/Operator | Description | Example |
|------------|------|------|
| `->` | Get JSON element (JSON type) | `'{"a":1}'::json -> 'a'` |
| `->>` | Get JSON element (text type) | `'{"a":1}'::json ->> 'a'` |
| `#>` | Get by path (JSON type) | `'{"a":{"b":1}}'::json #> '{a,b}'` |
| `#>>` | Get by path (text type) | `'{"a":{"b":1}}'::json #>> '{a,b}'` |
| `json_extract_path(json, keys...)` | Extract by path | `json_extract_path(doc, 'a', 'b')` |
| `json_extract_path_text(json, keys...)` | Extract by path (text) | `json_extract_path_text(doc, 'a', 'b')` |
| `jsonb_path_query(jsonb, path)` | JSONPath query | `jsonb_path_query(doc, '$.items[*].name')` |
| `jsonb_path_query_first(jsonb, path)` | JSONPath first result | `jsonb_path_query_first(doc, '$.name')` |
| `jsonb_path_exists(jsonb, path)` | JSONPath exists | `jsonb_path_exists(doc, '$.items[*]')` |

```sql
-- Extract JSON fields
SELECT data->>'name' AS name,
       data->>'age' AS age
FROM users_json;

-- Nested extraction
SELECT data->'address'->>'city' AS city
FROM users_json;

-- JSONPath query (PG 12+)
SELECT jsonb_path_query(data, '$.orders[*] ? (@.total > 100)')
FROM customers;
```

### JSON Modification

| Function | Description | Example |
|------|------|------|
| `jsonb_set(target, path, new_value)` | Set value at path | `jsonb_set(data, '{name}', '"Bob"')` |
| `jsonb_insert(target, path, new_value)` | Insert value | `jsonb_insert(data, '{tags}', '["new"]')` |
| `jsonb_strip_nulls(jsonb)` | Remove NULL value keys | `jsonb_strip_nulls(data)` |
| ` #- ` | Remove at path | `data #- '{address,zip}'` |

```sql
-- Update JSON field
UPDATE users_json
SET data = jsonb_set(data, '{age}', '31')
WHERE data->>'name' = 'Alice';

-- Add new key
UPDATE users_json
SET data = jsonb_set(data, '{email}', '"alice@example.com"')
WHERE data->>'name' = 'Alice';

-- Remove key
UPDATE users_json
SET data = data - 'temp_field'
WHERE data ? 'temp_field';
```

### JSON Aggregation

| Function | Description | Example |
|------|------|------|
| `json_agg(expr)` | Aggregate to JSON array | `json_agg(name)` |
| `jsonb_agg(expr)` | Aggregate to JSONB array | `jsonb_agg(name)` |
| `json_object_agg(key, value)` | Aggregate to JSON object | `json_object_agg(name, salary)` |
| `jsonb_object_agg(key, value)` | Aggregate to JSONB object | `jsonb_object_agg(name, salary)` |

```sql
-- Aggregate by department as JSON array
SELECT dept_id, json_agg(json_build_object('name', name, 'salary', salary)) AS employees
FROM employees
GROUP BY dept_id;

-- Build key-value mapping
SELECT json_object_agg(name, salary::text) AS salary_map
FROM employees
WHERE dept_id = 10;
```

## XML Functions

### XML Creation

| Function | Description | Example |
|------|------|------|
| `xmlforest(expr AS name, ...)` | Generate XML element sequence | `xmlforest(name AS "Name", salary AS "Salary")` |
| `xmlelement(NAME name, content)` | Generate XML element | `xmlelement(NAME emp, name)` |
| `xmlagg(xml)` | Aggregate XML | `xmlagg(xmlelement(...))` |
| `xmlparse(DOCUMENT str)` | Parse XML string | `xmlparse(DOCUMENT '<root/>')` |
| `xmlserialize(DOCUMENT xml AS text)` | XML to text | `xmlserialize(DOCUMENT xml_col AS text)` |

```sql
-- Generate XML
SELECT xmlelement(NAME employee,
    xmlforest(name AS "Name", salary AS "Salary")
) AS xml_data
FROM employees;

-- Aggregate as XML list
SELECT xmlagg(
    xmlelement(NAME emp,
        xmlforest(name AS "Name", salary AS "Salary")
    )
) AS employees_xml
FROM employees
WHERE dept_id = 10;
```

### XML Query

| Function | Description | Example |
|------|------|------|
| `xpath(expression, xml)` | XPath query | `xpath('/root/name/text()', xml_col)` |
| `xpath_exists(expression, xml)` | XPath exists | `xpath_exists('/root/name', xml_col)` |
| `xml_is_well_formed(text)` | Is valid XML | `xml_is_well_formed('<root/>')` |

```sql
-- XPath query
SELECT xpath('/employee/name/text()', xml_col) AS names
FROM xml_table;

-- Check if node exists
SELECT * FROM xml_table WHERE xpath_exists('/employee/salary', xml_col);
```

## Aggregate Functions

### Basic Aggregation

| Function | Description | Example |
|------|------|------|
| `COUNT(expr)` | Count | `COUNT(*)`, `COUNT(DISTINCT dept_id)` |
| `SUM(expr)` | Sum | `SUM(salary)` |
| `AVG(expr)` | Average | `AVG(salary)` |
| `MAX(expr)` | Maximum | `MAX(salary)` |
| `MIN(expr)` | Minimum | `MIN(hire_date)` |
| `STRING_AGG(expr, delim)` | String aggregation | `STRING_AGG(name, ', ')` |
| `ARRAY_AGG(expr)` | Array aggregation | `ARRAY_AGG(name)` |
| `BOOL_AND(expr)` | All true | `BOOL_AND(is_active)` |
| `BOOL_OR(expr)` | Any true | `BOOL_OR(is_admin)` |
| `BIT_AND(expr)` | Bitwise AND | `BIT_AND(flags)` |
| `BIT_OR(expr)` | Bitwise OR | `BIT_OR(flags)` |

```sql
-- Basic aggregation
SELECT dept_id,
       COUNT(*) AS emp_count,
       AVG(salary) AS avg_salary,
       MIN(salary) AS min_salary,
       MAX(salary) AS max_salary,
       SUM(salary) AS total_salary
FROM employees
GROUP BY dept_id;

-- String aggregation
SELECT dept_id, STRING_AGG(name, ', ' ORDER BY name) AS name_list
FROM employees
GROUP BY dept_id;

-- Array aggregation
SELECT dept_id, ARRAY_AGG(name ORDER BY salary DESC) AS name_array
FROM employees
GROUP BY dept_id;
```

### Statistical Aggregation

| Function | Description |
|------|------|
| `STDDEV(expr)` | Sample standard deviation |
| `STDDEV_POP(expr)` | Population standard deviation |
| `VARIANCE(expr)` | Sample variance |
| `VAR_POP(expr)` | Population variance |
| `COVAR_POP(expr1, expr2)` | Population covariance |
| `COVAR_SAMP(expr1, expr2)` | Sample covariance |
| `CORR(expr1, expr2)` | Correlation coefficient |
| `REGR_SLOPE(expr1, expr2)` | Regression slope |
| `REGR_INTERCEPT(expr1, expr2)` | Regression intercept |
| `REGR_R2(expr1, expr2)` | R-squared value |
| `PERCENTILE_CONT(fraction) WITHIN GROUP (ORDER BY expr)` | Continuous percentile |
| `PERCENTILE_DISC(fraction) WITHIN GROUP (ORDER BY expr)` | Discrete percentile |
| `MODE() WITHIN GROUP (ORDER BY expr)` | Mode |

```sql
-- Statistical analysis
SELECT
    STDDEV(salary) AS salary_stddev,
    VARIANCE(salary) AS salary_variance,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median,
    PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY salary) AS p90,
    MODE() WITHIN GROUP (ORDER BY dept_id) AS most_common_dept
FROM employees;

-- Correlation analysis
SELECT CORR(experience_years, salary) AS correlation
FROM employees;
```

## Window Functions

### Ranking Functions

| Function | Description | Characteristics |
|------|------|------|
| `ROW_NUMBER()` | Row number | No ties, sequential numbering |
| `RANK()` | Ranking | With ties, skips numbers |
| `DENSE_RANK()` | Dense ranking | With ties, no gaps |
| `PERCENT_RANK()` | Percentile ranking | Between 0 and 1 |
| `CUME_DIST()` | Cumulative distribution | Between 0 and 1 |
| `NTILE(n)` | Bucket numbering | Divides into n groups |

```sql
-- Salary ranking
SELECT name, salary, dept_id,
       ROW_NUMBER() OVER (ORDER BY salary DESC) AS row_num,
       RANK() OVER (ORDER BY salary DESC) AS rank_num,
       DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_rank_num
FROM employees;

-- Ranking within department
SELECT name, salary, dept_id,
       ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank
FROM employees;

-- Quartile grouping
SELECT name, salary,
       NTILE(4) OVER (ORDER BY salary) AS quartile
FROM employees;
```

### Offset Functions

| Function | Description | Example |
|------|------|------|
| `LEAD(expr, offset, default)` | Subsequent row | `LEAD(salary, 1) OVER (ORDER BY hire_date)` |
| `LAG(expr, offset, default)` | Previous row | `LAG(salary, 1) OVER (ORDER BY hire_date)` |
| `FIRST_VALUE(expr)` | First value in partition | `FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY hire_date)` |
| `LAST_VALUE(expr)` | Last value in partition | `LAST_VALUE(salary) OVER (...)` |
| `NTH_VALUE(expr, n)` | Nth value | `NTH_VALUE(salary, 2) OVER (...)` |

```sql
-- Month-over-month growth
SELECT month, revenue,
       LAG(revenue, 1) OVER (ORDER BY month) AS prev_revenue,
       revenue - LAG(revenue, 1) OVER (ORDER BY month) AS growth,
       ROUND((revenue - LAG(revenue, 1) OVER (ORDER BY month)) /
             LAG(revenue, 1) OVER (ORDER BY month) * 100, 2) AS growth_pct
FROM monthly_sales;

-- Department highest earner
SELECT DISTINCT dept_id,
       FIRST_VALUE(name) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS top_earner,
       FIRST_VALUE(salary) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS top_salary
FROM employees;
```

### Aggregate Window Functions

| Function | Description |
|------|------|
| `SUM(expr) OVER (...)` | Window sum |
| `AVG(expr) OVER (...)` | Window average |
| `COUNT(expr) OVER (...)` | Window count |
| `MAX(expr) OVER (...)` | Window maximum |
| `MIN(expr) OVER (...)` | Window minimum |

```sql
-- Cumulative sum
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month) AS cumulative_revenue
FROM monthly_sales;

-- Moving average (3 months)
SELECT month, revenue,
       ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2)
       AS moving_avg_3m
FROM monthly_sales;

-- Department salary percentage
SELECT name, dept_id, salary,
       ROUND(salary * 100.0 / SUM(salary) OVER (PARTITION BY dept_id), 2) AS pct_of_dept
FROM employees;
```

### Window Frame Definition

```sql
-- ROWS frame: by physical rows
BETWEEN 2 PRECEDING AND 2 FOLLOWING       -- 2 rows before to 2 rows after
BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  -- From start to current row
BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING  -- From current row to end

-- RANGE frame: by logical value
BETWEEN INTERVAL '30 days' PRECEDING AND CURRENT ROW  -- Within 30 days

-- GROUPS frame: by peer groups
BETWEEN 1 PRECEDING AND 1 FOLLOWING
```

## Range Functions

| Function/Type | Description | Example |
|----------|------|------|
| `int4range(low, high [, bounds])` | Integer range | `int4range(1, 10)` → [1,10) |
| `int8range(low, high [, bounds])` | Big integer range | `int8range(1, 100)` |
| `numrange(low, high [, bounds])` | Numeric range | `numrange(1.0, 10.0)` |
| `daterange(low, high [, bounds])` | Date range | `daterange('2025-01-01', '2025-12-31')` |
| `tsrange(low, high [, bounds])` | Timestamp range | `tsrange('2025-01-01', '2025-12-31')` |
| `tstzrange(low, high [, bounds])` | Timezone-aware timestamp range | `tstzrange(...)` |
| `lower(range)` | Range lower bound | `lower(int4range(1, 10))` → 1 |
| `upper(range)` | Range upper bound | `upper(int4range(1, 10))` → 10 |
| `lower_inc(range)` | Is lower bound inclusive | `lower_inc(int4range(1, 10))` → true |
| `upper_inc(range)` | Is upper bound inclusive | `upper_inc(int4range(1, 10))` → false |
| `range_contains(r, val)` | Contains value | `int4range(1, 10) @> 5` → true |
| `range_overlap(r1, r2)` | Overlaps | `int4range(1,5) && int4range(3,8)` → true |
| `range_adjacent(r1, r2)` | Adjacent | `int4range(1,5) -|- int4range(5,10)` → true |
| `range_union(r1, r2)` | Union | `int4range(1,5) + int4range(3,8)` |
| `range_intersect(r1, r2)` | Intersection | `int4range(1,5) * int4range(3,8)` |

```sql
-- Create range column
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    period daterange,
    name TEXT
);

INSERT INTO schedules VALUES (1, daterange('2025-01-01', '2025-06-30'), 'H1');
INSERT INTO schedules VALUES (2, daterange('2025-07-01', '2025-12-31'), 'H2');

-- Query records containing specific date
SELECT * FROM schedules WHERE period @> DATE '2025-03-15';

-- Query overlapping records
SELECT * FROM schedules s1, schedules s2
WHERE s1.period && s2.period AND s1.id < s2.id;
```

## Full-Text Search Functions

### Text Vectors

| Function | Description | Example |
|------|------|------|
| `to_tsvector(config, text)` | Text to vector | `to_tsvector('english', 'Hello World')` |
| `to_tsquery(config, text)` | Text to query | `to_tsquery('english', 'hello & world')` |
| `plainto_tsquery(config, text)` | Plain text to query | `plainto_tsquery('english', 'hello world')` |
| `phraseto_tsquery(config, text)` | Phrase query | `phraseto_tsquery('english', 'hello world')` |
| `websearch_to_tsquery(config, text)` | Web search style | `websearch_to_tsquery('english', 'hello -world')` |

```sql
-- Full-text search
SELECT title, content
FROM articles
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', 'database performance');

-- With ranking
SELECT title,
       ts_rank(to_tsvector('english', content),
               plainto_tsquery('english', 'database performance')) AS rank
FROM articles
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', 'database performance')
ORDER BY rank DESC;

-- With highlighting
SELECT title,
       ts_headline('english', content,
                   plainto_tsquery('english', 'database performance')) AS headline
FROM articles
WHERE to_tsvector('english', content) @@ plainto_tsquery('english', 'database performance');
```

### GIN Index Acceleration

```sql
-- Create GIN index
CREATE INDEX idx_articles_content ON articles
USING gin(to_tsvector('english', content));

-- Use functional index
CREATE INDEX idx_articles_fts ON articles
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
```

## Geometry Functions

### Basic Geometry Types

| Type | Description | Example |
|------|------|------|
| `point` | Point | `point(1, 2)` |
| `line` | Infinite line | `line(point(0,0), point(1,1))` |
| `lseg` | Line segment | `lseg(point(0,0), point(1,1))` |
| `box` | Rectangle | `box(point(0,0), point(1,1))` |
| `path` | Path | `path(point(0,0), point(1,1), point(2,0))` |
| `polygon` | Polygon | `polygon(point(0,0), point(1,1), point(2,0))` |
| `circle` | Circle | `circle(point(1,1), 5)` |

### Geometry Operation Functions

| Function | Description | Example |
|------|------|------|
| `area(obj)` | Area | `area(circle(point(0,0), 5))` → 78.54 |
| `center(obj)` | Center | `center(box(point(0,0), point(2,2)))` → (1,1) |
| `diameter(circle)` | Diameter | `diameter(circle(point(0,0), 5))` → 10 |
| `radius(circle)` | Radius | `radius(circle(point(0,0), 5))` → 5 |
| `distance(obj1, obj2)` | Distance | `distance(point(0,0), point(3,4))` → 5 |
| `length(obj)` | Length | `length(lseg(point(0,0), point(3,4)))` → 5 |
| `perimeter(obj)` | Perimeter | `perimeter(box(...))` |
| `npoints(path)` | Number of path points | `npoints(path(...))` |

```sql
-- Find points within specified range
SELECT name, location
FROM stores
WHERE location <@ circle(point(121.47, 31.23), 0.05);  -- Within 5km of Shanghai center

-- Calculate distance
SELECT a.name AS from_store,
       b.name AS to_store,
       distance(a.location, b.location) AS dist
FROM stores a, stores b
WHERE a.id < b.id
ORDER BY dist;
```

## Array Functions

| Function | Description | Example |
|------|------|------|
| `array_append(arr, elem)` | Append to end | `array_append(ARRAY[1,2], 3)` → {1,2,3} |
| `array_prepend(elem, arr)` | Prepend | `array_prepend(0, ARRAY[1,2])` → {0,1,2} |
| `array_cat(arr1, arr2)` | Concatenate | `array_cat(ARRAY[1,2], ARRAY[3,4])` → {1,2,3,4} |
| `array_ndims(arr)` | Number of dimensions | `array_ndims(ARRAY[[1,2],[3,4]])` → 2 |
| `array_dims(arr)` | Dimensions as text | `array_dims(ARRAY[[1,2],[3,4]])` → [1:2][1:2] |
| `array_length(arr, dim)` | Length of specified dimension | `array_length(ARRAY[1,2,3], 1)` → 3 |
| `array_remove(arr, elem)` | Remove element | `array_remove(ARRAY[1,2,3], 2)` → {1,3} |
| `array_replace(arr, old, new)` | Replace element | `array_replace(ARRAY[1,2,2], 2, 9)` → {1,9,9} |
| `array_position(arr, elem)` | Element position | `array_position(ARRAY['a','b','c'], 'b')` → 2 |
| `array_positions(arr, elem)` | All positions | `array_positions(ARRAY[1,2,2,3], 2)` → {2,3} |
| `unnest(arr)` | Expand to row set | `unnest(ARRAY[1,2,3])` → three rows |
| `array_agg(expr)` | Aggregate to array | `array_agg(name ORDER BY name)` |

```sql
-- Array operations
SELECT array_append(ARRAY[1,2,3], 4);       -- {1,2,3,4}
SELECT array_remove(ARRAY[1,2,2,3], 2);     -- {1,3}
SELECT unnest(ARRAY['a','b','c']);           -- three rows: a, b, c

-- Array aggregation
SELECT dept_id, array_agg(name ORDER BY salary DESC) AS name_list
FROM employees
GROUP BY dept_id;

-- Array containment query
SELECT * FROM articles WHERE tags @> ARRAY['database'];
```

## Sequence Operation Functions

| Function | Description | Example |
|------|------|------|
| `nextval(seq)` | Get and increment next value | `nextval('my_seq')` |
| `currval(seq)` | Get current session last value | `currval('my_seq')` |
| `lastval()` | Get last value from any sequence | `lastval()` |
| `setval(seq, val)` | Set sequence current value | `setval('my_seq', 100)` |
| `setval(seq, val, is_called)` | Set sequence value and is_called state | `setval('my_seq', 100, false)` |

```sql
-- Use sequence
CREATE SEQUENCE emp_seq START WITH 1000 INCREMENT BY 1;

-- Get next value
SELECT nextval('emp_seq') FROM DUAL;    -- Oracle style
SELECT nextval('emp_seq');               -- PG style

-- Use in INSERT
INSERT INTO employees (id, name) VALUES (nextval('emp_seq'), 'Alice');

-- View current value
SELECT currval('emp_seq');

-- Reset sequence
SELECT setval('emp_seq', 1, false);  -- Next nextval returns 1
```
