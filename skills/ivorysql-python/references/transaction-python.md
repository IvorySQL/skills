# IvorySQL Python Transaction Control

## Basic Transactions

```python
conn.autocommit = False  # Default

try:
    cur = conn.cursor()
    cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (100, 1))
    cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (100, 2))
    conn.commit()
except Exception as e:
    conn.rollback()
    raise
```

## Autocommit Mode

```python
# Auto commit (required for DDL operations)
conn.autocommit = True
cur.execute("CREATE DATABASE test_db")

# Manual transaction
conn.autocommit = False
```

## Context Manager

```python
with conn:
    with conn.cursor() as cur:
        cur.execute("INSERT INTO orders ...")
        cur.execute("INSERT INTO items ...")
    # Auto commit, auto rollback on exception
```

## Savepoints

```python
conn.autocommit = False
cur = conn.cursor()

cur.execute("INSERT INTO orders (id, amount) VALUES (1, 100)")

# Create savepoint
cur.execute("SAVEPOINT sp1")

try:
    cur.execute("INSERT INTO items (order_id, item) VALUES (1, 'A')")
except:
    cur.execute("ROLLBACK TO SAVEPOINT sp1")

cur.execute("INSERT INTO items (order_id, item) VALUES (1, 'B')")
conn.commit()
```

## Isolation Levels

```python
from psycopg2 import extensions

# READ COMMITTED (default)
conn.set_isolation_level(extensions.ISOLATION_LEVEL_READ_COMMITTED)

# REPEATABLE READ
conn.set_isolation_level(extensions.ISOLATION_LEVEL_REPEATABLE_READ)

# SERIALIZABLE
conn.set_isolation_level(extensions.ISOLATION_LEVEL_SERIALIZABLE)
```

### Isolation Level Mapping

| psycopg2 Constant | PostgreSQL Level |
|---------------|----------------|
| ISOLATION_LEVEL_READ_COMMITTED | READ COMMITTED |
| ISOLATION_LEVEL_REPEATABLE_READ | REPEATABLE READ |
| ISOLATION_LEVEL_SERIALIZABLE | SERIALIZABLE |

## Transaction Retry

```python
import time
from psycopg2 import errors

def with_retry(conn, max_retries=3):
    for i in range(max_retries):
        try:
            cur = conn.cursor()
            cur.execute("SELECT ...")
            conn.commit()
            return
        except (errors.SerializationFailure, errors.DeadlockDetected):
            conn.rollback()
            time.sleep(0.1 * (i + 1))
            continue
        except Exception:
            conn.rollback()
            raise
    raise Exception("Transaction retry limit exceeded")
```

## psycopg3 Async Transactions

```python
import asyncio
import psycopg

async def transfer():
    async with await psycopg.AsyncConnection.connect("postgresql://...") as conn:
        async with conn.transaction():
            await conn.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (100, 1))
            await conn.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (100, 2))
```

## Read-Only Transactions

```python
conn.autocommit = False
conn.set_session(readonly=True)
cur.execute("SELECT * FROM employees")
conn.commit()
```
