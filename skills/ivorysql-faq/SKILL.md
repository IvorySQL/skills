---
name: IvorySQL Frequently Asked Questions
name_for_command: ivorysql-faq
description: |
  IvorySQL FAQ and troubleshooting: installation and deployment FAQ, SQL compatibility FAQ, Oracle migration FAQ,
  performance optimization FAQ, common error codes and troubleshooting methods.
---

# IvorySQL Frequently Asked Questions

## Workflow

Trigger this skill when encountering the following issues:
- Installation and deployment issues
- SQL compatibility issues
- Oracle migration issues
- Performance issues
- Error code troubleshooting

**Sub-skill routing**:
- Installation issues → `references/installation-faq.md`
- SQL issues → `ivorysql-sql`
- Migration issues → `ivorysql-migration`
- Performance issues → `references/performance-config.md`

## Installation and Deployment FAQ

> For details: [installation-faq](references/installation-faq.md)

### Q: What is the default database name for IvorySQL?
A: `ivorysql` (different from PostgreSQL's `postgres`).

### Q: How do I choose between Oracle mode and PG mode?
A: If you need Oracle compatibility (such as using VARCHAR2/NUMBER/SYSDATE/DUAL, etc.), choose Oracle mode. If you're just using it as a PG replacement, choose PG mode. You can switch back to PG mode at any time from Oracle mode.

### Q: What happens if I don't specify the -m parameter during initdb?
A: It defaults to Oracle compatibility mode (`-m oracle`).

## SQL Compatibility FAQ

### Q: Are empty strings and NULL the same in Oracle mode?
A: Yes, empty strings are treated as NULL in Oracle mode, consistent with Oracle behavior. In PG mode, they are different values.

### Q: How do I use PG native functions in Oracle mode?
A: PG native functions are still available in Oracle mode. For example, `COALESCE`, `NOW()`, etc. can also be used in Oracle mode.

### Q: Why does SELECT * FROM DUAL throw an error?
A: The DUAL pseudo table is only available in Oracle compatibility mode. Please confirm that `ivorysql.compatible_mode` is set to `oracle`.

### Q: How do I switch the parser?
A: Use the `\parser` command in psql, or execute `SET ivorysql.compatible_mode TO oracle/pg`.

## Oracle Migration FAQ

### Q: Do I need to modify Oracle stored procedures when migrating?
A: Most of them don't need modification, as PL/iSQL is compatible with Oracle PL/SQL syntax. Cases that require modification include: usage of `PRAGMA AUTONOMOUS_TRANSACTION`, `UTL_FILE`, `DBMS_SQL`, etc.

### Q: Is Oracle's DATE type the same as IvorySQL's DATE type?
A: The DATE behavior in IvorySQL Oracle mode is consistent with Oracle, including hours, minutes, and seconds. In PG mode, DATE only includes the date portion.

## Performance FAQ

### Q: How do I view slow queries?
A: Set the `log_min_duration_statement` parameter, or use the `pg_stat_statements` extension.

### Q: How do I optimize query performance?
A: 1) Ensure ANALYZE has been executed 2) Create appropriate indexes 3) Review execution plans 4) Adjust work_mem 5) Enable parallel queries

## Common Errors

> For details: [error-codes](references/error-codes.md)

| Error Code | Description | Resolution |
|--------|------|----------|
| 08001 | Connection failed | Check host/port/authentication |
| 08004 | Server refused connection | Check pg_hba.conf |
| 28P01 | Authentication failed | Check username/password |
| 3D000 | Database does not exist | Check database name (defaults to ivorysql) |
| 42P01 | Table does not exist | Check table name/schema |
| 42601 | Syntax error | Check SQL syntax, or switch compatibility mode |
| 22023 | Invalid parameter value | Check parameter values |
| 53300 | Too many connections | Increase max_connections |

## Reference Documents

- [Installation and Deployment FAQ](references/installation-faq.md) — Installation, initialization, startup common issues
- [Error Code Reference](references/error-codes.md) — Common error codes and troubleshooting methods
