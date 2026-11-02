# IvorySQL JDBC Transaction Control

## Basic Transaction

```java
conn.setAutoCommit(false);
try {
    try (PreparedStatement ps = conn.prepareStatement(
            "UPDATE accounts SET balance = balance - ? WHERE id = ?")) {
        ps.setDouble(1, 100);
        ps.setInt(2, 1);
        ps.executeUpdate();
    }
    try (PreparedStatement ps = conn.prepareStatement(
            "UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
        ps.setDouble(1, 100);
        ps.setInt(2, 2);
        ps.executeUpdate();
    }
    conn.commit();
} catch (SQLException e) {
    conn.rollback();
    throw e;
} finally {
    conn.setAutoCommit(true);
}
```

## Savepoints

```java
conn.setAutoCommit(false);
Savepoint sp1 = conn.setSavepoint("sp_orders");
try {
    // Step 1: Create order
    try (PreparedStatement ps = conn.prepareStatement(
            "INSERT INTO orders (id, amount) VALUES (?, ?)")) {
        ps.setInt(1, 1);
        ps.setDouble(2, 100);
        ps.executeUpdate();
    }

    Savepoint sp2 = conn.setSavepoint("sp_items");
    try {
        // Step 2: Add order items
        try (PreparedStatement ps = conn.prepareStatement(
                "INSERT INTO order_items (order_id, item) VALUES (?, ?)")) {
            ps.setInt(1, 1);
            ps.setString(2, "A");
            ps.executeUpdate();
        }
    } catch (SQLException e) {
        conn.rollback(sp2);  // Rollback to second savepoint
    }

    conn.commit();
} catch (SQLException e) {
    conn.rollback(sp1);
} finally {
    conn.setAutoCommit(true);
}
```

## Isolation Levels

### Setting Isolation Level

```java
conn.setAutoCommit(false);
conn.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
```

### Isolation Level Reference

| JDBC Constant | PostgreSQL Level | Description |
|---------------|-----------------|-------------|
| TRANSACTION_READ_UNCOMMITTED | READ UNCOMMITTED | Actually mapped to READ COMMITTED |
| TRANSACTION_READ_COMMITTED | READ COMMITTED | Default level |
| TRANSACTION_REPEATABLE_READ | REPEATABLE READ | Repeatable read |
| TRANSACTION_SERIALIZABLE | SERIALIZABLE | Highest isolation level |

### Characteristics of Each Level

```java
// READ COMMITTED (default)
conn.setTransactionIsolation(Connection.TRANSACTION_READ_COMMITTED);
// Each statement sees a snapshot as of the start of the statement

// REPEATABLE READ
conn.setTransactionIsolation(Connection.TRANSACTION_REPEATABLE_READ);
// Entire transaction sees a snapshot as of the start of the transaction

// SERIALIZABLE
conn.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE);
// Fully isolated, may throw serialization failure exceptions
```

## Transaction Best Practices

### try-with-resources Pattern

```java
public void transfer(int fromId, int toId, double amount) throws SQLException {
    try (Connection conn = ds.getConnection()) {
        conn.setAutoCommit(false);
        try {
            // Business operations
            withdraw(conn, fromId, amount);
            deposit(conn, toId, amount);
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        }
    }
}
```

### Setting Transaction Timeout

```java
// Set timeout via Statement
try (Statement stmt = conn.createStatement()) {
    stmt.setQueryTimeout(30);  // 30 seconds timeout
    stmt.execute("SELECT long_running_query()");
}
```

### Read-Only Transaction

```java
conn.setAutoCommit(false);
conn.setReadOnly(true);  // Optimizer can leverage this for optimization
try (Statement stmt = conn.createStatement()) {
    ResultSet rs = stmt.executeQuery("SELECT * FROM large_table");
    // ...
}
conn.commit();
```

## Distributed Transactions (XA)

```java
// Requires XADataSource
import javax.transaction.xa.*;

XADataSource xaDs = ...; // Configure XA data source
XAConnection xaConn = xaDs.getXAConnection();
Connection conn = xaConn.getConnection();
XAResource xaRes = xaConn.getXAResource();

// XID transaction identifier
Xid xid = new MyXid(1, "branch1".getBytes(), "global1".getBytes());

try {
    xaRes.start(xid, XAResource.TMNOFLAGS);
    // Execute SQL
    conn.createStatement().executeUpdate("INSERT ...");
    xaRes.end(xid, XAResource.TMSUCCESS);

    // Commit phase
    int rc = xaRes.prepare(xid);
    if (rc == XAResource.XA_OK) {
        xaRes.commit(xid, false);
    }
} catch (XAException e) {
    xaRes.rollback(xid);
}
```

## Error Handling

### Common Transaction Error Codes

| SQLState | Description | Handling |
|----------|-------------|----------|
| 40001 | Serialization failure | Retry transaction |
| 40P01 | Deadlock detected | Retry transaction |
| 25P02 | Transaction aborted | Rollback and retry |
| 08006 | Connection failure | Reconnect |

### Transaction Retry Pattern

```java
public void withRetry(int maxRetries, RunnableWithSQL action) {
    for (int i = 0; i < maxRetries; i++) {
        try (Connection conn = ds.getConnection()) {
            conn.setAutoCommit(false);
            try {
                action.run(conn);
                conn.commit();
                return;
            } catch (SQLException e) {
                conn.rollback();
                if (!isRetryable(e) || i == maxRetries - 1) {
                    throw e;
                }
                Thread.sleep(100 * (i + 1));  // Linear backoff
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }
}

private boolean isRetryable(SQLException e) {
    String state = e.getSQLState();
    return "40001".equals(state) || "40P01".equals(state);
}
```
