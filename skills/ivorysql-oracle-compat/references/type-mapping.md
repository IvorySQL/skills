---
title: IvorySQL Oracle Data Type Mapping
description: Oracle to IvorySQL data type mapping table, migration considerations
tags: ivorysql, oracle-compat, data-types, type-mapping
---

# Oracle Data Type Mapping

## Numeric Types

| Oracle Type | IvorySQL Type | PG Underlying | Description |
|------------|-------------|---------|------|
| NUMBER | NUMBER | numeric | General numeric |
| NUMBER(p) | NUMBER(p) | numeric(p) | Specified precision |
| NUMBER(p,s) | NUMBER(p,s) | numeric(p,s) | Precision + scale |
| BINARY_FLOAT | REAL | real | Single-precision float |
| BINARY_DOUBLE | DOUBLE PRECISION | double precision | Double-precision float |

## Character Types

| Oracle Type | IvorySQL Type | PG Underlying | Description |
|------------|-------------|---------|------|
| VARCHAR2(n) | VARCHAR2 | character varying | Empty string -> NULL |
| NVARCHAR2(n) | VARCHAR | character varying | Unicode characters |
| CHAR(n) | CHAR(n) | character | Fixed-length character |
| NCHAR(n) | CHAR(n) | character | Unicode fixed-length |
| CLOB | CLOB | text | Character large object |
| NCLOB | TEXT | text | Unicode large object |
| LONG | LONG | text | Long text |

## Date Types

| Oracle Type | IvorySQL Type | PG Underlying | Description |
|------------|-------------|---------|------|
| DATE | DATE | timestamp | Includes time portion |
| TIMESTAMP | TIMESTAMP | timestamp | Timestamp |
| TIMESTAMP WITH TZ | TIMESTAMPTZ | timestamptz | With timezone |

## Binary Types

| Oracle Type | IvorySQL Type | PG Underlying | Description |
|------------|-------------|---------|------|
| BLOB | BLOB | bytea | Binary large object |
| RAW(n) | RAW | bytea | Raw binary data |
| LONG RAW | BYTEA | bytea | Long binary |

## Special Types

| Oracle Type | IvorySQL Type | Description |
|------------|-------------|------|
| ROWID | ROWID / TEXT | Row identifier |
| UROWID | TEXT | Universal row identifier |
| XMLTYPE | XML | XML data |
| ANYDATA | JSONB | Arbitrary data |

## Migration Considerations

### DATE Type Differences

Oracle DATE includes both date and time. IvorySQL maps it to TIMESTAMP to maintain consistency.

### NUMBER Precision

When NUMBER has no precision specified, it maps to NUMERIC. It is recommended to specify precision during migration.

### VARCHAR2 Empty String

In Oracle mode, VARCHAR2 treats empty strings as NULL, consistent with Oracle behavior.

### BLOB/CLOB

Oracle BLOB/CLOB is handled via BYTEA/TEXT. Be aware of interface differences during migration.
