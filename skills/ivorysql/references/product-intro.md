---
title: IvorySQL Product Introduction
description: IvorySQL product positioning, core advantages, certification information, technology ecosystem
tags: ivorysql, overview, introduction, certification
---

# Product Introduction

## Product Positioning

IvorySQL is an open-source relational database developed based on PostgreSQL with Oracle compatibility, led by HighGo Software.

### Core Advantages

| Advantage | Description |
|------|------|
| **Open Source Core** | Apache 2.0 license, no vendor lock-in, all core code is open source |
| **Oracle Compatibility** | Supports smooth migration from Oracle databases, 19+ compatibility features |
| **100% PG Compatible** | Always fully compatible with the latest PostgreSQL, drop-in replacement |
| **Customizable** | Modular design, customizable compatibility features based on needs |
| **Simple & Easy to Use** | Reduces management overhead, seamless third-party tool integration |
| **HighGo Support** | Commercial support provided by HighGo Software |

### Key Features

- **Dual Parser**: Oracle parser + PostgreSQL parser, session-level dynamic switching
- **Dual Port**: Oracle compatibility port (1521) + PG native port (5432)
- **PL/iSQL**: Procedural language compatible with Oracle PL/SQL
- **ivorysql_ora Plugin**: Provides Oracle-compatible built-in functions, data types, system views
- **GB18030 Support**: Chinese national standard character set

## Technology Ecosystem

Based on the PostgreSQL kernel, IvorySQL inherits the complete PG technology ecosystem:

| Dimension | Capabilities |
|------|------|
| SQL Standard | SQL-92/99/2003/2011, all PG 18 SQL features |
| Data Types | Rich data types: JSON/JSONB/XML/UUID/arrays/ranges/composite types |
| Extension Ecosystem | 20+ officially supported extensions: pgvector/PostGIS/pgAudit/pg_cron, etc. |
| Indexes | B-tree/GIN/GiST/BRIN/Hash/SP-GiST |
| Full-Text Search | Built-in tsvector/tsquery full-text search |
| Replication | Streaming/logical/synchronous/asynchronous replication |
| Security | RBAC/Row-Level Security/TDE/SSL/pgAudit |
| Connection Pool | pgbouncer/pgpool-II |
| Programming Languages | PL/pgSQL, PL/iSQL, PL/Python, PL/Perl, PL/Tcl |

## Core Application Scenarios

- **Enterprise Databases**: ERP, transaction systems, financial systems
- **Oracle Migration**: Smooth transition from Oracle to PG
- **LBS Applications**: Large-scale games, O2O (combined with PostGIS)
- **Data Warehouse & Big Data**: Column store, parallel queries
- **Domestic Substitution**: Information technology application innovation scenarios, adapted to domestic chips and operating systems
- **AI/ML Applications**: Vector search (pgvector)

## Open Source Information

| Project | URL |
|------|------|
| GitHub Main Repository | https://github.com/IvorySQL/IvorySQL |
| Official Documentation | https://docs.ivorysql.org |
| Official Website | https://www.ivorysql.org |
| Gitee Mirror | https://gitee.com/IvorySQL/IvorySQL |
| Docker Repository | https://github.com/IvorySQL/docker_library
