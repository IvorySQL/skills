---
title: Ecosystem Extension Components
description: IvorySQL ecosystem extension components reference, covering pgvector, PostGIS, pgAudit and 20+ extensions installation and usage
tags:
  - ecosystem
  - extensions
  - pgvector
  - postgis
---

# Ecosystem Extension Components

IvorySQL is compatible with the PostgreSQL ecosystem and can directly use a large number of third-party extensions. The following summarizes the installation and usage of commonly used extensions.

## Extension Overview

| Extension | Category | Description | Version Required |
|------|------|------|---------|
| `pgvector` | AI/Vector | Vector similarity search | PG 13+ |
| `PostGIS` | GIS | Geospatial data | PG 12+ |
| `pgAudit` | Audit | Session/object-level audit logging | PG 12+ |
| `pg_cron` | Scheduling | Scheduled task execution | PG 12+ |
| `Apache AGE` | Graph Database | Cypher graph queries | PG 12+ |
| `PGroonga` | Full-text Search | Multi-language full-text search | PG 12+ |
| `pg_stat_statements` | Performance | SQL execution statistics | Built-in |
| `pg_trgm` | Search | Fuzzy matching/similarity | Built-in |
| `pgcrypto` | Security | Encryption functions | Built-in |
| `pg_partman` | Partitioning | Automatic partition management | PG 12+ |
| `pg_repack` | Maintenance | Online table reorganization | PG 12+ |
| `pg_background` | Concurrency | Background task execution | PG 12+ |
| `plv8` | Language | JavaScript procedural language | PG 12+ |
| `pgjwt` | Security | JWT token generation | PG 12+ |
| `postgres_fdw` | FDW | PostgreSQL foreign data wrapper | Built-in |
| `oracle_fdw` | FDW | Oracle foreign data wrapper | PG 12+ |
| `mysql_fdw` | FDW | MySQL foreign data wrapper | PG 12+ |
| `tds_fdw` | FDW | SQL Server foreign data wrapper | PG 12+ |
| `pglogical` | Replication | Logical replication | PG 12+ |
| `pgpool-II` | Connection Pool | Connection pool/load balancing | External |
| `Patroni` | HA | High availability management | External |
| `pgBackRest` | Backup | Enterprise backup recovery | External |
| `TimescaleDB` | Time Series | Time series data processing | PG 12+ |

## Installation Methods

### Install from contrib (Built-in Extensions)

```bash
# Compile and install contrib modules
cd ivorysql-source/contrib
make
```
