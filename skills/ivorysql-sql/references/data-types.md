---
title: IvorySQL Data Types
description: PG native types + Oracle compatible types
tags: ivorysql, data-types, oracle-compat, varchar2, number, date
---

# IvorySQL Data Types

IvorySQL supports all PostgreSQL native data types, and provides Oracle data type mapping and compatibility in Oracle compatibility mode.

## Numeric Types

### PostgreSQL Native Numeric Types

| Type | Size | Range | Description |
|------|------|------|------|
| SMALLINT / INT2 | 2 bytes | -32,768 ~ +32,767 | Small range integer |
| INTEGER / INT / INT4 | 4 bytes | -2,147,483,648 ~ +2,147,483,647 | Common integer |
| BIGINT / INT8 | 8 bytes | -9,223,372,036,854,775,808 ~ +9,223,372,036,854,775,807 | Large range integer |
| NUMERIC(p,s) | Variable | 131,072 digits before decimal; 16,383 digits after | Arbitrary precision value |
| DECIMAL(p,s) | Variable | Same as NUMERIC | Alias for NUMERIC |
| REAL / FLOAT4 | 4 bytes | 6 decimal digits precision | Single-precision float |
| DOUBLE PRECISION / FLOAT8 | 8 bytes | 15 decimal digits precision | Double-precision float |
| SMALLSERIAL | 2 bytes | 1 ~ 32,767 | Auto-increment small integer |
| SERIAL | 4 bytes | 1 ~ 2,147,483,647 | Auto-increment integer |
| BIGSERIAL | 8 bytes | 1 ~ 9,223,372,036,854,775,807 | Auto-increment large integer |

### Oracle Compatible Numeric Types

| Oracle Type | Description | PG Equivalent | Notes |
|------------|------|------------|------|
| NUMBER | Unspecified precision numeric | NUMERIC | Equivalent to NUMERIC without parameters |
| NUMBER(p) | Fixed-point, p digits precision | NUMERIC(p) | Equivalent to NUMERIC(p,0) |
| NUMBER(p,s) | Fixed-point, p digits precision s decimal places | NUMERIC(p,s) | Fully equivalent |
| BINARY_FLOAT | Single-precision float | REAL | 32-bit IEEE 754 |
| BINARY_DOUBLE | Double-precision float | DOUBLE PRECISION | 64-bit IEEE 754 |
| FLOAT(p) | Float, p binary digits precision | DOUBLE PRECISION | Maps to FLOAT8 when p ≤ 53 |
| INTEGER | Oracle integer | NUMERIC(38) | INTEGER is NUMBER subtype in Oracle |

```sql
-- Use NUMBER type in Oracle mode
CREATE TABLE products (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(200),
    price NUMBER(10,2) NOT NULL,
    discount NUMBER(5,4),
    weight NUMBER
);

-- PG mode equivalent
```
