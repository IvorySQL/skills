---
title: IvorySQL ECPG Embedded SQL
description: ECPG Embedded SQL Programming
tags: ivorysql, c, ecpg, embedded-sql
---

# IvorySQL ECPG Embedded SQL

## Basic Usage

```c
#include <stdio.h>

EXEC SQL BEGIN DECLARE SECTION;
    int v_id = 1;
    char v_name[100];
    double v_salary;
EXEC SQL END DECLARE SECTION;

int main() {
    EXEC SQL CONNECT TO ivorysql USER ivorysql USING secret;

    EXEC SQL SELECT name, salary INTO :v_name, :v_salary
        FROM employees WHERE id = :v_id;

    printf("Name: %s, Salary: %.2f\n", v_name, v_salary);

    EXEC SQL DISCONNECT;
    return 0;
}
```

## Compilation

```bash
# Preprocess
ecpg test.pgc

# Compile
gcc -I/usr/local/ivorysql/include -c test.c

# Link
gcc -L/usr/local/ivorysql/lib -lecpg test.o -o test
```

## Transaction Control

```c
EXEC SQL BEGIN WORK;
EXEC SQL UPDATE accounts SET balance = balance - 100 WHERE id = 1;
EXEC SQL UPDATE accounts SET balance = balance + 100 WHERE id = 2;
EXEC SQL COMMIT;
```

## Error Handling

```c
EXEC SQL WHENEVER SQLERROR STOP;
EXEC SQL WHENEVER NOT FOUND CONTINUE;
EXEC SQL WHENEVER SQLWARNING CONTINUE;
```
