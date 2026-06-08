---
title: IvorySQL JDBC Advanced Features
description: Large objects, stored procedures, COPY command, Oracle compatibility mode
tags: ivorysql, jdbc, advanced, lob, stored-procedure, copy
---

# IvorySQL JDBC Advanced Features

## Large Objects (LOB)

```java
// Write large object
try (PreparedStatement ps = conn.prepareStatement(
        "INSERT INTO documents (name, content) VALUES (?, ?)")) {
    ps.setString(1, "report.pdf");
    ps.setBinaryStream(2, inputStream, fileSize);
    ps.executeUpdate();
}

// Read large object
try (PreparedStatement ps = conn.prepareStatement(
        "SELECT content FROM documents WHERE name = ?")) {
    ps.setString(1, "report.pdf");
    ResultSet rs = ps.executeQuery();
    if (rs.next()) {
        InputStream is = rs.getBinaryStream("content");
    }
}
```

## Stored Procedures

```java
// Call stored procedure (IN parameters)
try (CallableStatement cs = conn.prepareCall("{call my_proc(?, ?)}")) {
    cs.setInt(1, 1);
    cs.setString(2, "test");
    cs.execute();
}

// Call function (with return value)
try (CallableStatement cs = conn.prepareCall("{? = call my_func(?)}")) {
    cs.registerOutParameter(1, Types.VARCHAR);
    cs.setInt(2, 1);
    cs.execute();
    String result = cs.getString(1);
}

// OUT parameters
try (CallableStatement cs = conn.prepareCall("{call get_emp_info(?, ?, ?)}")) {
    cs.setInt(1, 1);
    cs.registerOutParameter(2, Types.VARCHAR);
    cs.registerOutParameter(3, Types.NUMERIC);
    cs.execute();
    String name = cs.getString(2);
    double salary = cs.getDouble(3);
}
```

## COPY Command (Batch Import/Export)

```java
// Batch import using CopyManager
CopyManager copyManager = new CopyManager((BaseConnection) conn);
StringReader reader = new StringReader("1\tZhang San\t8000\n2\tLi Si\t9000\n");
copyManager.copyIn("COPY employees (id, name, salary) FROM STDIN WITH DELIMITER '\t'", reader);

// Batch export
StringWriter writer = new StringWriter();
copyManager.copyOut("COPY employees TO STDOUT WITH DELIMITER '\t'", writer);
```

## Oracle Compatibility Mode

```java
// Set Oracle compatibility mode on connection
Properties props = new Properties();
props.setProperty("user", "ivorysql");
props.setProperty("password", "secret");
props.setProperty("options", "-c ivorysql.compatible_mode=oracle");
Connection conn = DriverManager.getConnection(url, props);

// Or set after connection
try (Statement stmt = conn.createStatement()) {
    stmt.execute("SET ivorysql.compatible_mode TO oracle");
}
```
