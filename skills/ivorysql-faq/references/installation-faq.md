---
title: IvorySQL Installation and Deployment FAQ
description: Common issues with installation, initialization, startup, and connection
tags: ivorysql, faq, installation, initdb, startup
---

# IvorySQL Installation and Deployment FAQ

## Installation Issues

### Q: Yum install cannot find the package?
A: Make sure the IvorySQL Yum repository is configured. Check if `/etc/yum.repos.d/ivorysql.repo` exists and `enabled=1`.

### Q: Source compilation reports missing readline?
A: Install dependencies: `yum install -y readline-devel` or `apt install -y libreadline-dev`.

### Q: How to enable the Oracle compatible port?
A: Add the `--with-oraport` option during compilation, then configure `ivorysql.port = 1521` in postgresql.conf.

## Initialization Issues

### Q: initdb reports permission denied?
A: Ensure the data directory is owned by the `ivorysql` user: `chown -R ivorysql:ivorysql /data/ivorysql`.

### Q: How to reinitialize the database?
A: Stop the database, delete the data directory, then re-run initdb. **Note: This will lose all data!**

### Q: How to set the superuser password after initdb?
A: Use the `--pwprompt` parameter: `initdb -D /data -m oracle --pwprompt --auth=scram-sha-256`.

## Startup Issues

### Q: Startup reports "could not create shared memory segment"?
A: Adjust the system shared memory parameters: `sysctl -w kernel.shmmax=1073741824`.

### Q: Startup reports "port 5432 already in use"?
A: Check if another PostgreSQL instance is using the port: `lsof -i :5432`, or modify the port parameter.

### Q: Connection reports "database ivorysql does not exist"?
A: The default database name for IvorySQL is `ivorysql` (not `postgres`). Make sure to specify the correct database name when connecting.

## Compatibility Mode Issues

### Q: How to confirm the current compatibility mode?
A: Run `SHOW ivorysql.compatible_mode;`, which returns `oracle` or `pg`.

### Q: How to enable Oracle compatibility after initializing in PG mode?
A: Manually install the ivorysql_ora extension: `CREATE EXTENSION ivorysql_ora;`, then `SET ivorysql.compatible_mode TO oracle;`.
