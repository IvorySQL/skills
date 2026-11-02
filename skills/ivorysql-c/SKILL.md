---
name: IvorySQL C Development
name_for_command: ivorysql-c
description: |
  IvorySQL C language development guide: libpq connection (Oracle port 1521), parameterized queries,
  binary data transfer, BINARY CURSOR, batch operations, large objects, ECPG embedded SQL.
---

# IvorySQL C Development

## Workflow

Trigger this skill when encountering the following issues:
- C language connects to IvorySQL
- libpq API usage
- Batch operations / large objects
- ECPG embedded SQL

## Headers and Dependencies

```c
#include <libpq-fe.h>

// Compile and link
// gcc -o app app.c -lpq -I/usr/include/postgresql
```

## Connection Methods

```c
PGconn *conn = PQsetdbLogin(
    "localhost",      // host
    "1521",           // port
    NULL,             // options
    NULL,             // tty
    "ivorysql",       // database
    "ivorysql",       // user
    "secret"          // password
);

if (PQstatus(conn) != CONNECTION_OK) {
    fprintf(stderr, "Connection failed: %s\n", PQerrorMessage(conn));
    PQfinish(conn);
    exit(1);
}

// Oracle compatibility mode
PGconn *conn = PQsetdbLogin("localhost", "1521", "-c ivorysql.compatible_mode=oracle", NULL, "ivorysql", "ivorysql", "secret");

// Connection string method
PGconn *conn = PQconnectdb("host=localhost port=1521 dbname=ivorysql user=ivorysql password=secret");
```

## Executing Queries

### Synchronous Query

```c
PGresult *res = PQexec(conn, "SELECT * FROM employees LIMIT 10");

if (PQresultStatus(res) != PGRES_TUPLES_OK) {
    fprintf(stderr, "Query failed: %s\n", PQerrorMessage(conn));
    PQclear(res);
    PQfinish(conn);
    exit(1);
}

int rows = PQntuples(res);
int cols = PQnfields(res);

for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        printf("%s\t", PQgetvalue(res, i, j));
    }
    printf("\n");
}

PQclear(res);
```

### Parameterized Query

```c
const char *paramValues[2] = { "IT", "5000" };
int paramLengths[2] = { 2, 4 };
int paramFormats[2] = { 0, 0 };

PGresult *res = PQexecParams(
    conn,
    "SELECT * FROM employees WHERE department = $1 AND salary > $2",
    2,               // Number of parameters
    NULL,            // Parameter types (NULL means let backend infer)
    paramValues,     // Parameter values
    paramLengths,    // Parameter lengths
    paramFormats,    // Parameter formats (0=text, 1=binary)
    0                // Result format (0=text)
);
```

## Getting Results

```c
int rows = PQntuples(res);
int cols = PQnfields(res);

// Field names
for (int j = 0; j < cols; j++) {
    printf("%s\t", PQfname(res, j));
}

// Values
for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        if (PQgetisnull(res, i, j)) {
            printf("NULL\t");
        } else {
            printf("%s\t", PQgetvalue(res, i, j));
        }
    }
}
```

## Transactions

```c
PGresult *res;

res = PQexec(conn, "BEGIN");
PQclear(res);

res = PQexec(conn, "UPDATE accounts SET balance = balance - 100 WHERE id = 1");
if (PQresultStatus(res) != PGRES_COMMAND_OK) {
    PQexec(conn, "ROLLBACK");
    PQclear(res);
    PQfinish(conn);
    exit(1);
}
PQclear(res);

res = PQexec(conn, "UPDATE accounts SET balance = balance + 100 WHERE id = 2");
PQclear(res);

res = PQexec(conn, "COMMIT");
PQclear(res);
```

## Batch Operations

```c
PGresult *res = PQexec(conn, "COPY employees (name, salary) FROM STDIN WITH CSV");
PQclear(res);

const char *data = "Zhang San,8000\nLi Si,9000\nWang Wu,7500\n";
int copied = PQputCopyData(conn, data, strlen(data));
if (copied != 1) {
    fprintf(stderr, "COPY data failed\n");
}

int end = PQputCopyEnd(conn, NULL);
PQexec(conn, "COMMIT");
```

## Error Handling

```c
char *err = PQerrorMessage(conn);
char *code = PQresultErrorField(res, PG_DIAG_SQLSTATE);

if (code != NULL && strcmp(code, "23505") == 0) {
    printf("Unique constraint violation\n");
}
```

## Makefile Example

```makefile
CC = gcc
CFLAGS = -I/usr/include/postgresql
LDFLAGS = -lpq

app: app.c
	$(CC) $(CFLAGS) -o app app.c $(LDFLAGS)

clean:
	rm -f app
```

## Thread Safety

```c
// Initialize libpq thread support
PQinitOpenSSL(1, 1);

// Each thread should use its own connection
// PQexec is not thread-safe, do not share connections across threads
```

## ECPG Embedded SQL

```c
// test.ecpg
EXEC SQL BEGIN DECLARE SECTION;
char name[100];
double salary;
EXEC SQL END DECLARE SECTION;

EXEC SQL CONNECT TO ivorysql@localhost:1521 USER ivorysql IDENTIFIED BY secret;

EXEC SQL SELECT name, salary INTO :name, :salary FROM employees WHERE id = 1;

printf("Name: %s, Salary: %.2f\n", name, salary);

EXEC SQL DISCONNECT;
```

Compile:
```bash
ecpg test.ecpg
gcc -o test test.c -lecpg
```

## Reference Documents

- [Complete libpq API](references/libpq.md)
- [ECPG Details](references/ecpg.md)
