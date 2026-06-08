---
title: String Functions Details
description: CONCAT/LENGTH/SUBSTR/INSTR/UPPER/LOWER/TRIM/REPLACE/LPAD/RPAD/INITCAP/REGEXP etc.
tags: ivorysql, functions, string, text, concat, substr, instr, regexp, oracle-compat
---

# String Functions Details

IvorySQL supports both PostgreSQL native string functions and Oracle-compatible string functions. In Oracle mode, you can use Oracle-style string functions and syntax.

## PostgreSQL Native String Functions

### Basic Functions

| Function | Description | Example | Result |
|------|------|------|------|
| `LENGTH(str)` / `CHAR_LENGTH(str)` | Returns character count | `LENGTH('Hello')` | 5 |
| `OCTET_LENGTH(str)` | Returns byte count | `OCTET_LENGTH('Hello')` | 5 |
| `BIT_LENGTH(str)` | Returns bit count | `BIT_LENGTH('hi')` | 16 |
| `UPPER(str)` | Convert to uppercase | `UPPER('Hello')` | HELLO |
| `LOWER(str)` | Convert to lowercase | `LOWER('Hello')` | hello |
| `INITCAP(str)` | Capitalize first letters | `INITCAP('hello world')` | Hello World |
| `REVERSE(str)` | Reverse string | `REVERSE('abc')` | cba |
| `CHR(n)` | ASCII to character | `CHR(65)` | A |
| `ASCII(str)` | First character ASCII | `ASCII('A')` | 65 |
| `UNISTR(str)` | Unicode to string | `UNISTR('\0041')` | A |

```sql
-- Basic function examples
SELECT LENGTH('IvorySQL') AS len;           -- 8
SELECT UPPER('hello') AS upper_str;          -- HELLO
SELECT LOWER('WORLD') AS lower_str;          -- world
SELECT INITCAP('hello world') AS initcap_str;-- Hello World
SELECT REVERSE('abcdef') AS reversed;        -- fedcba
SELECT CHR(10) || 'new line' AS text;        -- outputs new line
SELECT ASCII('A') AS ascii_val;              -- 65
```

### Substring and Search

| Function | Description | Example | Result |
|------|------|------|------|
| `SUBSTRING(str FROM pos FOR len)` | SQL standard substring | `SUBSTRING('Hello' FROM 2 FOR 3)` | ell |
| `SUBSTRING(str FROM pattern)` | Regex substring | `SUBSTRING('abc123' FROM '[0-9]+')` | 123 |
| `SUBSTRING(str, pos, len)` | Short substring | `SUBSTRING('Hello', 2, 3)` | ell |
| `LEFT(str, n)` | Left n characters | `LEFT('Hello', 3)` | Hel |
| `RIGHT(str, n)` | Right n characters | `RIGHT('Hello', 3)` | llo |
| `POSITION(sub IN str)` | Substring position | `POSITION('ll' IN 'Hello')` | 3 |
| `STRPOS(str, sub)` | Substring position | `STRPOS('Hello', 'll')` | 3 |
