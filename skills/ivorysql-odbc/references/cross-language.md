---
title: IvorySQL ODBC Cross-Language Access
description: Python/C/Excel/BI tools access IvorySQL via ODBC
tags: ivorysql, odbc, cross-language, python, excel, bi
---

# IvorySQL ODBC Cross-Language Access

## Python (pyodbc)

```python
import pyodbc
conn = pyodbc.connect('DSN=IvorySQL;UID=ivorysql;PWD=secret')
cursor = conn.cursor()
cursor.execute("SELECT * FROM employees")
for row in cursor.fetchall():
    print(row)
```

## C Language

```c
#include <sql.h>
#include <sqlext.h>

SQLHENV env;
SQLHDBC dbc;
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &env);
SQLSetEnvAttr(env, SQL_ATTR_ODBC_VERSION, (void*)SQL_OV_ODBC3, 0);
SQLAllocHandle(SQL_HANDLE_DBC, env, &dbc);
SQLConnect(dbc, (SQLCHAR*)"IvorySQL", SQL_NTS,
           (SQLCHAR*)"ivorysql", SQL_NTS,
           (SQLCHAR*)"secret", SQL_NTS);
```

## Excel

1. Data → Get Data → From Other Sources → From ODBC
2. Select IvorySQL DSN
3. Enter credentials
4. Select tables or write SQL query

## Power BI / Tableau

1. Get Data → ODBC
2. Select IvorySQL DSN
3. Enter credentials
4. Import data or DirectQuery
