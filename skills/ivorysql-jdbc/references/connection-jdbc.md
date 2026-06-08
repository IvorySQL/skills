# IvorySQL JDBC Connection

## Maven Dependency

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.2</version>
</dependency>
```

## Basic Connection

```java
String url = "jdbc:postgresql://localhost:1521/ivorysql";
Connection conn = DriverManager.getConnection(url, "ivorysql", "secret");
```

## Oracle Compatibility Mode

```java
// Via URL parameter
String url = "jdbc:postgresql://localhost:1521/ivorysql"
    + "?options=-c%20ivorysql.compatible_mode=oracle";

// Or via Properties
Properties props = new Properties();
props.setProperty("user", "ivorysql");
props.setProperty("password", "secret");
props.setProperty("options", "-c ivorysql.compatible_mode=oracle");
props.setProperty("loginTimeout", "30");
props.setProperty("socketTimeout", "60");
props.setProperty("binaryTransfer", "true");
props.setProperty("prepareThreshold", "5");

Connection conn = DriverManager.getConnection(url, props);
```

## Dual-Port Mode

| Port | Mode | Description |
|------|------|-------------|
| 5432 | PostgreSQL | PG native connection |
| 1521 | Oracle Compatible | Defaults to Oracle mode |

```java
// PG mode (port 5432)
String urlPg = "jdbc:postgresql://localhost:5432/ivorysql";

// Oracle compatibility mode (port 1521)
String urlOra = "jdbc:postgresql://localhost:1521/ivorysql"
    + "?options=-c ivorysql.compatible_mode=oracle";
```

## Driver Loading

```java
// JDBC 4.0+ auto-loading, can be omitted
Class.forName("org.postgresql.Driver");

// Explicit loading (legacy compatibility)
DriverManager.registerDriver(new org.postgresql.Driver());
```

## Complete Example

```java
import java.sql.*;
import java.util.Properties;

public class IvorySQLJDBCDemo {
    public static void main(String[] args) throws SQLException {
        String url = "jdbc:postgresql://localhost:1521/ivorysql";
        Properties props = new Properties();
        props.setProperty("user", "ivorysql");
        props.setProperty("password", "secret");
        props.setProperty("options", "-c ivorysql.compatible_mode=oracle");

        try (Connection conn = DriverManager.getConnection(url, props)) {
            System.out.println("Connected successfully: " + conn.getCatalog());

            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT version()")) {
                if (rs.next()) {
                    System.out.println("Version: " + rs.getString(1));
                }
            }
        }
    }
}
```

## URL Parameters Reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| loginTimeout | 0 | Connection timeout (seconds) |
| socketTimeout | 0 | Socket timeout (seconds) |
| connectTimeout | 10 | Connection establishment timeout (seconds) |
| prepareThreshold | 5 | Start server-side prepare after 5 executions |
| binaryTransfer | false | Binary transfer mode |
| reWriteBatchedInserts | false | Rewrite batched INSERTs |
| ssl | false | SSL connection |
| sslmode | prefer | SSL mode (disable/allow/prefer/require) |