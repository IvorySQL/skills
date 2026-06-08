---
title: IvorySQL Python CRUD Operations
description: Queries, parameterization, batch operations, ORM integration
tags: ivorysql, python, crud, query, batch, orm
---

# IvorySQL Python CRUD Operations

## Queries

```python
with conn.cursor() as cur:
    # Simple query
    cur.execute("SELECT * FROM employees")
    rows = cur.fetchall()
    for row in rows:
        print(row)
    
    # Parameterized query
    cur.execute("SELECT * FROM employees WHERE salary > %s", (5000,))
    
    # Dictionary results
    cur.execute("SELECT * FROM employees")
    columns = [desc[0] for desc in cur.description]
    result = [dict(zip(columns, row)) for row in cur.fetchall()]
```

## Insert/Update/Delete

```python
with conn.cursor() as cur:
    # Insert
    cur.execute("INSERT INTO employees (name, salary) VALUES (%s, %s)",
                ("Zhang San", 8000))
    
    # Batch insert
    cur.executemany("INSERT INTO employees (name, salary) VALUES (%s, %s)",
        [("Zhang San", 8000), ("Li Si", 9000), ("Wang Wu", 7500)])

    # Batch import using COPY (fastest)
    with cur.copy("COPY employees (name, salary) FROM STDIN") as copy:
        copy.write_row(("Zhang San", 8000))
        copy.write_row(("Li Si", 9000))

    # Update
    cur.execute("UPDATE employees SET salary = %s WHERE name = %s",
                (9000, "Zhang San"))

    # Delete
    cur.execute("DELETE FROM employees WHERE name = %s", ("Zhang San",))
    
    conn.commit()
```

## Transaction Control

```python
with conn.transaction():
    # Auto commit/rollback
    with conn.cursor() as cur:
        cur.execute("UPDATE accounts SET balance = balance - %s WHERE id = %s", (100, 1))
        cur.execute("UPDATE accounts SET balance = balance + %s WHERE id = %s", (100, 2))
```

## SQLAlchemy ORM

```python
from sqlalchemy import create_engine, Column, Integer, String, Numeric
from sqlalchemy.orm import declarative_base, Session

engine = create_engine("postgresql+psycopg://ivorysql:secret@localhost/ivorysql")
Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    salary = Column(Numeric(10, 2))

# Query
with Session(engine) as session:
    employees = session.query(Employee).filter(Employee.salary > 5000).all()

# Insert
with Session(engine) as session:
    emp = Employee(name="Zhang San", salary=8000)
    session.add(emp)
    session.commit()
```
