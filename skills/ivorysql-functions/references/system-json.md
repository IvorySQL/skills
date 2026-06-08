---
title: IvorySQL System and JSON Functions
description: System information functions, JSON/JSONB functions, crypto functions, sequence functions
tags: ivorysql, functions, system, json, jsonb, crypto, sequence
---

# IvorySQL System and JSON Functions

## System Information Functions

### Session Information

| Function | Description | Example |
|------|------|------|
| CURRENT_USER / USER | Current user | 'ivorysql' |
| SESSION_USER | Session user | 'ivorysql' |
| CURRENT_DATABASE() | Current database | 'ivorysql' |
| CURRENT_SCHEMA() | Current schema | 'public' |
| CURRENT_QUERY() | Current query | SELECT ... |
| INET_SERVER_ADDR() | Server address | '127.0.0.1' |
| INET_SERVER_PORT() | Server port | 5432 |
| PG_BACKEND_PID() | Backend process ID | 12345 |
| PG_TRANSACTION_STATUS() | Transaction status | 'in transaction' |

### Oracle Compatible System Functions

| Function | Description | Example |
|------|------|------|
| SYS_GUID() | Generate 16-byte GUID | SYS_GUID() → 'A1B2...' |
| SYS_CONTEXT(namespace, param) | Context value | SYS_CONTEXT('USERENV', 'SESSION_USER') |
| USERENV(param) | Environment info | USERENV('LANGUAGE') |
| UID | User ID | UID → 10 |
| USER | Current username | USER → 'IVORYSQL' |

### System Management

| Function | Description |
|------|------|
| PG_RELOAD_CONF() | Reload configuration |
| PG_SWITCH_WAL() | Switch WAL file |
| PG_CURRENT_WAL_LSN() | Current WAL position |
| PG_WAL_FILE_NAME(lsn) | WAL file name |
| PG_IS_IN_RECOVERY() | Is in recovery |
| PG_LAST_WAL_REPLAY_LSN() | Last replayed LSN |
| PG_STAT_GET_ACTIVITY(pid) | Get active connections |
| PG_TERMINATE_BACKEND(pid) | Terminate connection |
| PG_CANCEL_BACKEND(pid) | Cancel query |
| VERSION() | Version info |

## JSON / JSONB Functions

### Constructor Functions

| Function | Description | Example |
|------|------|------|
| TO_JSON(any) / TO_JSONB(any) | Convert to JSON | TO_JSONB(ROW(1, 'hi')) → {"f1":1,"f2":"hi"} |
| JSON_BUILD_ARRAY(...) | Build JSON array | JSON_BUILD_ARRAY(1, 'hi', null) → [1, "hi", null] |
| JSONB_BUILD_ARRAY(...) | Build JSONB array | Same as above |
| JSON_BUILD_OBJECT(...) | Build JSON object | JSON_BUILD_OBJECT('name', 'Alice', 'age', 30) |
| JSONB_BUILD_OBJECT(...) | Build JSONB object | Same as above |
| JSON_ARRAY(elements) | JSON array (PG 17+) | JSON_ARRAY(1, 2, 3) |
| ROW_TO_JSON(record) | Row to JSON | ROW_TO_JSON(t) |

### Query Functions

| Function | Description | Example |
|------|------|------|
| -> | Get by key (JSON) | '{"a":1}'::jsonb -> 'a' → 1 |
| ->> | Get by key (text) | '{"a":1}'::jsonb ->> 'a' → '1' |
| #> | Get by path (JSON) | '{"a":{"b":1}}'::jsonb #> '{a,b}' → 1 |
| #>> | Get by path (text) | Same as above but returns text |
| JSONB_PATH_QUERY(jsonb, path) | JSON path query | Returns all matches |
| JSONB_PATH_EXISTS(jsonb, path) | Path exists | Returns boolean |
| JSONB_PATH_QUERY_ARRAY(jsonb, path) | Path query (array) | Returns array |
| JSONB_PATH_QUERY_FIRST(jsonb, path) | Path query (first) | Returns first match |

### Judgment Functions

| Function | Description | Example |
|------|------|------|
| @> | JSON contains | '{"a":1,"b":2}'::jsonb @> '{"a":1}' → true |
| <@ | JSON is contained | '{"a":1}'::jsonb <@ '{"a":1,"b":2}' → true |
| ? | Key exists | '{"a":1}'::jsonb ? 'a' → true |
| ?\| | Any key exists | '{"a":1}'::jsonb ?\| array['a','b'] → true |
| ?& | All keys exist | '{"a":1}'::jsonb ?& array['a','b'] → false |
| @? | Path matches | - |
| @@ | Path predicate match | - |

### Modification Functions

| Function | Description |
|------|------|
| JSONB_SET(target, path, new_value) | Set value |
| JSONB_INSERT(target, path, new_value) | Insert value |
| JSONB_STRIP_NULLS(jsonb) | Strip NULLs |
| JSONB_PRETTY(jsonb) | Format |
| JSONB_PATH_QUERY_ARRAY() | Path query returning array |

### Aggregate Functions

| Function | Description |
|------|------|
| JSON_AGG(expr) | Aggregate to JSON array |
| JSONB_AGG(expr) | Aggregate to JSONB array |
| JSON_OBJECT_AGG(key, value) | Aggregate to JSON object |
| JSONB_OBJECT_AGG(key, value) | Aggregate to JSONB object |

## Crypto Functions

| Function | Description |
|------|------|
| MD5(str) | MD5 hash |
| SHA224(data) / SHA256(data) / SHA384(data) / SHA512(data) | SHA hash |
| ENCRYPT(data, key, algorithm) | pgcrypto encryption |
| DECRYPT(data, key, algorithm) | pgcrypto decryption |
| GEN_SALT(iter) | Generate salt |
| CRYPT(password, salt) | Password encryption |
| GEN_RANDOM_UUID() | Random UUID |
| UUIDV7() | Time-ordered UUID (PG 18) |

## Sequence Functions

| Function | Description |
|------|------|
| NEXTVAL(sequence) | Get next value |
| CURRVAL(sequence) | Get current value |
| LASTVAL() | Most recent NEXTVAL value |
| SETVAL(sequence, value) | Set sequence value |
| SETVAL(sequence, value, is_called) | Set sequence value (whether already called) |
