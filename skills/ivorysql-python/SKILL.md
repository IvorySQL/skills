---
name: IvorySQL Python Development
name_for_command: ivorysql-python
description: |
  Complete IvorySQL Python development guide: psycopg2/psycopg3 connection, connection pooling (QueuePool/LocalSession),
  async programming (asyncpg/psycopg3), SQLAlchemy ORM, Django integration, batch operations (COPY), transaction control.
---

# IvorySQL Python Development

## Workflow

Trigger this skill when encountering the following issues:
- Python connects to IvorySQL
- psycopg2/psycopg3 usage
- SQLAlchemy/Django ORM
- Python batch operations (COPY)
- Transaction control

**Sub-skill routing**:
- Connection configuration → [connection-python](references/connection-python.md)
- CRUD detailed examples → [crud-python](references/crud-python.md)
- Transaction control → [transaction-python](references/transaction-python.md)
- ORM integration → [orm-python](references/orm-python.md)

## Connection Methods

### psycopg2 (Synchronous)

```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=1521,  # Oracle compatibility port
    database="ivorysql",
    user="ivorysql",
    password="secret",
    options="-c ivorysql.compatible_mode=oracle"
)
```

### psycopg3 (Async + Sync)

```python
import psycopg

# Synchronous
conn = psycopg.connect("postgresql://ivorysql:secret@localhost:1521/ivorysql")

# Async
async with await psycopg.connect("postgresql://...") as conn:
    await conn.execute("SELECT ...")
```

> For details: [connection-python](references/connection-python.md)

## Parameterized Queries

psycopg2 uses `%s` placeholders:

```python
cur.execute("SELECT * FROM employees WHERE id = %s AND dept = %s", (1, "IT"))
```

## CRUD Operations

```python
with conn.cursor() as cur:
    # Insert with return ID
    cur.execute("INSERT INTO employees (name, salary) VALUES (%s, %s) RETURNING id",
                ("John Doe", 8000))
    new_id = cur.fetchone()[0]

    # Batch insert
    import psycopg2.extras
    psycopg2.extras.execute_batch(cur,
        "INSERT INTO employees (name, salary) VALUES (%s, %s)",
        [("Jane Smith", 9000), ("Bob Johnson", 7500)])

    # Query (dictionary format)
    from psycopg2.extras import RealDictCursor
    cur.execute("SELECT * FROM employees LIMIT 10")
    rows = cur.fetchall()

    conn.commit()
```

> For details: [crud-python](references/crud-python.md)

## COPY Batch Import (Fastest)

```python
# File import
with open("employees.csv", "r") as f:
    cur.copy_from(f, "employees", sep=",")
    conn.commit()

# In-memory data
import io
data = "John Doe,8000,IT\nJane Smith,9000,HR\n"
cur.copy_from(io.StringIO(data), "employees", sep=",")
conn.commit()
```

## Transaction Control

```python
conn.autocommit = False

try:
    cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (100, 1))
    cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (100, 2))
    conn.commit()
except:
    conn.rollback()
```

> For details: [transaction-python](references/transaction-python.md)

## SQLAlchemy ORM

```python
from sqlalchemy import create_engine, Column, Integer, String, Numeric
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    salary = Column(Numeric(10, 2))

engine = create_engine("postgresql+psycopg2://ivorysql:secret@localhost:1521/ivorysql")

with Session(engine) as session:
    emps = session.query(Employee).filter(Employee.salary > 5000).all()
```

> For details: [orm-python](references/orm-python.md)

## Django Integration

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ivorysql',
        'USER': 'ivorysql',
        'PASSWORD': 'secret',
        'HOST': 'localhost',
        'PORT': 1521,
        'OPTIONS': {'options': '-c ivorysql.compatible_mode=oracle'}
    }
}
```

## Oracle-Compatible Functions

```python
cur.execute("""
    SELECT name, NVL(bonus, 0), DECODE(dept, 'IT', 'Tech Dept', 'Other')
    FROM employees WHERE ROWNUM <= 10
""")
```

## Error Handling

```python
from psycopg2 import errors

try:
    cur.execute("INSERT ...")
    conn.commit()
except errors.UniqueViolation:
    print("Duplicate record")
except errors.ForeignKeyViolation:
    print("Foreign key violation")
```

## Performance Tuning Tips

| Scenario | Solution |
|------|------|
| Batch import | COPY > execute_batch > loop INSERT |
| Connection reuse | ThreadedConnectionPool / SQLAlchemy pool |
| Large result sets | Server-side cursor `cursor(name='xxx')` |
| Async IO | psycopg3 / asyncpg |

## Reference Documents

- [Connection Configuration](references/connection-python.md)
- [CRUD Operations](references/crud-python.md)
- [Transaction Control](references/transaction-python.md)
- [ORM Integration](references/orm-python.md)
