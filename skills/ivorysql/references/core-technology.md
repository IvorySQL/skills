---
title: IvorySQL Core Technology
description: Oracle compatibility technology, PG inheritance capabilities, extension ecosystem, security compliance, cloud native
tags: ivorysql, core-technology, oracle-compatibility
---

# Core Technology

## Oracle Compatibility Technology

### Dual Parser

IvorySQL adds an Oracle-compatible parser within the PG kernel, enabling session-level syntax switching:

- Oracle Parser: handles Oracle-specific SQL syntax
- PG Parser: handles standard PostgreSQL syntax
- Both parsers share the same query optimizer and execution engine

### Dual Port

Independent listening ports serve Oracle and PG connections respectively:

- Oracle Port (1521): automatically uses Oracle parser
- PG Port (5432): automatically uses PG parser
- Same instance, data fully shared

### PL/iSQL Procedural Language

PL/iSQL is IvorySQL's proprietary procedural language, compatible with Oracle PL/SQL:

- Supports Oracle anonymous block syntax
- Supports %TYPE and %ROWTYPE
- Supports OUT / IN OUT parameters
- Supports nested subprograms and overloading
- Supports Oracle Package
- Supports CALL syntax

### ivorysql_ora Plugin

Kernel-bound plugin providing Oracle-compatible built-in functions, data types, system views, etc.

## PG Inheritance Capabilities

IvorySQL is based on PostgreSQL and inherits all PG features:

| Feature | Description |
|------|------|
| Async I/O (AIO) | New async I/O subsystem, improves performance in I/O-intensive scenarios |
| pg_upgrade Stats Retention | Retains optimizer statistics during upgrades |
| Skip Scan | Skip scan optimization |
| uuidv7() | Time-ordered UUID |
| Virtual Generated Columns | Computed columns that don't consume storage |
| OAuth Authentication | New OAuth authentication method |
| RETURNING OLD/NEW | DML statements support OLD and NEW references |
| Temporal Constraints | Time range constraints |

## Extension Ecosystem

IvorySQL officially supports 20+ PostgreSQL ecosystem extensions:

| Category | Extensions |
|------|------|
| AI/ML | pgvector, pg_ai_query |
| GIS | PostGIS, pgRouting |
| Security | pgAudit |
| Operations | pg_cron, pg_partman, pgbouncer, system_stats |
| Monitoring | pg_stat_monitor |
| Search | PGroonga, pg_textsearch |
| Replication | wal2json |
| Graph Database | Apache AGE |
| Development | plpgsql_check, ddlx |
| Integration | redis_fdw, pgsql-http, pg_curl |
| Optimization | pg_hint_plan |

## Security Compliance

| Capability | Description |
|------|------|
| Authentication | Password/Certificate/GSSAPI/LDAP/OAuth |
| Access Control | RBAC + Row-Level Security Policies |
| Encryption | SSL/TLS connection encryption + pgcrypto column encryption |
| Auditing | pgAudit extension |
| GB18030 | Chinese national encoding standard support |
| National Crypto | Adapts to national cryptographic algorithms |

## Cloud Native

| Solution | Description |
|------|------|
| Docker/Podman | Single-instance containerization |
| Docker Compose/Swarm | Small-scale orchestration |
| Kubernetes + Helm | Cloud-native deployment |
| IvorySQL Operator | Advanced K8s operations management |
| IvorySQL Cloud | Managed visual control platform
