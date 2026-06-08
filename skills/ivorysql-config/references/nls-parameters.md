---
title: Oracle NLS Compatibility Parameters
description: IvorySQL Oracle NLS parameter compatibility configuration, including date format, timestamp format, numeric format, etc.
tags:
  - config
  - nls
  - oracle-compatible
  - date-format
---

# Oracle NLS Compatibility Parameters

IvorySQL provides Oracle NLS (National Language Support) parameter compatibility to control the display format of dates, timestamps, and numbers.

## NLS Parameter Overview

| Parameter Name | Type | Default | Context | Oracle Equivalent |
|--------|------|--------|--------|------------|
| `ivorysql.nls_date_format` | string | `YYYY-MM-DD` | user | `NLS_DATE_FORMAT` |
| `ivorysql.nls_timestamp_format` | string | `YYYY-MM-DD HH24:MI:SS.FF` | user | `NLS_TIMESTAMP_FORMAT` |
| `ivorysql.nls_timestamp_tz_format` | string | `YYYY-MM-DD HH24:MI:SS.FFTZH:TZM` | user | `NLS_TIMESTAMP_TZ_FORMAT` |
| `ivorysql.nls_numeric_characters` | string | `.,` | user | `NLS_NUMERIC_CHARACTERS` |

## Date Format Parameters

### ivorysql.nls_date_format

Controls the default display and input format for DATE types.

```sql
-- Set Oracle-style date format
SET ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS';

-- Query DATE type automatically displays in format
SELECT SYSDATE;
-- Output: 2024-06-15 14:30:25

-- Change to another format
SET ivorysql.nls_date_format = 'DD/MM/YYYY HH24:MI:SS';
SELECT SYSDATE;
-- Output: 15/06/2024 14:30:25

-- US format
SET ivorysql.nls_date_format = 'MM-DD-YYYY';
SELECT SYSDATE;
-- Output: 06-15-2024

-- Chinese format
SET ivorysql.nls_date_format = 'YYYY"Year"MM"Month"DD"Day"';
SELECT SYSDATE;
-- Output: 2024Year06Month15Day
```

### Date Format Templates

| Template | Meaning | Example |
|------|------|------|
| `YYYY` | 4-digit year | 2024 |
| `YY` | 2-digit year | 24 |
| `MM` | Month (01-12) | 06 |
| `MON` | Month abbreviation | JUN |
| `MONTH` | Month full name | JUNE |
| `DD` | Day (01-31) | 15 |
| `HH24` | 24-hour format | 14 |
| `HH` / `HH12` | 12-hour format | 02 |
| `MI` | Minutes (00-59) | 30 |
| `SS` | Seconds (00-59) | 25 |
| `DAY` | Day full name | SATURDAY |
| `DY` | Day abbreviation | SAT |
| `D` | Day of week (1-7) | 6 |
| `DDD` | Day of year | 167 |
| `WW` | Week of year | 24 |
| `Q` | Quarter | 2 |

### ivorysql.nls_timestamp_format

Controls the default display and input format for TIMESTAMP types.

```sql
-- Set timestamp format (with microseconds)
SET ivorysql.nls_timestamp_format = 'YYYY-MM-DD HH24:MI:SS.FF6';

-- Query TIMESTAMP
SELECT current_timestamp;
-- Output: 2024-06-15 14:30:25.123456

-- Simplified format (without microseconds)
SET ivorysql.nls_timestamp_format = 'YYYY-MM-DD HH24:MI:SS';
SELECT current_timestamp;
-- Output: 2024-06-15 14:30:25

-- Oracle default format
SET ivorysql.nls_timestamp_format = 'DD-MON-RR HH.MI.SS.FF AM';
```

### Additional Timestamp Format Templates

| Template | Meaning | Example |
|------|------|------|
| `FF` | Microseconds (auto precision) | 123456 |
| `FF1` - `FF6` | Specified precision microseconds | FF3 → 123 |
| `RR` | 2-digit year (smart century) | 24 → 2024 |
| `RRRR` | 4-digit year | 2024 |
| `AM` / `PM` | AM/PM indicator | AM |
| `A.M.` / `P.M.` | AM/PM with dots | A.M. |

### ivorysql.nls_timestamp_tz_format

Controls the format for TIMESTAMP WITH TIME ZONE types.

```sql
-- Set timezone-aware timestamp format
SET ivorysql.nls_timestamp_tz_format = 'YYYY-MM-DD HH24:MI:SS.FFTZH:TZM';

SELECT current_timestamp;
-- Output: 2024-06-15 14:30:25.123456+08:00

-- US format
SET ivorysql.nls_timestamp_tz_format = 'DD-MON-RR HH.MI.SS.FF AM TZH:TZM';
```

## Numeric Format Parameters

### ivorysql.nls_numeric_characters

Controls the decimal separator and thousands separator for numbers.

```sql
-- Default (US): comma thousands, dot decimal
SET ivorysql.nls_numeric_characters = '.,';
SELECT TO_CHAR(1234567.89, '999,999,999.99');
-- Output: 1,234,567.89

-- European: dot thousands, comma decimal
SET ivorysql.nls_numeric_characters = ',.';
SELECT TO_CHAR(1234567.89, '999.999.999,99');
-- Output: 1.234.567,89

-- Affects value parsing
SET ivorysql.nls_numeric_characters = '.,';
SELECT TO_NUMBER('1,234.56');  -- 1234.56
```

### Separator Combinations

| Format | Thousands Separator | Decimal Separator | Applicable Region |
|------|-----------|-----------|---------|
| `.,` | `,` | `.` | USA, China, Japan |
| `,.` | `.` | `,` | Germany, France, Spain |
| ` ` | Space | `,` | Sweden, Finland |

## Configuration File Example

```ini
# postgresql.conf - Oracle NLS compatibility configuration

# Date format
ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS'
ivorysql.nls_timestamp_format = 'YYYY-MM-DD HH24:MI:SS.FF6'
ivorysql.nls_timestamp_tz_format = 'YYYY-MM-DD HH24:MI:SS.FFTZH:TZM'

# Numeric format
ivorysql.nls_numeric_characters = '.,'
```

## TO_CHAR / TO_DATE Format Examples

```sql
-- Date to string
SET ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS';

SELECT TO_CHAR(SYSDATE, 'YYYY-MM-DD') FROM DUAL;
-- 2024-06-15

SELECT TO_CHAR(SYSDATE, 'YYYY"Year"MM"Month"DD"Day"') FROM DUAL;
-- 2024Year06Month15Day

SELECT TO_CHAR(SYSDATE, 'DY, DD MON YYYY') FROM DUAL;
-- SAT, 15 JUN 2024

-- String to date
SELECT TO_DATE('2024-06-15', 'YYYY-MM-DD') FROM DUAL;
SELECT TO_DATE('15/06/2024 14:30:00', 'DD/MM/YYYY HH24:MI:SS') FROM DUAL;

-- Number to string
SELECT TO_CHAR(1234567.89, '999,999,999.99') FROM DUAL;
-- 1,234,567.89

SELECT TO_CHAR(1234567.89, 'L999,999,999.99') FROM DUAL;
-- ￥1,234,567.89 (local currency symbol)

-- String to number
SELECT TO_NUMBER('1,234,567.89', '999,999,999.99') FROM DUAL;
-- 1234567.89
```

## Notes

1. NLS parameters affect **display and implicit conversion**, explicit format `TO_CHAR`/`TO_DATE` are not affected
2. Modifying `nls_date_format` does not affect stored data, only the display format when reading
3. Different sessions can set different NLS parameters without affecting each other
4. In application connection pool scenarios, ensure NLS setting consistency across connections
5. `nls_numeric_characters` format must be two characters, first for thousands separator, second for decimal separator
