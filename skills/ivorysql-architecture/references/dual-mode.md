---
title: IvorySQL Dual-Mode Design
description: initdb process, dual-mode switching principles, Oracle/PG mode behavior differences
tags: ivorysql, architecture, dual-mode, initdb, mode-switch
---

# IvorySQL Dual-Mode Design

## initdb Process

### Oracle Mode Initialization

```bash
initdb -D /data/ivorysql -m oracle
```

Initialization steps:
1. Create data directory structure
2. Write PG base system catalogs
3. **Install ivorysql_ora plugin**
4. Set `ivorysql.compatible_mode = oracle`
5. Create default database `ivorysql`
6. Install Oracle-compatible system views
7. Set default parser to Oracle Parser

### PG Mode Initialization

```bash
initdb -D /data/ivorysql -m pg
```

Initialization steps:
1. Create data directory structure
2. Write PG base system catalogs
3. **Do not install** ivorysql_ora plugin
4. Set `ivorysql.compatible_mode = pg`
5. Create default database `ivorysql`
6. Use standard PG system views
7. Set default parser to PG Parser

## Mode Switching Principles

### Switching Timing

```
┌──────────────────────────────────────┐
│        Database Instance Start         │
│   (uses default mode from initdb)      │
└──────────────┬───────────────────────┘
               │
       ┌───────┴───────┐
       │  New Session    │
       └───────┬───────┘
               │
    ┌──────────┼──────────┐
    │          │          │
 Oracle Port  PG Port   SET Command
 (1521)      (5432)   Switch Mode
    │          │          │
    ▼          ▼          ▼
 Oracle     PG        Dynamic
 Parser    Parser     Switch
```

### Switching Impact

Mode switching is session-level and does not affect other sessions. After switching:

1. **Parser switch**: Subsequent SQL statements use the corresponding parser.
2. **Function visibility**: Oracle-compatible functions are visible in Oracle mode.
3. **Type availability**: Oracle-specific types such as VARCHAR2 are available in Oracle mode.
4. **Behavior changes**: Case sensitivity, empty string handling, etc.

## ivorysql_ora Plugin

### Feature Scope

| Module | Features |
|--------|----------|
| Data types | VARCHAR2, NUMBER, DATE, BLOB, CLOB, RAW, ROWID |
| Built-in functions | NVL, DECODE, SYSDATE, TO_CHAR, TO_DATE, INSTR, SYS_GUID, etc. |
| System views | ALL_TABLES, DBA_TABLES, USER_TABLES, and other Oracle-compatible views |
| Syntax extension | DUAL, (+) outer join, CONNECT BY, ROWNUM |
| NLS parameters | NLS_DATE_FORMAT, NLS_LANGUAGE, etc. |
| Packages | CREATE PACKAGE / PACKAGE BODY |

### Installation

```bash
# Automatically installed with initdb -m oracle
initdb -D /data/ivorysql -m oracle

# Or install manually
psql -d ivorysql -c "CREATE EXTENSION ivorysql_ora;"
```
