---
title: IvorySQL Product Versions
description: Version evolution, feature comparison, selection recommendations
tags: ivorysql, versions, release
---

# Product Versions

## Version Evolution

| Version | PG Kernel | Release Date | Core Features |
|------|---------|----------|----------|
| IvorySQL 1.x | PG 14 | 2022 | Initial release, basic Oracle compatibility |
| IvorySQL 2.x | PG 15 | 2023 | Enhanced compatibility, PL/iSQL improvements |
| IvorySQL 3.x | PG 16 | 2023 | Stable release, Docker/K8s support |
| IvorySQL 4.x | PG 17 | 2024 | Package support, 21 Oracle compatibility features |
| IvorySQL 5.x | PG 18 | 2025 | Comprehensive upgrade, 10+ ecosystem components, Operator v5 |

## Version Feature Comparison

| Feature | 3.x | 4.x | 5.x |
|------|-----|-----|------|
| PG Kernel | 16 | 17 | 18 |
| Dual Parser | ✅ | ✅ | ✅ |
| Dual Port | ✅ | ✅ | ✅ |
| PL/iSQL | Basic | Enhanced | Complete |
| Package | ❌ | ✅ | ✅ |
| Oracle Data Types | Partial | Complete | Complete |
| Oracle Built-in Functions | 50+ | 80+ | 100+ |
| DUAL Pseudo Table | ✅ | ✅ | ✅ |
| (+) Outer Join | ✅ | ✅ | ✅ |
| CONNECT BY | ✅ | ✅ | ✅ |
| MERGE INTO | ✅ | ✅ | ✅ |
| FORCE VIEW | ❌ | ✅ | ✅ |
| Invisible Columns | ❌ | ✅ | ✅ |
| ROWID | ❌ | ✅ | ✅ |
| %TYPE/%ROWTYPE | ❌ | ✅ | ✅ |
| NLS Parameters | ❌ | ✅ | ✅ |
| Nested Subprograms | ❌ | ✅ | ✅ |
| SYS_GUID | ❌ | ✅ | ✅ |
| Empty String to NULL | ❌ | ✅ | ✅ |
| CALL INTO | ❌ | ✅ | ✅ |
| GB18030 | ✅ | ✅ | ✅ |
| Docker | ✅ | ✅ | ✅ |
| K8s | Basic | ✅ | ✅ |
| Operator | ❌ | ✅ | v5 |
| Cloud | ❌ | ❌ | v5 |
| pgvector | ❌ | ❌ | ✅ |
| PostGIS | ❌ | ❌ | ✅ |
| pgAudit | ❌ | ❌ | ✅ |
| pg_cron | ❌ | ❌ | ✅ |

