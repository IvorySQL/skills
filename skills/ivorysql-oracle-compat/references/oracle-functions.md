---
title: IvorySQL Oracle-Compatible Functions
description: NVL/DECODE/SYSDATE/TO_CHAR/TO_DATE/SYS_GUID and other Oracle-compatible functions
tags: ivorysql, oracle-compat, functions, nvl, decode, sysdate
---

# Oracle-Compatible Functions

## Null Handling

| Function | Description | Example |
|------|------|------|
| NVL(expr1, expr2) | Replace NULL | NVL(NULL, 'default') -> default |
| NVL2(expr1, expr2, expr3) | Conditional NULL | NVL2(NULL, 'yes', 'no') -> no |

## Conditional Expressions

| Function | Description | Example |
|------|------|------|
| DECODE(expr, s1, r1, ..., default) | Conditional matching | DECODE(1, 1,'A', 2,'B', 'X') -> A |

## Date Functions

| Function | Description |
|------|------|
| SYSDATE | Current date and time |
| ADD_MONTHS(d, n) | Add/subtract months |
| LAST_DAY(d) | Last day of month |
| MONTHS_BETWEEN(d1, d2) | Month difference |
| NEXT_DAY(d, weekday) | Next specified weekday |
| TRUNC(d, fmt) | Date truncation |
| ROUND(d, fmt) | Date rounding |

## Conversion Functions

| Function | Description |
|------|------|
| TO_CHAR(expr, fmt) | Formatting |
| TO_DATE(str, fmt) | String to date |
| TO_NUMBER(str, fmt) | String to numeric |
| TO_TIMESTAMP(str, fmt) | String to timestamp |

## String Functions

| Function | Description |
|------|------|
| INSTR(str, substr, start, n) | Substring position |
| SUBSTR(str, start, len) | Substring extraction |
| RPAD/LPAD(s, len, pad) | Padding |
| RTRIM/LTRIM(s, chars) | Trimming |
| INITCAP(s) | Capitalize first letter |
| TRANSLATE(s, from, to) | Character replacement |

## System Functions

| Function | Description |
|------|------|
| SYS_GUID() | 16-byte RAW GUID |
| SYS_CONTEXT(ns, param) | System context |
| USERENV(param) | Session environment |
| UID / USER | Current user |
