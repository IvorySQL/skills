# IvorySQL Go Connection

## pgx v5/v6 (Recommended)

### Basic Connection

```go
import (
    "context"
    "github.com/jackc/pgx/v5"
)

conn, err := pgx.Connect(context.Background(),
    "postgres://ivorysql:secret@localhost:1521/ivorysql")
if err != nil {
    log.Fatal(err)
}
defer conn.Close(context.Background())
```

### Connection Pool (Production)

```go
import "github.com/jackc/pgx/v5/pgxpool"

pool, err := pgxpool.New(context.Background(),
    "postgres://ivorysql:secret@localhost:1521/ivorysql")
if err != nil {
    log.Fatal(err)
}
defer pool.Close()
```

### Connection Pool Configuration

```go
config, err := pgxpool.ParseConfig(
    "postgres://ivorysql:secret@localhost:1521/ivorysql")
if err != nil {
    log.Fatal(err)
}

config.MinConns = 5
config.MaxConns = 50
config.MaxConnLifetime = time.Hour
config.MaxConnIdleTime = 30 * time.Minute
config.HealthCheckPeriod = time.Minute

pool, err = pgxpool.NewWithConfig(context.Background(), config)
```

## database/sql Standard Library

```go
import (
    "database/sql"
    _ "github.com/jackc/pgx/v5/stdlib"
)

db, err := sql.Open("pgx",
    "postgres://ivorysql:secret@localhost:1521/ivorysql")
if err != nil {
    log.Fatal(err)
}

db.SetMaxOpenConns(25)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(5 * time.Minute)
defer db.Close()
```

## Oracle Compatible Mode

```go
// Via connection string parameter
conn, err := pgx.Connect(ctx,
    "postgres://ivorysql:secret@localhost:1521/ivorysql?options=-c%20ivorysql.compatible_mode=oracle")

// Or execute SET after connection
conn.Exec(ctx, "SET ivorysql.compatible_mode TO 'oracle'")
```

## Dual Port Mode

| Port | Mode | Description |
|------|------|-------------|
| 5432 | PostgreSQL | PG native connection |
| 1521 | Oracle Compatible | Enters Oracle mode by default |

```go
// PG mode
connPg, _ := pgx.Connect(ctx, "postgres://ivorysql:secret@localhost:5432/ivorysql")

// Oracle compatible mode
connOra, _ := pgx.Connect(ctx, "postgres://ivorysql:secret@localhost:1521/ivorysql")
```

## Connection Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| sslmode | prefer | SSL mode |
| connect_timeout | 0 | Connection timeout (seconds) |
| statement_timeout | 0 | Statement timeout (milliseconds) |
| pool_max_conns | 5 | Max connections |
| pool_min_conns | 0 | Min connections |

```go
// Complete URL example
url := "postgres://ivorysql:secret@localhost:1521/ivorysql" +
    "?sslmode=disable" +
    "&connect_timeout=10" +
    "&pool_max_conns=50"
```

## Connection Pool Best Practices

### Connection Count Calculation

```go
// Rule of thumb: connections = CPU cores * 2 + number of disks
cpuCores := runtime.NumCPU()
optimalConns := cpuCores * 2 + 1  // assuming 1 disk

config.MaxConns = int32(optimalConns)
config.MinConns = int32(optimalConns / 2)
```

### Health Check

```go
config.HealthCheckPeriod = time.Minute
config.MaxConnLifetime = time.Hour

// Manual check
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

err := pool.Ping(ctx)
if err != nil {
    log.Printf("Connection pool health check failed: %v", err)
}
```

### Connection Leak Prevention

```go
// pgxpool automatically recycles idle connections
// Set a reasonable MaxConnIdleTime to prevent connection leaks
config.MaxConnIdleTime = 30 * time.Minute
```

## Complete Example

```go
package main

import (
    "context"
    "fmt"
    "log"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
)

func main() {
    ctx := context.Background()

    config, _ := pgxpool.ParseConfig(
        "postgres://ivorysql:secret@localhost:1521/ivorysql")
    config.MinConns = 5
    config.MaxConns = 20
    config.MaxConnLifetime = time.Hour

    pool, err := pgxpool.NewWithConfig(ctx, config)
    if err != nil {
        log.Fatal(err)
    }
    defer pool.Close()

    var version string
    err = pool.QueryRow(ctx, "SELECT version()").Scan(&version)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println("Connected successfully:", version)
}
```
