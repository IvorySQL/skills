---
name: IvorySQL Skills
name_for_command: ivorysql-skills
description: |
  IvorySQL database AI assistant skills package. Contains 22 sub-skills covering product overview, deployment, architecture, configuration, security, high availability,
  SQL development, multi-language drivers (Java/Go/Python/C#/Node.js/C/ODBC), Oracle compatibility features, PL/iSQL,
  data migration, toolchain, and more. Built on PostgreSQL kernel, Apache 2.0 open source license.
tags:
  - ivorysql
  - postgresql
  - oracle-compatible
  - database
  - plisql
  - sql
  - migration
  - jdbc
  - python
  - golang
  - csharp
  - nodejs
  - odbc
---

# IvorySQL Skills

## Workflow

Trigger this skill when users ask the following questions:
- What is IvorySQL / differences from PostgreSQL / Oracle
- How to install / deploy IvorySQL
- What sub-skills are available / how to choose
- IvorySQL resources / documentation / community
- IvorySQL Oracle compatibility / PL/iSQL / migration
- IvorySQL development (Java / Python / Go / C# / Node.js / C / ODBC)
- IvorySQL architecture / configuration / security / high availability
- Uncertain about specific direction, need overall understanding

> **Sub-skill routing**: Installation & Deployment → `ivorysql-deployment` | Architecture → `ivorysql-architecture` | Configuration & Tuning → `ivorysql-config` | Security & Compliance → `ivorysql-security` | High Availability → `ivorysql-ha` | Oracle Compatibility → `ivorysql-oracle-compat` | PL/iSQL → `ivorysql-plisql` | SQL Syntax → `ivorysql-sql` | Built-in Functions → `ivorysql-functions` | Data Migration → `ivorysql-migration` | Application Development (end-to-end) → `ivorysql-app-builder` | JDBC → `ivorysql-jdbc` | Python → `ivorysql-python` | Go → `ivorysql-go` | C# → `ivorysql-csharp` | Node.js → `ivorysql-nodejs` | C → `ivorysql-c` | ODBC → `ivorysql-odbc` | FAQ → `ivorysql-faq` | Ecosystem Integration → `ivorysql-ecosystem` | Toolchain → `ivorysql-tools`

## Skills Overview

IvorySQL Skills is a comprehensive AI assistant skill system providing professional guidance across the full lifecycle of the IvorySQL database.

| Category | Sub-skill Count | Coverage |
|----------|----------------|----------|
| **Core Skills** | 6 | Main entry, deployment, architecture, configuration, security, high availability |
| **Development Skills** | 8 | End-to-end development, JDBC, Python, Go, C#, Node.js, C, ODBC |
| **Feature Skills** | 4 | SQL syntax, built-in functions, PL/iSQL, Oracle compatibility |
| **Auxiliary Skills** | 3 | Data migration, FAQ, ecosystem integration, toolchain |

## Core Value

- **Oracle Compatibility**: Dual parser + PL/iSQL + 21 Oracle compatibility features, zero or minimal changes for Oracle migration
- **PG Ecosystem Inheritance**: 100% compatible with PostgreSQL ecosystem, full compatibility with extensions, drivers, and tools
- **Dual Port Operation**: 5432 (PG mode) + 1521 (Oracle mode), dynamic switching without restart
- **Domestic & Autonomous**: Apache 2.0 open source, supports Loongson / ARM / MIPS and other domestic chips

## Applicable Scenarios Quick Reference

| User Role | Recommended Sub-skill |
|-----------|----------------------|
| First-time IvorySQL user | `ivorysql-deployment` → `ivorysql-architecture` → `ivorysql-sql` |
| Oracle developer | `ivorysql-oracle-compat` → `ivorysql-plisql` → `ivorysql-migration` |
| Java development | `ivorysql-jdbc` |
| Python development | `ivorysql-python` |
| Go development | `ivorysql-go` |
| C# / .NET development | `ivorysql-csharp` |
| Node.js development | `ivorysql-nodejs` |
| C / C++ development | `ivorysql-c` |
| Enterprise applications | `ivorysql-app-builder` |
| DBA / Operations | `ivorysql-config` → `ivorysql-security` → `ivorysql-ha` |
| Data migration | `ivorysql-migration` |

## Complete Sub-skill List

### Core Skills (6)

| Skill | Description |
|-------|-------------|
| `ivorysql` | Product overview, version selection, quick start |
| `ivorysql-deployment` | YUM/RPM, source compilation, Docker, K8s/Operator |
| `ivorysql-architecture` | Dual parser, dual port, dual-mode architecture |
| `ivorysql-config` | GUC parameters, memory management, connection configuration |
| `ivorysql-security` | Privilege management, audit logging, TDE transparent encryption |
| `ivorysql-ha` | Backup & recovery, streaming replication, monitoring & alerting |

### Development Skills (8)

| Skill | Description |
|-------|-------------|
| `ivorysql-app-builder` | End-to-end application development (Go/Python/Java + Vue3 + IvorySQL) |
| `ivorysql-jdbc` | Java JDBC 4.2/5.0 (connection pool, transactions, batching, named parameters) |
| `ivorysql-python` | psycopg2/psycopg3, SQLAlchemy, Django, COPY |
| `ivorysql-go` | pgx v5/v6, GORM, connection pool, COPY, context timeout |
| `ivorysql-csharp` | ADO.NET, Dapper, EF Core (async, connection pool) |
| `ivorysql-nodejs` | pg, Sequelize, Prisma, COPY, transactions |
| `ivorysql-c` | libpq, ECPG, large objects, binary cursors |
| `ivorysql-odbc` | ODBC driver configuration, Python/C/Excel cross-language |

### Feature Skills (4)

| Skill | Description |
|-------|-------------|
| `ivorysql-sql` | DDL/DML/DQL/DCL/TCL, DDL triggers, partitioned tables |
| `ivorysql-functions` | String/date/aggregate/window/analytic functions |
| `ivorysql-plisql` | PL/iSQL stored procedures, functions, packages, triggers |
| `ivorysql-oracle-compat` | 21 Oracle compatibility features (VARCHAR2/NUMBER/DUAL/ROWNUM/etc.) |

### Auxiliary Skills (4)

| Skill | Description |
|-------|-------------|
| `ivorysql-migration` | Oracle / MySQL / PostgreSQL → IvorySQL migration plan |
| `ivorysql-faq` | Frequently asked questions, error codes, compatibility Q&A |
| `ivorysql-ecosystem` | ORM integration (SQLAlchemy/Hibernate/GORM/Prisma), recommended extensions |
| `ivorysql-tools` | psql, pgAdmin, DBeaver, Navicat, CliFF, pg_dump |

## Version Information

| Version | PG Kernel | Release Date | Status |
|---------|-----------|--------------|--------|
| **IvorySQL 5.3** | PG 18.3 | 2026-03 | ✅ Latest stable |
| IvorySQL 5.1 | PG 18.1 | 2025-12 | Stable |
| IvorySQL 5.0 | PG 18.0 | 2025-11 | Stable |
| IvorySQL 4.0 | PG 17 | 2024-12 | Stable |

## Reference Resources

- [IvorySQL Official Website](https://ivorysql.org)
- [IvorySQL GitHub](https://github.com/IvorySQL/IvorySQL)
- [IvorySQL Documentation](https://docs.ivorysql.org)

---
