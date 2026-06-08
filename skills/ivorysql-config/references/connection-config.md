---
title: IvorySQL Connection and Security Configuration
description: Connection configuration, authentication methods, SSL/TLS, pg_hba.conf
tags: ivorysql, config, connection, authentication, ssl, pgbouncer
---

# IvorySQL Connection and Security Configuration

## Connection Parameters

### Listen Configuration

```ini
# postgresql.conf
listen_addresses = '*'          # Listen on all addresses
port = 5432                     # PG port
ivorysql.port = 1521            # Oracle compatibility port
max_connections = 200           # Maximum connections
superuser_reserved_connections = 3
```

### TCP Keepalive

```ini
tcp_keepalives_idle = 60        # Send keepalive after 60 seconds idle
tcp_keepalives_interval = 10    # Retry every 10 seconds
tcp_keepalives_count = 10       # Disconnect after 10 failed attempts
```

## Authentication Configuration (pg_hba.conf)

### Authentication Methods

| Method | Description | Security |
|------|------|--------|
| trust | No password required | ❌ Insecure |
| md5 | MD5 password hash | ⚠️ Moderate |
| scram-sha-256 | SCRAM-SHA-256 | ✅ Recommended |
| cert | Client certificate | ✅ High security |
| gss / sspi | GSSAPI / SSPI | ✅ Enterprise |
| ldap | LDAP authentication | ✅ Enterprise |
| radius | RADIUS authentication | ✅ Enterprise |
| pam | PAM authentication | ✅ System-level |

### pg_hba.conf Example

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# Local connections
local   all             all                                     scram-sha-256
# IPv4 local
host    all             all             127.0.0.1/32            scram-sha-256
# IPv6 local
host    all             all             ::1/128                 scram-sha-256
# Intranet connections
host    ivorysql        app_user        10.0.0.0/8              scram-sha-256
# Replication connections
host    replication     replicator      10.0.0.0/8              scram-sha-256
# Oracle compatibility port
hostivorysql  all       all             0.0.0.0/0               scram-sha-256
```

## SSL/TLS Configuration

### Enable SSL

```ini
# postgresql.conf
ssl = on
ssl_ca_file = '/etc/ivorysql/ca.crt'
ssl_cert_file = '/etc/ivorysql/server.crt'
ssl_key_file = '/etc/ivorysql/server.key'
ssl_ciphers = 'HIGH:MEDIUM:+3DES:!aNULL'
ssl_prefer_server_ciphers = on
ssl_min_protocol_version = 'TLSv1.2'
```

### Connection Strings

```bash
# JDBC
jdbc:ivorysql://host:5432/dbname?ssl=true&sslmode=verify-full

# psycopg2
postgresql://user:pass@host:5432/dbname?sslmode=verify-full

# libpq
PGSSLMODE=verify-full psql -h host -d dbname
```

### SSL Modes

| Mode | Description | Security |
|------|------|--------|
| disable | No SSL | ❌ |
| allow | Prefer non-SSL | ⚠️ |
| prefer | Prefer SSL | ⚠️ |
| require | Must use SSL | ✅ |
| verify-ca | Verify CA | ✅✅ |
| verify-full | Verify CA + hostname | ✅✅✅ |

## Connection Pool (pgbouncer)

### Installation

```bash
# CentOS/RHEL
yum install pgbouncer

# Ubuntu
apt install pgbouncer
```

### Configuration Example

```ini
# pgbouncer.ini
[databases]
ivorysql = host=127.0.0.1 port=5432 dbname=ivorysql

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
reserve_pool_size = 5
reserve_pool_timeout = 3
server_idle_timeout = 300
```
