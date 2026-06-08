---
title: PostgreSQL Built-in Functions
description: Complete PostgreSQL built-in function reference
tags: ivorysql, postgresql, functions, string, math, date, aggregate
---

# PostgreSQL Built-in Functions

## String Functions

| Function | Description | Example |
|------|------|------|
| length(s) | String length | length('hello') → 5 |
| substring(s, start, len) | Extract substring | substring('hello',1,3) → hel |
| concat(s1, s2, ...) | String concatenation | concat('a','b') → ab |
| lower(s) / upper(s) | Case conversion | lower('HELLO') → hello |
| trim(s) | Trim whitespace | trim('  hi  ') → hi |
| replace(s, from, to) | Replace | replace('abc','b','x') → axc |
| position(sub in s) | Substring position | position('ll' in 'hello') → 3 |
| left(s, n) / right(s, n) | Left/right substring | left('hello',3) → hel |
| split_part(s, delim, n) | Split by delimiter | split_part('a,b,c',',',2) → b |
| regexp_matches(s, pattern) | Regex match | Returns array of matched substrings |
| regexp_replace(s, p, r) | Regex replace | Replace by regex pattern |
| format(fmt, ...) | Format string | format('Hello %s', 'World') |
| md5(s) | MD5 hash | Returns 32-character hex string |
| quote_literal(s) | SQL escape | For dynamic SQL construction |

## Math Functions

| Function | Description | Example |
|------|------|------|
| abs(x) | Absolute value | abs(-5) → 5 |
| ceil(x) / floor(x) | Round up/down | ceil(3.2) → 4 |
| round(x, n) | Round | round(3.1415,2) → 3.14 |
| trunc(x, n) | Truncate | trunc(3.1415,2) → 3.14 |
| power(x, y) | Exponentiation | power(2,3) → 8 |
| sqrt(x) | Square root | sqrt(16) → 4 |
| mod(x, y) | Modulo | mod(10,3) → 1 |
| random() | Random number [0,1) | random() → 0.123... |
| ln(x) / log(x) / log(b, x) | Logarithm | log(10,100) → 2 |
| pi() | Pi constant | pi() → 3.14159... |

## Datetime Functions

| Function | Description | Example |
|------|------|------|
| current_date | Current date | current_date → 2025-01-01 |
| current_time | Current time | current_time → 12:30:00 |
| now() | Current timestamp | now() → 2025-01-01 12:30:00+08 |
| age(t1, t2) | Time difference | age(timestamp '2025-01-01', timestamp '2024-01-01') |
| date_part(field, ts) | Extract field | date_part('year', now()) → 2025 |
| date_trunc(field, ts) | Truncate | date_trunc('month', now()) |
| extract(field FROM ts) | Extract field | extract(year from now()) |
| to_char(ts, fmt) | Format timestamp | to_char(now(), 'YYYY-MM-DD') |
| to_date(s, fmt) | String to date | to_date('2025-01-01', 'YYYY-MM-DD') |
| to_timestamp(s, fmt) | String to timestamp | to_timestamp('2025-01-01 12:00', '...') |

## Aggregate Functions

| Function | Description |
|------|------|
| count(*) / count(expr) | Count |
| sum(expr) | Sum |
| avg(expr) | Average |
| min(expr) / max(expr) | Minimum/Maximum |
| array_agg(expr) | Aggregate to array |
| string_agg(expr, delim) | Aggregate to string |
| bool_and(expr) / bool_or(expr) | Boolean aggregation |
| percentile_cont(f) WITHIN GROUP (ORDER BY x) | Continuous percentile |

## Window Functions

| Function | Description |
|------|------|
| row_number() | Row number |
| rank() / dense_rank() | Ranking |
| lag(expr, offset) / lead(expr, offset) | Previous/next row value |
| first_value(expr) / last_value(expr) | First/last row value |
| ntile(n) | Bucket numbering |

## JSON/JSONB Functions

| Function | Description |
|------|------|
| jsonb_path_query(data, path) | JSON path query |
| jsonb_pretty(data) | Format JSON |
| jsonb_array_elements(data) | Expand array |
| jsonb_each(data) | Expand object |
| jsonb_typeof(data) | Value type |
| to_jsonb(value) | Convert to JSONB |
| jsonb_set(target, path, new_value) | Modify JSON |
