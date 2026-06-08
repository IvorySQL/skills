---
title: IvorySQL Go CRUD Operations
description: Query, batch operations, transactions, large objects
tags: ivorysql, go, crud, query, batch, transaction
---

# IvorySQL Go CRUD Operations

## Query

```go
// Single row query
var name string
var salary float64
err := conn.QueryRow(context.Background(),
    "SELECT name, salary FROM employees WHERE id = $1", 1).Scan(&name, &salary)

// Multiple row query
rows, err := conn.Query(context.Background(),
    "SELECT id, name, salary FROM employees WHERE salary > $1", 5000)
defer rows.Close()
for rows.Next() {
    var id int
    var name string
    var salary float64
    rows.Scan(&id, &name, &salary)
}
```

## Insert / Update / Delete

```go
// Insert
_, err := conn.Exec(context.Background(),
    "INSERT INTO employees (name, salary) VALUES ($1, $2)", "Zhang San", 8000)

// Insert returning ID
var id int
err := conn.QueryRow(context.Background(),
    "INSERT INTO employees (name, salary) VALUES ($1, $2) RETURNING id",
    "Zhang San", 8000).Scan(&id)

// Update
_, err := conn.Exec(context.Background(),
    "UPDATE employees SET salary = $1 WHERE id = $2", 9000, 1)

// Delete
_, err := conn.Exec(context.Background(),
    "DELETE FROM employees WHERE id = $1", 1)
```

## Batch Operations

```go
batch := &pgx.Batch{}
for i := 0; i < 1000; i++ {
    batch.Queue("INSERT INTO employees (name, salary) VALUES ($1, $2)",
        fmt.Sprintf("Employee%d", i), 5000+float64(i))
}
br := conn.SendBatch(context.Background(), batch)
defer br.Close()
for i := 0; i < 1000; i++ {
    br.Exec()
}
```

## Transactions

```go
tx, err := conn.Begin(context.Background())
if err != nil {
    log.Fatal(err)
}
defer tx.Rollback(context.Background())

_, err = tx.Exec(context.Background(),
    "UPDATE accounts SET balance = balance - $1 WHERE id = $2", 100, 1)
_, err = tx.Exec(context.Background(),
    "UPDATE accounts SET balance = balance + $1 WHERE id = $2", 100, 2)

err = tx.Commit(context.Background())
```

## Parameter Placeholders

> **Important**: pgx uses `$1, $2, $3...` placeholders (not `?`)

```go
// Correct
conn.QueryRow(ctx, "SELECT * FROM t WHERE a = $1 AND b = $2", val1, val2)

// Incorrect
// conn.QueryRow(ctx, "SELECT * FROM t WHERE a = ? AND b = ?", val1, val2)
```
