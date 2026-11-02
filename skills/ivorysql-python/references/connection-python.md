# IvorySQL Python Connection

## psycopg2 (Synchronous, Most Common)

### Basic Connection

```python
import psycopg2

# Oracle-compatible port 1521
conn = psycopg2.connect(
    host="localhost",
    port=1521,
    database="ivorysql",
    user="ivorysql",
    password="secret"
)
```

### Oracle Compatibility Mode

```python
conn = psycopg2.connect(
    host="localhost",
    port=1521,
    database="ivorysql",
    options="-c ivorysql.compatible_mode=oracle"
)
```

### Dual-Port Mode

```python
# PG mode (port 5432)
conn_pg = psycopg2.connect(
    host="localhost", port=5432, database="ivorysql",
    user="ivorysql", password="secret"
)

# Oracle-compatible mode (port 1521)
conn_ora = psycopg2.connect(
    host="localhost", port=1521, database="ivorysql",
    options="-c ivorysql.compatible_mode=oracle"
)
```

## psycopg3 (Async + Sync)

### Sync

```python
import psycopg

conn = psycopg.connect("postgresql://ivorysql:secret@localhost:1521/ivorysql")
```

### Async

```python
import asyncio
import psycopg

async def main():
    async with await psycopg.AsyncConnection.connect(
        "postgresql://ivorysql:secret@localhost:1521/ivorysql"
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM employees LIMIT 5")
            rows = await cur.fetchall()

asyncio.run(main())
```

## Connection Pools

### psycopg2 SimpleConnectionPool

```python
from psycopg2 import pool

conn_pool = psycopg2.pool.SimpleConnectionPool(
    minconn=5,
    maxconn=20,
    host="localhost", port=1521, database="ivorysql",
    user="ivorysql", password="secret"
)

conn = conn_pool.getconn()
try:
    # Use connection
    pass
finally:
    conn_pool.putconn(conn)
```

### psycopg2 ThreadedConnectionPool (Multi-threaded)

```python
conn_pool = psycopg2.pool.ThreadedConnectionPool(
    minconn=5,
    maxconn=50,
    host="localhost", port=1521, database="ivorysql",
    user="ivorysql", password="secret"
)
```

### SQLAlchemy Connection Pool

```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql+psycopg2://ivorysql:secret@localhost:1521/ivorysql",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### psycopg3 Async Connection Pool

The pool is provided by the separate `psycopg_pool` package. Install the optional pool extra to use this example:

```bash
pip install "psycopg[pool]"
```

```python
import psycopg_pool

async with psycopg_pool.AsyncConnectionPool(
    "postgresql://ivorysql:secret@localhost:1521/ivorysql",
    min_size=5, max_size=20
) as pool:
    async with pool.connection() as conn:
        await conn.execute("INSERT INTO logs (msg) VALUES ('hello')")
```

## Connection Parameters

| Parameter | Default | Description |
|------|--------|------|
| connect_timeout | None | Connection timeout (seconds) |
| options | None | Server-side parameters (e.g., compatibility mode) |
| sslmode | prefer | SSL mode |
| application_name | None | Application identifier |

## Complete Example

```python
import psycopg2
from psycopg2.extras import RealDictCursor

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=1521,
        database="ivorysql",
        user="ivorysql",
        password="secret",
        options="-c ivorysql.compatible_mode=oracle",
        cursor_factory=RealDictCursor
    )

with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT version()")
        print(cur.fetchone())
```
