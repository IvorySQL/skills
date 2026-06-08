---
title: IvorySQL Python Connection Management
description: psycopg2/psycopg3 connections, connection pooling, async operations
tags: ivorysql, python, connection, psycopg, pool, async
---

# IvorySQL Python Connection Management

## Connection Strings

```
dbname=ivorysql user=ivorysql password=secret host=localhost port=5432
```

or URL format:

```
postgresql://ivorysql:secret@localhost:5432/ivorysql
```

## psycopg3 Connections

```python
import psycopg

# Sync connection
conn = psycopg.connect("dbname=ivorysql user=ivorysql password=secret")

# Context manager
with psycopg.connect(...) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT version()")
        print(cur.fetchone())

# Async connection
import asyncio

async def main():
    async with await psycopg.AsyncConnection.connect(
        "dbname=ivorysql user=ivorysql password=secret"
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT version()")
            print(await cur.fetchone())

asyncio.run(main())
```

## Connection Pool

```python
from psycopg_pool import ConnectionPool

pool = ConnectionPool(
    "dbname=ivorysql user=ivorysql password=secret",
    min_size=2,
    max_size=10,
    open=True
)

with pool.connection() as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT 1")
        print(cur.fetchone())
```

## Oracle Compatibility Mode

```python
# Set at connection time
conn = psycopg.connect(
    "dbname=ivorysql user=ivorysql password=secret",
    options="-c ivorysql.compatible_mode=oracle"
)

# Or set after connection
with conn.cursor() as cur:
    cur.execute("SET ivorysql.compatible_mode TO oracle")
```
