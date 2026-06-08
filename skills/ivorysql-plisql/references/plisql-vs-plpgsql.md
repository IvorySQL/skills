---
title: PL/iSQL vs PL/pgSQL Comparison
description: Syntax differences / migration notes
tags: ivorysql, plisql, plpgsql, comparison, migration, syntax-differences
---

# PL/iSQL vs PL/pgSQL Comparison

IvorySQL supports both PL/iSQL (Oracle compatible) and PL/pgSQL (PostgreSQL native) procedural languages. Understanding the differences between the two is essential for application migration and development.

## Syntax Comparison Table

### Basic Structure

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Syntax Style | Oracle PL/SQL Compatible | PostgreSQL Native |
| Anonymous Block | `DECLARE ... BEGIN ... END; /` | `DO $$ ... $$` or `DO BEGIN ... END; $$` |
| Statement Terminator | `;` + `/` to execute | `;` to execute |
| Comments | `--` single line, `/* */` multi-line | `--` single line, `/* */` multi-line |
| Quoted Identifiers | Double quotes `"name"` | Double quotes `"name"` |

### Variables and Types

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Variable Declaration | `v_name VARCHAR2(100);` | `v_name VARCHAR(100);` |
| Variable Assignment | `:=` or `SELECT INTO` | `:=` or `SELECT INTO` |
| Constant Declaration | `c_val CONSTANT NUMBER := 42;` | `c_val CONSTANT INTEGER := 42;` |
| Anchored Type | `v_name tab.col%TYPE` | `v_name tab.col%TYPE` |
| Row Type | `v_row tab%ROWTYPE` | `v_row tab%ROWTYPE` |
| Boolean Type | `BOOLEAN` | `BOOLEAN` |
| Numeric Types | `NUMBER`, `BINARY_FLOAT`, `BINARY_DOUBLE` | `INTEGER`, `BIGINT`, `NUMERIC`, `REAL`, `DOUBLE PRECISION` |
| Character Types | `VARCHAR2`, `CHAR`, `CLOB` | `VARCHAR`, `CHAR`, `TEXT` |
| Date Types | `DATE` (includes time), `TIMESTAMP` | `DATE` (date only), `TIMESTAMP` |

### Control Structures

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| IF Syntax | `IF ... THEN ... ELSIF ... ELSE ... END IF;` | `IF ... THEN ... ELSIF ... ELSE ... END IF;` |
| CASE Statement | `CASE ... WHEN ... THEN ... END CASE;` | `CASE ... WHEN ... THEN ... END CASE;` |
| Basic LOOP | `LOOP ... EXIT WHEN ... END LOOP;` | `LOOP ... EXIT WHEN ... END LOOP;` |
| WHILE LOOP | `WHILE ... LOOP ... END LOOP;` | `WHILE ... LOOP ... END LOOP;` |
| FOR Loop | `FOR i IN 1..10 LOOP ... END LOOP;` | `FOR i IN 1..10 LOOP ... END LOOP;` |
| Cursor FOR | `FOR rec IN cursor LOOP ... END LOOP;` | `FOR rec IN cursor LOOP ... END LOOP;` |
| CONTINUE | `CONTINUE;` / `CONTINUE WHEN ...;` | `CONTINUE;` / `CONTINUE WHEN ...;` |
| GOTO | Supported | Supported (not recommended) |

### Cursors

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Explicit Cursor Declaration | `CURSOR cur IS SELECT ...;` | `CURSOR cur FOR SELECT ...;` or `CURSOR cur IS SELECT ...;` |
| Parameterized Cursor | `CURSOR cur(p_id NUMBER) IS SELECT ...;` | `CURSOR cur(p_id INTEGER) FOR SELECT ...;` |
| Open Cursor | `OPEN cur;` or `OPEN cur(val);` | `OPEN cur;` or `OPEN cur(val);` |
| Fetch Data | `FETCH cur INTO var;` | `FETCH cur INTO var;` |
| Close Cursor | `CLOSE cur;` | `CLOSE cur;` |
| Cursor Attributes | `cur%FOUND`, `cur%NOTFOUND`, `cur%ISOPEN`, `cur%ROWCOUNT` | `FOUND`, `NOT FOUND` (checked after FETCH) |
| Implicit Cursor Attributes | `SQL%FOUND`, `SQL%ROWCOUNT`, etc. | `FOUND`, `ROW_COUNT`, etc. via GET DIAGNOSTICS |
| REF CURSOR | `TYPE cur_type IS REF CURSOR;` | `REFCURSOR` type |

### Exception Handling

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Exception Block | `EXCEPTION WHEN ... THEN ...` | `EXCEPTION WHEN ... THEN ...` |
| Predefined Exceptions | `NO_DATA_FOUND`, `TOO_MANY_ROWS`, `ZERO_DIVIDE`, etc. | `no_data_found`, `too_many_rows`, `division_by_zero`, etc. |
| Custom Exceptions | `e_name EXCEPTION; PRAGMA EXCEPTION_INIT(e_name, -20001);` | No direct equivalent, use RAISE EXCEPTION |
| Raise Exception | `RAISE e_name;` or `RAISE_APPLICATION_ERROR(-20001, 'msg');` | `RAISE EXCEPTION 'msg';` |
| Error Code | `SQLCODE` | `SQLSTATE` |
| Error Message | `SQLERRM` | `SQLERRM` or use `GET STACKED DIAGNOSTICS` |

### Stored Procedures and Functions

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Create Procedure | `CREATE PROCEDURE name (params) AS ...` | `CREATE PROCEDURE name (params) LANGUAGE plpgsql AS $$ ... $$` |
| Create Function | `CREATE FUNCTION name RETURN type AS ...` | `CREATE FUNCTION name() RETURNS type LANGUAGE plpgsql AS $$ ... $$` |
| Parameter Modes | `IN`, `OUT`, `IN OUT` | `IN`, `OUT`, `INOUT` |
| Return Value | `RETURN expr;` | `RETURN expr;` |
| Language Declaration | Not required (defaults to PL/iSQL) | Requires `LANGUAGE plpgsql` |
| Package | Supported | Not supported |

### Strings and Expressions

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| String Concatenation | `\|\|` operator | `\|\|` operator |
| String Quotes | Single quotes `'text'` | Single quotes `'text'`, or `$$...$$` / `$tag$...$tag$` |
| Empty String | Equals NULL | Not equal to NULL |
| Boolean Expressions | `TRUE`, `FALSE`, `NULL` | `TRUE`, `FALSE`, `NULL` |
| Assignment Operator | `:=` | `:=` |
| Conditional Expressions | `DECODE`, `NVL`, `NVL2` | `CASE WHEN`, `COALESCE`, `NULLIF` |

### Dynamic SQL

| Feature | PL/iSQL | PL/pgSQL |
|------|---------|----------|
| Immediate Execution | `EXECUTE IMMEDIATE sql_str;` | `EXECUTE sql_str;` |
| Execute with Variables | `EXECUTE IMMEDIATE sql_str INTO var USING bind_var;` | `EXECUTE sql_str INTO var USING bind_var;` |
| Dynamic Cursor | `OPEN cur FOR sql_str;` | `OPEN cur FOR EXECUTE sql_str;` |

## Migration Notes

### Oracle → PL/iSQL

1. **Most PL/SQL can be used directly**: IvorySQL's PL/iSQL is designed to maximize Oracle PL/SQL compatibility, most code requires no modification.

2. **Package is supported**: Including Package Specification and Package Body.

3. **Some DBMS packages need manual implementation**:
   - `DBMS_SQL`: Dynamic SQL package (partially compatible)
   - `DBMS_JOB`: Job scheduling (can use pg_cron as alternative)
   - `DBMS_LOB`: Large object operations (partially compatible)
   - `DBMS_PIPE`: Inter-session communication (not compatible)
   - `UTL_FILE`: File operations (not compatible)

4. **Trigger syntax differences**:
   ```sql
   -- Oracle: Statement-level trigger
   CREATE TRIGGER trg_name
   AFTER INSERT ON table_name
   DECLARE
       v_count NUMBER;
   BEGIN
       ...
   END;
   /

   -- IvorySQL: Need to specify FOR EACH STATEMENT/ROW
   CREATE TRIGGER trg_name
   AFTER INSERT ON table_name
   FOR EACH ROW
   DECLARE
       v_count NUMBER;
   BEGIN
       ...
   END;
   /
   ```

5. **Collection type mapping**:
   - Oracle `VARRAY` → IvorySQL `VARRAY` (compatible)
   - Oracle `NESTED TABLE` → IvorySQL nested table (compatible)
   - Oracle `ASSOCIATIVE ARRAY` → IvorySQL associative array (compatible)

### PostgreSQL → PL/pgSQL

1. **PL/pgSQL is fully available in IvorySQL**: Switch to PG mode to use native PL/pgSQL.

2. **Both procedural languages can coexist in the same instance**: Different databases/sessions can use different modes.

3. **Cursor attribute differences**:
   ```sql
   -- PL/iSQL
   IF emp_cur%FOUND THEN ...
   IF SQL%ROWCOUNT > 0 THEN ...

   -- PL/pgSQL
   IF FOUND THEN ...
   GET DIAGNOSTICS v_rowcount = ROW_COUNT;
   IF v_rowcount > 0 THEN ...
   ```

### Key Conversion Points

#### 1. Empty String Behavior

```sql
-- PL/iSQL (Oracle mode): Empty string = NULL
IF v_name = '' THEN ...     -- Never TRUE
IF v_name IS NULL THEN ...  -- Correct approach

-- PL/pgSQL (PG mode): Empty string ≠ NULL
IF v_name = '' THEN ...     -- Can be TRUE
IF v_name IS NULL THEN ...  -- Only when NULL
```

#### 2. Date Types

```sql
-- PL/iSQL: DATE includes date and time
v_date DATE := SYSDATE;  -- 2025-01-15 10:30:00

-- PL/pgSQL: DATE includes date only
v_date DATE := CURRENT_DATE;  -- 2025-01-15
-- Use TIMESTAMP for time
v_ts TIMESTAMP := now();  -- 2025-01-15 10:30:00
```

#### 3. Identifier Case

```sql
-- PL/iSQL: Identifiers preserve case (when unquoted)
CREATE TABLE MyTable (id NUMBER);  -- Created as MYTABLE (uppercase)

-- PL/pgSQL: Identifiers converted to lowercase (when unquoted)
CREATE TABLE MyTable (id INTEGER);  -- Created as mytable (lowercase)
```

#### 4. Parameter Mode Differences

```sql
-- PL/iSQL: IN OUT
CREATE PROCEDURE my_proc(
    p_in   IN NUMBER,
    p_out  OUT NUMBER,
    p_inout IN OUT NUMBER
) AS ...

-- PL/pgSQL: INOUT
CREATE PROCEDURE my_proc(
    p_in   IN INTEGER,
    p_out  OUT INTEGER,
    p_inout INOUT INTEGER
) LANGUAGE plpgsql AS $$ ... $$;
```

## Common Conversion Examples

### Example 1: Anonymous Block Conversion

```sql
-- PL/iSQL
DECLARE
    v_name VARCHAR2(100);
BEGIN
    SELECT name INTO v_name FROM employees WHERE id = 1;
    DBMS_OUTPUT.PUT_LINE('Name: ' || v_name);
END;
/

-- PL/pgSQL
DO $$
DECLARE
    v_name VARCHAR(100);
BEGIN
    SELECT name INTO v_name FROM employees WHERE id = 1;
    RAISE NOTICE 'Name: %', v_name;
END;
$$;
```

### Example 2: Stored Procedure Conversion

```sql
-- PL/iSQL
CREATE OR REPLACE PROCEDURE calc_bonus(
    p_emp_id  IN NUMBER,
    p_bonus   OUT NUMBER
) AS
    v_salary NUMBER;
BEGIN
    SELECT salary INTO v_salary FROM employees WHERE id = p_emp_id;
    p_bonus := v_salary * 0.1;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_bonus := 0;
END;
/

-- PL/pgSQL
CREATE OR REPLACE PROCEDURE calc_bonus(
    p_emp_id  IN INTEGER,
    p_bonus   OUT NUMERIC
) LANGUAGE plpgsql AS $$
DECLARE
    v_salary NUMERIC;
BEGIN
    SELECT salary INTO v_salary FROM employees WHERE id = p_emp_id;
    p_bonus := v_salary * 0.1;
EXCEPTION
    WHEN no_data_found THEN
        p_bonus := 0;
END;
$$;
```

### Example 3: Function Conversion

```sql
-- PL/iSQL
CREATE OR REPLACE FUNCTION get_emp_count(
    p_dept_id IN NUMBER
) RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM employees WHERE dept_id = p_dept_id;
    RETURN v_count;
END;
/

-- PL/pgSQL
CREATE OR REPLACE FUNCTION get_emp_count(
    p_dept_id INTEGER
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM employees WHERE dept_id = p_dept_id;
    RETURN v_count;
END;
$$;
```

### Example 4: Exception Handling Conversion

```sql
-- PL/iSQL
DECLARE
    v_salary NUMBER;
BEGIN
    SELECT salary INTO v_salary FROM employees WHERE id = 99999;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('Not found');
    WHEN TOO_MANY_ROWS THEN
        DBMS_OUTPUT.PUT_LINE('Too many');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

-- PL/pgSQL
DO $$
DECLARE
    v_salary NUMERIC;
BEGIN
    SELECT salary INTO v_salary FROM employees WHERE id = 99999;
EXCEPTION
    WHEN no_data_found THEN
        RAISE NOTICE 'Not found';
    WHEN too_many_rows THEN
        RAISE NOTICE 'Too many';
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END;
$$;
```

### Example 5: Dynamic SQL Conversion

```sql
-- PL/iSQL
DECLARE
    v_sql   VARCHAR2(200);
    v_count NUMBER;
BEGIN
    v_sql := 'SELECT COUNT(*) FROM ' || v_table_name;
    EXECUTE IMMEDIATE v_sql INTO v_count;
    DBMS_OUTPUT.PUT_LINE('Count: ' || v_count);
END;
/

-- PL/pgSQL
DO $$
DECLARE
    v_sql   TEXT;
    v_count INTEGER;
BEGIN
    v_sql := 'SELECT COUNT(*) FROM ' || v_table_name;
    EXECUTE v_sql INTO v_count;
    RAISE NOTICE 'Count: %', v_count;
END;
$$;
```

### Example 6: Cursor Conversion

```sql
-- PL/iSQL
DECLARE
    CURSOR emp_cur IS SELECT name, salary FROM employees;
    v_name   VARCHAR2(100);
    v_salary NUMBER;
BEGIN
    OPEN emp_cur;
    LOOP
        FETCH emp_cur INTO v_name, v_salary;
        EXIT WHEN emp_cur%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(v_name || ': ' || v_salary);
    END LOOP;
    CLOSE emp_cur;
END;
/

-- PL/pgSQL
DO $$
DECLARE
    emp_cur CURSOR FOR SELECT name, salary FROM employees;
    v_name   VARCHAR(100);
    v_salary NUMERIC;
BEGIN
    OPEN emp_cur;
    LOOP
        FETCH emp_cur INTO v_name, v_salary;
        EXIT WHEN NOT FOUND;
        RAISE NOTICE '%: %', v_name, v_salary;
    END LOOP;
    CLOSE emp_cur;
END;
$$;
```

### Example 7: DECODE → CASE WHEN Conversion

```sql
-- PL/iSQL (Oracle function)
SELECT DECODE(status,
    'A', 'Active',
    'I', 'Inactive',
    'D', 'Deleted',
    'Unknown'
) AS status_desc FROM accounts;

-- PL/pgSQL (Standard SQL)
SELECT CASE status
    WHEN 'A' THEN 'Active'
    WHEN 'I' THEN 'Inactive'
    WHEN 'D' THEN 'Deleted'
    ELSE 'Unknown'
END AS status_desc FROM accounts;
```

### Example 8: Mode Switching

```sql
-- Switch to Oracle mode to use PL/iSQL
SET ivorysql.compatible_mode TO oracle;
\parser oracle

-- Now PL/iSQL syntax can be used
CREATE OR REPLACE PACKAGE my_pkg AS
    PROCEDURE my_proc;
END my_pkg;
/

-- Switch to PG mode to use PL/pgSQL
SET ivorysql.compatible_mode TO pg;
\parser pg

-- Now use PL/pgSQL syntax
CREATE OR REPLACE FUNCTION my_func()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    RAISE NOTICE 'Hello from PL/pgSQL';
END;
$$;
```
