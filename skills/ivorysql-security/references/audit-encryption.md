---
title: IvorySQL Audit and Encryption
description: Detailed explanation of IvorySQL security auditing and data encryption, covering pgAudit audit logging, SSL/TLS transport encryption, TDE transparent data encryption, pgcrypto column-level encryption
tags:
  - ivorysql
  - security
  - audit
  - encryption
  - ssl
  - tls
  - pgcrypto
  - tde
  - pgaudit
---

# IvorySQL Audit and Encryption

## Overview

Data security and compliance are core requirements for enterprise databases. IvorySQL provides a complete auditing and encryption solution: pgAudit for statement-level auditing, SSL/TLS for protecting data in transit, pgcrypto for column-level data encryption, and TDE (Transparent Data Encryption) for protecting data at rest.

## pgAudit Auditing

### Installation and Enablement

```bash
# Install pgAudit extension
# RPM method
yum install -y ivorysql-pgaudit

# Source compilation
cd contrib/pgaudit
make install
```

```ini
# postgresql.conf
shared_preload_libraries = 'pgaudit'

# Basic auditing configuration
pgaudit.log = 'all'                    # Audit all operations
pgaudit.log_catalog = off              # Do not audit system catalog operations
pgaudit.log_client = off               # Do not send audit logs to client
pgaudit.log_parameter = on             # Record parameter values
pgaudit.log_relation = on              # Record object references
pgaudit.log_statement_once = off       # Log every statement
pgaudit.log_level = log               # Log level
```

### Audit Log Levels

| Level | Description |
|------|------|
| `none` | No logging (default) |
| `read` | SELECT/COPY and other read operations |
| `write` | INSERT/UPDATE/DELETE/COPY and other write operations |
| `function` | Function calls |
| `role` | Role/user management operations |
| `ddl` | DDL statements (CREATE/ALTER/DROP) |
| `misc` | Miscellaneous operations (DISCARD/SET/RESET) |
| `all` | All operations |

### Configuration Examples

```ini
# Audit only DDL and write operations
pgaudit.log = 'ddl, write'

# Audit read, write, DDL
pgaudit.log = 'read, write, ddl'

# Audit role management
pgaudit.log = 'role'

# Audit all operations (including parameters)
pgaudit.log = 'all'
pgaudit.log_parameter = on
```

### Object-Level Auditing

```sql
-- Enable auditing for specific table
CREATE TABLE sensitive_data (
    id serial PRIMARY KEY,
    secret_value text
);

-- Audit all read operations
AUDIT ALL ON sensitive_data BY app_user;

-- Audit specific operations
AUDIT SELECT, UPDATE ON sensitive_data BY app_user;

-- Configure object auditing via pgaudit
-- Set audit role
SET pgaudit.role = 'auditor';

-- Grant audit permissions to role
GRANT SELECT ON sensitive_data TO auditor;
```

### Audit Log Format

```
2025-01-15 10:30:45.123 CST [12345]: LOG:  AUDIT: SESSION,1,1,READ,SELECT,,,SELECT * FROM employees WHERE deptno = 10,<none>
2025-01-15 10:30:46.456 CST [12345]: LOG:  AUDIT: SESSION,2,1,WRITE,INSERT,,,INSERT INTO employees (empno, ename) VALUES (9999, 'NEW'),<none>
```

**Field descriptions:**
- AUDIT: Fixed prefix
- SESSION/OBJECT: Audit type
- Statement ID, sub-statement ID
- Operation category
- Command tag
- Object type
- Object name
- Statement text
- Parameters

### Audit Log Management

```bash
# Log rotation configuration
log_rotation_age = 1d
log_rotation_size = 100MB

# Log archiving
rsync -av /var/lib/ivorysql/data/log/audit-* /archive/audit/

# Manage audit logs with logrotate
cat > /etc/logrotate.d/ivorysql-audit <<EOF
/var/lib/ivorysql/data/log/postgresql-*.log {
    daily
    rotate 90
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF
```

## SSL/TLS Transport Encryption

### Generate Certificates

```bash
# Create self-signed CA
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
    -subj "/C=CN/ST=Beijing/O=IvorySQL/CN=IvorySQL-CA"

# Generate server certificate
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
    -subj "/C=CN/ST=Beijing/O=IvorySQL/CN=ivorysql.example.com"
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key \
    -CAcreateserial -out server.crt -days 3650 \
    -extfile <(echo "subjectAltName=DNS:ivorysql.example.com,DNS:ivorysql")

# Set permissions
chmod 600 server.key
chmod 644 server.crt ca.crt
chown postgres:postgres server.key server.crt ca.crt
```

### Server Configuration

```ini
# postgresql.conf
ssl = on
ssl_ca_file = 'ca.crt'
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL:!MD5:!RC4'
ssl_min_protocol_version = 'TLSv1.2'
ssl_max_protocol_version = 'TLSv1.3'
ssl_prefer_server_ciphers = on
ssl_dh_params_file = ''              # Use built-in DH parameters
ssl_passphrase_command = ''           # Key passphrase command
```

### Enforce SSL Connections

```conf
# pg_hba.conf
# Only allow SSL connections
hostssl    all             all             0.0.0.0/0               scram-sha-256

# Reject non-SSL connections
hostnossl  all             all             0.0.0.0/0               reject
```

### Client Connections

```bash
# Verify server certificate
psql "host=ivorysql.example.com port=5432 dbname=postgres \
      sslmode=verify-ca sslrootcert=ca.crt"

# Verify server certificate + hostname
psql "host=ivorysql.example.com port=5432 dbname=postgres \
      sslmode=verify-full sslrootcert=ca.crt"

# Use client certificate for mutual authentication
psql "host=ivorysql.example.com port=5432 dbname=postgres \
      sslmode=verify-full sslrootcert=ca.crt \
      sslcert=client.crt sslkey=client.key"
```

### SSL Mode Description

| sslmode | Description | Verify Certificate | Verify Hostname |
|---------|------|------------|--------------|
| disable | No SSL | - | - |
| allow | Prefer non-SSL | No | No |
| prefer | Prefer SSL | No | No |
| require | Must use SSL | No | No |
| verify-ca | Must use SSL + verify CA | Yes | No |
| verify-full | Must use SSL + full verification | Yes | Yes |

### View Current SSL Connections

```sql
-- View SSL usage for current connection
SELECT ssl_is_used();

-- Detailed SSL information
SELECT ssl_version, ssl_cipher
FROM pg_stat_ssl
WHERE pid = pg_backend_pid();

-- View all SSL connections
SELECT s.pid, usename, datname, ssl, ssl_version, ssl_cipher
FROM pg_stat_ssl s
JOIN pg_stat_activity a ON s.pid = a.pid
WHERE ssl = true;
```

## TDE Transparent Data Encryption

TDE (Transparent Data Encryption) encrypts data at the storage layer to prevent physical disk leakage.

### IvorySQL TDE Configuration

```ini
# postgresql.conf
# IvorySQL TDE parameters (if supported)
encrypt_tables = on
encryption_key_path = '/etc/ivorysql/encryption_keys'
```

### Using Filesystem-Level Encryption

When TDE is not available, Linux filesystem encryption can be used:

```bash
# LUKS encrypt data directory
cryptsetup luksFormat /dev/sdb1
cryptsetup luksOpen /dev/sdb1 ivorysql_data
mkfs.ext4 /dev/mapper/ivorysql_data
mount /dev/mapper/ivorysql_data /var/lib/ivorysql/data

# Auto-mount configuration
echo "ivorysql_data /dev/sdb1 /var/lib/ivorysql/data ext4 defaults 0 2" >> /etc/crypttab
```

## pgcrypto Column-Level Encryption

The pgcrypto extension provides column-level encryption within the database.

### Enable pgcrypto

```sql
CREATE EXTENSION pgcrypto;
```

### Symmetric Encryption

```sql
-- AES-256 encryption
INSERT INTO secrets (id, data)
VALUES (1, encrypt('sensitive data', 'key string', 'aes256'));

-- Decryption
SELECT convert_from(decrypt(data, 'key string', 'aes256'), 'SQL_ASCII') AS plaintext
FROM secrets WHERE id = 1;

-- Use PGP symmetric encryption (more secure, with S2K)
INSERT INTO secrets (id, data)
VALUES (2, pgp_sym_encrypt('sensitive data', 'passphrase'));

-- Decryption
SELECT pgp_sym_decrypt(data, 'passphrase') AS plaintext
FROM secrets WHERE id = 2;
```

### Asymmetric Encryption (PGP)

```sql
-- Generate PGP key pair (done at application layer, use existing keys here)

-- Encrypt with public key
INSERT INTO secrets (id, data)
VALUES (3, pgp_pub_encrypt('sensitive data', dearmor('
-----BEGIN PGP PUBLIC KEY BLOCK-----
...public key content...
-----END PGP PUBLIC KEY BLOCK-----
')));

-- Decrypt with private key
SELECT pgp_pub_decrypt(data, dearmor('
-----BEGIN PGP PRIVATE KEY BLOCK-----
...private key content...
-----END PGP PRIVATE KEY BLOCK-----
'), 'private key passphrase') AS plaintext
FROM secrets WHERE id = 3;
```

### Hash Functions

```sql
-- MD5 (not recommended for security scenarios)
SELECT md5('password');

-- SHA-256
SELECT encode(digest('password', 'sha256'), 'hex');

-- SHA-512
SELECT encode(digest('password', 'sha512'), 'hex');

-- bcrypt password hashing (recommended)
SELECT crypt('password', gen_salt('bf'));
-- Result: $2a$06$R0JlLXZxYjIwMjMwNTExSuPkFQJ5e6YR6X5J4zK7h8R9T0U1V2W3e

-- Verify password
SELECT crypt('password', stored_hash) = stored_hash AS password_matches;
```

### Complete Column Encryption Example

```sql
-- Create table with encrypted columns
CREATE TABLE user_credentials (
    id serial PRIMARY KEY,
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,      -- Using crypt hashing
    ssn bytea,                         -- Using symmetric encryption
    credit_card bytea                  -- Using PGP encryption
);

-- Insert data
INSERT INTO user_credentials (username, password_hash, ssn, credit_card)
VALUES (
    'john',
    crypt('P@ssw0rd', gen_salt('bf', 12)),
    encrypt('123-45-6789', 'ssn_encryption_key', 'aes256'),
    pgp_sym_encrypt('4111111111111111', 'cc_encryption_passphrase')
);

-- Verify password
SELECT crypt('P@ssw0rd', password_hash) = password_hash AS auth_ok
FROM user_credentials WHERE username = 'john';

-- Read SSN
SELECT convert_from(decrypt(ssn, 'ssn_encryption_key', 'aes256'), 'SQL_ASCII') AS ssn
FROM user_credentials WHERE username = 'john';

-- Read credit card number
SELECT pgp_sym_decrypt(credit_card, 'cc_encryption_passphrase') AS cc_number
FROM user_credentials WHERE username = 'john';
```

### Key Management Best Practices

1. **Keys not stored in database**, use external key management service (KMS/Vault)
2. **Use application-level encryption** for most sensitive data
3. **Rotate keys regularly**
4. **Separate data and key storage**

```sql
-- Get key from environment variable
CREATE OR REPLACE FUNCTION get_encryption_key() RETURNS text AS $$
    SELECT current_setting('app.encryption_key');
$$ LANGUAGE sql STABLE;

-- Use function to get key
SELECT encrypt('data', get_encryption_key(), 'aes256');
```

## Audit and Encryption Compliance

### Compliance Requirement Mapping

| Compliance Standard | Audit Requirement | Encryption Requirement |
|---------|---------|---------|
| GDPR | Data access auditing | Transport encryption + encryption at rest |
| PCI DSS | All database activity auditing | SSL + column-level encryption (credit cards) |
| HIPAA | PHI access auditing | Transport encryption + encryption at rest |
| SOX | Financial data change auditing | Transport encryption |

### Compliance Auditing Configuration

```ini
# PCI DSS compliant auditing configuration
pgaudit.log = 'ddl, write, role'
pgaudit.log_parameter = on
pgaudit.log_relation = on

# SSL mandatory
ssl = on
ssl_min_protocol_version = 'TLSv1.2'

# Password policy
password_encryption = scram-sha-256
```
