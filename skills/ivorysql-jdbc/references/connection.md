---
title: IvorySQL JDBC Connection Management
description: Connection strings, connection pools, SSL configuration
tags: ivorysql, jdbc, connection, hikari, ssl
---

# IvorySQL JDBC Connection Management

## Connection String Format

```
jdbc:postgresql://host:port/database?param1=value1&param2=value2
```

### Common Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| user | Username | - |
| password | Password | - |
| currentSchema | Default schema | public |
| ssl | Enable SSL | false |
| sslmode | SSL mode | prefer |
| ApplicationName | Application name | - |
| prepareThreshold | Prepare threshold | 5 |
| binaryTransfer | Binary transfer | true |
| reWriteBatchedInserts | Batch rewrite | false |

### SSL Connection

```
jdbc:postgresql://host:5432/ivorysql?ssl=true&sslmode=verify-full
```

## Connection Pools

### HikariCP (Recommended)

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/ivorysql");
config.setUsername("ivorysql");
config.setPassword("secret");
config.setMaximumPoolSize(20);
config.setMinimumIdle(5);
config.setIdleTimeout(600000);
config.setMaxLifetime(1800000);
config.setConnectionTimeout(30000);
HikariDataSource ds = new HikariDataSource(config);

try (Connection conn = ds.getConnection()) {
    // Use connection
}
```

### Druid

```java
DruidDataSource ds = new DruidDataSource();
ds.setUrl("jdbc:postgresql://localhost:5432/ivorysql");
ds.setUsername("ivorysql");
ds.setPassword("secret");
ds.setInitialSize(5);
ds.setMinIdle(5);
ds.setMaxActive(20);
ds.setMaxWait(60000);
```

## Oracle Compatibility Mode Configuration

```java
// Set compatibility mode after connection
try (Connection conn = ds.getConnection();
     Statement stmt = conn.createStatement()) {
    stmt.execute("SET ivorysql.compatible_mode TO oracle");
}
```
