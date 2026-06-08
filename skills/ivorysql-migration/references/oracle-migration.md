---
title: Oracle to IvorySQL Migration Details
description: Complete guide for Oracle to IvorySQL migration, covering data type mapping, SQL syntax conversion, stored procedure migration (PL/SQL to PL/iSQL), function compatibility
tags:
  - ivorysql
  - migration
  - oracle
  - data-type-mapping
  - plsql
  - plisql
  - syntax-conversion
---

# Oracle to IvorySQL Migration Details

## Overview

IvorySQL's core value lies in Oracle compatibility, making Oracle to IvorySQL migration smoother. This document details key migration tasks including data type mapping, SQL syntax conversion, and stored procedure migration.

## Data Type Mapping

### Basic Data Types

| Oracle Type | IvorySQL Type | Description |
|------------|--------------|------|
| NUMBER(p,s) | numeric(p,s) | Precision numeric |
| NUMBER | numeric | Unspecified precision numeric |
| NUMBER(p) | integer / bigint | Integer |
| BINARY_FLOAT | real | Single-precision float |
| BINARY_DOUBLE | double precision | Double-precision float |
| VARCHAR2(n) | varchar(n) | Variable-length string |
| NVARCHAR2(n) | varchar(n) | Unicode string |
| CHAR(n) | char(n) | Fixed-length string |
| NCHAR(n) | char(n) | Unicode fixed-length |
| CLOB | text | Large text |
| NCLOB | text | Unicode large text |
| BLOB | bytea | Binary large object |
| RAW(n) | bytea | Raw binary |
| LONG RAW | bytea | Long raw binary |
| LONG | text | Long text |
| DATE | timestamp | Date time (Oracle DATE includes time) |
| TIMESTAMP(p) | timestamp(p) | Timestamp |
| TIMESTAMP(p) WITH TZ | timestamptz(p) | Timestamp with timezone |
| INTERVAL YEAR(p) TO MONTH | interval year(p) | Year-month interval |
| INTERVAL DAY(p) TO SECOND(s) | interval day(p) to second(s) | Day-second interval |
| ROWID | text | Row identifier |
| UROWID | text | Universal row identifier |
| XMLTYPE | xml | XML data |
| BOOLEAN | boolean | Boolean (Oracle 23c+) |
