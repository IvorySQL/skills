---
title: PostgreSQL Migration Guide
description: PostgreSQL to IvorySQL migration: seamless migration solutions
tags: ivorysql, migration, postgresql, pg_dump
---

# PostgreSQL Migration Guide

## Migration Methods

### pg_dump/pg_restore (Recommended)

```bash
# Backup PG database
pg_dump -h pg_host -d postgres -Fc -f pg_backup.dump

# Restore in IvorySQL
pg_restore -h ivorysql_host -d ivorysql pg_backup.dump
```

### Logical Replication (Zero Downtime)

```sql
-- On PG side: Create publication
CREATE PUBLICATION migrate_pub FOR ALL TABLES;

-- On IvorySQL side: Create subscription
CREATE SUBSCRIPTION migrate_sub
    CONNECTION 'host=pg_host dbname=postgres user=replicator password=pass'
    PUBLICATION migrate_pub;

-- After data sync completes, switch application connections
```

### pg_upgrade

```bash
# If PG and IvorySQL are on the same machine
pg_upgrade -b /usr/bin -B /usr/local/ivorysql/bin \
    -d /var/lib/pgsql/data -D /var/lib/ivorysql/data
```

## Notes

| Item | Description |
|------|-------------|
| Default database | PG: postgres -> IvorySQL: ivorysql |
| Compatibility mode | Oracle mode recommended for additional features |
| Extensions | Check extension compatibility |
| Encoding | Ensure consistent encoding |
| Version | IvorySQL is based on PG 18, pay attention to compatibility when migrating from lower versions |
