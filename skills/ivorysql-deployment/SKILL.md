---
name: IvorySQL Installation and Deployment
name_for_command: ivorysql-deployment
description: |
  Complete IvorySQL installation and deployment guide: Yum/RPM package installation, source code compilation,
  Docker/Podman containerized deployment, Kubernetes/Helm deployment, IvorySQL Operator deployment,
  Docker Compose deployment, startup parameters, Oracle mode initialization, IvorySQL Cloud.
tags: ivorysql, deployment, installation, docker, kubernetes, operator
---

# IvorySQL Installation and Deployment

## Deployment Overview

| Deployment Method | Complexity | Use Case |
|----------|--------|----------|
| Yum/RPM | Low | CentOS/RHEL production environments |
| Source Compilation | Medium | Custom build options |
| Docker | Low | Development/testing, quick deployment |
| Docker Compose | Medium | Single-host multi-container |
| Kubernetes/Helm | High | Cloud-native production environments |
| IvorySQL Operator | High | K8s high availability clusters |
| IvorySQL Cloud | Low | Managed cloud service |

> For details: [installation](references/installation.md)

## Source Code Compilation and Installation

```bash
# 1. Install dependencies
yum install -y gcc readline-devel zlib-devel flex bison

# 2. Clone source code
git clone https://github.com/IvorySQL/IvorySQL.git
cd IvorySQL

# 3. Configure
./configure --prefix=/usr/local/ivorysql \
    --enable-debug --enable-cassert \
    --with-uuid=e2fs --with-libxml \
    --with-oraport=1521              # Enable Oracle compatible port

# 4. Compile and install
make -j$(nproc)
make install

# 5. Oracle mode initialization
initdb -D /data/ivorysql -m oracle

# 6. Start service
pg_ctl -D /data/ivorysql start

# 7. Connect to database
psql -d ivorysql
```

## Docker Deployment

```bash
# Pull official image
docker pull ivorysql/ivorysql:5.3

# Run container
docker run -d --name ivorysql \
    -p 5432:5432 \
    -p 1521:1521 \
    -v /data/ivorysql:/var/lib/ivorysql/data \
    -e POSTGRES_PASSWORD=your_password \
    ivorysql/ivorysql:5.3
```

> For details: [container-deployment](references/container-deployment.md)

## Docker Compose Deployment

```yaml
version: '3.8'
services:
  ivorysql:
    image: ivorysql/ivorysql:5.3
    container_name: ivorysql
    ports:
      - "5432:5432"
      - "1521:1521"
    volumes:
      - ivorysql_data:/var/lib/ivorysql/data
    environment:
      - POSTGRES_PASSWORD=your_password
    deploy:
      resources:
        limits:
          memory: 8G
          cpus: '4'
    restart: unless-stopped

volumes:
  ivorysql_data:
```

## Kubernetes Deployment

```bash
# Using Helm
helm repo add ivorysql https://ivorysql.github.io/helm-charts
helm install ivorysql ivorysql/ivorysql \
    --set persistence.enabled=true \
    --set persistence.size=100Gi \
    --set resources.requests.memory=4Gi \
    --set resources.requests.cpu=2
```

## Start and Stop

### Start

```bash
# Foreground start
pg_ctl -D /data/ivorysql start

# Specify log file
pg_ctl -D /data/ivorysql -l /var/log/ivorysql.log start
```

### Stop

```bash
# Smart stop (wait for connections to close)
pg_ctl -D /data/ivorysql stop

# Fast stop (interrupt connections)
pg_ctl -D /data/ivorysql stop -m fast

# Immediate stop (may cause data corruption)
pg_ctl -D /data/ivorysql stop -m immediate
```

### Reload Configuration

```bash
pg_ctl -D /data/ivorysql reload
# Or
SELECT pg_reload_conf();
```

## Initialization Modes

```bash
# Oracle compatible mode
initdb -D /data/ivorysql -m oracle

# PG mode
initdb -D /data/ivorysql -m pg

# Specify encoding
initdb -D /data/ivorysql -m oracle --encoding=UTF8 --lc-collate=zh_CN.UTF-8 --lc-ctype=zh_CN.UTF-8
```

## Workflow

When a user asks about installation and deployment:

1. Determine deployment method (source/package/containerized/cloud)
2. Determine compatibility mode requirements (Oracle/PG)
3. Provide complete deployment steps for the selected method
4. Configure key parameters
5. Verify deployment success

## Reference Documents

- [Installation Guide](references/installation.md) — Detailed Yum/RPM/Source compilation steps
- [Containerized Deployment](references/container-deployment.md) — Docker/Podman/Compose/K8s/Operator
- [Startup Parameters](references/startup-params.md) — Startup parameters, runtime modes
- [IvorySQL Cloud](references/cloud.md) — Cloud service usage
