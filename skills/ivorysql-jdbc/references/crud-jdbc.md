# IvorySQL JDBC CRUD Operations

## Queries

### Basic Query

```java
try (Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT * FROM employees LIMIT 10")) {
    while (rs.next()) {
        int id = rs.getInt("id");
        String name = rs.getString("name");
        double salary = rs.getDouble("salary");
        System.out.println(id + ": " + name + " - " + salary);
    }
}
```

### PreparedStatement (SQL Injection Prevention)

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

### Generic Query Utility

```java
public <T> List<T> query(String sql, RowMapper<T> mapper, Object... params) 
        throws SQLException {
    List<T> results = new ArrayList<>();
    try (PreparedStatement ps = conn.prepareStatement(sql)) {
        for (int i = 0; i < params.length; i++) {
            ps.setObject(i + 1, params[i]);
        }
        try (ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                results.add(mapper.mapRow(rs));
            }
        }
    }
    return results;
}

// Usage example
List<Employee> employees = query(
    "SELECT * FROM employees WHERE department = ?",
    rs -> new Employee(rs.getInt("id"), rs.getString("name"), rs.getDouble("salary")),
    "IT"
);
```

### COUNT Query

```java
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT COUNT(*) FROM employees WHERE salary > ?")) {
    ps.setDouble(1, 5000);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
            long count = rs.getLong(1);
            System.out.println("Total records: " + count);
        }
    }
}
```

## Insert

### Basic Insert

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)")) {
    ps.setString(1, "Zhang San");
    ps.setDouble(2, 8000);
    ps.setString(3, "IT");
    int rows = ps.executeUpdate();
    System.out.println("Rows inserted: " + rows);
}
```

### Insert with Auto-Generated ID

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)",
        Statement.RETURN_GENERATED_KEYS)) {
    ps.setString(1, "Li Si");
    ps.setDouble(2, 9000);
    ps.setString(3, "HR");
    ps.executeUpdate();

    try (ResultSet rs = ps.getGeneratedKeys()) {
        if (rs.next()) {
            long newId = rs.getLong(1);
            System.out.println("New record ID: " + newId);
        }
    }
}
```

### Oracle Compatibility: Using Sequences

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (id, name, salary) VALUES (emp_seq.NEXTVAL, ?, ?)")) {
    ps.setString(1, "Wang Wu");
    ps.setDouble(2, 7500);
    ps.executeUpdate();
}
```

## Update

### Basic Update

```java
try (PreparedStatement ps = conn.prepareStatement(
        "UPDATE employees SET salary = ? WHERE id = ?")) {
    ps.setDouble(1, 9500);
    ps.setInt(2, 1);
    int rows = ps.executeUpdate();
    System.out.println("Rows updated: " + rows);
}
```

### Conditional Update

```java
try (PreparedStatement ps = conn.prepareStatement(
        "UPDATE employees SET salary = salary * 1.1 WHERE department = ? AND salary < ?")) {
    ps.setString(1, "IT");
    ps.setDouble(2, 5000);
    int rows = ps.executeUpdate();
    System.out.println("Employees with raise: " + rows);
}
```

### Using RETURNING

```java
try (PreparedStatement ps = conn.prepareStatement(
        "UPDATE employees SET salary = ? WHERE id = ? RETURNING salary")) {
    ps.setDouble(1, 10000);
    ps.setInt(2, 1);
    try (ResultSet rs = ps.executeQuery()) {
        if (rs.next()) {
            System.out.println("New salary: " + rs.getDouble(1));
        }
    }
}
```

## Delete

```java
try (PreparedStatement ps = conn.prepareStatement(
        "DELETE FROM employees WHERE id = ?")) {
    ps.setInt(1, 10);
    int rows = ps.executeUpdate();
    System.out.println("Rows deleted: " + rows);
}
```

## Batch Operations

### addBatch Batch Insert

```java
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO employees (name, salary, department) VALUES (?, ?, ?)")) {
    
    String[] names = {"A", "B", "C", "D", "E"};
    double[] salaries = {8000, 9000, 7500, 8500, 9500};
    String[] depts = {"IT", "HR", "IT", "Sales", "IT"};
    
    for (int i = 0; i < names.length; i++) {
        ps.setString(1, names[i]);
        ps.setDouble(2, salaries[i]);
        ps.setString(3, depts[i]);
        ps.addBatch();
    }
    
    int[] results = ps.executeBatch();
    int total = Arrays.stream(results).sum();
    System.out.println("Batch inserted: " + total + " rows");
}
```

### Batch Update

```java
try (PreparedStatement ps = conn.prepareStatement(
        "UPDATE employees SET salary = ? WHERE id = ?")) {
    
    for (Employee emp : employees) {
        ps.setDouble(1, emp.getSalary());
        ps.setInt(2, emp.getId());
        ps.addBatch();
    }
    
    int[] results = ps.executeBatch();
    int totalUpdated = Arrays.stream(results).sum();
    System.out.println("Batch updated: " + totalUpdated + " rows");
}
```

### Large-scale COPY Import

```java
// Fastest import using COPY command (requires pg_copy_in API)
// Or use reWriteBatchedInserts=true parameter to optimize batch INSERT
```

## ResultSet Handling

### Scrollable Cursor

```java
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT * FROM employees ORDER BY salary DESC",
        ResultSet.TYPE_SCROLL_INSENSITIVE,
        ResultSet.CONCUR_READ_ONLY)) {
    ResultSet rs = ps.executeQuery();
    
    rs.last();                    // Move to last row
    int total = rs.getRow();     // Get total row count
    System.out.println("Total rows: " + total);

    rs.first();                   // Move to first row
    rs.relative(5);               // Move forward 5 rows
    rs.previous();                // Move back one row
}
```

### Get Metadata

```java
try (Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT * FROM employees LIMIT 1")) {
    ResultSetMetaData meta = rs.getMetaData();
    int cols = meta.getColumnCount();
    for (int i = 1; i <= cols; i++) {
        System.out.printf("%s (%s)\n",
            meta.getColumnLabel(i),
            meta.getColumnTypeName(i));
    }
}
```

### Handling NULL

```java
String name = rs.getString("name");        // NULL -> ""
int salary = rs.getInt("salary");          // NULL -> 0

// Recommended: use wasNull() to check
int salary = rs.getInt("salary");
if (rs.wasNull()) {
    salary = 0;  // NULL value handling
}

// Or use getObject
Integer salary = (Integer) rs.getObject("salary");  // NULL -> null
```
