# IvorySQL Python CRUD Operations

## Parameterized Queries (Injection Prevention)

psycopg2 uses `%s` placeholders:

```python
cur.execute("SELECT * FROM employees WHERE id = %s", (1,))
cur.execute("SELECT * FROM employees WHERE dept = %s AND salary > %s", ("IT", 5000))
```

## CRUD Operations

### Queries

```python
# Single row
cur.execute("SELECT * FROM employees WHERE id = %s", (1,))
emp = cur.fetchone()

# Multiple rows
cur.execute("SELECT * FROM employees WHERE salary > %s", (5000,))
rows = cur.fetchall()

# Dictionary format
from psycopg2.extras import RealDictCursor
with conn.cursor(cursor_factory=RealDictCursor) as cur:
    cur.execute("SELECT * FROM employees LIMIT 10")
    rows = cur.fetchall()  # [{'id': 1, 'name': 'Zhang San', ...}, ...]
```

### Insert

```python
# Basic insert
cur.execute(
    "INSERT INTO employees (name, salary) VALUES (%s, %s) RETURNING id",
    ("Zhang San", 8000)
)
new_id = cur.fetchone()[0]
conn.commit()
```

### Batch Insert

```python
import psycopg2.extras

data = [
    ("Li Si", 9000, "HR"),
    ("Wang Wu", 7500, "IT"),
    ("Zhao Liu", 8500, "Sales")
]

psycopg2.extras.execute_batch(
    cur,
    "INSERT INTO employees (name, salary, department) VALUES (%s, %s, %s)",
    data,
    page_size=100
)
conn.commit()
```

### Update

```python
cur.execute("UPDATE employees SET salary = %s WHERE id = %s", (9000, 1))
conn.commit()
```

### Delete

```python
cur.execute("DELETE FROM employees WHERE id = %s", (1,))
conn.commit()
```

## COPY Batch Import (Fastest)

### copy_from (File Import)

```python
with open("employees.csv", "r") as f:
    cur.copy_from(f, "employees", sep=",", columns=("name", "salary", "department"))
conn.commit()
```

### copy_expert (SQL COPY)

```python
sql = "COPY employees (name, salary) FROM STDIN WITH CSV"
with open("employees.csv", "r") as f:
    cur.copy_expert(sql, f)
conn.commit()
```

### In-Memory Data Import

```python
import io

data = "Zhang San,8000,IT\nLi Si,9000,HR\n"
f = io.StringIO(data)
cur.copy_from(f, "employees", sep=",")
conn.commit()
```

## COPY Export

```python
sql = "COPY employees TO STDOUT WITH CSV HEADER"
with open("employees_export.csv", "w") as f:
    cur.copy_expert(sql, f)
```

## NULL Handling

```python
# Python None maps to SQL NULL
cur.execute("INSERT INTO employees (name, bonus) VALUES (%s, %s)", ("Zhang San", None))

# None represents NULL when querying
cur.execute("SELECT name, bonus FROM employees WHERE id = %s", (1,))
name, bonus = cur.fetchone()
if bonus is None:
    print("Bonus is NULL")
```

## Error Handling

```python
from psycopg2 import errors

try:
    cur.execute("INSERT INTO employees (id, name) VALUES (1, 'Zhang San')")
    conn.commit()
except errors.UniqueViolation:
    print("Duplicate record")
except errors.ForeignKeyViolation:
    print("Foreign key violation")
except errors.CheckViolation:
    print("Check constraint violation")
except Exception as e:
    conn.rollback()
    print(f"Error: {e}")
```
