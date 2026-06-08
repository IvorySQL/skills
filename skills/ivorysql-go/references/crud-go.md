# IvorySQL Go CRUD Operations

## Parameter Placeholders

pgx uses `$1, $2, $3...` placeholders:

```go
conn.QueryRow(ctx, "SELECT name FROM employees WHERE id = $1 AND dept = $2", 1, "IT")
```

## Query

### Single Row Query

```go
var name string
var salary float64
err := conn.QueryRow(ctx,
    "SELECT name, salary FROM employees WHERE id = $1", 1).Scan(&name, &salary)
if err == pgx.ErrNoRows {
    fmt.Println("No record found")
}
```

### Multiple Row Query

```go
rows, err := conn.Query(ctx,
    "SELECT id, name, salary FROM employees WHERE salary > $1", 5000)
if err != nil {
    log.Fatal(err)
}
defer rows.Close()

type Employee struct {
    ID     int
    Name   string
    Salary float64
}

var employees []Employee
for rows.Next() {
    var emp Employee
    err := rows.Scan(&emp.ID, &emp.Name, &emp.Salary)
    if err != nil {
        log.Fatal(err)
    }
    employees = append(employees, emp)
}
```

### Map Mapping

```go
rows, _ := conn.Query(ctx, "SELECT * FROM employees LIMIT 3")
cols := rows.FieldDescriptions()

for rows.Next() {
    values, _ := rows.Values()
    m := make(map[string]interface{})
    for i, col := range cols {
        m[col.Name] = values[i]
    }
    fmt.Printf("%+v\n", m)
}
```

### COUNT Query

```go
var count int64
err := conn.QueryRow(ctx,
    "SELECT COUNT(*) FROM employees WHERE salary > $1", 5000).Scan(&count)
```

## Insert

### Basic Insert

```go
_, err := conn.Exec(ctx,
    "INSERT INTO employees (name, salary, department) VALUES ($1, $2, $3)",
    "Zhang San", 8000, "IT")
```

### Insert Returning ID

```go
var newID int64
err := conn.QueryRow(ctx,
    "INSERT INTO employees (name, salary) VALUES ($1, $2) RETURNING id",
    "Li Si", 9000).Scan(&newID)
fmt.Println("New record ID:", newID)
```

### Insert Returning Multiple Columns

```go
var id int
var createdAt time.Time
err := conn.QueryRow(ctx,
    "INSERT INTO employees (name, salary) VALUES ($1, $2) RETURNING id, created_at",
    "Wang Wu", 7500).Scan(&id, &createdAt)
```

### Batch Insert (SendBatch)

```go
batch := &pgx.Batch{}
batch.Queue("INSERT INTO employees (name, salary) VALUES ($1, $2)", "A", 8000)
batch.Queue("INSERT INTO employees (name, salary) VALUES ($1, $2)", "B", 9000)
batch.Queue("INSERT INTO employees (name, salary) VALUES ($1, $2)", "C", 7500)

br := conn.SendBatch(ctx, batch)
defer br.Close()

for i := 0; i < 3; i++ {
    _, err := br.Exec()
    if err != nil {
        log.Fatal(err)
    }
}
```

## Update

### Basic Update

```go
tag, err := conn.Exec(ctx,
    "UPDATE employees SET salary = $1 WHERE id = $2", 9000, 1)
fmt.Printf("Updated %d row(s)\n", tag.RowsAffected())
```

### Conditional Update

```go
tag, err := conn.Exec(ctx,
    "UPDATE employees SET salary = salary * 1.1 WHERE department = $1 AND salary < $2",
    "IT", 5000)
```

### Update Returning Old Value

```go
var oldSalary float64
err = conn.QueryRow(ctx,
    "UPDATE employees SET salary = $1 WHERE id = $2 RETURNING salary",
    10000, 1).Scan(&oldSalary)
fmt.Println("Previous salary:", oldSalary)
```

## Delete

```go
tag, err := conn.Exec(ctx, "DELETE FROM employees WHERE id = $1", 5)
fmt.Printf("Deleted %d row(s)\n", tag.RowsAffected())
```

## Batch Operations

### COPY Import (Fastest)

```go
rows := [][]interface{}{
    {"Zhang San", 8000, "IT"},
    {"Li Si", 9000, "HR"},
    {"Wang Wu", 7500, "IT"},
}

count, err := conn.CopyFrom(
    context.Background(),
    pgx.Identifier{"employees"},
    []string{"name", "salary", "department"},
    pgx.CopyFromRows(rows),
)
fmt.Printf("Imported %d row(s)\n", count)
```

### Batch Update

```go
batch := &pgx.Batch{}
for _, emp := range employees {
    batch.Queue("UPDATE employees SET salary = $1 WHERE id = $2", emp.Salary, emp.ID)
}
br := conn.SendBatch(ctx, batch)
br.Close()
```

## NULL Handling

### Using Pointers

```go
type Employee struct {
    Name   string
    Bonus  *float64  // NULL -> nil
}
```

### Using sql.NullXxx

```go
import "database/sql"

var name string
var bonus sql.NullFloat64
err := conn.QueryRow(ctx, "SELECT name, bonus FROM employees WHERE id = $1", 1).Scan(&name, &bonus)

if bonus.Valid {
    fmt.Println("Bonus:", bonus.Float64)
} else {
    fmt.Println("Bonus: NULL")
}
```

### Using pgtype

```go
import "github.com/jackc/pgx/v5/pgtype"

type Employee struct {
    Name  string
    Bonus pgtype.Float8
}

// Check
if emp.Bonus.Valid {
    fmt.Println(emp.Bonus.Float64)
}
```

## Error Handling

```go
import "github.com/jackc/pgx/v5/pgconn"

var pgErr *pgconn.PgError
if errors.As(err, &pgErr) {
    switch pgErr.Code {
    case "23505":
        fmt.Println("Unique constraint violation")
    case "23503":
        fmt.Println("Foreign key violation")
    case "42P01":
        fmt.Println("Table does not exist")
    }
}
```
