---
title: Error Code Reference
description: PostgreSQL/IvorySQL SQLSTATE error code classification reference table
tags:
  - faq
  - error-codes
  - sqlstate
  - reference
---

# Error Code Reference

IvorySQL inherits the PostgreSQL SQLSTATE error code system. Error codes are 5 characters: the first two digits represent the category, and the last three digits represent the specific error.

## Error Code Categories

| Category Code | Category Name | Description |
|--------------|---------------|-------------|
| 00 | Successful Completion | Success |
| 01 | Warning | Warning |
| 02 | No Data | No data |
| 03 | SQL Statement Not Yet Complete | SQL not yet complete |
| 08 | Connection Exception | Connection exception |
| 09 | Triggered Action Exception | Triggered action exception |
| 0A | Feature Not Supported | Feature not supported |
| 0B | Invalid Transaction Initiation | Invalid transaction initiation |
| 0F | Locator Exception | Locator exception |
| 0L | Invalid Grantor | Invalid grantor |
| 0P | Invalid Role Specification | Invalid role specification |
| 0Z | Diagnostics Exception | Diagnostics exception |
| 20 | Case Not Found | CASE not found |
| 21 | Cardinality Violation | Cardinality violation |
| 22 | Data Exception | Data exception |
| 23 | Integrity Constraint Violation | Integrity constraint violation |
| 24 | Invalid Cursor State | Invalid cursor state |
| 25 | Invalid Transaction State | Invalid transaction state |
| 26 | Invalid SQL Statement Name | Invalid SQL statement name |
| 27 | Triggered Data Change Violation | Triggered data change violation |
| 28 | Invalid Authorization Specification | Invalid authorization specification |
| 2B | Dependent Privilege Descriptors Still Exist | Dependent privilege descriptors still exist |
| 2D | Invalid Transaction Termination | Invalid transaction termination |
| 2F | SQL Routine Exception | SQL routine exception |
| 34 | Invalid Cursor Name | Invalid cursor name |
| 38 | External Routine Exception | External routine exception |
| 39 | External Routine Invocation Exception | External routine invocation exception |
| 3B | Savepoint Exception | Savepoint exception |
| 3D | Invalid Catalog Name | Invalid catalog name |
| 3F | Invalid Schema Name | Invalid schema name |
| 40 | Transaction Rollback | Transaction rollback |
| 42 | Syntax Error or Access Rule Violation | Syntax error or access rule violation |
| 44 | WITH CHECK OPTION Violation | WITH CHECK OPTION violation |
| 53 | Insufficient Resources | Insufficient resources |
| 54 | Program Limit Exceeded | Program limit exceeded |
| 55 | Object Not In Prerequisite State | Object not in prerequisite state |
| 57 | Operator Intervention | Operator intervention |
| 58 | System Error | System error |
| 72 | Snapshot Failure | Snapshot failure |
| F0 | Configuration File Error | Configuration file error |
| HV | Foreign Data Wrapper Error | FDW error |
| P0 | PL/pgSQL Error | PL/pgSQL error |
| XX | Internal Error | Internal error |

## Common Error Codes

### 08 — Connection Exceptions

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 08001 | sqlclient_unable_to_establish_sqlconnection | Client unable to establish connection | Network failure, incorrect address |
| 08003 | connection_does_not_exist | Connection does not exist | Connection has been dropped |
| 08004 | sqlserver_rejected_establishment_of_sqlconnection | Server rejected connection | pg_hba.conf restriction |
| 08006 | connection_failure | Connection failure | Server shutdown, network interruption |
| 08007 | transaction_resolution_unknown | Transaction state unknown | Transaction state unclear when connection interrupted |

### 22 — Data Exceptions

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 22001 | string_data_right_truncation | String truncation | Data exceeds column length |
| 22003 | numeric_value_out_of_range | Numeric out of range | Value exceeds type range |
| 22004 | null_value_not_allowed | NULL not allowed | Inserting NULL into NOT NULL column |
| 22005 | error_in_assignment | Assignment error | Type mismatch |
| 22008 | datetime_field_overflow | Datetime overflow | Invalid datetime value |
| 22012 | division_by_zero | Division by zero | Divisor is 0 |
| 22021 | character_not_in_repertoire | Character not in repertoire | Encoding mismatch |
| 22023 | invalid_parameter_value | Invalid parameter value | Invalid function argument |
| 22026 | string_data_length_mismatch | String length mismatch | Fixed-length field length error |
| 2202E | array_subscript_error | Array subscript error | Subscript out of bounds |
| 2202H | invalid_tablesample_repeat | Invalid TABLESAMPLE repeat | TABLESAMPLE parameter error |
| 2202G | invalid_text_representation | Invalid text representation | Type conversion failure |
| 2202H | invalid_binary_representation | Invalid binary representation | Binary conversion failure |
| 22P01 | floating_point_exception | Floating point exception | Floating point overflow |
| 22P02 | invalid_text_representation | Invalid text representation | Type conversion error |
| 22P03 | invalid_binary_representation | Invalid binary representation | Binary parsing error |
| 22P04 | bad_copy_file_format | COPY file format error | COPY data format incorrect |
| 22P05 | untranslatable_character | Untranslatable character | Character set conversion failure |
| 22P06 | nonstandard_use_of_escape_character | Nonstandard escape character | LIKE pattern escape issue |

### 23 — Integrity Constraint Violations

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 23001 | restrict_violation | RESTRICT violation | Foreign key RESTRICT delete |
| 23502 | not_null_violation | NOT NULL violation | Inserting NULL into NOT NULL column |
| 23503 | foreign_key_violation | Foreign key violation | Referencing non-existent value |
| 23505 | unique_violation | Unique constraint violation | Duplicate key value |
| 23514 | check_violation | CHECK constraint violation | Violates CHECK condition |
| 23P01 | exclusion_violation | Exclusion constraint violation | Violates EXCLUSION constraint |

### 42 — Syntax Errors or Access Rule Violations

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 42000 | syntax_error_or_access_rule_violation | Syntax or access error | General category |
| 42601 | syntax_error | Syntax error | Incorrect SQL syntax |
| 42501 | insufficient_privilege | Insufficient privilege | No permission to perform operation |
| 42602 | invalid_name | Invalid name | Illegal identifier |
| 42611 | invalid_column_definition | Invalid column definition | Column definition error |
| 42622 | name_too_long | Name too long | Exceeds identifier length limit |
| 42701 | duplicate_column | Duplicate column | Column name duplicate in same table |
| 42702 | ambiguous_column | Ambiguous column | Multi-table same column without qualifier |
| 42703 | undefined_column | Undefined column | Column does not exist |
| 42704 | undefined_object | Undefined object | Object does not exist |
| 42710 | duplicate_object | Duplicate object | Object already exists |
| 42712 | duplicate_alias | Duplicate alias | Duplicate alias in FROM clause |
| 42723 | duplicate_function | Duplicate function | Function signature already exists |
| 42725 | ambiguous_function | Ambiguous function | Function overload match is ambiguous |
| 42803 | grouping_error | Grouping error | Non-aggregate column without GROUP BY |
| 42804 | datatype_mismatch | Data type mismatch | Type inconsistency |
| 42809 | wrong_object_type | Wrong object type | Object type mismatch |
| 42830 | foreign_key_violation | Foreign key attribute mismatch | Foreign key type mismatch |
| 42846 | cannot_coerce | Cannot coerce | Type cannot be implicitly converted |
| 42883 | undefined_function | Undefined function | Function does not exist |
| 428C9 | invalid_foreign_key | Invalid foreign key | Foreign key definition error |
| 42939 | reserved_name | Reserved name | Using system reserved identifier |
| 42P01 | undefined_table | Undefined table | Table does not exist |
| 42P02 | undefined_parameter | Undefined parameter | Function parameter does not exist |
| 42P03 | duplicate_cursor | Duplicate cursor | Cursor already exists |
| 42P04 | duplicate_database | Duplicate database | Database already exists |
| 42P05 | duplicate_prepared_statement | Duplicate prepared statement | PREPARE name already exists |
| 42P06 | duplicate_schema | Duplicate schema | Schema already exists |
| 42P07 | duplicate_table | Duplicate table | Table already exists |
| 42P10 | invalid_column_reference | Invalid column reference | ORDER BY column reference error |
| 42P12 | invalid_database_definition | Invalid database definition | CREATE DATABASE parameter error |
| 42P13 | invalid_function_definition | Invalid function definition | CREATE FUNCTION parameter error |
| 42P15 | invalid_schema_definition | Invalid schema definition | CREATE SCHEMA parameter error |
| 42P16 | invalid_table_definition | Invalid table definition | CREATE TABLE parameter error |
| 42P17 | invalid_object_definition | Invalid object definition | Object definition error |
| 42P18 | indeterminate_datatype | Indeterminate datatype | Cannot infer type |
| 42P19 | indeterminate_collation | Indeterminate collation | Collation unknown |
| 42P20 | windowing_error | Windowing error | Window function misuse |
| 42P21 | collation_mismatch | Collation mismatch | Multiple collation conflicts |
| 42P22 | indeterminate_collation | Indeterminate collation | Collation inference failed |

### 53 — Insufficient Resources

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 53000 | insufficient_resources | Insufficient resources | System resources exhausted |
| 53100 | disk_full | Disk full | Insufficient disk space |
| 53200 | out_of_memory | Out of memory | Memory allocation failure |
| 53300 | too_many_connections | Too many connections | Exceeds max_connections |

### 55 — Object State Not Satisfied

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 55000 | object_not_in_prerequisite_state | Object not in prerequisite state | Object state incorrect |
| 55006 | object_in_use | Object in use | Cannot modify object in use |
| 55P02 | cant_change_runtime_param | Cannot change runtime parameter | Parameter cannot be modified dynamically |
| 55P03 | lock_not_available | Lock not available | NOWAIT lock acquisition failed |

### 57 — Operator Intervention

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 57000 | operator_intervention | Operator intervention | Administrator action |
| 57014 | query_canceled | Query canceled | User cancellation or timeout |
| 57P01 | admin_shutdown | Admin shutdown | Administrator shut down server |
| 57P02 | crash_shutdown | Crash shutdown | Server crash |
| 57P03 | cannot_connect_now | Cannot connect now | Server is starting up |
| 57P04 | database_dropped | Database dropped | Connected database was dropped |

### 58 — System Errors

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| 58000 | system_error | System error | Operating system level error |
| 58030 | io_error | IO error | Disk IO failure |
| 58P01 | undefined_file | Undefined file | File does not exist |
| 58P02 | duplicate_file | Duplicate file | File already exists |

### XX — Internal Errors

| Error Code | Name | Description | Common Cause |
|------------|------|-------------|--------------|
| XX000 | internal_error | Internal error | Database internal bug |
| XX001 | data_corrupted | Data corrupted | Storage layer data corruption |
| XX002 | index_corrupted | Index corrupted | Index data inconsistency |

## Querying Error Information

```sql
-- Catch exceptions in PL/pgSQL
DO $$
BEGIN
    INSERT INTO test VALUES (1);
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Duplicate key: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %, SQLSTATE: %', SQLERRM, SQLSTATE;
END $$;

-- Get recent error information
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

## Application-Layer Error Handling

```python
# Python psycopg2 error handling
import psycopg2
from psycopg2 import errors

try:
    conn = psycopg2.connect("dbname=mydb")
    cur = conn.cursor()
    cur.execute("INSERT INTO test VALUES (1)")
except errors.UniqueViolation as e:
    print(f"Duplicate key: {e}")
except errors.ForeignKeyViolation as e:
    print(f"Foreign key error: {e}")
except errors.SyntaxError as e:
    print(f"SQL syntax error: {e}")
except psycopg2.Error as e:
    print(f"Database error: {e.pgcode} - {e.pgerror}")
finally:
    conn.close()
```

```java
// Java JDBC error handling
try {
    Statement stmt = conn.createStatement();
    stmt.execute("INSERT INTO test VALUES (1)");
} catch (SQLException e) {
    String sqlState = e.getSQLState();
    switch (sqlState) {
        case "23505":  // unique_violation
            System.out.println("Duplicate key");
            break;
        case "23503":  // foreign_key_violation
            System.out.println("Foreign key violation");
            break;
        case "42601":  // syntax_error
            System.out.println("SQL syntax error");
            break;
        default:
            System.out.println("Error: " + sqlState + " - " + e.getMessage());
    }
}
```

## Notes

1. SQLSTATE error codes follow the SQL standard; IvorySQL/PostgreSQL additional error codes end with P
2. Applications should classify errors based on SQLSTATE rather than error message text
3. Internal errors (XX category) should be reported to the database administrator or filed as bugs
4. Error codes can be statistically analyzed via `pg_stat_statements` or logs
