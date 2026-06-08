---
title: Access Control
description: Detailed explanation of IvorySQL/PostgreSQL access control, including permission levels, GRANT/REVOKE, RLS policies, role management, and encryption
tags:
  - security
  - access-control
  - rbac
  - rls
  - encryption
---

# Access Control

## Permission Levels

| Level | Description | Grant Command |
|------|------|---------|
| Cluster | Role/database creation | `ALTER ROLE` / `CREATEROLE` / `CREATEDB` |
| Database | Connect/create schema | `GRANT CONNECT` / `GRANT CREATE` |
| Schema | Use schema/create objects | `GRANT USAGE` / `GRANT CREATE` |
| Table | Query/insert/update/delete | `GRANT SELECT/INSERT/UPDATE/DELETE` |
| Column | Specific column permissions | `GRANT SELECT(col)` / `GRANT UPDATE(col)` |
| Row | Row-level security policies | `CREATE POLICY` / `ALTER TABLE ENABLE ROW LEVEL SECURITY` |
| Function | Execute permission | `GRANT EXECUTE` |
| Sequence | Use sequence | `GRANT USAGE` / `GRANT SELECT` / `GRANT UPDATE` |

## GRANT / REVOKE

### Database Permissions

```sql
-- Grant connect permission
GRANT CONNECT ON DATABASE mydb TO app_user;

-- Grant create schema permission
GRANT CREATE ON DATABASE mydb TO app_user;

-- Revoke permission
REVOKE CONNECT ON DATABASE mydb FROM app_user;
```

### Schema Permissions

```sql
-- Grant schema usage permission
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant permission to create objects within schema
GRANT CREATE ON SCHEMA public TO app_user;

-- Grant permissions for all tables in schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;

-- Grant permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE ON TABLES TO app_user;
```

### Table Permissions

```sql
-- Grant query permission
GRANT SELECT ON TABLE employees TO read_user;

-- Grant insert permission
GRANT INSERT ON TABLE employees TO write_user;

-- Grant update permission
GRANT UPDATE ON TABLE employees TO write_user;

-- Grant delete permission
GRANT DELETE ON TABLE employees TO admin_user;

-- Grant all permissions
GRANT ALL PRIVILEGES ON TABLE employees TO admin_user;

-- Grant specific column permissions
GRANT SELECT (empno, ename) ON TABLE employees TO limited_user;
GRANT UPDATE (sal, comm) ON TABLE employees TO hr_user;

-- Grant permissions for multiple tables
GRANT SELECT ON TABLE employees, departments TO read_user;

-- Allow grant passing
GRANT SELECT ON TABLE employees TO read_user WITH GRANT OPTION;

-- Revoke permission
REVOKE SELECT ON TABLE employees FROM read_user;

-- Revoke all permissions
REVOKE ALL PRIVILEGES ON TABLE employees FROM read_user;
```

### Function Permissions

```sql
-- Grant execute permission
GRANT EXECUTE ON FUNCTION calc_bonus(numeric) TO app_user;

-- Grant execute permission for all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- Default permissions for future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT EXECUTE ON FUNCTIONS TO app_user;
```

### Sequence Permissions

```sql
GRANT USAGE, SELECT ON SEQUENCE emp_seq TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
```

## Role Management

### Create Roles

```sql
-- Create login role (user)
CREATE ROLE app_user WITH LOGIN PASSWORD 'secure_password';

-- Create non-login role (group)
CREATE ROLE read_only NOLOGIN;
CREATE ROLE read_write NOLOGIN;
CREATE ROLE admin NOLOGIN;

-- Create role with attributes
CREATE ROLE dba WITH LOGIN PASSWORD 'dba_password'
    CREATEDB CREATEROLE;

-- Modify role attributes
ALTER ROLE app_user WITH PASSWORD 'new_password';
ALTER ROLE app_user WITH CONNECTION LIMIT 10;
ALTER ROLE app_user VALID UNTIL '2025-12-31';
```

### Role Inheritance

```sql
-- Add user to role group
GRANT read_only TO app_user;
GRANT read_write TO admin_user;
GRANT admin TO super_user;

-- Role hierarchy
GRANT read_only TO read_write;
GRANT read_write TO admin;

-- View role members
SELECT r.rolname AS role, m.rolname AS member
FROM pg_auth_members am
JOIN pg_roles r ON r.oid = am.roleid
JOIN pg_roles m ON m.oid = am.member;
```

### Typical Role System

```sql
-- Read-only role
CREATE ROLE readonly NOLOGIN;
GRANT CONNECT ON DATABASE mydb TO readonly;
GRANT USAGE ON SCHEMA public TO readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO readonly;

-- Read-write role
CREATE ROLE readwrite NOLOGIN;
GRANT readonly TO readwrite;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT INSERT, UPDATE, DELETE ON TABLES TO readwrite;

-- Admin role
CREATE ROLE db_admin NOLOGIN;
GRANT readwrite TO db_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO db_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO db_admin;
GRANT CREATE ON SCHEMA public TO db_admin;

-- Assign actual users to roles
GRANT readonly TO report_user;
GRANT readwrite TO app_user;
GRANT db_admin TO admin_user;
```

## Row-Level Security (RLS)

### Enable RLS

```sql
-- Create policy table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT,
    owner_id INTEGER REFERENCES users(id)
);

-- Enable row-level security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Check if enabled
SELECT relname, relrowsecurity, relforcerowsecurity
FROM pg_class WHERE relname = 'documents';
```

### Create Policies

```sql
-- Users can only view their own documents
CREATE POLICY documents_owner ON documents
    FOR ALL
    TO PUBLIC
    USING (owner_id = current_user_id());

-- Read-only policy
CREATE POLICY documents_read ON documents
    FOR SELECT
    TO PUBLIC
    USING (owner_id = current_user_id());

-- Insert policy
CREATE POLICY documents_insert ON documents
    FOR INSERT
    TO PUBLIC
    WITH CHECK (owner_id = current_user_id());

-- Update policy
CREATE POLICY documents_update ON documents
    FOR UPDATE
    TO PUBLIC
    USING (owner_id = current_user_id())
    WITH CHECK (owner_id = current_user_id());

-- Delete policy
CREATE POLICY documents_delete ON documents
    FOR DELETE
    TO PUBLIC
    USING (owner_id = current_user_id());

-- Admin can view all
CREATE POLICY documents_admin ON documents
    FOR ALL
    TO admin_role
    USING (true)
    WITH CHECK (true);

-- Combined policy: department visibility
CREATE POLICY documents_dept ON documents
    FOR SELECT
    TO PUBLIC
    USING (dept_id IN (
        SELECT dept_id FROM user_departments
        WHERE user_id = current_user_id()
    ));
```

### Policy Management

```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'documents';

-- Disable RLS
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Drop policy
DROP POLICY documents_owner ON documents;

-- Force policy (applies to table owner too)
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
```

## pgcrypto Encryption

### Installation

```sql
CREATE EXTENSION pgcrypto;
```

### Password Hashing

```sql
-- bcrypt hash (recommended)
SELECT crypt('mypassword', gen_salt('bf'));
-- Output: $2a$06$R0JkV9q5X8zN2kH7mP1yLOkZwJ5xQvR3sT4uV6wX8yA0bC2dE4fG6

-- Specify rounds (4-31, default 6)
SELECT crypt('mypassword', gen_salt('bf', 10));

-- Verify password
SELECT crypt('mypassword', stored_hash) = stored_hash AS matches;
```

### Symmetric Encryption

```sql
-- AES encryption
SELECT encrypt('secret data', 'my-encryption-key', 'aes');
-- Output: \x...

-- AES decryption
SELECT decrypt(encrypted_data, 'my-encryption-key', 'aes');
-- Output: secret data

-- AES encryption with IV
SELECT encrypt_iv('secret data', 'my-key', 'initialization-vector', 'aes');
SELECT decrypt_iv(encrypted, 'my-key', 'initialization-vector', 'aes');
```

### One-Way Hashing

```sql
-- SHA-256
SELECT digest('data', 'sha256');

-- SHA-512
SELECT digest('data', 'sha512');

-- HMAC
SELECT hmac('message', 'key', 'sha256');
```

### PGP Encryption

```sql
-- PGP symmetric encryption
SELECT pgp_sym_encrypt('secret data', 'password');

-- PGP symmetric decryption
SELECT pgp_sym_decrypt(encrypted_data, 'password');

-- PGP public key encryption
SELECT pgp_pub_encrypt('secret data', dearmor(public_key));

-- PGP private key decryption
SELECT pgp_priv_decrypt(encrypted_data, dearmor(private_key));
```

## pgAudit Auditing

### Installation Configuration

```ini
# postgresql.conf
shared_preload_libraries = 'pgaudit'
pgaudit.log = 'read, write, function, role'
pgaudit.log_relation = on
pgaudit.log_parameter = on
pgaudit.role = 'auditor'
```

```sql
CREATE EXTENSION pgaudit;
```

### Audit Levels

| Level | Description |
|------|------|
| `read` | SELECT / COPY |
| `write` | INSERT / UPDATE / DELETE / TRUNCATE |
| `function` | Function calls |
| `role` | Role/permission operations |
| `ddl` | DDL statements |
| `misc` | Other operations (DISCARD, etc.) |
| `all` | All |

### Object-Level Auditing

```sql
-- Audit all operations on specific table
ALTER TABLE sensitive_data SET (pgaudit.log = 'all');

-- Audit specific role
SET pgaudit.role = 'admin';
```

## Permission Queries

```sql
-- View database permissions
SELECT datname, datacl FROM pg_database WHERE datname = 'mydb';

-- View table permissions
SELECT grantee, table_name, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
ORDER BY table_name, grantee;

-- View role attributes
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole,
       rolinherit, rolcanlogin, rolconnlimit
FROM pg_roles
WHERE rolcanlogin = true;

-- View my permissions
SELECT has_table_privilege('employees', 'select') AS can_select,
       has_table_privilege('employees', 'insert') AS can_insert,
       has_table_privilege('employees', 'update') AS can_update,
       has_table_privilege('employees', 'delete') AS can_delete;
```

## Notes

1. **Principle of least privilege**: Only grant necessary permissions, avoid over-privileging
2. **Use role groups**: Manage permissions through role inheritance, not direct grants to users
3. **RLS performance**: Row-level security policies add query overhead, evaluate performance impact
4. **Key management**: Encryption keys should not be stored in the database, use external key management systems
5. **Audit log protection**: Audit logs should be stored in tamper-proof locations
6. **Regular auditing**: Regularly review permission settings, clean up unnecessary permissions
