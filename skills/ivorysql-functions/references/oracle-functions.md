---
title: Oracle Compatible Functions
description: NVL/DECODE/SYSDATE/TO_CHAR/SYS_GUID and other Oracle compatible functions
tags: ivorysql, oracle, functions, nvl, decode, sysdate
---

# Oracle Compatible Functions

## Null Handling

| Function | Description | Example |
|------|------|------|
| NVL(expr1, expr2) | Replace null | NVL(NULL, 'default') → default |
| NVL2(expr1, expr2, expr3) | Conditional null | NVL2(NULL, 'yes', 'no') → no |
| COALESCE(expr1, expr2, ...) | First non-null | Standard SQL, supported by both PG and Oracle |

## Conditional Expressions

| Function | Description | Example |
|------|------|------|
| DECODE(expr, s1, r1, s2, r2, default) | Conditional match | DECODE(1, 1,'A', 2,'B', 'X') → A |

## Date Functions

| Function | Description | Example |
|------|------|------|
| SYSDATE | Current datetime | SELECT SYSDATE FROM DUAL |
| ADD_MONTHS(d, n) | Add/subtract months | ADD_MONTHS(DATE '2025-01-01', 3) |
| LAST_DAY(d) | End of month date | LAST_DAY(DATE '2025-01-15') → 2025-01-31 |
| MONTHS_BETWEEN(d1, d2) | Month difference | MONTHS_BETWEEN(d1, d2) |
| NEXT_DAY(d, weekday) | Next specified weekday | NEXT_DAY(DATE '2025-01-01', 'MON') |
| TRUNC(d, fmt) | Date truncation | TRUNC(SYSDATE, 'MONTH') |
| ROUND(d, fmt) | Date rounding | ROUND(SYSDATE, 'MONTH') |

## Conversion Functions

| Function | Description | Example |
|------|------|------|
| TO_CHAR(expr, fmt) | Format | TO_CHAR(1234.5, '999,999.99') |
| TO_DATE(str, fmt) | String to date | TO_DATE('2025-01-01', 'YYYY-MM-DD') |
| TO_NUMBER(str, fmt) | String to number | TO_NUMBER('1,234', '9,999') |
| TO_TIMESTAMP(str, fmt) | String to timestamp | Oracle format supported |

## String Functions (Oracle Compatible)

| Function | Description |
|------|------|
| INSTR(str, substr, start, occurrence) | Substring position |
| SUBSTR(str, start, len) | Substring extraction |
| RPAD(s, len, pad) / LPAD(s, len, pad) | Left/right padding |
