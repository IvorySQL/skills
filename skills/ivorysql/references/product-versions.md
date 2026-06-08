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
| IvorySQL 4.0 | PG 17 | 2024-12 | Package support, 21 Oracle compatibility features |
| IvorySQL 5.0 | PG 18.0 | 2025-11 | Comprehensive upgrade, 10+ ecosystem components, Operator v5 |
| IvorySQL 5.3 | PG 18.3 | 2026-03 | Latest stable release |

## Version Feature Comparison

| Feature | 3.x | 4.0 | 5.0+ |
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

## Selection Recommendations

| Scenario | Recommended Version | Description |
|------|---------|------|
| New Project | 5.3 | Latest stable release, most feature-complete |
| Oracle Migration | 5.0+ | Requires complete Oracle compatibility features |
| PG Replacement | 5.0+ | 100% PG compatible + Oracle compatibility as backup |
| Production Environment | 5.3 | Verified stable release |
| Development & Testing | 5.3 | Latest features
