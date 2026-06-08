---
name: IvorySQL Built-in Function Reference
name_for_command: ivorysql-functions
description: |
  IvorySQL built-in functions complete reference: string functions, math functions, datetime functions,
  aggregate functions, window functions, JSON functions, XML functions, system functions,
  Oracle compatible functions. Includes comparison between PG native functions and Oracle compatible functions.
---

# IvorySQL Built-in Function Reference

IvorySQL inherits the complete function library from PostgreSQL, and also provides Oracle compatible functions through the ivorysql_ora plugin.

## Workflow

This skill is triggered when encountering the following:
- String/math/datetime function queries
- Oracle compatible function usage (NVL/DECODE/SYSDATE, etc.)
- JSON/XML functions
- Aggregate/window functions
- System information functions

**Sub-skill routing**:
- SQL syntax → `ivorysql-sql`
- Oracle compatibility → `ivorysql-oracle-compat`
- JSON function details → `references/system-json.md`

## Function Categories

| Category | PG Native Functions | Oracle Compatible | Description |
|------|:----------:|:-------------:|------|
| String | 50+ | 15+ | Character processing, regex, formatting |
| Math | 30+ | 10+ | Numeric computation, trigonometry, statistics |
| Datetime | 20+ | 10+ | Date operations, formatting, truncation |
| Aggregate | 20+ | 5+ | Grouped statistics, windowing |
| JSON | 15+ | - | JSON processing, path queries |
| XML | 10+ | 5+ | XML processing |
| System | 30+ | 10+ | System information, session, management |
| Crypto | 10+ | - | Hashing, encryption, PGP |

## String Functions

> For details, see: [string-functions](references/string-functions.md)

### Quick Reference

| Function | Description | Example |
|------|------|------|
| LENGTH(str) | String length | LENGTH('Hello') → 5 |
| UPPER(str) | Convert to uppercase | UPPER('hello') → 'HELLO' |
| LOWER(str) | Convert to lowercase | LOWER('HELLO') → 'hello' |
| SUBSTRING(str, pos, len) | Extract substring | SUBSTRING('Hello', 1, 3) → 'Hel' |
| REPLACE(str, old, new) | Replace | REPLACE('Hello', 'l', 'r') → 'Herro' |
| TRIM(str) | Trim whitespace | TRIM('  hi  ') → 'hi' |
| SPLIT_PART(str, delim, n) | Split by delimiter | SPLIT_PART('a,b,c', ',', 2) → 'b' |
| CONCAT(str1, str2, ...) | Concatenate strings | CONCAT('a', 'b') → 'ab' |
| FORMAT(fmt, ...) | Format string | FORMAT('Hello %s', 'World') → 'Hello World' |

### Oracle Compatible String Functions

| Function | Description | PG Equivalent |
|------|------|---------|
| INSTR(str, sub) | Substring position | POSITION(sub IN str) |
| SUBSTR(str, pos, len) | Extract substring | SUBSTRING(str FROM pos FOR len) |
| LPAD / RPAD | Padding | LPAD / RPAD |
| INITCAP | Capitalize first letters | INITCAP |
| NVL(str, default) | Null replacement | COALESCE(str, default) |
| DECODE(expr, ...) | Conditional decoding | CASE WHEN ... END |

## Math Functions

> For details, see: [math-functions](references/datetime-functions.md)

| Function | Description | Example |
|------|------|------|
| ABS(n) | Absolute value | ABS(-5) → 5 |
| ROUND(n, d) | Round | ROUND(3.14159, 2) → 3.14 |
| TRUNC(n, d) | Truncate | TRUNC(3.14159, 2) → 3.14 |
| CEIL / CEILING(n) | Round up | CEIL(3.14) → 4 |
| FLOOR(n) | Round down | FLOOR(3.14) → 3 |
| MOD(m, n) | Modulo | MOD(10, 3) → 1 |
| POWER(m, n) | Exponentiation | POWER(2, 10) → 1024 |
| SQRT(n) | Square root | SQRT(16) → 4 |
| RANDOM() | Random number | RANDOM() → 0~1 |

## Datetime Functions

| Function | Description | Example |
|------|------|------|
| CURRENT_DATE | Current date | CURRENT_DATE → 2024-01-15 |
| CURRENT_TIME | Current time | CURRENT_TIME → 14:30:00 |
| CURRENT_TIMESTAMP | Current timestamp | CURRENT_TIMESTAMP → 2024-01-15 14:30:00+08 |
| NOW() | Current timestamp | Same as CURRENT_TIMESTAMP |
| EXTRACT(field FROM date) | Extract field | EXTRACT(YEAR FROM date) → 2024 |
| DATE_TRUNC(field, date) | Truncate | DATE_TRUNC('month', date) → first of month |
| AGE(date1, date2) | Time interval | AGE(date1, date2) → 1 year 2 months |
| SYSDATE | Oracle current time | SYSDATE → 2024-01-15 14:30:00 |

## Aggregate Functions

| Function | Description |
|------|------|
| COUNT(expr) | Row count |
| SUM(expr) | Sum |
| AVG(expr) | Average |
| MAX(expr) | Maximum |
| MIN(expr) | Minimum |
| STDDEV(expr) | Standard deviation |
| VARIANCE(expr) | Variance |
| STRING_AGG(expr, delim) | String aggregation |
| ARRAY_AGG(expr) | Array aggregation |
| JSON_AGG(expr) | JSON aggregation |
| BOOL_AND(expr) | All true |
| BOOL_OR(expr) | Any true |

## JSON Functions

| Function | Description |
|------|------|
| -> | Get JSON value by key (JSON type) |
| ->> | Get JSON value by key (text type) |
| #> | Get JSON value by path |
| #>> | Get JSON value by path (text) |
| @> | JSON contains |
| <@ | JSON is contained |
| ? | Key exists |
| jsonb_path_query() | JSON path query |
| jsonb_pretty() | Format JSON |
| jsonb_agg() | Aggregate to JSON array |
| jsonb_object_agg() | Aggregate to JSON object |
| to_jsonb() | Convert to JSONB |

## Window Functions

| Function | Description |
|------|------|
| ROW_NUMBER() | Row number |
| RANK() | Ranking (with gaps) |
| DENSE_RANK() | Ranking (no gaps) |
| PERCENT_RANK() | Percentile ranking |
| CUME_DIST() | Cumulative distribution |
| NTILE(n) | Bucketing |
| LAG(expr, offset) | Get previous value |
| LEAD(expr, offset) | Get next value |
| FIRST_VALUE(expr) | First value in window |
| LAST_VALUE(expr) | Last value in window |
| NTH_VALUE(expr, n) | Nth value in window |

## Reference Documents

- [String Functions](references/string-functions.md) — Complete string function reference
- [Math and Date Functions](references/datetime-functions.md) — Math and datetime functions
- [Aggregate and Window Functions](references/string-functions.md) — Aggregate and window functions
- [System and JSON Functions](references/json-xml-functions.md) — System functions, JSON functions, crypto functions
