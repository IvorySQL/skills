---
title: IvorySQL Go Advanced Features
description: Connection pool configuration, performance optimization, Oracle compatible mode
tags: ivorysql, go, advanced, pool, performance, oracle
---

# IvorySQL Go Advanced Features

## pgxpool Configuration

```go
config, err := pgxpool.ParseConfig(
    "postgres://ivorysql:secret@localhost:5432/ivorysql")
config.MaxConns = 20
config.MinConns = 5
config.MaxConnLifetime = time.Hour
config.MaxConnIdleTime = 30 * time.Minute
config.HealthCheckPeriod = 30 * time.Second

pool, err := pgxpool.NewWithConfig(context.Background(), config)
```

## Oracle Compatible Mode

```go
conn, _ := pgx.Connect(context.Background(), connString)
conn.Exec(context.Background(), "SET ivorysql.compatible_mode TO oracle")

// Use Oracle functions
rows, _ := conn.Query(context.Background(),
    "SELECT NVL(salary, 0), DECODE(dept, 'IT', 'Tech', 'Other') FROM employees")
```

## Performance Optimization

```go
// 1. Use prepared statements
preparedStmt, err := conn.Prepare(context.Background(),
    "get_emp", "SELECT * FROM employees WHERE id = $1")

// 2. Use COPY for batch import
copySrc, _ := conn.CopyFrom(context.Background(),
    pgx.Identifier{"employees"},
    []string{"name", "salary"},
    pgx.CopyFromSlice(1000, func(i int) ([]any, error) {
        return []any{fmt.Sprintf("Employee%d", i), 5000 + float64(i)}, nil
    }),
)

// 3. Connection pool reuse
// Use pgxpool instead of single connections
```
