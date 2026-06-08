---
title: Source Code Compilation Installation
description: Detailed steps for compiling and installing IvorySQL from source code, including dependency installation, configure options, compilation, and initialization
tags:
  - deployment
  - source-build
  - compile
  - installation
---

# Source Code Compilation Installation

## Get Source Code

```bash
# Clone from GitHub
git clone https://github.com/IvorySQL/IvorySQL.git
cd IvorySQL

# Switch to stable branch
git checkout IV5_REL_5_3_STABLE

# Or download release tarball
wget https://github.com/IvorySQL/IvorySQL/archive/refs/tags/5.3.tar.gz
tar xzf 5.3.tar.gz
cd IvorySQL-5.3
```

## Install Dependencies

### CentOS / RHEL 7

```bash
sudo yum groupinstall -y "Development Tools"
sudo yum install -y \
    readline-devel \
    zlib-devel \
    openssl-devel \
    pam-devel \
    libxml2-devel \
    libxslt-devel \
    openldap-devel \
    tcl-devel \
    python3-devel \
    perl-devel \
    perl-ExtUtils-Embed \
    gettext \
    uuid-devel \
    libicu-devel \
    systemd-devel \
    lz4-devel \
    zstd-devel
```

### CentOS / RHEL 8 / Rocky / AlmaLinux

```bash
sudo dnf groupinstall -y "Development Tools"
sudo dnf install -y \
    readline-devel \
    zlib-devel \
    openssl-devel \
    pam-devel \
    libxml2-devel \
    libxslt-devel \
    openldap-devel \
    tcl-devel \
    python3-devel \
    perl-devel \
    perl-ExtUtils-Embed \
    gettext \
    libuuid-devel \
    libicu-devel \
    systemd-devel \
    lz4-devel \
    libzstd-devel
```

### Ubuntu / Debian

```bash
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
    tcl8.6-dev \
    python3-dev \
    libperl-dev \
    gettext \
    uuid-dev \
    libicu-dev \
    libsystemd-dev \
    liblz4-dev \
    libzstd-dev
```

### Dependency Description

| Package | Purpose | Required |
|--------|------|------|
| `readline` | psql command-line editing | Yes |
| `zlib` | Compression support | Yes |
| `openssl` | SSL connections | No (recommended) |
| `pam` | PAM authentication | No |
| `libxml2` | XML type support | No |
| `libxslt` | XSLT transformation | No |
| `openldap` | LDAP authentication | No |
| `tcl` | PL/Tcl | No |
| `python3` | PL/Python3 | No |
| `perl` | PL/Perl | No |
| `libicu` | ICU collation | No (recommended) |
| `systemd` | systemd notification | No |
| `lz4` | LZ4 compression | No |
| `zstd` | ZSTD compression | No |

## Configure Options

### Basic Configuration

```bash
./configure \
    --prefix=/usr/local/ivorysql \
    --enable-debug \
    --enable-cassert \
    --enable-tap-tests
```

### Full Configuration (Production Recommended)

```bash
./configure \
    --prefix=/usr/local/ivorysql \
    --with-openssl \
    --with-pam \
    --with-ldap \
    --with-libxml \
    --with-libxslt \
    --with-icu \
    --with-systemd \
    --with-lz4 \
    --with-zstd \
    --with-python \
    --with-perl \
    --with-tcl \
    --with-uuid=e2fs \
    --with-gnu-ld \
    --enable-nls \
    --with-oraport
```

### Configure Options Explained

| Option | Description |
|------|------|
| `--prefix=DIR` | Installation directory, default `/usr/local` |
| `--with-oraport` | Enable Oracle port compatibility (IvorySQL specific) |
| `--with-openssl` | Enable SSL support |
| `--with-pam` | Enable PAM authentication |
| `--with-ldap` | Enable LDAP authentication |
| `--with-libxml` | Enable XML types |
| `--with-libxslt` | Enable XSLT support |
| `--with-icu` | Enable ICU collation |
| `--with-systemd` | Enable systemd integration |
| `--with-lz4` | Enable LZ4 compression |
| `--with-zstd` | Enable ZSTD compression |
| `--with-python` | Enable PL/Python3 |
| `--with-perl` | Enable PL/Perl |
| `--with-tcl` | Enable PL/Tcl |
| `--with-uuid=LIB` | Enable UUID (e2fs / ossp) |
| `--with-gnu-ld` | Use GNU ld |
| `--enable-nls[=LANGUAGES]` | Enable NLS |
| `--enable-debug` | Enable debug symbols |
| `--enable-cassert` | Enable assertion checks (for development) |
| `--enable-tap-tests` | Enable TAP tests |
| `--enable-thread-safety` | Enable thread safety (enabled by default) |

### --with-oraport Explained

`--with-oraport` is an IvorySQL-specific configure option that enables Oracle protocol port support:

```bash
# Enable Oracle port, allow listening on both PG and Oracle protocols simultaneously
./configure --with-oraport=1521 --prefix=/usr/local/ivorysql

# Can be configured in postgresql.conf after build
# ivorysql.port = 1521      # Oracle protocol port
# port = 5432               # PostgreSQL protocol port
```

## Compile and Install

```bash
# Compile (using multi-core acceleration)
make -j$(nproc)

# Run regression tests (optional)
make check

# Run PL/iSQL tests (optional)
make check-world

# Install
sudo make install

# Install contrib modules
cd contrib
make -j$(nproc)
sudo make install
cd ..

# Install IvorySQL-specific modules
cd src/oracle_fe_utils
make
sudo make install
cd ../..
```

## Initialization

```bash
# Create ivorysql user and group
sudo groupadd ivorysql
sudo useradd -g ivorysql -m -s /bin/bash ivorysql

# Create data directory
sudo mkdir -p /usr/local/ivorysql/data
sudo chown ivorysql:ivorysql /usr/local/ivorysql/data
sudo chmod 700 /usr/local/ivorysql/data

# Set environment variables
sudo su - ivorysql
cat >> ~/.bashrc << 'EOF'
export PATH=/usr/local/ivorysql/bin:$PATH
export LD_LIBRARY_PATH=/usr/local/ivorysql/lib:$LD_LIBRARY_PATH
export PGDATA=/usr/local/ivorysql/data
EOF
source ~/.bashrc

# Initialize database
# Oracle compatible mode
initdb -m oracle -D /usr/local/ivorysql/data

# PG mode
initdb -m pg -D /usr/local/ivorysql/data

# Initialize with encoding
initdb -m oracle -D /usr/local/ivorysql/data \
    --encoding=UTF-8 \
    --locale=en_US.UTF-8
```

## Configure systemd Service

```bash
# Create systemd service file
sudo cat > /etc/systemd/system/ivorysql.service << 'EOF'
[Unit]
Description=IvorySQL 5.3 Database Server
Documentation=https://www.ivorysql.org/
After=network.target

[Service]
Type=notify
User=ivorysql
Group=ivorysql
Environment=PGDATA=/usr/local/ivorysql/data
Environment=PG_OOM_ADJUST_FILE=/proc/self/oom_score_adj
Environment=PG_OOM_ADJUST_VALUE=0
ExecStart=/usr/local/ivorysql/bin/postgres -D ${PGDATA}
ExecReload=/bin/kill -HUP $MAINPID
KillMode=mixed
KillSignal=SIGINT
TimeoutSec=0

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
sudo systemctl daemon-reload

# Start service
sudo systemctl start ivorysql
sudo systemctl enable ivorysql
```

## Verify Installation

```bash
# Connect to database
psql -U ivorysql -d postgres

# Check version
SELECT version();

# Check Oracle compatibility mode
SHOW ivorysql.compatible_mode;

# Check available extensions
SELECT * FROM pg_available_extensions ORDER BY name;
```

## Upgrade Build

```bash
# Stop service
sudo systemctl stop ivorysql

# Backup data
pg_dumpall -U ivorysql > backup.sql

# Update source code
cd IvorySQL
git pull
git checkout IV5_REL_5_3_STABLE

# Recompile
make clean
./configure --prefix=/usr/local/ivorysql --with-oraport=1521 --with-openssl ...
make -j$(nproc)
sudo make install

# Start service (data directory upgraded automatically)
sudo systemctl start ivorysql
```

## Common Build Issues

| Issue | Cause | Solution |
|------|------|---------|
| `readline not found` | Missing readline | `yum install readline-devel` |
| `zlib not found` | Missing zlib | `yum install zlib-devel` |
| `openssl headers not found` | Missing OpenSSL | `yum install openssl-devel` |
| `ICU not found` | Missing ICU | `yum install libicu-devel` |
| `lz4 not found` | Missing LZ4 | `yum install lz4-devel` |
| `zstd not found` | Missing ZSTD | `yum install libzstd-devel` |
| `oraport support not available` | Missing --with-oraport | Reconfigure |
