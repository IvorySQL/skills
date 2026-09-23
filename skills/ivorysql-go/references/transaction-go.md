# IvorySQL Go Transaction Control

## Basic Transaction

```go
tx, err := conn.Begin(ctx)
if err != nil {
    log.Fatal(err)
}
defer tx.Rollback(ctx)  // Automatic rollback on failure

_, err = tx.Exec(ctx, "UPDATE accounts SET balance = balance - $1 WHERE id = $2", 100, 1)
if err != nil {
    tx.Rollback(ctx)
    log.Fatal(err)
}

_, err = tx.Exec(ctx, "UPDATE accounts SET balance = balance + $1 WHERE id = $2", 100, 2)
if err != nil {
    tx.Rollback(ctx)
    log.Fatal(err)
}

err = tx.Commit(ctx)
if err != nil {
    log.Fatal(err)
}
```

## Transactions with Connection Pool

```go
err := pool.AcquireFunc(ctx, func(conn *pgxpool.Conn) error {
    tx, err := conn.Begin(ctx)
    if err != nil {
        return err
    }
    defer tx.Rollback(ctx)

    _, err = tx.Exec(ctx, "INSERT INTO logs (msg) VALUES ($1)", "event1")
    if err != nil {
        return err
    }

    _, err = tx.Exec(ctx, "INSERT INTO logs (msg) VALUES ($1)", "event2")
    if err != nil {
        return err
    }

    return tx.Commit(ctx)
})
```

## Isolation Levels

```go
import "github.com/jackc/pgx/v5"

// READ COMMITTED (default)
tx, _ := conn.Begin(ctx)

// REPEATABLE READ
tx, _ := conn.BeginTx(ctx, pgx.TxOptions{
    IsoLevel: pgx.RepeatableRead,
})

// SERIALIZABLE
tx, _ := conn.BeginTx(ctx, pgx.TxOptions{
    IsoLevel: pgx.Serializable,
})

// Read-only transaction
tx, _ := conn.BeginTx(ctx, pgx.TxOptions{
    AccessMode: pgx.ReadOnly,
})
```

### Isolation Level Reference

| pgx Constant | PostgreSQL Level | Description |
|--------------|------------------|-------------|
| ReadCommitted | READ COMMITTED | Default |
| RepeatableRead | REPEATABLE READ | Repeatable read |
| Serializable | SERIALIZABLE | Highest isolation |

## Savepoints (Nested Transactions)

```go
tx, _ := conn.Begin(ctx)
defer tx.Rollback(ctx)

tx.Exec(ctx, "INSERT INTO orders (id, amount) VALUES (1, 100)")

// Create savepoint
_, _ = tx.Exec(ctx, "SAVEPOINT sp1")

tx.Exec(ctx, "INSERT INTO items (order_id, item) VALUES (1, 'A')")

// Rollback to savepoint
tx.Exec(ctx, "ROLLBACK TO SAVEPOINT sp1")

tx.Exec(ctx, "INSERT INTO items (order_id, item) VALUES (1, 'B')")

tx.Commit(ctx)
```

## Transaction Timeout

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

tx, _ := conn.Begin(ctx)

// Must complete within 30 seconds, otherwise automatic rollback
_, err := tx.Exec(ctx, "SELECT long_running_operation()")
if err != nil {
    tx.Rollback(ctx)
}

tx.Commit(ctx)
```

## Transaction Retry

```go
func withRetry(ctx context.Context, pool *pgxpool.Pool, maxRetries int, fn func(pgx.Tx) error) error {
    if maxRetries <= 0 {
        return errors.New("maxRetries must be greater than zero")
    }
    var lastErr error
    for i := 0; i < maxRetries; i++ {
        tx, err := pool.Begin(ctx)
        if err != nil {
            return err
        }

        err = fn(tx)
        if err != nil {
            tx.Rollback(ctx)
            if isRetryable(err) {
                lastErr = err
                time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
                continue
            }
            return err
        }

        err = tx.Commit(ctx)
        if err != nil && isRetryable(err) {
            lastErr = err
            time.Sleep(time.Duration(i+1) * 100 * time.Millisecond)
            continue
        }
        return err
    }
    return lastErr
}

func isRetryable(err error) bool {
    var pgErr *pgconn.PgError
    if errors.As(err, &pgErr) {
        return pgErr.Code == "40001" || pgErr.Code == "40P01" // Serialization failure / Deadlock
    }
    return false
}
```

## Transaction Error Handling

### Common Error Codes

| Error Code | Description | Handling |
|------------|-------------|----------|
| 40001 | Serialization failure | Retry |
| 40P01 | Deadlock | Retry |
| 25P02 | Transaction aborted | Rollback |

### Detect Transaction State

```go
// After a transaction failure, execution cannot continue; must rollback
_, err = tx.Exec(ctx, "INSERT ...")
if err != nil {
    // Check if it's a transaction abort error
    if strings.Contains(err.Error(), "current transaction is aborted") {
        tx.Rollback(ctx)
        // Start a new transaction
        tx, _ = conn.Begin(ctx)
    }
}
```
