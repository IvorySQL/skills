---
title: Date Time Functions Details
description: SYSDATE/CURRENT_DATE/NOW/TO_CHAR/TO_DATE/EXTRACT/ADD_MONTHS/LAST_DAY/TRUNC etc.
tags: ivorysql, functions, datetime, date, timestamp, interval, sysdate, to_char, oracle-compat
---

# Date Time Functions Details

IvorySQL supports both PostgreSQL native date time functions and Oracle-compatible date time functions. In Oracle mode, you can use Oracle-style date functions and syntax.

## PostgreSQL Native Date Time Functions

### Get Current Date Time

| Function | Description | Return Type | Example Result |
|------|------|---------|---------|
| `current_date` | Current date | date | 2025-01-15 |
| `current_time` | Current time (with timezone) | timetz | 10:30:00+08 |
| `current_timestamp` | Current timestamp (with timezone) | timestamptz | 2025-01-15 10:30:00+08 |
| `localtime` | Current time (no timezone) | time | 10:30:00 |
| `localtimestamp` | Current timestamp (no timezone) | timestamp | 2025-01-15 10:30:00 |
| `now()` | Current timestamp (with timezone) | timestamptz | 2025-01-15 10:30:00+08 |
| `transaction_timestamp()` | Transaction start time | timestamptz | same as now() |
| `statement_timestamp()` | Statement start time | timestamptz | - |
| `clock_timestamp()` | Real-time clock | timestamptz | different each call |
| `timeofday()` | Time string | text | Wed Jan 15 10:30:00 2025 CST |

```sql
-- Current date
SELECT current_date;

-- Current timestamp
SELECT now();
SELECT current_timestamp;

-- Precise to statement/transaction time
SELECT statement_timestamp() AS stmt_time,
       transaction_timestamp() AS txn_time,
       clock_timestamp() AS real_time;
```

### Date Time Operations

| Operation | Description | Example |
|------|------|------|
| `date + integer` | Add days to date | `DATE '2025-01-15' + 7` → 2025-01-22 |
| `date - integer` | Subtract days from date | `DATE '2025-01-15' - 7` → 2025-01-08 |
| `date - date` | Date difference in days | `DATE '2025-01-22' - DATE '2025-01-15'` → 7 |
| `timestamp + interval` | Add interval to timestamp | `now() + INTERVAL '1 day'` |
| `timestamp - interval` | Subtract interval from timestamp | `now() - INTERVAL '2 hours'` |
