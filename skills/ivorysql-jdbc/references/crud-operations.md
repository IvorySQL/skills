---
title: IvorySQL JDBC CRUD Operations
description: Statement/PreparedStatement/Batch operations/Transaction control
tags: ivorysql, jdbc, crud, prepared-statement, batch, transaction
---

# IvorySQL JDBC CRUD Operations

## Basic Operations

### Query

```java
// Simple query
try (Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT * FROM employees")) {
    while (rs.next()) {
        int id = rs.getInt("id");
        String name = rs.getString("name");
        double salary = rs.getDouble("salary");
    }
}

// Parameterized query
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT * FROM employees WHERE department = ? AND salary > ?")) {
    ps.setString(1, "IT");
    ps.setDouble(2, 5000);
    ResultSet rs = ps.executeQuery();
}
```

### Insert

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary) VALUES (?, ?)",
        Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, "Zhang San");
    ps.setDouble(2, 8000);
    ps.executeUpdate();

    try (ResultSet rs = ps.getGeneratedKeys()) {
        if (rs.next()) {
            int id = rs.getInt(1);
        }
    }
}
```

### Update and Delete

```java
// Update
try (PreparedStatement ps = conn.prepareStatement(
        "UPDATE employees SET salary = ? WHERE id = ?")) {
    ps.setDouble(1, 9000);
    ps.setInt(2, 1);
    int rows = ps.executeUpdate();
}

// Delete
try (PreparedStatement ps = conn.prepareStatement(
        "DELETE FROM employees WHERE id = ?")) {
    ps.setInt(1, 1);
    int rows = ps.executeUpdate();
}
```

## Batch Operations

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary) VALUES (?, ?)")) {
    for (int i = 0; i < 1000; i++) {
        ps.setString(1, "Employee" + i);
        ps.setDouble(2, 5000 + i);
        ps.addBatch();
        if (i % 100 == 0) {
            ps.executeBatch();
        }
    }
    ps.executeBatch();
}
```

## Transaction Control

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
}
```

## Oracle-Compatible SQL

```java
// Use Oracle-compatible functions
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT NVL(salary, 0), DECODE(department, 'IT', 'Tech Dept', 'Other') FROM employees")) {
    ResultSet rs = ps.executeQuery();
}

// Call stored procedure
try (CallableStatement cs = conn.prepareCall("{call update_salary(?, ?)}")) {
    cs.setInt(1, 1);
    cs.setDouble(2, 10000);
    cs.execute();
}
```
