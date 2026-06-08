---
title: Oracle System Views
description: ALL_/USER_/DBA_ views
tags: ivorysql, oracle, system-views, all_tables, user_tables, dba_views, data-dictionary
---

# Oracle System Views

IvorySQL provides Oracle-style data dictionary views (ALL_/USER_/DBA_ prefixes) in Oracle compatibility mode, allowing applications migrated from Oracle to query data dictionaries without modifying SQL.

## View Category Description

| Prefix | Description | Permission Required |
|------|------|---------|
| `USER_` | Objects owned by the current user | No special permissions |
| `ALL_` | Objects accessible to the current user (including those granted by other users) | No special permissions |
| `DBA_` | All objects in the database | Requires DBA privileges |

## ALL_ Views

ALL_ views return information about all objects accessible to the current user.

### Tables and Columns

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_TABLES` | All tables accessible to the user | OWNER, TABLE_NAME, TABLESPACE_NAME, NUM_ROWS |
| `ALL_TAB_COLUMNS` | Column information for all tables | OWNER, TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, NULLABLE |
| `ALL_TAB_COMMENTS` | Table comments | OWNER, TABLE_NAME, COMMENTS |
| `ALL_COL_COMMENTS` | Column comments | OWNER, TABLE_NAME, COLUMN_NAME, COMMENTS |
| `ALL_ALL_TABLES` | All tables (including IOT) | Same as ALL_TABLES |
| `ALL_OBJECT_TABLES` | All object tables | OWNER, TABLE_NAME |
| `ALL_EXTERNAL_TABLES` | All external tables | OWNER, TABLE_NAME, TYPE_NAME |

### Views

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_VIEWS` | All views | OWNER, VIEW_NAME, TEXT |
| `ALL_MVIEWS` | All materialized views | OWNER, MVIEW_NAME, QUERY |

### Indexes

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_INDEXES` | All indexes | OWNER, INDEX_NAME, TABLE_NAME, UNIQUENESS |
| `ALL_IND_COLUMNS` | Index column information | INDEX_OWNER, INDEX_NAME, COLUMN_NAME, COLUMN_POSITION |
| `ALL_CONSTRAINTS` | All constraints | OWNER, CONSTRAINT_NAME, CONSTRAINT_TYPE, TABLE_NAME |

### Sequences

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_SEQUENCES` | All sequences | SEQUENCE_OWNER, SEQUENCE_NAME, MIN_VALUE, MAX_VALUE, INCREMENT_BY, LAST_NUMBER |

### Stored Procedures and Functions

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_PROCEDURES` | All stored procedures | OWNER, OBJECT_NAME, PROCEDURE_NAME, OBJECT_TYPE |
| `ALL_ARGUMENTS` | Procedure/function parameters | OWNER, OBJECT_NAME, ARGUMENT_NAME, DATA_TYPE, IN_OUT |
| `ALL_SOURCE` | Source code | OWNER, NAME, TYPE, TEXT |

### Triggers

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_TRIGGERS` | All triggers | OWNER, TRIGGER_NAME, TABLE_NAME, TRIGGERING_EVENT, TRIGGER_TYPE |

### Synonyms

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_SYNONYMS` | All synonyms | OWNER, SYNONYM_NAME, TABLE_OWNER, TABLE_NAME |

### Objects

| View Name | Description | Common Columns |
|--------|------|--------|
| `ALL_OBJECTS` | All objects | OWNER, OBJECT_NAME, OBJECT_TYPE, CREATED, LAST_DDL_TIME, STATUS |

## USER_ Views

USER_ views return information about objects owned by the current user, equivalent to a subset of `ALL_` views where `OWNER = CURRENT_USER`.

| View Name | Description | Corresponding ALL_ View |
|--------|------|---------------|
| `USER_TABLES` | Tables owned by the current user | ALL_TABLES |
| `USER_TAB_COLUMNS` | Column information for current user's tables | ALL_TAB_COLUMNS |
| `USER_TAB_COMMENTS` | Table comments for current user | ALL_TAB_COMMENTS |
| `USER_COL_COMMENTS` | Column comments for current user | ALL_COL_COMMENTS |
| `USER_VIEWS` | Current user's views | ALL_VIEWS |
| `USER_INDEXES` | Current user's indexes | ALL_INDEXES |
| `USER_IND_COLUMNS` | Current user's index columns | ALL_IND_COLUMNS |
| `USER_CONSTRAINTS` | Current user's constraints | ALL_CONSTRAINTS |
| `USER_SEQUENCES` | Current user's sequences | ALL_SEQUENCES |
| `USER_PROCEDURES` | Current user's stored procedures | ALL_PROCEDURES |
| `USER_ARGUMENTS` | Current user's procedure parameters | ALL_ARGUMENTS |
| `USER_SOURCE` | Current user's source code | ALL_SOURCE |
| `USER_TRIGGERS` | Current user's triggers | ALL_TRIGGERS |
| `USER_SYNONYMS` | Current user's synonyms | ALL_SYNONYMS |
| `USER_OBJECTS` | Current user's objects | ALL_OBJECTS |
| `USER_TABLESPACES` | Tablespaces accessible to current user | ALL_TABLESPACES |
| `USER_ENCRYPTED_COLUMNS` | Current user's encrypted columns | ALL_ENCRYPTED_COLUMNS |
| `USER_TAB_PRIVS` | Current user's table privileges | ALL_TAB_PRIVS |
| `USER_COL_PRIVS` | Current user's column privileges | ALL_COL_PRIVS |

> **Note**: USER_ views do not include the OWNER column (since it is always the current user). All other columns are identical to the corresponding ALL_ views.

## DBA_ Views

DBA_ views return information about all objects in the entire database and require DBA privileges to query.

| View Name | Description | Common Columns |
|--------|------|--------|
| `DBA_TABLES` | All tables in the database | OWNER, TABLE_NAME, TABLESPACE_NAME, NUM_ROWS |
| `DBA_TAB_COLUMNS` | All table column information | OWNER, TABLE_NAME, COLUMN_NAME, DATA_TYPE |
| `DBA_TAB_COMMENTS` | All table comments | OWNER, TABLE_NAME, COMMENTS |
| `DBA_VIEWS` | All views | OWNER, VIEW_NAME, TEXT |
| `DBA_INDEXES` | All indexes | OWNER, INDEX_NAME, TABLE_NAME |
| `DBA_IND_COLUMNS` | All index columns | INDEX_OWNER, INDEX_NAME, COLUMN_NAME |
| `DBA_CONSTRAINTS` | All constraints | OWNER, CONSTRAINT_NAME, CONSTRAINT_TYPE |
| `DBA_SEQUENCES` | All sequences | SEQUENCE_OWNER, SEQUENCE_NAME |
| `DBA_PROCEDURES` | All stored procedures | OWNER, OBJECT_NAME, OBJECT_TYPE |
| `DBA_SOURCE` | All source code | OWNER, NAME, TYPE, TEXT |
| `DBA_TRIGGERS` | All triggers | OWNER, TRIGGER_NAME, TABLE_NAME |
| `DBA_SYNONYMS` | All synonyms | OWNER, SYNONYM_NAME, TABLE_OWNER, TABLE_NAME |
| `DBA_OBJECTS` | All objects | OWNER, OBJECT_NAME, OBJECT_TYPE, STATUS |
| `DBA_USERS` | All users | USERNAME, USER_ID, ACCOUNT_STATUS, DEFAULT_TABLESPACE |
| `DBA_ROLES` | All roles | ROLE, PASSWORD_REQUIRED |
| `DBA_SYS_PRIVS` | System privileges | GRANTEE, PRIVILEGE, ADMIN_OPTION |
| `DBA_TAB_PRIVS` | Table privileges | GRANTEE, OWNER, TABLE_NAME, PRIVILEGE |
| `DBA_COL_PRIVS` | Column privileges | GRANTEE, OWNER, TABLE_NAME, COLUMN_NAME, PRIVILEGE |
| `DBA_ROLE_PRIVS` | Role privileges | GRANTEE, GRANTED_ROLE, ADMIN_OPTION |
| `DBA_TABLESPACES` | All tablespaces | TABLESPACE_NAME, STATUS, CONTENTS |
| `DBA_DATA_FILES` | Data files | FILE_NAME, TABLESPACE_NAME, BYTES, STATUS |

## Differences from Oracle Native Views

IvorySQL's Oracle compatibility views are implemented on top of PostgreSQL system catalogs, with the following differences:

| Difference | Oracle Native | IvorySQL Compatibility Views | Description |
|--------|------------|------------------|------|
| Data source | Oracle internal dictionary | PG system catalog mapping | Different underlying data structures |
| Column completeness | All columns return values | Some columns may return NULL | Unsupported Oracle feature columns return NULL |
| Object types | Includes Oracle-specific types | Only PG-supported types | Types like CLUSTER, IOT, etc. are not supported |
| OWNER column | Real Oracle user name | PG role name | Different user systems |
| STATUS column | VALID/INVALID | VALID/INVALID (mapped) | PG objects are always VALID |
| LAST_DDL_TIME | Precision to seconds | Approximated from stat_mtime | Time precision may differ |
| NUM_ROWS | Row count from statistics | Based on pg_class.reltuples | Different statistics mechanisms |
| TABLESPACE_NAME | Oracle tablespace name | PG tablespace name | Naming and structural differences |
| CREATED column | Object creation time | Approximated from system catalog | PG does not precisely record creation time |
| PARTITIONED | Whether partitioned | May not be fully supported | Different partitioning mechanisms |

### Unsupported or Partially Supported View Columns

The following Oracle view columns may return NULL or default values in IvorySQL:

- `ALL_TABLES.PCT_FREE` / `PCT_USED` / `INI_TRANS` / `MAX_TRANS` (storage parameters, no PG equivalent)
- `ALL_TAB_COLUMNS.DATA_DEFAULT` (column defaults are represented differently)
- `ALL_INDEXES.PCT_THRESHOLD` / `INCLUDE_COLUMN` (index-organized table specific)
- `DBA_USERS.EXPIRY_DATE` / `LOCK_DATE` (different account management)

## Usage Examples

### Example 1: View all tables for the current user

```sql
SELECT table_name, num_rows
FROM USER_TABLES
ORDER BY table_name;
```

### Example 2: View column information for a table

```sql
SELECT column_name, data_type, data_length, nullable
FROM ALL_TAB_COLUMNS
WHERE table_name = 'EMPLOYEES'
  AND owner = 'HR'
ORDER BY column_id;
```

### Example 3: View table comments

```sql
SELECT table_name, comments
FROM ALL_TAB_COMMENTS
WHERE comments IS NOT NULL
ORDER BY table_name;
```

### Example 4: View indexes and index columns

```sql
SELECT i.index_name, i.table_name, i.uniqueness,
       ic.column_name, ic.column_position
FROM ALL_INDEXES i
JOIN ALL_IND_COLUMNS ic ON i.index_name = ic.index_name AND i.owner = ic.index_owner
WHERE i.table_name = 'EMPLOYEES'
ORDER BY i.index_name, ic.column_position;
```

### Example 5: View all stored procedure source code

```sql
SELECT name, type, line, text
FROM ALL_SOURCE
WHERE owner = 'HR'
  AND type = 'PACKAGE BODY'
  AND name = 'EMP_PKG'
ORDER BY line;
```

### Example 6: Find all invalid objects

```sql
SELECT owner, object_name, object_type, status
FROM ALL_OBJECTS
WHERE status = 'INVALID'
ORDER BY owner, object_type, object_name;
```

### Example 7: DBA views for all users and permissions

```sql
-- View all users
SELECT username, account_status, default_tablespace
FROM DBA_USERS
ORDER BY username;

-- View system privileges
SELECT grantee, privilege, admin_option
FROM DBA_SYS_PRIVS
WHERE grantee = 'HR';

-- View role privileges
SELECT grantee, granted_role
FROM DBA_ROLE_PRIVS
WHERE grantee = 'HR';
```

### Example 8: Query constraint information for a table

```sql
SELECT c.constraint_name, c.constraint_type, c.table_name,
       cc.column_name
FROM ALL_CONSTRAINTS c
JOIN ALL_CONS_COLUMNS cc
  ON c.constraint_name = cc.constraint_name
  AND c.owner = cc.owner
WHERE c.table_name = 'EMPLOYEES'
ORDER BY c.constraint_name, cc.position;
```

### Example 9: Equivalent queries using Oracle-style vs PG native system catalogs

```sql
-- Oracle style
SELECT table_name FROM USER_TABLES;

-- PG native equivalent
SELECT tablename FROM pg_tables WHERE schemaname = current_schema();

-- Oracle style
SELECT column_name, data_type FROM ALL_TAB_COLUMNS WHERE table_name = 'EMP';

-- PG native equivalent
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'emp';
```
