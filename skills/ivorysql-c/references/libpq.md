---
title: IvorySQL libpq Client Library
description: libpq connection, queries, parameterization, async operations
tags: ivorysql, c, libpq, connection, query, async
---

# IvorySQL libpq Client Library

## Connection Management

```c
PGconn *conn = PQconnectdb("dbname=ivorysql user=ivorysql password=secret host=localhost");
if (PQstatus(conn) != CONNECTION_OK) {
    fprintf(stderr, "Connection failed: %s", PQerrorMessage(conn));
    PQfinish(conn);
    return 1;
}
// When done
PQfinish(conn);
```

### Connection Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| host | Server address | localhost |
| port | Port | 5432 |
| dbname | Database name | Username |
| user | Username | OS user |
| password | Password | - |
| sslmode | SSL mode | prefer |
| connect_timeout | Connection timeout (seconds) | 0 |

## Query Operations

```c
// Simple query
PGresult *res = PQexec(conn, "SELECT * FROM employees");
ExecStatusType status = PQresultStatus(res);
if (status == PGRES_TUPLES_OK) {
    int nrows = PQntuples(res);
    int ncols = PQnfields(res);
    for (int i = 0; i < nrows; i++) {
        for (int j = 0; j < ncols; j++) {
            printf("%s\t", PQgetvalue(res, i, j));
        }
        printf("\n");
    }
}
PQclear(res);

// Parameterized query
const char *paramValues[1] = {"5000"};
int paramLengths[1] = {4};
int paramFormats[1] = {0};  // Text format
res = PQexecParams(conn,
    "SELECT * FROM employees WHERE salary > $1",
    1, NULL, paramValues, paramLengths, paramFormats, 0);
PQclear(res);
```

## Transaction Control

```c
PGresult *res;
res = PQexec(conn, "BEGIN");
PQclear(res);

res = PQexec(conn, "UPDATE accounts SET balance = balance - 100 WHERE id = 1");
PQclear(res);

res = PQexec(conn, "COMMIT");
PQclear(res);
```

## Async Queries

```c
// Send async query
int ret = PQsendQuery(conn, "SELECT * FROM large_table");

// Non-blocking result retrieval
while (1) {
    PGresult *res = PQgetResult(conn);
    if (res == NULL) break;
    // Process result
    PQclear(res);
}
```
