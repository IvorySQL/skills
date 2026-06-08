---
title: IvorySQL ODBC Connection Management
description: DSN configuration, connection strings, SSL
tags: ivorysql, odbc, connection, dsn, ssl
---

# IvorySQL ODBC Connection Management

## DSN Configuration

### System DSN (odbc.ini)

```ini
[IvorySQL]
Description=IvorySQL Database
Driver=PostgreSQL
Servername=localhost
Port=5432
Database=ivorysql
Username=ivorysql
Password=secret
ReadOnly=No
SSLmode=prefer
```

### Driver Configuration (odbcinst.ini)

```ini
[PostgreSQL]
Description=PostgreSQL ODBC Driver
Driver=/usr/lib64/psqlodbcw.so
Setup=/usr/lib64/psqlodbcw.so
```

## Connection Strings

```
DSN=IvorySQL;UID=ivorysql;PWD=secret
Driver={PostgreSQL};Server=localhost;Port=5432;Database=ivorysql;Uid=ivorysql;Pwd=secret
```

## SSL Configuration

```
Driver={PostgreSQL};Server=localhost;Port=5432;Database=ivorysql;Uid=ivorysql;Pwd=secret;SSLmode=require
```
