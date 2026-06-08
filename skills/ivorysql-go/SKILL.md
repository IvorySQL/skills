---
name: IvorySQL Go Development
name_for_command: ivorysql-go
description: |
  Complete IvorySQL Go development guide: pgx v5/v6 connection (Oracle port 1521), database/sql wrapper,
  connection pool configuration, transaction control, batch operations (BATCH), RETURNING clause, GORM integration,
  struct mapping, context timeout, NULL handling, error handling and retry.
---

# IvorySQL Go Development

## Workflow

Trigger this skill when encountering the following issues:
- Go connects to IvorySQL
- pgx / database/sql usage
- GORM operations with IvorySQL
- Go batch inserts / transactions
- Go connection pool configuration
- RETURNING clause

**Sub-skill routing**:
- Connection configuration → [connection-go](references/connection-go.md)
- CRUD detailed examples → [crud-go](references/crud-go.md)
- Transaction control → [transaction-go](references/transaction-go.md)
- GORM integration → [gorm-go](references/gorm-go.md)

## Connection Methods

### pgx v5/v6 (Recommended)

```go
import (
    "context"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"
)

// Basic connection
conn, err := pgx.Connect(ctx,
    "postgres://ivorysql:secret@localhost:1521/ivorysql")

// Connection pool (production)
pool, err := pgxpool.New(ctx,
    "postgres://ivorysql:secret@localhost:1521/ivorysql")
```

### database/sql Standard Library

```go
import (
    "database/sql"
    _ "github.com/jackc/pgx/v5/stdlib"
)

db, _ := sql.Open("pgx", "postgres://ivorysql:secret@localhost:1521/ivorysql")
db.SetMaxOpenConns(25)
```

> For details: [connection-go](references/connection-go.md)

## Parameter Placeholders

pgx uses `$1, $2, $3...`:

```go
conn.QueryRow(ctx, "SELECT name FROM employees WHERE id = $1", 1)
```

## CRUD Operations

### Query

```go
// Single row
var name string
conn.QueryRow(ctx, "SELECT name FROM employees WHERE id = $1", 1).Scan(&name)

// Multiple rows
rows, _ := conn.Query(ctx, "SELECT id, name FROM employees WHERE salary > $1", 5000)
for rows.Next() {
    var id int; var name string
    rows.Scan(&id, &name)
}
```

### Insert with Return ID

```go
var newID int64
conn.QueryRow(ctx,
    "INSERT INTO employees (name, salary) VALUES ($1, $2) RETURNING id",
    "Zhang San", 8000).Scan(&newID)
```

> For details: [crud-go](references/crud-go.md)

## Batch Operations

### SendBatch

```go
batch := &pgx.Batch{}
batch.Queue("INSERT INTO employees (name, salary) VALUES ($1, $2)", "A", 8000)
batch.Queue("INSERT INTO employees (name, salary) VALUES ($1, $2)", "B", 9000)
br := conn.SendBatch(ctx, batch)
defer br.Close()
```

### COPY (Fastest)

```go
rows := [][]interface{}{{"Zhang San", 8000}, {"Li Si", 9000}}
count, _ := conn.CopyFrom(ctx, pgx.Identifier{"employees"},
    []string{"name", "salary"}, pgx.CopyFromRows(rows))
```

## Transactions

```go
tx, _ := conn.Begin(ctx)
defer tx.Rollback(ctx)

tx.Exec(ctx, "UPDATE accounts SET balance = balance - $1 WHERE id = $2", 100, 1)
tx.Exec(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", 100, 2)

tx.Commit(ctx)
```

> For details: [transaction-go](references/transaction-go.md)

## GORM Integration

```go
import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

dsn := "host=localhost user=ivorysql password=secret dbname=ivorysql port=1521"
db, _ := gorm.Open(postgres.Open(dsn), &gorm.Config{})

type Employee struct {
    ID     uint
    Name   string
    Salary float64
}

db.First(&emp, 1)
db.Create(&Employee{Name: "Zhang San", Salary: 8000})
db.Where("salary > ?", 5000).Find(&emps)
```

> For details: [gorm-go](references/gorm-go.md)

## NULL Handling

```go
// Pointers
type Employee struct {
    Name  string
    Bonus *float64  // NULL → nil
}

// sql.NullFloat64
var bonus sql.NullFloat64
conn.QueryRow(ctx, "SELECT bonus FROM employees WHERE id = $1", 1).Scan(&bonus)
if bonus.Valid { fmt.Println(bonus.Float64) }
```

## Error Handling

```go
import "github.com/jackc/pgx/v5/pgconn"

var pgErr *pgconn.PgError
if errors.As(err, &pgErr) {
    switch pgErr.Code {
    case "23505": fmt.Println("Unique constraint violation")
    case "40P01": fmt.Println("Deadlock, retry")
    }
}
```

## Context Timeout

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

conn.QueryRow(ctx, "SELECT ...")
```

## Performance Recommendations

| Scenario | Solution |
|------|------|
| Frequent connections | pgxpool connection pool |
| Batch inserts | COPY > SendBatch > loop INSERT |
| Read-only queries | `BeginTx(IsoLevel: pgx.Serializable)` |
| Timeout control | `context.WithTimeout` |

## Reference Documents

- [Connection Configuration](references/connection-go.md)
- [CRUD Operations](references/crud-go.md)
- [Transaction Control](references/transaction-go.md)
- [GORM Integration](references/gorm-go.md)
