---
title: IvorySQL Installation Guide
description: Complete IvorySQL installation guide covering Yum/RPM package installation, source code compilation, dependency configuration, environment variable setup, and post-installation initialization
tags:
  - ivorysql
  - deployment
  - installation
  - yum
  - rpm
  - source-build
---

# IvorySQL Installation Guide

## Overview

IvorySQL supports multiple installation methods: Yum/RPM package manager installation (recommended for production environments), source code compilation installation (when custom build options are needed). This document details the complete steps for each installation method.

## System Requirements

### Hardware Requirements

| Component | Minimum | Recommended |
|------|---------|---------|
| CPU | 2 Cores | 4+ Cores |
| Memory | 2 GB | 8+ GB |
| Disk | 10 GB | 100+ GB SSD |
| Network | 100 Mbps | 1 Gbps |

### Supported Operating Systems

| System | Version |
|------|------|
| RHEL / CentOS / Rocky | 7.x, 8.x, 9.x |
| openEuler | 20.03, 22.03 |
| Debian | 11, 12 |
| Ubuntu | 20.04, 22.04, 24.04 |

## Yum/RPM Installation

### 1. Configure Yum Repository

```bash
# CentOS/RHEL 8
sudo yum install -y https://repo.ivorysql.org/yum/ivorysql/5/rhel/8/x86_64/ivorysql-release-5-1.el8.noarch.rpm

# CentOS/RHEL 7
sudo yum install -y https://repo.ivorysql.org/yum/ivorysql/5/rhel/7/x86_64/ivorysql-release-5-1.el7.noarch.rpm

# openEuler 20.03
sudo yum install -y https://repo.ivorysql.org/yum/ivorysql/5/openEuler/20.03/x86_64/ivorysql-release-5-1.oe1.noarch.rpm
```

### 2. Install IvorySQL

```bash
# Install server and client
sudo yum install -y ivorysql-server

# Install client only
sudo yum install -y ivorysql-client

# Install additional components
sudo yum install -y ivorysql-contrib    # Extension modules
sudo yum install -y ivorysql-devel      # Development headers
sudo yum install -y ivorysql-docs       # Documentation
sudo yum install -y ivorysql-plpython3  # PL/Python
sudo yum install -y ivorysql-pltcl      # PL/Tcl
```

### 3. RPM Package List

| Package | Description |
|------|------|
| ivorysql-server | Server core |
| ivorysql-client | Client tools (psql, etc.) |
| ivorysql-contrib | Additional extensions and tools |
| ivorysql-devel | C development headers |
| ivorysql-docs | Documentation |
| ivorysql-libs | Client libraries |
| ivorysql-plpython3 | PL/Python3 procedural language |
| ivorysql-pltcl | PL/Tcl procedural language |
| ivorysql-pgaudit | pgAudit audit extension |
| ivorysql-pgbackrest | PGBackRest backup tool |

### 4. Post-Installation Verification

```bash
# Check installation
rpm -qa | grep ivorysql

# View installation path
rpm -ql ivorysql-server | head -20

# Check version
/usr/ivorysql/5/bin/postgres --version
/usr/ivorysql/5/bin/psql --version
```

## Source Code Compilation Installation

### 1. Install Dependencies

```bash
# CentOS/RHEL 8
sudo yum groupinstall -y "Development Tools"
sudo yum install -y \
    readline-devel \
    zlib-devel \
    openssl-devel \
    pam-devel \
    libxml2-devel \
    libxslt-devel \
    openldap-devel \
    python3-devel \
    tcl-devel \
    perl-ExtUtils-Embed \
    systemd-devel \
    uuid-devel \
    libicu-devel

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    libreadline-dev \
    zlib1g-dev \
    libssl-dev \
    libpam0g-dev \
    libxml2-dev \
    libxslt1-dev \
    libldap2-dev \
    python3-dev \
    tcl-dev \
    libsystemd-dev \
    uuid-dev \
    libicu-dev
```

### 2. Download Source Code

```bash
# Download from GitHub
git clone https://github.com/IvorySQL/IvorySQL.git
cd IvorySQL

# Switch to stable version
git checkout IvorySQL_5.3

# Or download release tarball
wget https://github.com/IvorySQL/IvorySQL/archive/refs/tags/IvorySQL_5.3.tar.gz
tar xzf IvorySQL-IvorySQL_5.3.tar.gz
cd IvorySQL-IvorySQL_5.3
```

### 3. Configure Build Options

```bash
./configure \
    --prefix=/usr/local/ivorysql/5 \
    --with-oraport=1521 \
    --with-openssl \
    --with-readline \
    --with-zlib \
    --with-pam \
    --with-ldap \
    --with-libxml \
    --with-libxslt \
    --with-systemd \
    --with-uuid=e2fs \
    --with-icu \
    --with-python \
    --with-tcl

# Key build options explanation:
# --prefix         Installation path
# --with-oraport   Enable Oracle compatible port
# --with-openssl   SSL/TLS support
# --with-systemd   systemd service integration
# --with-ldap      LDAP authentication support
```

### 4. Compile and Install

```bash
# Compile (using multi-core acceleration)
make -j$(nproc)

# Run regression tests (optional)
make check

# Install
sudo make install

# Install contrib modules
cd contrib
make -j$(nproc)
sudo make install
cd ..

# Install IvorySQL extensions
cd ivorysql_contrib
make -j$(nproc)
sudo make install
cd ..
```

### 5. Verify Installation

```bash
# Check version
/usr/local/ivorysql/5/bin/postgres --version
# Output: postgres (IvorySQL 5.3)

# Check build configuration
/usr/local/ivorysql/5/bin/pg_config --configure
```

## Initialization and Startup

### 1. Create OS User

```bash
# Create ivorysql user
sudo useradd -m -s /bin/bash ivorysql
sudo passwd ivorysql
```

### 2. Initialize Data Directory

```bash
# Switch to ivorysql user
sudo su - ivorysql

# Initialize cluster
# RPM installation
/usr/ivorysql/5/bin/initdb -D /var/lib/ivorysql/5/data

# Source installation
/usr/local/ivorysql/5/bin/initdb -D /home/ivorysql/data

# Initialize with options
/usr/ivorysql/5/bin/initdb \
    -D /var/lib/ivorysql/5/data \
    -E UTF8 \
    --locale=en_US.UTF-8 \
    --data-checksums
```

### 3. Configure postgresql.conf

```bash
# Edit configuration file
vi /var/lib/ivorysql/5/data/postgresql.conf
```

```ini
# Basic configuration
listen_addresses = '*'
port = 5432
max_connections = 100

# Oracle compatible port
ivorysql.port = 1521
ivorysql.listen_mode = '*'
ivorysql.enable_oracle_compatible = true

# Memory configuration (adjust based on system memory)
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 16MB

# Logging
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_min_duration_statement = 1000

# Autovacuum
autovacuum = on
```

### 4. Configure pg_hba.conf

```bash
vi /var/lib/ivorysql/5/data/pg_hba.conf
```

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
host    all             all             0.0.0.0/0               scram-sha-256
```

### 5. Start Service

```bash
# Manual startup
/usr/ivorysql/5/bin/pg_ctl start -D /var/lib/ivorysql/5/data -l /var/log/ivorysql/logfile

# Using systemd (RPM installation)
sudo systemctl enable ivorysql-5
sudo systemctl start ivorysql-5

# Check status
sudo systemctl status ivorysql-5

# Check ports
ss -tlnp | grep -E '5432|1521'
```

### 6. Connection Verification

```bash
# Connect via PG port
/usr/ivorysql/5/bin/psql -h localhost -p 5432 -U ivorysql -d postgres

# Connect via Oracle port
/usr/ivorysql/5/bin/psql -h localhost -p 1521 -U ivorysql -d postgres
```

```sql
-- Verify version
SELECT version();

-- Verify Oracle compatibility
SHOW ivorysql.enable_oracle_compatible;
SHOW ivorysql.port;

-- Verify dual port
SELECT inet_server_port();
```

## Environment Variable Configuration

```bash
# Add to ~/.bashrc or ~/.bash_profile
export IVORYSQL_HOME=/usr/ivorysql/5
export PATH=$IVORYSQL_HOME/bin:$PATH
export PGDATA=/var/lib/ivorysql/5/data
export PGHOST=localhost
export PGPORT=5432
export PGUSER=ivorysql
export PGDATABASE=postgres
export MANPATH=$IVORYSQL_HOME/share/man:$MANPATH

# Apply
source ~/.bashrc
```

## systemd Service Configuration

```ini
; /usr/lib/systemd/system/ivorysql-5.service
[Unit]
Description=IvorySQL 5.3 Server
Documentation=https://www.ivorysql.org
After=network.target

[Service]
Type=notify
User=ivorysql
Group=ivorysql
Environment=PGDATA=/var/lib/ivorysql/5/data
Environment=PG_OOM_ADJUST_FILE=/proc/self/oom_score_adj
Environment=PG_OOM_ADJUST_VALUE=0
ExecStartPre=/usr/ivorysql/5/bin/pg_ctl start -D /var/lib/ivorysql/5/data -w -t 300
ExecStart=/usr/ivorysql/5/bin/pg_ctl start -D /var/lib/ivorysql/5/data -w -t 300
ExecReload=/usr/ivorysql/5/bin/pg_ctl reload -D /var/lib/ivorysql/5/data
ExecStop=/usr/ivorysql/5/bin/pg_ctl stop -D /var/lib/ivorysql/5/data -m fast
KillMode=mixed
KillSignal=SIGINT
TimeoutSec=300

[Install]
WantedBy=multi-user.target
```

## Uninstall

```bash
# RPM uninstall
sudo yum remove ivorysql-server ivorysql-client ivorysql-contrib

# Source installation uninstall
cd IvorySQL-IvorySQL_5.3
sudo make uninstall

# Clean up data directory
sudo rm -rf /var/lib/ivorysql/5/data
sudo rm -rf /var/log/ivorysql
```

## Common Issues

### Q: "Shared memory" error during initialization

```bash
# Increase shared memory
sudo sysctl -w kernel.shmmax=68719476736
sudo sysctl -w kernel.shmall=16777216
echo "kernel.shmmax = 68719476736" | sudo tee -a /etc/sysctl.conf
echo "kernel.shmall = 16777216" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Q: Cannot find openssl during compilation

```bash
# CentOS/RHEL 8
sudo yum install -y openssl-devel

# Specify path
./configure --with-openssl INCLUDES="-I/usr/include/openssl" LIBS="-L/usr/lib64"
```

### Q: Oracle port not listening

```bash
# Check if --with-oraport was included during build
pg_config --configure | grep oraport

# Check configuration
psql -c "SHOW ivorysql.port"
psql -c "SHOW ivorysql.listen_mode"
```
