---
name: IvorySQL ODBC Development
name_for_command: ivorysql-odbc
description: |
  Complete IvorySQL ODBC development guide: psqlODBC driver installation, DSN configuration (Windows/Linux/macOS),
  cross-language multi-platform access (Python/C/C#/Excel/BI tools), connection string parameters, batch operations, transactions.
---

# IvorySQL ODBC Development

## Workflow

Trigger this skill when encountering the following issues:
- psqlODBC driver installation and configuration
- DSN configuration (Windows/Linux/macOS)
- Python/C/C# ODBC connection
- Excel/BI tool connection to IvorySQL

**Sub-skill routing**:
- Python development → `ivorysql-python`
- C development → `ivorysql-c`
- C# development → `ivorysql-csharp`

## Driver Installation

### Windows

```powershell
# 1. Download psqlODBC: https://www.postgresql.org/ftp/odbc/versions/msi/
# 2. After installation, open ODBC Data Source Administrator (64-bit: odbcad32.exe)
# 3. System DSN / User DSN → Add → PostgreSQL Unicode
```

### Linux

```bash
# Debian/Ubuntu
sudo apt install odbc-postgresql unixodbc unixodbc-dev

# Verify driver
odbcinst -q -d

# Configure driver (/etc/odbcinst.ini)
[PostgreSQL Unicode]
Description = PostgreSQL ODBC driver (Unicode version)
Driver      = /usr/lib/x86_64-linux-gnu/odbc/psqlodbcw.so
Setup       = /usr/lib/x86_64-linux-gnu/odbc/libodbcpsqlS.so
FileUsage   = 1
```

### macOS

```bash
brew install psqlodbc
# or
brew install unixodbc
```

## DSN Configuration

### /etc/odbc.ini (System DSN)

```ini
[ivorysql_oracle]
Description   = IvorySQL Oracle Mode
Driver        = PostgreSQL Unicode
Servername    = localhost
Port          = 1521              ; Oracle compatibility port
Database      = ivorysql
Username      = ivorysql
Password      = secret
SSLmode       = prefer
```

```ini
[ivorysql_pg]
Description = IvorySQL PG Mode
Driver      = PostgreSQL Unicode
Servername  = localhost
Port        = 5432              ; PG port
Database    = ivorysql
Username    = ivorysql
Password    = secret
```

### Connection Strings

```csharp
// C# ODBC connection string
var connStr = "Driver={PostgreSQL Unicode};"
    + "Server=localhost;Port=1521;"
    + "Database=ivorysql;"
    + "Uid=ivorysql;Pwd=secret;";
```

```python
# Python pyodbc connection string
conn_str = (
    "DRIVER={PostgreSQL Unicode};"
    "SERVER=localhost;"
    "PORT=1521;"
    "DATABASE=ivorysql;"
    "UID=ivorysql;"
    "PWD=secret;"
)
```

## Multi-Language ODBC Examples

### Python pyodbc

```python
import pyodbc

conn_str = (
    "DRIVER={PostgreSQL Unicode};"
    "SERVER=localhost;PORT=1521;"
    "DATABASE=ivorysql;"
    "UID=ivorysql;PWD=secret;"
)

conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# Query
cursor.execute("SELECT * FROM employees WHERE salary > ?", (5000,))
for row in cursor.fetchall():
    print(row)

# Insert
cursor.execute("INSERT INTO employees (name, salary) VALUES (?, ?)", ("Zhang San", 8000))
conn.commit()

# Batch insert
data = [("Li Si", 9000), ("Wang Wu", 7500)]
for row in data:
    cursor.execute("INSERT INTO employees (name, salary) VALUES (?, ?)", row)
conn.commit()

conn.close()
```

### C ODBC

```c
#include <sql.h>
#include <sqlext.h>

SQLHENV henv;
SQLHDBC hdbc;
SQLHSTMT hstmt;
SQLRETURN ret;

// Allocate environment handle
SQLAllocHandle(SQL_HANDLE_ENV, SQL_NULL_HANDLE, &henv);
SQLSetEnvAttr(henv, SQL_ATTR_ODBC_VERSION, (void*)SQL_OV_ODBC3, 0);

// Allocate connection handle
SQLAllocHandle(SQL_HANDLE_DBC, henv, &hdbc);

// Connect
SQLCHAR connStr[] = "DRIVER={PostgreSQL Unicode};"
    "SERVER=localhost;PORT=1521;"
    "DATABASE=ivorysql;"
    "UID=ivorysql;PWD=secret;";
SQLDriverConnect(hdbc, NULL, connStr, SQL_NTS, NULL, 0, NULL, SQL_DRIVER_COMPLETE);

// Query
SQLAllocHandle(SQL_HANDLE_STMT, hdbc, &hstmt);
SQLExecDirect(hstmt, (SQLCHAR*)"SELECT * FROM employees LIMIT 10", SQL_NTS);

SQLCHAR name[101], salary[21];
while (SQLFetch(hstmt) == SQL_SUCCESS) {
    SQLGetData(hstmt, 1, SQL_C_CHAR, name, 100, NULL);
    SQLGetData(hstmt, 2, SQL_C_CHAR, salary, 20, NULL);
    printf("%s - %s\n", name, salary);
}

// Release
SQLFreeHandle(SQL_HANDLE_STMT, hstmt);
SQLDisconnect(hdbc);
SQLFreeHandle(SQL_HANDLE_DBC, hdbc);
SQLFreeHandle(SQL_HANDLE_ENV, henv);
```

### Excel via ODBC

```vb
' Excel VBA connects to IvorySQL
Sub ConnectIvorySQL()
    Dim conn As Object
    Set conn = CreateObject("ADODB.Connection")

    conn.Open "Driver={PostgreSQL Unicode};" & _
               "Server=localhost;Port=1521;" & _
               "Database=ivorysql;" & _
               "Uid=ivorysql;Pwd=secret;"

    Dim rs As Object
    Set rs = conn.Execute("SELECT name, salary FROM employees WHERE salary > 5000")

    Do While Not rs.EOF
        Debug.Print rs.Fields("name").Value, rs.Fields("salary").Value
        rs.MoveNext
    Loop

    rs.Close
    conn.Close
End Sub
```

## DSN-less Connection

No need to configure system DSN, specify driver directly in connection string:

```python
# Python - no pre-configured DSN needed
conn_str = (
    "DRIVER={PostgreSQL Unicode};"
    "SERVER=localhost;PORT=1521;"
    "DATABASE=ivorysql;"
    "UID=ivorysql;PWD=secret;"
)
```

## Transactions and Performance

```python
conn = pyodbc.connect(conn_str, autocommit=False)
try:
    cursor.execute("BEGIN")
    cursor.executemany(
        "INSERT INTO employees (name, salary) VALUES (?, ?)",
        [("A", 8000), ("B", 9000), ("C", 7500)]
    )
    conn.commit()
except:
    conn.rollback()
```

## Reference Documents

- [Connection Configuration](references/connection.md) — DSN configuration and connection strings
- [Cross-Language Access](references/cross-language.md) — Python/C/Excel/BI tool examples
