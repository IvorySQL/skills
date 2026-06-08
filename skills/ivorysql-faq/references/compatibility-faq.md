---
title: Common Issues
description: IvorySQL common issue troubleshooting, covering installation, compatibility, connection, and performance FAQ
tags:
  - faq
  - troubleshooting
  - installation
  - compatibility
---

# Common Issues

## Installation Issues

### Q: initdb reports "directory exists but is not empty"

```
initdb: error: directory "/var/lib/ivorysql/data" exists but is not empty
```

**Cause**: The data directory already contains content, possibly from a previous initialization.

**Solution**:

```bash
# Option 1: Backup then clear
sudo cp -r /var/lib/ivorysql/data /var/lib/ivorysql/data.bak
sudo rm -rf /var/lib/ivorysql/data/*
initdb -m oracle -D /var/lib/ivorysql/data

# Option 2: Use a new directory
initdb -m oracle -D /var/lib/ivorysql/newdata
```

### Q: Yum install cannot find ivorysql package

**Cause**: IvorySQL Yum repository is not configured.

**Solution**:

```bash
# Configure repository
sudo yum install -y https://yum.ivorysql.org/ivorysql-release/rhel/7/x86_64/ivorysql-release-1.0-1.el7.noarch.rpm

# Clean cache
sudo yum clean all
sudo yum makecache

# Verify
yum list | grep ivorysql
```

### Q: Source compilation reports "readline library not found"

**Solution**:

```bash
# CentOS/RHEL
sudo yum install -y readline-devel

# Ubuntu/Debian
sudo apt-get install -y libreadline-dev

# If still failing, disable readline
./configure --without-readline
```

### Q: `--with-oraport` option not recognized during compilation

**Cause**: Using the wrong IvorySQL version or branch.

**Solution**:

```bash
# Make sure to use IvorySQL source instead of native PostgreSQL
git clone https://github.com/IvorySQL/IvorySQL.git
cd IvorySQL
git checkout IV5_REL_5_3_STABLE

# Verify configure supports --with-oraport
./configure --help | grep oraport
```

## Compatibility Issues

### Q: DATE type does not include time portion in Oracle mode

**Cause**: `ivorysql.datatype` parameter is not set correctly.

**Solution**:

```sql
-- Confirm Oracle data type compatibility is enabled
SHOW ivorysql.datatype;
-- Should return 'oracle'

-- Set Oracle data type mode
SET ivorysql.datatype = oracle;

-- Now DATE includes time
CREATE TABLE test (dt DATE);
INSERT INTO test VALUES (TO_DATE('2024-06-15 14:30:00', 'YYYY-MM-DD HH24:MI:SS'));
SELECT TO_CHAR(dt, 'YYYY-MM-DD HH24:MI:SS') FROM test;
-- Output: 2024-06-15 14:30:00
```

### Q: Oracle functions such as NVL, DECODE cannot be used

**Cause**: Oracle function compatibility is not enabled.

**Solution**:

```sql
-- Check function compatibility mode
SHOW ivorysql.function;
SHOW ivorysql.enable_oracle_function;

-- Enable
SET ivorysql.function = oracle;
SET ivorysql.enable_oracle_function = true;

-- Verify
SELECT NVL(NULL, 'default');
SELECT DECODE(1, 1, 'one', 'other');
```

### Q: Inconsistent identifier case causes table not found

**Cause**: Oracle mode and PG mode handle identifier case differently.

**Solution**:

```sql
-- Oracle mode (case-insensitive, stored as uppercase)
SET ivorysql.identifier_case = upper;
CREATE TABLE MyTable (Id NUMBER);
-- Stored as MYTABLE (ID)
SELECT * FROM mytable;    -- OK
SELECT * FROM MYTABLE;    -- OK
SELECT * FROM "MyTable";  -- Error, case-sensitive

-- PG mode (case-insensitive, stored as lowercase)
SET ivorysql.identifier_case = lower;
CREATE TABLE MyTable (Id INTEGER);
-- Stored as mytable (id)
SELECT * FROM MyTable;    -- OK
SELECT * FROM mytable;    -- OK

-- Check actual table names
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Q: Inconsistent behavior between empty strings and NULL

**Cause**: In Oracle, empty strings are equivalent to NULL; in PostgreSQL, they are not.

**Solution**:

```sql
-- Enable empty string to NULL conversion
SET ivorysql.emptystring_to_null = true;

INSERT INTO test (name) VALUES ('');   -- Stored as NULL
SELECT * FROM test WHERE name IS NULL; -- Can be found

-- Disable (PG default behavior)
SET ivorysql.emptystring_to_null = false;

INSERT INTO test (name) VALUES ('');   -- Stored as empty string
SELECT * FROM test WHERE name = '';    -- Can be found
```

### Q: DUAL table does not exist

**Cause**: Not running in Oracle mode, or DUAL table was not created.

**Solution**:

```sql
-- Switch to Oracle mode
SET ivorysql.compatible_mode = oracle;

-- Verify DUAL table
SELECT * FROM DUAL;

-- If still not exists, create manually
CREATE TABLE DUAL (DUMMY VARCHAR2(1));
INSERT INTO DUAL VALUES ('X');
```

## Connection Issues

### Q: Cannot connect to IvorySQL remotely

**Troubleshooting steps**:

```bash
# 1. Check listen address
# postgresql.conf
listen_addresses = '*'

# 2. Check pg_hba.conf
# Add remote access rule
host    all    all    0.0.0.0/0    scram-sha-256

# 3. Reload configuration
pg_ctl reload -D /var/lib/ivorysql/data
# or
SELECT pg_reload_conf();

# 4. Check firewall
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload

# 5. Check SELinux
getenforce
sudo setenforce 0  # Temporarily disable

# 6. Test connection
psql -h remote-host -p 5432 -U sysadmin -d mydb
```

### Q: Connection reports "FATAL: no pg_hba.conf entry"

**Solution**:

```bash
# Edit pg_hba.conf, add client IP access rule
# TYPE  DATABASE  USER  ADDRESS         METHOD
host    mydb      app   192.168.1.0/24  scram-sha-256

# Reload configuration
pg_ctl reload
```

### Q: Connection timeout

**Troubleshooting steps**:

```bash
# 1. Check network connectivity
ping ivorysql-host
telnet ivorysql-host 5432

# 2. Check if IvorySQL is running
pg_isready -h ivorysql-host -p 5432

# 3. Check if connections are full
SELECT count(*) FROM pg_stat_activity;
SHOW max_connections;

# 4. Check connection timeout parameter
# postgresql.conf
authentication_timeout = 60s
```

### Q: Password authentication failed

**Troubleshooting steps**:

```sql
-- 1. Check authentication method
-- METHOD column in pg_hba.conf

-- 2. Check password encryption method
SHOW password_encryption;

-- 3. Reset password (using correct encryption method)
SET password_encryption = 'scram-sha-256';
ALTER USER sysadmin PASSWORD 'newpassword';

-- 4. If upgrading from md5 to scram-sha-256
-- All users need to reset their passwords
```

## Performance Issues

### Q: Query is slow, how to troubleshoot

**Troubleshooting steps**:

```sql
-- 1. View slow queries
SELECT query, calls, round(total_exec_time::numeric, 2) AS total_ms,
       round(mean_exec_time::numeric, 2) AS avg_ms
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;

-- 2. Analyze execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM large_table WHERE col = 'value';

-- 3. Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'your_table';

-- 4. Check lock waits
SELECT pid, wait_event_type, wait_event, query
FROM pg_stat_activity
WHERE wait_event IS NOT NULL;

-- 5. Check cache hit ratio
SELECT sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) AS cache_hit_ratio
FROM pg_statio_user_tables;
```

### Q: Autovacuum cannot keep up

**Solution**:

```sql
-- 1. View dead tuple count for tables
SELECT relname, n_live_tup, n_dead_tup,
       last_autovacuum, last_autoanalyze
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC;

-- 2. Adjust autovacuum parameters
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.05;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.02;
ALTER SYSTEM SET autovacuum_max_workers = 6;
ALTER SYSTEM SET autovacuum_vacuum_cost_limit = 2000;
SELECT pg_reload_conf();

-- 3. Set specific parameters for large tables
ALTER TABLE large_table SET (
    autovacuum_vacuum_scale_factor = 0.01,
    autovacuum_analyze_scale_factor = 0.005
);

-- 4. Manually trigger vacuum
VACUUM ANALYZE large_table;
```

### Q: Connection pool exhausted

**Solution**:

```sql
-- 1. View active connections
SELECT datname, usename, client_addr, state, query
FROM pg_stat_activity
ORDER BY query_start;

-- 2. Terminate idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND query_start < now() - interval '30 minutes';

-- 3. Increase max connections
ALTER SYSTEM SET max_connections = 300;
-- Requires restart

-- 4. Use connection pooling (recommended)
-- Configure PgBouncer or PgPool-II
```

### Q: Insufficient disk space

**Troubleshooting steps**:

```sql
-- 1. Check database size
SELECT datname, pg_size_pretty(pg_database_size(datname)) AS size
FROM pg_database
ORDER BY pg_database_size(datname) DESC;

-- 2. Check table size
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- 3. Reclaim space
VACUUM FULL large_table;  -- Reclaims space, locks table
-- or use pg_repack (no table lock)
```

## Notes

1. After modifying `postgresql.conf`, some parameters require `pg_ctl reload`, others require a restart
2. After modifying `pg_hba.conf`, only `pg_ctl reload` is needed
3. For production environments, it is recommended to enable `log_min_duration_statement` to log slow queries
4. Run `ANALYZE` regularly to update statistics
5. Always test large table operations in a test environment first
