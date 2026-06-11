---
name: IvorySQL Product Overview
name_for_command: ivorysql
author: IvorySQL Community
author_url: https://ivorysql.org
description: |
  IvorySQL chief skill entry point. An open-source relational database based on PostgreSQL kernel with Oracle compatibility.
  Applicable scenarios: understanding product features, architecture design, version selection, quick start. For Oracle compatibility, PL/iSQL, migration,
  and other issues, route to the corresponding sub-skills.
---

# IvorySQL Product Overview

## Workflow

Trigger this skill when users ask the following questions:
- What is IvorySQL / differences from PostgreSQL / Oracle
- IvorySQL installation and deployment
- How to choose an IvorySQL version
- IvorySQL architecture principles (dual parser / dual port / dual mode)
- IvorySQL vs PostgreSQL vs Oracle comparison
- What Oracle compatibility features does IvorySQL have
- How to migrate from Oracle / MySQL to IvorySQL
- **Develop applications based on IvorySQL** → route to `ivorysql-app-builder`

> Sub-skill routing: installation/deployment → `ivorysql-deployment` | Oracle compatibility → `ivorysql-oracle-compat` | PL/iSQL → `ivorysql-plisql` | SQL syntax → `ivorysql-sql` | Functions → `ivorysql-functions` | Migration → `ivorysql-migration` | Application development → `ivorysql-app-builder`

## Product Positioning

| Dimension | Description |
|-----------|-------------|
| **Open Source** | Apache 2.0 license, all core code is open source |
| **Oracle Compatibility** | Dual parser + PL/iSQL + 21 Oracle compatibility features |
| **PG Kernel** | Based on PostgreSQL, 100% compatible with PG ecosystem |
| **Localization** | Supports GB18030, adapts to domestic chips such as Loongson/ARM/MIPS |
| **Cloud Native** | Full-stack solutions: Docker/K8s/Operator/Cloud |

## Architecture Highlights: Dual Parser + Dual Port + Dual Mode

```
┌─────────────────────────────────────────────────────────────┐
│                        IvorySQL Architecture                 │
│                                                             │
│   Client Connections                                         │
│   ├── Oracle Compatible Client ──→ Port 1521 ──→ Oracle Parser│
│   └── PostgreSQL Client ──→ Port 5432 ──→ PG Parser          │
│                                                             │
│   Compatibility Modes                                        │
│   ├── Oracle Mode: VARCHAR2/NUMBER/DUAL/(+)/CONNECT BY      │
│   └── PG Mode: Standard PG syntax                            │
│                                                             │
│   Session-level Switching                                    │
│   └── SET ivorysql.compatible_mode TO oracle/pg             │
└─────────────────────────────────────────────────────────────┘
```

**Core Value**:
- Can migrate from Oracle database with **zero or minimal modifications**
- Retains the complete PostgreSQL ecosystem (extensions, tools, drivers)
- Supports **dynamic switching** between Oracle/PG parsers within the same connection

## 21 Oracle Compatibility Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | VARCHAR2/NUMBER | Oracle data types, natively supported |
| 2 | DATE (with time) | Oracle DATE behavior |
| 3 | DUAL pseudo table | `SELECT SYSDATE FROM DUAL` |
| 4 | (+) outer join | Oracle traditional outer join syntax |
| 5 | CONNECT BY | Hierarchical queries (organizational structure) |
| 6 | ROWNUM | Row number pseudo column |
| 7 | ROWID | Row identifier |
| 8 | %TYPE / %ROWTYPE | Type anchoring |
| 9 | OUT parameters | Stored procedure OUT/IN OUT |
| 10 | Package | CREATE PACKAGE / PACKAGE BODY |
| 11 | Invisible columns | INVISIBLE columns |
| 12 | FORCE VIEW | Create views when base tables do not exist |
| 13 | NVL/DECODE/SYSDATE | Oracle built-in functions |
| 14 | SYS_GUID | RAW format GUID |
| 15 | TO_CHAR/TO_DATE/TO_NUMBER | Type conversion functions |
| 16 | ADD_MONTHS/LAST_DAY/TRUNC | Date functions |
| 17 | INSTR/SUBSTR/LPAD | String functions |
| 18 | MERGE INTO | Merge insert/update |
| 19 | Empty string = NULL | Oracle compatible empty string behavior |
| 20 | Nested subprograms | Define functions/procedures within subprograms |
| 21 | GB18030 encoding | Chinese national standard |

## Version Comparison

| Version | PG Kernel | Release Date | Applicable Scenario |
|---------|-----------|--------------|---------------------|
| **IvorySQL 5.3** | PG 18.3 | 2026-03 | ✅ Latest stable release, recommended for production |
| IvorySQL 5.1 | PG 18.1 | 2025-12 | Recent stable release |
| IvorySQL 5.0 | PG 18.0 | 2025-11 | Significant Oracle compatibility enhancements |
| IvorySQL 4.x | PG 17 | 2024-12 | Package support |
| IvorySQL 3.x | PG 16 | 2023 | Legacy version |

## Comparison with PostgreSQL / Oracle

| Feature | IvorySQL | PostgreSQL | Oracle |
|---------|----------|------------|--------|
| License | Apache 2.0 | PostgreSQL | Commercial |
| Oracle Compatibility | ✅ 21 features | ❌ | ✅ Native |
| PL/iSQL | ✅ | ❌ | ❌ (PL/SQL) |
| Dual Port | ✅ 1521+5432 | ❌ 5432 | ❌ 1521 |
| Package | ✅ | ❌ | ✅ |
| PG Extensions | ✅ 100% | ✅ | Partial |
| Default Database | ivorysql | postgres | ORCL |
| Identifier Case | Preserved | Lowercase | Uppercase |

## Quick Start

### Deployment

```bash
# Quick start with Docker
docker run -d --name ivorysql \
    -p 5432:5432 -p 1521:1521 \
    -e POSTGRES_PASSWORD=secret \
    ivorysql/ivorysql:latest

# Connect (Oracle port)
psql -h localhost -p 1521 -U ivorysql ivorysql

# Connect (PG port)
psql -h localhost -p 5432 -U ivorysql ivorysql
```

### Using Oracle Mode

```sql
-- Check current mode
SHOW ivorysql.compatible_mode;

-- Switch to Oracle mode
SET ivorysql.compatible_mode = 'oracle';

-- Oracle syntax test
SELECT SYSDATE FROM DUAL;
SELECT NVL(NULL, 'default') FROM DUAL;
SELECT DECODE(1, 1, 'One', 2, 'Two', 'Other') FROM DUAL;
```

## Sub-skill Navigation

| Scenario | Route to |
|----------|----------|
| **Application Development (End-to-End)** | `ivorysql-app-builder` |
| Installation / Deployment / Docker / K8s | `ivorysql-deployment` |
| Oracle Compatible Syntax / Functions / Types | `ivorysql-oracle-compat` |
| PL/iSQL / Stored Procedures / Package | `ivorysql-plisql` |
| SQL Syntax / DDL / DML / Queries | `ivorysql-sql` |
| Built-in Functions / String / Date / Aggregate | `ivorysql-functions` |
| System Configuration / GUC / Port / Memory | `ivorysql-config` |
| Security / Permissions / Audit / TDE | `ivorysql-security` |
| High Availability / Backup / Replication / Monitoring | `ivorysql-ha` |
| Oracle / MySQL → IvorySQL Migration | `ivorysql-migration` |
| Java JDBC Development | `ivorysql-jdbc` |
| Python psycopg / SQLAlchemy | `ivorysql-python` |
| Go pgx / GORM | `ivorysql-go` |
| C# .NET / EF Core | `ivorysql-csharp` |
| Node.js / Sequelize / Prisma | `ivorysql-nodejs` |
| C libpq / ECPG | `ivorysql-c` |
| ODBC Cross-platform | `ivorysql-odbc` |
| FAQ / Error Codes | `ivorysql-faq` |
| Architecture / Kernel / Dual Parser | `ivorysql-architecture` |
| Ecosystem Integration / ORM / Extensions | `ivorysql-ecosystem` |
| Client Tools / psql / DBeaver | `ivorysql-tools` |

## Reference Documents

- [Product Introduction](references/product-intro.md) — Positioning, advantages, certifications
- [Product Architecture](references/architecture.md) — Dual parser, dual port, dual mode
- [Product Versions](references/product-versions.md) — Version evolution and selection recommendations
- [Core Technology](references/core-technology.md) — Oracle compatibility, PG inheritance, extension ecosystem

---
