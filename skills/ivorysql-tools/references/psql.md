---
title: psql Command Line Reference
description: IvorySQL psql command line tool complete reference, including connection, meta-commands, parser switching, and export/import
tags:
  - tools
  - psql
  - cli
  - reference
---

# psql Command Line Reference

## Connection

### Basic Connection

```bash
# Connect to local default database
psql

# Specify user and database
psql -U sysadmin -d mydb

# Specify host and port
psql -h ivorysql-host -p 1521 -U sysadmin -d mydb

# Use connection string
psql "postgresql://sysadmin:password@ivorysql-host:1521/mydb"

# Use service name (~/.pg_service.conf)
psql service=ivorysql_prod
```

### Connection Parameters

| Parameter | Description | Example |
|------|------|------|
| `-h HOST` | Host address | `-h localhost` |
| `-p PORT` | Port | `-p 1521` |
| `-U USER` | Username | `-U sysadmin` |
| `-d DB` | Database name | `-d mydb` |
| `-w` | No password prompt | |
| `-W` | Force password prompt | |
| `-c SQL` | Execute single SQL | `-c "SELECT 1"` |
| `-f FILE` | Execute SQL file | `-f script.sql` |
| `-o FILE` | Output to file | `-o result.txt` |
| `-F SEP` | Field separator | `-F ','` |
| `-A` | Unaligned mode | |
| `-t` | Show data only | |
| `-q` | Quiet mode | |
