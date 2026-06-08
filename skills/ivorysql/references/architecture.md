---
title: IvorySQL Product Architecture
description: Dual parser architecture, dual port architecture, dual mode design, ivorysql_ora plugin architecture
tags: ivorysql, architecture, dual-parser, dual-port
---

# Product Architecture

## Overall Architecture

IvorySQL has been deeply transformed on top of the PostgreSQL kernel, with core innovations in the **dual parser architecture** and **dual mode compatibility framework**.

### Architecture Diagram

```
Client Connections
    │
    ├── PG Port (5432) ──→ PostgreSQL Parser
    │                         │
    └── Oracle Port (1521) ──→ Oracle Parser
                              │
                    ┌─────────┴─────────┐
                    │ Query Analysis    │
                    │   & Rewrite       │
                    │ (GUC controlled)  │
                    ├───────────────────┤
                    │ Query Optimizer   │
                    │   (CBO)           │
                    ├───────────────────┤
                    │ Execution Engine  │
                    ├───────────────────┤
                    │ Storage Engine    │
                    │ (Buffer/WAL/Table)│
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │ ivorysql_ora      │
                    │ Plugin            │
                    │ (Func/Type/View/  │
                    │  Package)         │
                    └───────────────────┘
```

## Dual Parser Architecture

### Oracle Parser

- Parses Oracle-compatible SQL syntax
- Supports PL/SQL, DUAL, (+) outer join, CONNECT BY, etc.
- Automatically activated in Oracle mode
- Manually switched via `\parser oracle` command

### PostgreSQL Parser

- Parses standard PostgreSQL SQL syntax
- Fully compatible with PG syntax
- Default parser
- Manually switched via `\parser pg` command

### Parser Switching Rules

| Connection Method | Default Parser | Switch Method |
|----------|-----------|---------|
| PG Port (5432) | PG Parser | `\parser oracle` |
| Oracle Port (1521) | Oracle Parser | `\parser pg` |
| GUC Parameter | Based on compatible_mode | SET ivorysql.compatible_mode |

## Dual Port Architecture

### Port Description

| Port | Default | Protocol | Parser |
|------|--------|------|--------|
| PG Native Port | 5432 | PostgreSQL Protocol | PG Parser |
| Oracle Compatibility Port | 1521 | PostgreSQL Protocol | Oracle Parser |

### Configuration

```ini
# postgresql.conf
port = 5432                    # PG port

# Oracle port requires compile-time enable
# ./configure --with-oraport=1521
# Then configure
# ivorysql.port = 1521
```

### Dual Port Advantages

- Single instance serves both PG and Oracle-style connections simultaneously
- Data fully shared, no data synchronization needed
- Smooth migration: Oracle apps connect to 1521, PG apps connect to 5432
- Gradual migration: no need to switch all applications at once

## ivorysql_ora Plugin

ivorysql_ora is an IvorySQL kernel-bound plugin providing Oracle compatibility capabilities:

| Module | Functionality |
|------|------|
| Compatible Data Types | VARCHAR2, NUMBER, DATE, BLOB, CLOB, etc. |
| Compatible Built-in Functions | NVL, DECODE, SYSDATE, TO_CHAR, SYS_GUID, etc. |
| Compatible System Views | ALL_TABLES, USER_TABLES, DBA_OBJECTS, etc. |
| Compatible Syntax | DUAL, (+) outer join, CONNECT BY, MERGE INTO, etc. |
| Package | CREATE PACKAGE / PACKAGE BODY |
| NLS Parameters | NLS_DATE_FORMAT, NLS_TIMESTAMP_FORMAT, etc.
