---
title: IvorySQL Math and Date Functions
description: Math functions, datetime functions reference
tags: ivorysql, functions, math, date, datetime
---

# IvorySQL Math and Date Functions

## Math Functions

### Basic Operations

| Function | Description | Example |
|------|------|------|
| ABS(n) | Absolute value | ABS(-5) → 5 |
| CEIL(n) / CEILING(n) | Round up | CEIL(3.14) → 4 |
| FLOOR(n) | Round down | FLOOR(3.14) → 3 |
| ROUND(n [, d]) | Round | ROUND(3.14159, 2) → 3.14 |
| TRUNC(n [, d]) | Truncate | TRUNC(3.14159, 2) → 3.14 |
| SIGN(n) | Sign | SIGN(-5) → -1 |
| MOD(m, n) | Modulo | MOD(10, 3) → 1 |

### Power and Logarithms

| Function | Description | Example |
|------|------|------|
| POWER(m, n) | Exponentiation | POWER(2, 10) → 1024 |
| SQRT(n) | Square root | SQRT(16) → 4 |
| CBRT(n) | Cube root | CBRT(27) → 3 |
| EXP(n) | e^n | EXP(1) → 2.718... |
| LN(n) | Natural logarithm | LN(EXP(1)) → 1 |
| LOG(b, n) / LOG(n) | Logarithm | LOG(2, 8) → 3 |
| LOG10(n) | Common logarithm | LOG10(100) → 2 |

### Trigonometric Functions

| Function | Description |
|------|------|
| SIN(n) / COS(n) / TAN(n) | Sine/Cosine/Tangent |
| ASIN(n) / ACOS(n) / ATAN(n) | Inverse trigonometric |
| ATAN2(y, x) | Two-argument arctangent |
| SINH(n) / COSH(n) / TANH(n) | Hyperbolic functions |
| RADIANS(n) / DEGREES(n) | Angle conversion |

### Random and Range

| Function | Description |
|------|------|
| RANDOM() | Random number 0~1 |
| SETSEED(n) | Set random seed |
| MIN_SCALE(n) | Minimum scale |
| NUMERIC_PRECISION(n) | Numeric precision |
| WIDTH_BUCKET(op, b1, b2, count) | Bucketing |

## Datetime Functions

### Get Current Time

| Function | Description | Return Type |
|------|------|----------|
| CURRENT_DATE | Current date | DATE |
| CURRENT_TIME | Current time | TIME WITH TIME ZONE |
| CURRENT_TIMESTAMP | Current timestamp | TIMESTAMPTZ |
| LOCALTIMESTAMP | Local timestamp | TIMESTAMP |
| NOW() | Current timestamp | TIMESTAMPTZ |
| CLOCK_TIMESTAMP() | Real-time timestamp | TIMESTAMPTZ |
| STATEMENT_TIMESTAMP() | Statement start timestamp | TIMESTAMPTZ |
| TRANSACTION_TIMESTAMP() | Transaction start timestamp | TIMESTAMPTZ |
| SYSDATE | Oracle current time | TIMESTAMP |

### Date Arithmetic

| Function/Operator | Description | Example |
|------------|------|------|
| date + integer | Add days | DATE '2024-01-01' + 7 → 2024-01-08 |
| date - integer | Subtract days | DATE '2024-01-08' - 7 → 2024-01-01 |
| date - date | Date difference in days | DATE '2024-01-08' - DATE '2024-01-01' → 7 |
| date + interval | Add interval | DATE '2024-01-01' + INTERVAL '1 month' |
| date + time | Date + time | DATE '2024-01-01' + TIME '10:00' |
| AGE(date1, date2) | Time interval | AGE('2024-03-01', '2023-01-01') → 1 year 2 months |

### Extract and Truncate

| Function | Description | Example |
|------|------|------|
| EXTRACT(field FROM date) | Extract field | EXTRACT(YEAR FROM NOW()) → 2024 |
| DATE_TRUNC(field, date) | Truncate | DATE_TRUNC('month', NOW()) → first of month |
| DATE_PART(field, date) | Extract field (float) | DATE_PART('hour', NOW()) → 14 |
| ISFINITE(date) | Is finite | ISFINITE(NOW()) → true |

### EXTRACT / DATE_PART Fields

| Field | Description |
|------|------|
| YEAR / MONTH / DAY | Year/Month/Day |
| HOUR / MINUTE / SECOND | Hour/Minute/Second |
| QUARTER | Quarter (1-4) |
| WEEK | ISO week |
| DOW | Day of week (0=Sunday) |
| DOY | Day of year (1-366) |
| EPOCH | Unix timestamp |
| TIMEZONE | Timezone offset (seconds) |

### Formatting

| Function | Description | Example |
|------|------|------|
| TO_CHAR(date, fmt) | Date to string | TO_CHAR(NOW(), 'YYYY-MM-DD HH24:MI:SS') |
| TO_DATE(str, fmt) | String to date | TO_DATE('2024-01-01', 'YYYY-MM-DD') |
| TO_TIMESTAMP(str, fmt) | String to timestamp | TO_TIMESTAMP('2024-01-01 12:00', 'YYYY-MM-DD HH24:MI') |

### Oracle Compatible Date Functions

| Function | Description | PG Equivalent |
|------|------|---------|
| SYSDATE | Current datetime | NOW() |
| ADD_MONTHS(d, n) | Add months | d + INTERVAL 'n months' |
| LAST_DAY(d) | End of month | DATE_TRUNC('month', d) + INTERVAL '1 month' - INTERVAL '1 day' |
| NEXT_DAY(d, weekday) | Next specified weekday | - |
| MONTHS_BETWEEN(d1, d2) | Month difference | EXTRACT(YEAR FROM age)*12 + EXTRACT(MONTH FROM age) |
| TRUNC(d, fmt) | Date truncation | DATE_TRUNC |
| ROUND(d, fmt) | Date rounding | - |
| NEW_TIME(d, tz1, tz2) | Timezone conversion | d AT TIME ZONE |
