---
title: Authentication
description: Detailed explanation of IvorySQL/PostgreSQL authentication methods, including SCRAM-SHA-256, MD5, certificates, GSSAPI, and pg_hba.conf configuration
tags:
  - security
  - authentication
  - pg_hba
  - ssl
---

# Authentication

## Authentication Method Comparison

| Method | Security | Performance | Configuration Complexity | Use Case |
|------|--------|------|-----------|---------|
| `trust` | None | Highest | Lowest | Development only |
| `peer` | Medium | High | Low | Local same-user |
| `ident` | Low | High | Low | Local |
| `md5` | Medium | High | Low | Legacy system compatibility |
| `scram-sha-256` | High | Medium | Low | **Production recommended** |
| `cert` | Very high | Medium | High | High security scenarios |
| `gss` | High | Medium | High | Enterprise SSO |
| `sspi` | High | Medium | High | Windows domain |
| `ldap` | Medium | Medium | Medium | Enterprise LDAP |
| `radius` | Medium | Medium | Medium | RADIUS server |
| `pam` | Medium | Medium | Medium | PAM authentication |

## pg_hba.conf Configuration

### File Format

```
# TYPE  DATABASE  USER  ADDRESS  METHOD  [auth-options]
```

### Common Configuration Examples

```
# Local connections
local   all         all                     peer
local   all         postgres                peer

# IPv4 local
host    all         all     127.0.0.1/32    scram-sha-256

# IPv6 local
host    all         all     ::1/128         scram-sha-256

# LAN access
host    all         app_user    192.168.1.0/24   scram-sha-256

# Read-only user
host    reporting   read_only   10.0.0.0/8      scram-sha-256

# Replication user
host    replication replicator  192.168.1.0/24   scram-sha-256

# Admin (SSL + certificate dual authentication)
hostssl all         admin       10.0.0.0/8       cert clientcert=verify-full

# Reject all other connections
host    all         all         0.0.0.0/0        reject
```

### Field Descriptions

| Field | Description | Example |
|------|------|------|
| TYPE | Connection type | `local`, `host`, `hostssl`, `hostnossl` |
| DATABASE | Database name | `all`, `sameuser`, `replication`, `mydb` |
| USER | Username | `all`, `postgres`, `app_user` |
| ADDRESS | Client address | `127.0.0.1/32`, `192.168.1.0/24` |
| METHOD | Authentication method | `scram-sha-256`, `cert`, `peer` |

### TYPE Values

| Type | Description |
|------|------|
| `local` | Unix domain socket connection |
| `host` | TCP/IP connection (SSL or non-SSL) |
| `hostssl` | SSL-only TCP/IP connection |
| `hostnossl` | Non-SSL-only TCP/IP connection |

## SCRAM-SHA-256

### Configuration

```ini
# postgresql.conf
password_encryption = scram-sha-256
```

```
# pg_hba.conf
host    all    all    0.0.0.0/0    scram-sha-256
```

### User Management

```sql
-- Create user (automatically uses scram-sha-256 encryption)
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Change password
ALTER USER app_user WITH PASSWORD 'new_secure_password';

-- View password encryption method
SELECT rolname, rolpassword FROM pg_authid WHERE rolname = 'app_user';
-- scram-sha-256 password starts with SCRAM-SHA-256$
```

### Migrating from MD5 to SCRAM-SHA-256

```sql
-- 1. Set new encryption method
SET password_encryption = 'scram-sha-256';

-- 2. Have all users reset passwords
-- Generate password reset SQL
SELECT 'ALTER USER ' || rolname || ' PASSWORD ''' || rolname || '_temp_password'';'
FROM pg_authid
WHERE rolpassword LIKE 'md5%'
  AND rolcanlogin = true;

-- 3. Update pg_hba.conf
-- Change md5 to scram-sha-256

-- 4. Reload configuration
SELECT pg_reload_conf();
```

## Certificate Authentication

### Generate Certificates

```bash
# 1. Create CA
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
    -subj "/CN=IvorySQL-CA"

# 2. Generate server certificate
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
    -subj "/CN=ivorysql-server"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \
    -CAcreateserial -days 365 -out server.crt

# 3. Generate client certificate
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr \
    -subj "/CN=app_user"
openssl x509 -req -in client.csr -CA ca.crt -CAkey ca.key \
    -CAcreateserial -days 365 -out client.crt

# 4. Set permissions
chmod 600 server.key
chmod 644 server.crt
chown ivorysql:ivorysql server.key server.crt
```

### Server Configuration

```ini
# postgresql.conf
ssl = on
ssl_ca_file = '/etc/ivorysql/ca.crt'
ssl_cert_file = '/etc/ivorysql/server.crt'
ssl_key_file = '/etc/ivorysql/server.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_min_protocol_version = 'TLSv1.2'
```

```
# pg_hba.conf
hostssl    all    all    0.0.0.0/0    cert clientcert=verify-full
```

### Client Connection

```bash
# psql certificate authentication
psql "host=ivorysql-host port=5432 dbname=mydb user=app_user sslmode=verify-full \
      sslcert=/path/to/client.crt sslkey=/path/to/client.key sslrootcert=/path/to/ca.crt"

# JDBC certificate authentication
jdbc:postgresql://ivorysql-host:5432/mydb?sslmode=verify-full\
&sslcert=/path/to/client.crt&sslkey=/path/to/client.key&sslrootcert=/path/to/ca.crt
```

## GSSAPI Authentication

### Configuration

```bash
# Install dependencies
sudo yum install -y krb5-devel

# Recompile IvorySQL
./configure --with-gssapi --prefix=/usr/local/ivorysql
```

```ini
# postgresql.conf
krb_server_keyfile = '/etc/ivorysql/ivorysql.keytab'
```

```
# pg_hba.conf
host    all    all    0.0.0.0/0    gss include_realm=0
```

### Kerberos Configuration

```ini
# /etc/krb5.conf
[libdefaults]
    default_realm = EXAMPLE.COM
    dns_lookup_realm = false
    dns_lookup_kdc = true

[realms]
    EXAMPLE.COM = {
        kdc = kdc.example.com
        admin_server = kdc.example.com
    }
```

```bash
# Create service principal
kadmin -q "addprinc -randkey postgres/ivorysql-host.example.com@EXAMPLE.COM"

# Export keytab
kadmin -q "ktadd -norandkey -k /etc/ivorysql/ivorysql.keytab postgres/ivorysql-host.example.com@EXAMPLE.COM"

# Set permissions
chown ivorysql:ivorysql /etc/ivorysql/ivorysql.keytab
chmod 400 /etc/ivorysql/ivorysql.keytab
```

### Client Connection

```bash
# Get Kerberos ticket
kinit app_user@EXAMPLE.COM

# Connect using GSSAPI
psql -h ivorysql-host -U app_user@EXAMPLE.COM -d mydb
```

## LDAP Authentication

```
# pg_hba.conf
host    all    all    0.0.0.0/0    ldap ldapserver=ldap.example.com ldapport=636 ldaptls=1 ldapbasedn="ou=users,dc=example,dc=com" ldapsearchfilter="(uid=$username)"
```

### LDAP with Bind DN

```
host    all    all    0.0.0.0/0    ldap \
    ldapserver=ldap.example.com \
    ldapport=636 \
    ldaptls=1 \
    ldapbasedn="ou=users,dc=example,dc=com" \
    ldapbinddn="cn=ivorysql,ou=services,dc=example,dc=com" \
    ldapbindpasswd="service_password" \
    ldapsearchfilter="(uid=$username)"
```

## Connection Encryption (SSL/TLS)

### SSL Modes

| Mode | Description | Recommended Scenario |
|------|------|---------|
| `disable` | No SSL | Local development |
| `allow` | Prefer non-SSL | Not recommended |
| `prefer` | Prefer SSL | General scenarios |
| `require` | Must use SSL | Production environment |
| `verify-ca` | SSL + verify CA | High security |
| `verify-full` | SSL + verify CA + hostname | Highest security |

### Enforce SSL

```ini
# postgresql.conf
ssl = on
ssl_min_protocol_version = 'TLSv1.2'
```

```
# pg_hba.conf - reject non-SSL connections
hostnossl    all    all    0.0.0.0/0    reject
hostssl      all    all    0.0.0.0/0    scram-sha-256
```

## Security Best Practices

1. **Production must use** `scram-sha-256` or `cert` authentication, `trust` is prohibited
2. **SSL encryption**: Remote connections must enable SSL
3. **Minimum privilege**: pg_hba.conf only opens necessary access
4. **Regular password rotation**: Recommended 90-day password change
5. **Auditing**: Use pgAudit to record authentication events
6. **Network isolation**: Database should not be directly exposed to the public network
7. **Key management**: Private key file permissions must be 0600
