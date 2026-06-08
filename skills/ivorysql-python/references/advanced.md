---
title: IvorySQL Python Advanced Features
description: Stored procedures, large objects, async operations, Oracle compatibility
tags: ivorysql, python, advanced, stored-procedure, async, lob
---

# IvorySQL Python Advanced Features

## Stored Procedures

```python
with conn.cursor() as cur:
    # Call stored procedure
    cur.execute("CALL update_salary(%s, %s)", (1, 10000))
    conn.commit()
    
    # Call function
    cur.execute("SELECT get_emp_name(%s)", (1,))
    name = cur.fetchone()[0]
```

## Async Operations

```python
import asyncio
import psycopg

async def main():
    async with await psycopg.AsyncConnection.connect(
        "dbname=ivorysql user=ivorysql password=secret"
    ) as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT * FROM employees")
            rows = await cur.fetchall()
            for row in rows:
                print(row)

asyncio.run(main())
```

## Large Objects (LOB)

```python
# Write binary data
with conn.cursor() as cur:
    with open("file.pdf", "rb") as f:
        cur.execute("INSERT INTO documents (name, content) VALUES (%s, %s)",
                    ("report.pdf", f.read()))
    conn.commit()

# Read binary data
with conn.cursor() as cur:
    cur.execute("SELECT content FROM documents WHERE name = %s", ("report.pdf",))
    data = cur.fetchone()[0]
```

## Oracle Compatibility Mode

```python
# Use Oracle-compatible functions
with conn.cursor() as cur:
    cur.execute("SET ivorysql.compatible_mode TO oracle")
    cur.execute("SELECT NVL(NULL, 'default'), SYSDATE FROM DUAL")
    row = cur.fetchone()
    print(row)
    
    # Use DECODE
    cur.execute("""
        SELECT DECODE(department, 'IT', 'Tech Dept', 'HR', 'HR Dept', 'Other')
        FROM employees
    """)
