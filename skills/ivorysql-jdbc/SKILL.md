---
name: IvorySQL JDBC Development
name_for_command: ivorysql-jdbc
description: |
  Complete IvorySQL JDBC development guide: PostgreSQL JDBC driver connection (Oracle port 1521),
  Connection/Session configuration, PreparedStatement/CallableStatement,
  batch operations (BATCH), transaction control (Savepoint/isolation levels), connection pooling (HikariCP/Druid),
  CRUD, stored procedure calls, Oracle-compatible functions, ResultSet handling, common error handling.
---

# IvorySQL JDBC Development

## Workflow

Trigger this skill when encountering the following issues:
- Java connects to IvorySQL
- JDBC CRUD / PreparedStatement
- HikariCP / Druid connection pool
- Java batch inserts / transactions
- CallableStatement for stored procedures
- Oracle-compatible functions (NVL/DECODE)
- JDBC driver configuration

**Sub-skill routing**:
- Connection configuration → [connection-jdbc](references/connection-jdbc.md)
- CRUD detailed examples → [crud-jdbc](references/crud-jdbc.md)
- Transaction control → [transaction-jdbc](references/transaction-jdbc.md)
- Connection pool configuration → [pool-jdbc](references/pool-jdbc.md)

## Driver Dependencies

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.2</version>
</dependency>
```

## Connection Methods

```java
// Basic connection
String url = "jdbc:postgresql://localhost:1521/ivorysql";
Connection conn = DriverManager.getConnection(url, "ivorysql", "secret");

// Oracle compatibility mode
String url = "jdbc:postgresql://localhost:1521/ivorysql"
    + "?options=-c%20ivorysql.compatible_mode=oracle";

// PG mode (port 5432)
String urlPg = "jdbc:postgresql://localhost:5432/ivorysql";
```

> For details: [connection-jdbc](references/connection-jdbc.md)

## CRUD Operations

### Query

```java
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT * FROM employees WHERE department = ? AND salary > ?")) {
    ps.setString(1, "IT");
    ps.setDouble(2, 5000);
    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getString("name"));
        }
    }
}
```

### Insert with Return ID

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary) VALUES (?, ?)",
        Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, "Zhang San");
    ps.setDouble(2, 8000);
    ps.executeUpdate();
    try (ResultSet rs = ps.getGeneratedKeys()) {
        if (rs.next()) System.out.println("New ID: " + rs.getLong(1));
    }
}
```

> For details: [crud-jdbc](references/crud-jdbc.md)

## Batch Operations

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary) VALUES (?, ?)")) {
    for (Employee e : employees) {
        ps.setString(1, e.getName());
        ps.setDouble(2, e.getSalary());
        ps.addBatch();
    }
    int[] results = ps.executeBatch();
}
```

## Transaction Control

```java
conn.setAutoCommit(false);
try {
    // Business operations
    updateAccount(conn, fromId, -amount);
    updateAccount(conn, toId, amount);
    conn.commit();
} catch (SQLException e) {
    conn.rollback();
    throw e;
} finally {
    conn.setAutoCommit(true);
}
```

> For details: [transaction-jdbc](references/transaction-jdbc.md)

## Stored Procedure Calls

```java
// IN parameters
try (CallableStatement cs = conn.prepareCall("{call update_salary(?, ?)}")) {
    cs.setInt(1, 1);
    cs.setDouble(2, 10000);
    cs.execute();
}

// OUT parameters
try (CallableStatement cs = conn.prepareCall("{call get_emp_info(?, ?, ?)}")) {
    cs.setInt(1, 1);
    cs.registerOutParameter(2, Types.VARCHAR);
    cs.registerOutParameter(3, Types.DOUBLE);
    cs.execute();
    System.out.println(cs.getString(2) + ": " + cs.getDouble(3));
}

// Function return value
try (CallableStatement cs = conn.prepareCall("{? = call get_emp_name(?)}")) {
    cs.registerOutParameter(1, Types.VARCHAR);
    cs.setInt(2, 1);
    cs.execute();
    System.out.println("Name: " + cs.getString(1));
}
```

## Connection Pool

### HikariCP (Recommended)

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:1521/ivorysql");
config.setUsername("ivorysql");
config.setPassword("secret");
config.setMinimumIdle(5);
config.setMaximumPoolSize(50);
config.addDataSourceProperty("reWriteBatchedInserts", "true");

HikariDataSource ds = new HikariDataSource(config);
try (Connection conn = ds.getConnection()) {
    // Use connection
}
```

> For details: [pool-jdbc](references/pool-jdbc.md)

## Oracle-Compatible Functions

```java
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT name, NVL(bonus, 0), DECODE(dept, 'IT', 'Tech Dept', 'Other') "
        + "FROM employees WHERE ROWNUM <= 10")) {
    ResultSet rs = ps.executeQuery();
    while (rs.next()) {
        System.out.println(rs.getString(1) + " - Bonus: " + rs.getDouble(2));
    }
}
```

## Error Handling

| SQLState | Description | Handling |
|----------|------|------|
| 23505 | Unique constraint violation | Check for duplicate records |
| 23503 | Foreign key violation | Check references |
| 40001 | Serialization failure | Retry transaction |
| 40P01 | Deadlock | Retry transaction |

## Performance Recommendations

| Scenario | Solution |
|------|------|
| Frequent connections | HikariCP / Druid |
| Batch inserts | `addBatch` + `reWriteBatchedInserts=true` |
| Read-only queries | `conn.setReadOnly(true)` |
| Connection leaks | `leakDetectionThreshold=60000` |

## Reference Documents

- [Connection Configuration](references/connection-jdbc.md)
- [CRUD Operations](references/crud-jdbc.md)
- [Transaction Control](references/transaction-jdbc.md)
- [Connection Pool Configuration](references/pool-jdbc.md)
