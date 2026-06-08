---
title: IvorySQL DDL
description: Database/schema/table/index/view/sequence/package management
tags: ivorysql, ddl, create, alter, drop, partition, index, view, sequence, package
---

# IvorySQL DDL

## Database Management

### CREATE DATABASE

```sql
-- Basic syntax
CREATE DATABASE name
    [ WITH ]
    [ OWNER = user_name ]
    [ TEMPLATE = template ]
    [ ENCODING = encoding ]
    [ LC_COLLATE = lc_collate ]
    [ LC_CTYPE = lc_ctype ]
    [ TABLESPACE = tablespace_name ]
    [ ALLOW_CONNECTIONS = allowconn ]
    [ CONNECTION LIMIT = connlimit ]
    [ IS_TEMPLATE = istemplate ];

-- Create database example
CREATE DATABASE mydb
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'zh_CN.UTF-8'
    LC_CTYPE = 'zh_CN.UTF-8'
    TEMPLATE = template0;

-- Specify owner and connection limit
CREATE DATABASE appdb
    OWNER = appuser
    CONNECTION LIMIT = 100;
```

> **Note**: IvorySQL default database is `ivorysql` (not `postgres` like PostgreSQL).

### ALTER DATABASE

```sql
-- Rename database
ALTER DATABASE mydb RENAME TO newdb;

-- Change owner
ALTER DATABASE mydb OWNER TO newowner;
