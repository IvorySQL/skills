---
name: IvorySQL Security and Permission Management
name_for_command: ivorysql-security
description: |
  Complete IvorySQL security and permission reference: authentication (SCRAM/MD5/certificates/LDAP),
  permission management (system/database/schema/object level), role management, row-level security policies (RLS),
  auditing (pgAudit), data encryption (SSL/TDE).
---

# IvorySQL Security and Permission Management

## Workflow

Trigger this skill when encountering the following issues:
- Authentication configuration (SCRAM/MD5/certificates/LDAP)
- Permission management (RBAC/row-level security)
- Audit configuration (pgAudit)
- Data encryption (SSL/TDE)
- User and role management

**Sub-skill routing**:
- Configuration reference → `ivorysql-config`
- High availability → `ivorysql-ha`

IvorySQL inherits the complete PostgreSQL security system and supports the pgAudit audit extension.

## Authentication

### Authentication Methods

| Method | Description | Security Level |
|------|------|----------|
| scram-sha-256 | SCRAM-SHA-256 authentication (recommended) | High |
| md5 | MD5 password hash | Medium |
| cert | Client certificate authentication | High |
| ldap | LDAP directory authentication | Enterprise |
| gss | GSSAPI/Kerberos | Enterprise |
| trust | No password (development only) | None |

### Password Management

```sql
-- Create user
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Modify password
ALTER USER app_user WITH PASSWORD 'new_secure_password';

-- Set password expiration
ALTER USER app_user VALID UNTIL '2025-12-31';

-- Set connection limit
ALTER USER app_user CONNECTION LIMIT 10;
```

> For details: [authentication](references/authentication.md)

## Permission Management

### Permission Hierarchy

| Permission Level | Description | Example |
|----------|------|------|
| System | Role/database creation | CREATEDB, CREATEROLE |
| Database | Operations within database | CONNECT, CREATE, TEMPORARY |
| Schema | Operations within schema | CREATE, USAGE |
| Table | Table operations | SELECT, INSERT, UPDATE, DELETE |
| Column | Column operations | SELECT(col), UPDATE(col) |
| Function | Function execution | EXECUTE |

### Grant Syntax

```sql
-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON employees TO app_user;
GRANT SELECT (name, salary) ON employees TO hr_user;  -- Column level

-- Grant schema permissions
GRANT USAGE ON SCHEMA myschema TO app_user;
GRANT CREATE ON SCHEMA myschema TO dev_user;

-- Grant database permissions
GRANT CONNECT, TEMPORARY ON DATABASE ivorysql TO app_user;

-- Grant sequence permissions
GRANT USAGE, SELECT ON SEQUENCE emp_seq TO app_user;

-- Revoke permissions
REVOKE INSERT ON employees FROM app_user;
```

> For details: [access-control](references/access-control.md)

## Role Management

```sql
-- Create roles
CREATE ROLE read_only;
CREATE ROLE read_write;
CREATE ROLE admin;

-- Grant role permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO read_only;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO read_write;

-- Assign roles to users
GRANT read_only TO app_user;
GRANT read_write TO dev_user;
GRANT admin TO super_admin;

-- Set default role
ALTER USER app_user SET ROLE read_only;

-- View role members
\du
```

## Row-Level Security Policies (RLS)

```sql
-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policy: users can only see their own department data
CREATE POLICY dept_policy ON employees
    USING (department = current_user_dept());

-- Create policy: admins can see all
CREATE POLICY admin_policy ON employees
    USING (current_user_is_admin())
    WITH CHECK (true);  -- Admins can insert any row

-- Superusers bypass RLS by default
-- To force superusers to also follow RLS:
ALTER TABLE employees FORCE ROW LEVEL SECURITY;
```

## Data Encryption

### SSL Transport Encryption

```ini
# postgresql.conf
ssl = on
ssl_cert_file = '/etc/ivorysql/server.crt'
ssl_key_file = '/etc/ivorysql/server.key'
ssl_ca_file = '/etc/ivorysql/ca.crt'
```

### Transparent Data Encryption

IvorySQL supports TDE through tablespace encryption:

```sql
-- Create encrypted tablespace (requires configuration)
-- Specific methods depend on the deployed version
```

### Column-Level Encryption

```sql
-- Use pgcrypto extension
CREATE EXTENSION pgcrypto;

-- Encrypt data
INSERT INTO users (name, ssn)
VALUES ('Zhang San', encrypt('123456789', 'secret_key', 'aes'));

-- Decrypt data
SELECT name, decrypt(ssn, 'secret_key', 'aes') FROM users;

-- Hash passwords
INSERT INTO users (name, password_hash)
VALUES ('Zhang San', crypt('mypassword', gen_salt('bf')));
```

## Auditing (pgAudit)

```sql
-- Install pgAudit extension
CREATE EXTENSION pgaudit;

-- Configure audit parameters
# postgresql.conf
# pgaudit.log = 'all'              -- Audit all operations
# pgaudit.log = 'read, write'      -- Audit read/write operations
# pgaudit.log = 'ddl'              -- Audit DDL
# pgaudit.log_relation = on        -- Record object names
# pgaudit.log_parameter = on       -- Record parameter values
```

> For details: [audit-encryption](references/audit-encryption.md)

## Reference Documents

- [Authentication](references/authentication.md) — Authentication methods, password policies, pg_hba.conf
- [Access Control](references/access-control.md) — Permission management, roles, RLS
- [Audit and Encryption](references/audit-encryption.md) — pgAudit, SSL, TDE, pgcrypto
