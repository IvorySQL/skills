---
title: GUI Tools
description: IvorySQL GUI management tools reference, covering pgAdmin, DBeaver, and IvorySQL Cloud configuration and usage
tags:
  - tools
  - gui
  - pgadmin
  - dbeaver
---

# GUI Tools

## Tool Comparison

| Tool | Type | Platform | Oracle Mode Support | Cost | Use Case |
|------|------|------|----------------|------|---------|
| pgAdmin 4 | Web/Desktop | Cross-platform | Yes | Free | PostgreSQL dedicated |
| DBeaver | Desktop | Cross-platform | Yes | Free/Commercial | Universal database |
| DataGrip | Desktop | Cross-platform | Yes | Commercial | Professional development |
| Navicat | Desktop | Cross-platform | Yes | Commercial | DBA management |
| IvorySQL Cloud | Web | Browser | Yes | Commercial | IvorySQL dedicated |

## pgAdmin 4

### Installation

```bash
# Docker deployment (recommended)
docker run -d \
    --name pgadmin4 \
    -e PGADMIN_DEFAULT_EMAIL=admin@example.com \
    -e PGADMIN_DEFAULT_PASSWORD=admin123 \
    -p 5050:80 \
    -v pgadmin-data:/var/lib/pgadmin \
    dpage/pgadmin4

# CentOS/RHEL
sudo yum install -y pgadmin4

# Ubuntu/Debian
sudo apt-get install -y pgadmin4

# Python pip
pip install pgadmin4
```

### Connecting to IvorySQL

1. Open pgAdmin 4
2. Right-click "Servers" → "Register" → "Server"
3. Fill in connection details:

| Parameter | PG Mode | Oracle Mode |
|------|---------|------------|
| Host | `ivorysql-host` | `ivorysql-host` |
| Port | `5432` | `1521` |
| Maintenance DB | `postgres` | `postgres` |
| Username | `postgres` | `sysadmin` |
| Password | password | password |

4. Optional configuration in the "Advanced" tab:
   - Service: custom service name
   - SSL Mode: `require` or `verify-full` recommended for production

### Common Features

```sql
-- Query Tool
-- Shortcut: Alt+Shift+Q

-- View table structure
-- Object Browser → Tables → Right-click → Properties

-- Execution plan analysis
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM employees WHERE deptno = 10;

-- Graphical execution plan
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM employees WHERE deptno = 10;

-- ER diagram generation
-- Tools → ERD Tool

-- Data export
-- Query results → Right-click → Download as CSV/JSON
```

### pgAdmin Configuration Optimization

```ini
# config_distro.py or config_local.py

# Enhanced connection timeout
DEFAULT_SERVER = '0.0.0.0'
DEFAULT_SERVER_PORT = 5050

# Session timeout (seconds)
SESSION_EXPIRATION_TIME = 7 * 24 * 3600  # 7 days

# Maximum upload size
MAX_CONTENT_LENGTH = 256 * 1024 * 1024  # 256MB

# Allowed file extensions
ALLOWED_FILE_EXTENSIONS = ['.sql', '.csv', '.json', '.xml']
```

## DBeaver

### Installation

```bash
# Download
wget https://dbeaver.io/files/dbeaver-ce-latest-linux.x86_64.rpm
sudo rpm -ivh dbeaver-ce-latest-linux.x86_64.rpm

# Or DEB
wget https://dbeaver.io/files/dbeaver-ce-latest-linux.amd64.deb
sudo dpkg -i dbeaver-ce-latest-linux.amd64.deb

# macOS
brew install --cask dbeaver-community

# Windows
# Download installer from https://dbeaver.io/download/
```

### Connecting to IvorySQL

1. New Connection → PostgreSQL
2. Fill in connection parameters:

| Parameter | Value |
|------|------|
| Host | `ivorysql-host` |
| Port | `5432` or `1521` |
| Database | `mydb` |
| Username | `sysadmin` |
| Password | password |

3. Advanced parameters available in "Driver properties":
   - `ssl`: `true`
   - `sslmode`: `verify-full`
   - `preferQueryMode`: `extended`
   - `options`: `-c ivorysql.compatible_mode=oracle`

### DBeaver Features

```sql
-- SQL Editor
-- Shortcut: Ctrl+Enter to execute, Ctrl+\ to format

-- ER Diagram
-- Database → Right-click → Generate ER Diagram

-- Data Export
-- Table → Right-click → Export Data
-- Supported formats: CSV, SQL, JSON, XML, Excel

-- Data Import
-- Table → Right-click → Import Data
-- Supported formats: CSV, SQL, JSON, XML, Excel

-- Database Comparison
-- Tools → Compare Structure / Compare Data

-- Database Dump
-- Tools → Backup / Restore (calls pg_dump/pg_restore)
```

### DBeaver Driver Configuration

```xml
<!-- Custom JDBC URL template -->
<!-- In connection settings → Driver properties -->
<!-- For Oracle mode, add connection initialization SQL -->

<!-- Connection Init SQL: -->
SET ivorysql.compatible_mode = oracle;
SET ivorysql.identifier_case = upper;
SET search_path = sys, ora, public;
```

## DataGrip

### Connecting to IvorySQL

1. File → Data Sources → + → PostgreSQL
2. Configure connection:

| Parameter | Value |
|------|------|
| Host | `ivorysql-host` |
| Port | `5432` or `1521` |
| Database | `mydb` |
| User | `sysadmin` |
| Password | password |
| URL | `jdbc:postgresql://ivorysql-host:1521/mydb` |

3. Advanced tab → VM options:
```
-Djdbc.url.parameters=options=-c%20ivorysql.compatible_mode=oracle
```

### Common Features

```
-- Smart code completion
-- Ctrl+Space: Basic completion
-- Ctrl+Shift+Space: Type completion

-- Navigation
-- Ctrl+N: Find tables/objects
-- Ctrl+Shift+N: Find files

-- Refactoring
-- Shift+F6: Rename
-- Ctrl+Alt+L: Format

-- Data editing
-- Double-click table → Data View → Edit data directly

-- Database comparison
-- Right-click database → Compare With...
```

## Navicat

### Connecting to IvorySQL

1. Connection → PostgreSQL
2. General tab:

| Parameter | Value |
|------|------|
| Host | `ivorysql-host` |
| Port | `5432` or `1521` |
| Initial Database | `mydb` |
| Username | `sysadmin` |
| Password | password |

3. Advanced tab:
   - Check "Use SSL"
   - Connection timeout: 30 seconds

### Key Features

- **Data Transfer**: Direct data transfer between different databases
- **Data Synchronization**: Table-level data comparison and sync
- **Schema Synchronization**: Schema comparison and sync
- **Query Builder**: Visual query building
- **Model**: Database modeling and design
- **Backup**: Visual backup/restore

## IvorySQL Cloud

### Overview

IvorySQL Cloud is the official IvorySQL cloud management platform, providing visual database management and monitoring capabilities.

### Access

```
URL: https://cloud.ivorysql.org
```

### Main Features

| Feature | Description |
|------|------|
| Instance Management | Create/delete/scale IvorySQL instances |
| Monitoring Dashboard | CPU/memory/connections/query monitoring |
| Performance Analysis | Slow query identification and optimization suggestions |
| Backup Management | Automatic/manual backup and restore |
| High Availability | Primary-replica replication, failover |
| SQL Workbench | Online SQL editing and execution |
| Schema Management | Visual table/index/view management |
| Alert Notifications | Custom alert rules and notifications |

### Creating an Instance

1. Log in to IvorySQL Cloud
2. Click "Create Instance"
3. Configure instance parameters:

| Parameter | Options |
|------|------|
| Instance Name | Custom |
| Compatibility Mode | Oracle / PG |
| Specification | CPU/memory configuration |
| Storage | SSD capacity |
| Region | Availability zone |
| Network | VPC/subnet |
| High Availability | Enable or not |
| Backup Policy | Automatic backup retention days |

4. Confirm creation

### Monitoring Dashboard

```sql
-- Monitoring metrics provided by IvorySQL Cloud
-- Performance metrics
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_stat_database;
SELECT * FROM pg_stat_user_tables;

-- Replication monitoring
SELECT * FROM pg_stat_replication;

-- Lock monitoring
SELECT * FROM pg_locks WHERE NOT granted;

-- WAL statistics
SELECT * FROM pg_stat_wal;
```

## Generic Connection Configuration

### JDBC URL Templates

```
# PG Mode
jdbc:postgresql://host:5432/dbname?currentSchema=public&sslmode=require

# Oracle Mode
jdbc:postgresql://host:1521/dbname?currentSchema=sys,public&options=-c%20ivorysql.compatible_mode=oracle

# With SSL
jdbc:postgresql://host:5432/dbname?ssl=true&sslmode=verify-full&sslrootcert=/path/to/ca.crt&sslcert=/path/to/client.crt&sslkey=/path/to/client.key
```

### Connection Pool Configuration Reference

| Parameter | Recommended Value | Description |
|------|--------|------|
| Max Connections | 20-50 | Per application instance |
| Min Idle Connections | 5 | Keep warm |
| Connection Timeout | 30s | Connection establishment timeout |
| Idle Timeout | 600s | Idle connection reclamation |
| Max Lifetime | 1800s | Maximum connection lifetime |
| Connection Test | `SELECT 1` | Connection validity check |

## Notes

1. **Driver Version**: Ensure JDBC driver version matches IvorySQL/PostgreSQL version, 42.5+ recommended
2. **SSL Configuration**: Enable SSL encrypted connections in production environments
3. **Oracle Mode Search Path**: Set `search_path = sys, ora, public` when connecting
4. **Timeout Settings**: Set connection/query timeouts appropriately to avoid holding connections for too long
5. **Permission Management**: Database users used by GUI tools should follow the principle of least privilege
6. **Auto Commit**: Pay attention to GUI tool auto-commit settings; manual transaction control is recommended for bulk operations
