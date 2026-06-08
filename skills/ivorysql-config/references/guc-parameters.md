---
title: IvorySQL Extended GUC Parameters
description: Detailed explanation of IvorySQL-specific GUC parameters, including compatibility mode, data types, functions, identifier case, and other parameter configurations
tags:
  - config
  - guc
  - parameters
  - oracle-compatible
---

# IvorySQL Extended GUC Parameters

IvorySQL adds a series of extended parameters on top of PostgreSQL standard GUC parameters to control Oracle compatibility behavior.

## Parameter Overview

| Parameter Name | Type | Default | Context | Description |
|--------|------|--------|--------|------|
| `ivorysql.compatible_mode` | enum | `pg` | superuser | Compatibility mode: `pg` / `oracle` |
| `ivorysql.datatype` | enum | `pg` | user | Data type compatibility: `pg` / `oracle` |
| `ivorysql.function` | enum | `pg` | user | Function compatibility: `pg` / `oracle` |
| `ivorysql.identifier_case` | enum | `lower` | user | Identifier case: `lower` / `upper` / `normal` |
| `ivorysql.emptystring_to_null` | bool | `false` | user | Empty string to NULL |
| `ivorysql.enable_oracle_syntax` | bool | `true` | user | Enable Oracle syntax parsing |
| `ivorysql.enable_oracle_datatype` | bool | `true` | user | Enable Oracle data types |
| `ivorysql.enable_oracle_function` | bool | `true` | user | Enable Oracle compatible functions |
| `ivorysql.nls_date_format` | string | `YYYY-MM-DD` | user | NLS date format |
| `ivorysql.nls_timestamp_format` | string | `YYYY-MM-DD HH24:MI:SS.FF` | user | NLS timestamp format |
| `ivorysql.nls_numeric_characters` | string | `.,` | user | NLS numeric separator |
| `ivorysql.port` | int | `5432` | postmaster | IvorySQL listen port |

## Parameter Details

### ivorysql.compatible_mode

Controls the overall compatibility mode of IvorySQL, the most core parameter.

```sql
-- View current mode
SHOW ivorysql.compatible_mode;

-- Switch to Oracle mode
SET ivorysql.compatible_mode = oracle;

-- Switch to PG mode
SET ivorysql.compatible_mode = pg;

-- Global setting (requires restart)
ALTER SYSTEM SET ivorysql.compatible_mode = oracle;
-- Or in postgresql.conf
-- ivorysql.compatible_mode = oracle
```

**Associated effects**: When setting `compatible_mode = oracle`, it is recommended to also configure:

```sql
SET ivorysql.datatype = oracle;
SET ivorysql.function = oracle;
SET ivorysql.identifier_case = upper;
SET ivorysql.emptystring_to_null = true;
```

### ivorysql.datatype

Controls data type compatibility behavior.

```sql
-- Oracle mode automatically maps types
SET ivorysql.datatype = oracle;

CREATE TABLE test_types (
    id NUMBER,              -- Maps to numeric
    name VARCHAR2(100),     -- Maps to varchar
    created DATE,           -- Maps to timestamp
    data CLOB,              -- Maps to text
    raw_data RAW(16)        -- Maps to bytea
);

-- PG mode uses native types
SET ivorysql.datatype = pg;

CREATE TABLE test_types (
    id numeric,
    name varchar(100),
    created timestamp,
    data text,
    raw_data bytea
);
```

### ivorysql.function

Controls built-in function compatibility behavior.

```sql
-- Oracle mode
SET ivorysql.function = oracle;

SELECT SYSDATE;                    -- Returns current date and time
SELECT NVL(NULL, 'default');      -- Oracle NVL function
SELECT DECODE(1, 1, 'one', 'other');  -- Oracle DECODE
SELECT ADD_MONTHS(SYSDATE, 3);    -- Date plus months
SELECT LAST_DAY(SYSDATE);         -- Last day of month
SELECT TRUNC(SYSDATE);            -- Date truncation

-- PG mode
SET ivorysql.function = pg;

SELECT current_timestamp;         -- PG way to get current time
SELECT COALESCE(NULL, 'default'); -- PG standard
SELECT CASE WHEN 1=1 THEN 'one' ELSE 'other' END;
```

### ivorysql.identifier_case

Controls case conversion behavior for unquoted identifiers.

```sql
-- Uppercase mode (Oracle style)
SET ivorysql.identifier_case = upper;

CREATE TABLE MyTable (MyColumn VARCHAR2(50));
-- Actually stored as MYTABLE (MYCOLUMN)
SELECT * FROM mytable;   -- Success
SELECT * FROM MYTABLE;   -- Success
SELECT * FROM MyTable;   -- Success

-- Lowercase mode (PG default)
SET ivorysql.identifier_case = lower;

CREATE TABLE MyTable (MyColumn VARCHAR(50));
-- Actually stored as mytable (mycolumn)
SELECT * FROM MyTable;   -- Success, auto-converted to lowercase
SELECT * FROM mytable;   -- Success

-- Preserve as-is
SET ivorysql.identifier_case = normal;
-- Identifiers are not case-converted
```

### ivorysql.emptystring_to_null

Controls whether empty strings are automatically converted to NULL, simulating Oracle behavior.

```sql
-- Oracle mode: empty strings equal NULL
SET ivorysql.emptystring_to_null = true;

INSERT INTO test (name) VALUES ('');  -- Stored as NULL
SELECT * FROM test WHERE name IS NULL;  -- Can find the above row
SELECT * FROM test WHERE name = '';     -- Cannot find (empty string converted to NULL, NULL != NULL)

-- PG mode: empty strings are empty strings
SET ivorysql.emptystring_to_null = false;

INSERT INTO test (name) VALUES ('');   -- Stored as empty string
SELECT * FROM test WHERE name = '';    -- Can find
SELECT * FROM test WHERE name IS NULL; -- Cannot find
```

### ivorysql.enable_oracle_syntax

Controls whether Oracle-specific syntax parsing is enabled.

```sql
-- Enable Oracle syntax
SET ivorysql.enable_oracle_syntax = true;

-- Can use Oracle syntax
SELECT * FROM DUAL;
SELECT ROWNUM, t.* FROM employees t WHERE ROWNUM <= 10;
SELECT * FROM employees WHERE salary > ALL (SELECT salary FROM dept_sal);

-- Disable Oracle syntax
SET ivorysql.enable_oracle_syntax = false;

-- Above Oracle syntax will not be parsed
```

### ivorysql.enable_oracle_datatype

Controls whether Oracle-compatible data types are enabled.

```sql
SET ivorysql.enable_oracle_datatype = true;

-- Can use Oracle data types
CREATE TABLE oracle_types (
    num NUMBER(10,2),
    v2  VARCHAR2(200),
    nv2 NVARCHAR2(100),
    dt  DATE,
    c   CLOB,
    b   BLOB,
    r   RAW(32)
);
```

### ivorysql.enable_oracle_function

Controls whether Oracle-compatible functions are enabled.

```sql
SET ivorysql.enable_oracle_function = true;

-- Oracle functions available
SELECT SYSDATE;
SELECT NVL(col, 0);
SELECT DECODE(status, 'A', 'Active', 'I', 'Inactive', 'Unknown');
SELECT INSTR('hello world', 'world');
SELECT SUBSTR('hello world', 1, 5);
SELECT TRUNC(SYSDATE, 'MONTH');
SELECT ADD_MONTHS(SYSDATE, -1);
SELECT LAST_DAY(SYSDATE);
SELECT MONTHS_BETWEEN(date1, date2);
SELECT NEXT_DAY(SYSDATE, 'MONDAY');
SELECT ROUND(123.456, 2);
SELECT TRUNC(123.456, 2);
```

## Configuration File Example

```ini
# postgresql.conf - Oracle compatibility mode configuration

# Core compatibility mode
ivorysql.compatible_mode = oracle
ivorysql.datatype = oracle
ivorysql.function = oracle

# Identifiers and empty strings
ivorysql.identifier_case = upper
ivorysql.emptystring_to_null = true

# Oracle feature switches
ivorysql.enable_oracle_syntax = true
ivorysql.enable_oracle_datatype = true
ivorysql.enable_oracle_function = true

# NLS format
ivorysql.nls_date_format = 'YYYY-MM-DD HH24:MI:SS'
ivorysql.nls_timestamp_format = 'YYYY-MM-DD HH24:MI:SS.FF6'
ivorysql.nls_numeric_characters = '.,'

# Port (Oracle mode commonly uses 1521)
ivorysql.port = 1521
```

## Parameter Combination Recommendations

### Oracle Migration Scenario

```sql
-- postgresql.conf
ivorysql.compatible_mode = oracle
ivorysql.datatype = oracle
ivorysql.function = oracle
ivorysql.identifier_case = upper
ivorysql.emptystring_to_null = true
ivorysql.port = 1521
```

### Pure PostgreSQL Scenario

```sql
-- postgresql.conf
ivorysql.compatible_mode = pg
ivorysql.datatype = pg
ivorysql.function = pg
ivorysql.identifier_case = lower
ivorysql.emptystring_to_null = false
ivorysql.port = 5432
```

### Mixed Scenario

```sql
-- postgresql.conf (base configuration as PG)
ivorysql.compatible_mode = pg
ivorysql.port = 5432

-- Switch in session when needed
SET ivorysql.compatible_mode = oracle;
SET ivorysql.datatype = oracle;
SET ivorysql.function = oracle;
```

## Notes

1. `compatible_mode` is a superuser-level parameter, not recommended for regular users to modify arbitrarily
2. `emptystring_to_null = true` affects all string comparison logic, ensure application compatibility
3. `identifier_case` changes only affect newly created objects, existing objects are not affected
4. Mixing both modes in the same database instance may cause confusion, recommend instance-level unified configuration
5. Some GUC parameter changes require instance restart to take effect
