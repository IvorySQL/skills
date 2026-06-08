# IvorySQL JDBC Connection Pool

## HikariCP (Recommended)

### Maven Dependency

```xml
<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.1.0</version>
</dependency>
```

### Basic Configuration

```java
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:1521/ivorysql");
config.setUsername("ivorysql");
config.setPassword("secret");
config.setDriverClassName("org.postgresql.Driver");

HikariDataSource ds = new HikariDataSource(config);

// Usage
try (Connection conn = ds.getConnection()) {
    // Execute SQL
}

// Close
ds.close();
```

### Connection Pool Size

```java
config.setMinimumIdle(5);           // Minimum idle connections
config.setMaximumPoolSize(50);      // Maximum connections
config.setIdleTimeout(600000);      // Idle timeout 10 minutes
config.setMaxLifetime(1800000);     // Max connection lifetime 30 minutes
config.setConnectionTimeout(30000); // Connection acquisition timeout 30 seconds
```

### Performance Optimization Parameters

```java
config.addDataSourceProperty("cachePrepStmts", "true");
config.addDataSourceProperty("prepStmtCacheSize", "250");
config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");
config.addDataSourceProperty("reWriteBatchedInserts", "true");
```

### Health Check

```java
config.setConnectionTestQuery("SELECT 1");
config.setValidationTimeout(5000);
config.setLeakDetectionThreshold(60000);  // Connection leak detection 60 seconds
```

### Complete Example

```java
public class HikariPool {
    private static final HikariDataSource ds;
    
    static {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:postgresql://localhost:1521/ivorysql");
        config.setUsername("ivorysql");
        config.setPassword("secret");
        config.setDriverClassName("org.postgresql.Driver");
        
        // Connection pool configuration
        config.setMinimumIdle(5);
        config.setMaximumPoolSize(50);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(30000);

        // Performance optimization
        config.addDataSourceProperty("cachePrepStmts", "true");
        config.addDataSourceProperty("prepStmtCacheSize", "250");
        config.addDataSourceProperty("reWriteBatchedInserts", "true");

        // Health check
        config.setConnectionTestQuery("SELECT 1");
        config.setLeakDetectionThreshold(60000);
        
        ds = new HikariDataSource(config);
    }
    
    public static Connection getConnection() throws SQLException {
        return ds.getConnection();
    }
    
    public static void close() {
        ds.close();
    }
}
```

## Druid (Alibaba)

### Maven Dependency

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.23</version>
</dependency>
```

### Basic Configuration

```java
import com.alibaba.druid.pool.DruidDataSource;

DruidDataSource ds = new DruidDataSource();
ds.setUrl("jdbc:postgresql://localhost:1521/ivorysql");
ds.setUsername("ivorysql");
ds.setPassword("secret");
ds.setDriverClassName("org.postgresql.Driver");

ds.setInitialSize(5);
ds.setMinIdle(5);
ds.setMaxActive(50);
ds.setMaxWait(30000);

ds.init();
```

### SQL Firewall

```java
// Enable stat monitoring and wall firewall
ds.setFilters("stat,wall");

// Custom wall configuration
WallConfig wallConfig = new WallConfig();
wallConfig.setSelectAllow(true);
wallConfig.setDeleteAllow(false);  // Disable DELETE

WallFilter wallFilter = new WallFilter();
wallFilter.setConfig(wallConfig);
ds.setProxyFilters(Arrays.asList(wallFilter));
```

### Monitoring Configuration

```java
// Enable Web monitoring (requires Servlet configuration)
StatViewServlet statViewServlet = new StatViewServlet();
// Access /druid/index.html to view monitoring dashboard
```

## Connection Pool Selection Guide

| Feature | HikariCP | Druid |
|---------|----------|-------|
| Performance | ⭐⭐⭐⭐⭐ Fastest | ⭐⭐⭐⭐ |
| Monitoring | ⭐⭐⭐ Basic | ⭐⭐⭐⭐⭐ Comprehensive |
| SQL Firewall | ❌ None | ✅ Built-in wall |
| Community Activity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Configuration Complexity | Simple | Moderate |

**Recommendations**:
- For performance → HikariCP
- For SQL audit/firewall → Druid
- Spring Boot default → HikariCP

## Connection Leak Troubleshooting

### HikariCP Leak Detection

```java
config.setLeakDetectionThreshold(60000);  // Print warning if connection not returned within 60 seconds
```

Log output:
```
WARNING - Connection leak detection triggered for connection...
```

### Druid Leak Detection

```java
ds.setRemoveAbandoned(true);        // Remove abandoned connections
ds.setRemoveAbandonedTimeout(300);  // Consider abandoned after 5 minutes
ds.setLogAbandoned(true);           // Log abandoned connections
```

## Connection Pool Monitoring

### HikariCP Prometheus Metrics

```java
// Add Prometheus monitoring
config.setMetricRegistry(prometheusRegistry);

// Expose metrics: hikaricp_connections_active, hikaricp_connections_idle, etc.
```

### Druid Built-in Monitoring

```java
// Spring Boot configuration
spring.datasource.druid.stat-view-servlet.enabled=true
spring.datasource.druid.stat-view-servlet.url-pattern=/druid/*
spring.datasource.druid.web-stat-filter.enabled=true
```

Access `http://localhost:8080/druid/` to view:
- SQL execution statistics
- URI monitoring
- Spring monitoring
- Data source information

## Connection Pool Size Calculation

Rule of thumb:
```
connections = CPU cores * 2 + effective disk count
```

Example:
- 8-core CPU + 1 SSD = 8 * 2 + 1 = 17
- Recommended: set maxPoolSize = 20, leave some margin

```java
int cpuCores = Runtime.getRuntime().availableProcessors();
int diskCount = 1;  // SSD
int optimalSize = cpuCores * 2 + diskCount;
config.setMaximumPoolSize(optimalSize);
```
