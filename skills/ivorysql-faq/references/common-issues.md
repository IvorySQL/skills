---
title: Common Issues
description: IvorySQL common issue troubleshooting, covering installation, compatibility, connection, and performance FAQ
tags:
  - faq
  - troubleshooting
  - installation
  - compatibility
---

# Common Issues

## Installation Issues

### Q: initdb reports "directory exists but is not empty"

```
initdb: error: directory "/var/lib/ivorysql/data" exists but is not empty
```

**Cause**: The data directory already has content, possibly from a previous initialization.

**Solution**:

```bash
# Option 1: Backup then clear
sudo cp -r /var/lib/ivorysql/data /var/lib/ivorysql/data.bak
sudo rm -rf /var/lib/ivorysql/data/*
initdb -m oracle -D /var/lib/ivorysql/data

# Option 2: Use a new directory
initdb -m oracle -D /var/lib/ivorysql/newdata
```

### Q: Yum install cannot find ivorysql package

**Cause**: IvorySQL Yum repository is not configured.

**Solution**:

```bash
# Configure repository
sudo yum install -y https://yum.ivorysql.org/ivorysql-release/rhel/7/x86_64/ivorysql-release-1.0-1.el7.noarch.rpm

# Clean cache
sudo yum clean all
sudo yum makecache

# Verify
yum list | grep ivorysql
```
