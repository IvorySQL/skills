---
title: ODBC Installation and DSN Configuration
description: psqlODBC installation, DSN configuration, connection strings
tags: ivorysql, odbc, installation, dsn
---

# ODBC Installation and DSN Configuration

```bash
# Linux
yum install postgresql-odbc

# Windows: Download psqlODBC installer
```

```ini
# /etc/odbcinst.ini
[PostgreSQL]
Driver=/usr/lib/psqlodbcw.so

# /etc/odbc.ini
[IvorySQL]
Driver=PostgreSQL
Servername=localhost
Port=5432
Database=ivorysql
Username=ivorysql
Password=password
```
