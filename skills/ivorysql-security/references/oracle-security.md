---
title: Oracle Security Compatibility
description: IvorySQL Oracle security feature compatibility, including DBA role emulation and Oracle audit view compatibility
tags:
  - security
  - oracle-compatible
  - dba-role
  - audit
---

# Oracle Security Compatibility

## Overview

IvorySQL provides a compatibility layer for Oracle security features in Oracle compatibility mode, primarily including DBA role emulation and audit view compatibility.

## DBA Role Emulation

### Pre-created Roles

During Oracle mode initialization (`initdb -m oracle`), IvorySQL automatically creates the following Oracle-compatible roles:

| Role | Oracle Equivalent | IvorySQL Mapping | Description |
|------|------------|--------------|------|
| `SYS` | SYS | Superuser | Oracle system administrator |
| `SYSTEM` | SYSTEM | Superuser | Oracle system operator |
| `DBA` | DBA | Role group | Database administrator role |

### DBA Role Permissions

```sql
-- View DBA role permissions (in Oracle mode)
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole
FROM pg_roles
WHERE rolname IN ('SYS', 'SYSTEM', 'DBA');

-- Permissions included in DBA role
SELECT roleid::regrole, member::regrole
FROM pg_auth_members
WHERE roleid = (SELECT oid FROM pg_roles WHERE rolname = 'DBA');
```

### Creating DBA Users

```sql
-- Create DBA user in Oracle mode
CREATE USER myadmin WITH PASSWORD 'secure_password';
GRANT DBA TO myadmin;

-- Verify permissions
SELECT has_database_privilege('myadmin', 'mydb', 'CONNECT');
SELECT has_schema_privilege('myadmin', 'public', 'CREATE');
```

### Oracle Users/Roles Comparison

| Oracle | IvorySQL (Oracle Mode) | Description |
|--------|---------------------|------|
| `CREATE USER` | `CREATE ROLE ... WITH LOGIN` | Oracle user equals PG login role |
| `GRANT DBA TO user` | `GRANT DBA TO user` | Grant DBA role |
| `GRANT RESOURCE TO user` | `GRANT readwrite TO user` | Grant resource permissions |
| `GRANT CONNECT TO user` | `GRANT CONNECT ON DATABASE` | Grant connect permission |
| `ALTER USER` | `ALTER ROLE` | Modify user attributes |
| `DROP USER` | `DROP ROLE` | Delete user |
| `GRANT ALL ON schema.*` | `GRANT ALL ON ALL TABLES IN SCHEMA` | Grant all permissions |

### Oracle User Attribute Mapping

```sql
-- Oracle user attributes
-- ALTER USER user ACCOUNT LOCK/UNLOCK
-- ALTER USER user PASSWORD EXPIRE
-- ALTER USER user PROFILE profile_name
-- ALTER USER user DEFAULT TABLESPACE ts
-- ALTER USER user QUOTA n ON ts

-- IvorySQL equivalent
ALTER ROLE user ACCOUNT LOCK;    -- Not directly supported, can limit via pg_hba.conf
ALTER ROLE user VALID UNTIL '2025-12-31';  -- Password expiration
-- PROFILE simulated via roles and configuration parameters
-- TABLESPACE mapped via schema and tablespace
-- QUOTA managed via disk quotas

-- Alternative: use connection limits
ALTER ROLE user CONNECTION LIMIT 0;  -- Prevent login
ALTER ROLE user CONNECTION LIMIT 10; -- Restore login
```

## Oracle Audit View Compatibility

### Compatible Audit Views

IvorySQL Oracle mode provides the following Oracle audit view compatibility:

| Oracle View | IvorySQL Compatibility | Description |
|------------|--------------|------|
| `DBA_AUDIT_TRAIL` | `sys.dba_audit_trail` | Standard audit records |
| `DBA_FGA_AUDIT_TRAIL` | `sys.dba_fga_audit_trail` | Fine-grained auditing |
| `DBA_OBJ_AUDIT_OPTS` | `sys.dba_obj_audit_opts` | Object audit options |
| `DBA_PRIV_AUDIT_OPTS` | `sys.dba_priv_audit_opts` | Privilege audit options |
| `DBA_STMT_AUDIT_OPTS` | `sys.dba_stmt_audit_opts` | Statement audit options |
| `ALL_AUDIT_POLICIES` | `sys.all_audit_policies` | Audit policies |
| `USER_AUDIT_TRAIL` | `sys.user_audit_trail` | User audit records |

### Using Audit Views

```sql
-- Switch to Oracle mode
SET ivorysql.compatible_mode = oracle;

-- Query audit records
SELECT * FROM sys.dba_audit_trail
WHERE timestamp > SYSDATE - 7
ORDER BY timestamp DESC;

-- Query object audit options
SELECT * FROM sys.dba_obj_audit_opts;

-- Query privilege audit options
SELECT * FROM sys.dba_priv_audit_opts;
```

### Using with pgAudit

```ini
# postgresql.conf
shared_preload_libraries = 'pgaudit'
pgaudit.log = 'read, write, function, role, ddl'
pgaudit.log_relation = on
pgaudit.log_parameter = on
```

```sql
-- Install pgAudit
CREATE EXTENSION pgaudit;

-- Query pgAudit logs (via Oracle compatibility view)
SELECT * FROM sys.dba_audit_trail
WHERE action_name LIKE '%SELECT%'
  AND timestamp > SYSDATE - 1;

-- Object-level auditing
ALTER TABLE sensitive_table SET (pgaudit.log = 'all');

-- Role-level auditing
SET pgaudit.role = 'admin';
```

## Oracle Profile Compatibility

### Oracle Profile Functionality

```sql
-- Oracle Profile
CREATE PROFILE limited_profile LIMIT
    SESSIONS_PER_USER 5
    FAILED_LOGIN_ATTEMPTS 3
    PASSWORD_LIFE_TIME 90
    PASSWORD_LOCK_TIME 1
    PASSWORD_GRACE_TIME 7;

ALTER USER app_user PROFILE limited_profile;
```

### IvorySQL Equivalent Implementation

```sql
-- Simulate Profile using roles and parameters

-- Connection count limit
ALTER ROLE app_user CONNECTION LIMIT 5;

-- Password expiration
ALTER ROLE app_user VALID UNTIL now() + interval '90 days';

-- Login failure locking (requires custom implementation)
-- Create login failure count table
CREATE TABLE login_attempts (
    username TEXT PRIMARY KEY,
    attempt_count INTEGER DEFAULT 0,
    locked_until TIMESTAMP
);

-- Login trigger (example logic)
CREATE OR REPLACE FUNCTION check_login_attempts()
RETURNS event_trigger AS $$
DECLARE
    v_attempts INTEGER;
    v_locked_until TIMESTAMP;
BEGIN
    SELECT attempt_count, locked_until
    INTO v_attempts, v_locked_until
    FROM login_attempts
    WHERE username = current_user;

    IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
        RAISE EXCEPTION 'Account is locked until %', v_locked_until;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

## Oracle Permission Compatibility

### System Permission Mapping

| Oracle System Permission | IvorySQL Equivalent |
|----------------|--------------|
| `CREATE SESSION` | `GRANT CONNECT ON DATABASE` |
| `CREATE TABLE` | `GRANT CREATE ON SCHEMA` |
| `CREATE ANY TABLE` | `GRANT CREATE ON ALL SCHEMAS` (requires superuser) |
| `CREATE VIEW` | `GRANT CREATE ON SCHEMA` |
| `CREATE PROCEDURE` | `GRANT CREATE ON SCHEMA` |
| `CREATE SEQUENCE` | `GRANT CREATE ON SCHEMA` |
| `CREATE TRIGGER` | `GRANT CREATE ON SCHEMA` |
| `ALTER ANY TABLE` | Table owner or superuser |
| `DROP ANY TABLE` | Table owner or superuser |
| `SELECT ANY TABLE` | `GRANT SELECT ON ALL TABLES IN SCHEMA` |
| `INSERT ANY TABLE` | `GRANT INSERT ON ALL TABLES IN SCHEMA` |
| `UPDATE ANY TABLE` | `GRANT UPDATE ON ALL TABLES IN SCHEMA` |
| `DELETE ANY TABLE` | `GRANT DELETE ON ALL TABLES IN SCHEMA` |
| `EXECUTE ANY PROCEDURE` | `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA` |
| `GRANT ANY PRIVILEGE` | `CREATEROLE` attribute |
| `CREATE USER` | `CREATEROLE` attribute |
| `DROP USER` | `CREATEROLE` attribute |
| `ALTER USER` | `CREATEROLE` attribute |
| `SYSDBA` | `superuser` attribute |

### Object Permission Mapping

| Oracle Object Permission | IvorySQL Equivalent |
|----------------|--------------|
| `SELECT ON table` | `GRANT SELECT ON TABLE` |
| `INSERT ON table` | `GRANT INSERT ON TABLE` |
| `UPDATE ON table` | `GRANT UPDATE ON TABLE` |
| `DELETE ON table` | `GRANT DELETE ON TABLE` |
| `ALTER ON table` | Table owner |
| `INDEX ON table` | Table owner |
| `REFERENCES ON table` | `GRANT REFERENCES ON TABLE` |
| `EXECUTE ON procedure` | `GRANT EXECUTE ON FUNCTION` |
| `SELECT ON sequence` | `GRANT SELECT ON SEQUENCE` |
| `UPDATE ON sequence` | `GRANT USAGE, UPDATE ON SEQUENCE` |

## Notes

1. **Role name case**: In Oracle mode, role names default to uppercase, consistent with Oracle
2. **Audit log storage**: Oracle audit view compatibility layer depends on pgAudit, ensure pgAudit is installed and configured
3. **Permission granularity differences**: IvorySQL permission granularity is not exactly the same as Oracle, check one by one during migration
4. **SYS/SYSTEM users**: These two users are superusers in IvorySQL, use with caution
5. **Profile compatibility**: Oracle Profile functionality has no direct equivalent in IvorySQL, must be simulated through combinations
6. **Audit data retention**: It is recommended to configure audit log retention policies to avoid unlimited log table growth
