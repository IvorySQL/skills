---
title: IvorySQL Containerized Deployment
description: Complete guide to IvorySQL containerized deployment, covering Docker, Podman, Docker Compose, and Kubernetes deployment methods with full YAML configuration examples
tags:
  - ivorysql
  - deployment
  - docker
  - podman
  - kubernetes
  - container
  - docker-compose
---

# IvorySQL Containerized Deployment

## Overview

Containerized deployment is one of the mainstream deployment methods for IvorySQL, providing a fast, consistent, and reproducible deployment experience. This document introduces complete solutions for deploying IvorySQL using Docker, Podman, Docker Compose, and Kubernetes.

## Docker Deployment

### Pull Image

```bash
# IvorySQL official image
docker pull ivorysql/ivorysql:5.3

# Specific variants
docker pull ivorysql/ivorysql:5.3-oracle    # Oracle compatible mode
docker pull ivorysql/ivorysql:5.3-alpine    # Alpine minimal image

# View available tags
docker search ivorysql
```

### Basic Startup

```bash
# Basic startup
docker run -d \
    --name ivorysql \
    -e POSTGRES_USER=ivorysql \
    -e POSTGRES_PASSWORD=ivorysql \
    -e POSTGRES_DB=postgres \
    -p 5432:5432 \
    -p 1521:1521 \
    ivorysql/ivorysql:5.3

# With persistent storage
docker run -d \
    --name ivorysql \
    -e POSTGRES_USER=ivorysql \
    -e POSTGRES_PASSWORD=ivorysql \
    -e POSTGRES_DB=postgres \
    -p 5432:5432 \
    -p 1521:1521 \
    -v ivorysql_data:/var/lib/ivorysql/data \
    ivorysql/ivorysql:5.3
```

### Custom Configuration Startup

```bash
# Mount custom configuration
docker run -d \
    --name ivorysql \
    -e POSTGRES_USER=ivorysql \
    -e POSTGRES_PASSWORD=ivorysql \
    -p 5432:5432 \
    -p 1521:1521 \
    -v /path/to/postgresql.conf:/etc/ivorysql/postgresql.conf \
    -v ivorysql_data:/var/lib/ivorysql/data \
    ivorysql/ivorysql:5.3 \
    -c config_file=/etc/ivorysql/postgresql.conf
```

### Initialization Scripts

```bash
# Mount initialization SQL scripts
# .sql/.sh files under /docker-entrypoint-initdb.d/ are automatically executed on first container startup
docker run -d \
    --name ivorysql \
    -e POSTGRES_USER=ivorysql \
    -e POSTGRES_PASSWORD=ivorysql \
    -p 5432:5432 \
    -p 1521:1521 \
    -v /path/to/init-scripts:/docker-entrypoint-initdb.d \
    -v ivorysql_data:/var/lib/ivorysql/data \
    ivorysql/ivorysql:5.3
```

Initialization script example:

```sql
-- /path/to/init-scripts/01_create_database.sql
CREATE DATABASE app_db;
CREATE DATABASE test_db;

-- /path/to/init-scripts/02_create_extensions.sql
\c app_db
CREATE EXTENSION pgcrypto;
CREATE EXTENSION pgaudit;
```

### Environment Variables

| Variable | Description | Default |
|------|------|--------|
| POSTGRES_USER | Superuser name | ivorysql |
| POSTGRES_PASSWORD | Superuser password | (must be set) |
| POSTGRES_DB | Default database name | postgres |
| POSTGRES_INITDB_ARGS | Additional initdb arguments | |
| POSTGRES_INITDB_WALDIR | WAL directory | |
| PGDATA | Data directory | /var/lib/ivorysql/data |

## Podman Deployment

Podman is a Docker alternative that does not require a daemon and supports rootless mode.

### Basic Startup

```bash
# Rootless mode startup
podman run -d \
    --name ivorysql \
    -e POSTGRES_USER=ivorysql \
    -e POSTGRES_PASSWORD=ivorysql \
    -p 5432:5432 \
    -p 1521:1521 \
    -v ivorysql_data:/var/lib/ivorysql/data \
    ivorysql/ivorysql:5.3

# Generate systemd service file using podman generate systemd
podman generate systemd --name ivorysql > ~/.config/systemd/user/ivorysql.service
systemctl --user enable ivorysql.service
systemctl --user start ivorysql.service
```

### Podman Compose

```bash
# Install podman-compose
pip3 install podman-compose

# Use the same configuration as Docker Compose
podman-compose up -d
```

## Docker Compose Deployment

### Single Node Deployment

```yaml
# docker-compose.yml
version: '3.8'

services:
  ivorysql:
    image: ivorysql/ivorysql:5.3
    container_name: ivorysql
    restart: unless-stopped
    environment:
      POSTGRES_USER: ivorysql
      POSTGRES_PASSWORD: ivorysql_password
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
      - "1521:1521"
    volumes:
      - ivorysql_data:/var/lib/ivorysql/data
      - ./config/postgresql.conf:/etc/ivorysql/postgresql.conf
      - ./init-scripts:/docker-entrypoint-initdb.d
    command: >
      -c config_file=/etc/ivorysql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ivorysql"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ivorysql_net

volumes:
  ivorysql_data:

networks:
  ivorysql_net:
    driver: bridge
```

### Primary-Standby Replication Deployment

```yaml
# docker-compose-replication.yml
version: '3.8'

services:
  ivorysql-primary:
    image: ivorysql/ivorysql:5.3
    container_name: ivorysql-primary
    restart: unless-stopped
    environment:
      POSTGRES_USER: ivorysql
      POSTGRES_PASSWORD: ivorysql_password
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
      - "1521:1521"
    volumes:
      - primary_data:/var/lib/ivorysql/data
      - ./config/primary.conf:/etc/ivorysql/postgresql.conf
    command: >
      -c config_file=/etc/ivorysql/postgresql.conf
      -c wal_level=replica
      -c max_wal_senders=10
      -c hot_standby=on
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ivorysql"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ivorysql_net

  ivorysql-standby:
    image: ivorysql/ivorysql:5.3
    container_name: ivorysql-standby
    restart: unless-stopped
    environment:
      POSTGRES_USER: ivorysql
      POSTGRES_PASSWORD: ivorysql_password
      POSTGRES_DB: postgres
      PGUSER: replicator
    ports:
      - "5433:5432"
      - "1522:1521"
    volumes:
      - standby_data:/var/lib/ivorysql/data
    depends_on:
      ivorysql-primary:
        condition: service_healthy
    entrypoint: >
      bash -c "
        until pg_isready -h ivorysql-primary -U ivorysql; do sleep 1; done &&
        pg_basebackup -h ivorysql-primary -U replicator -D /var/lib/ivorysql/data -Fp -Xs -P -R &&
        postgres
      "
    networks:
      - ivorysql_net

volumes:
  primary_data:
  standby_data:

networks:
  ivorysql_net:
    driver: bridge
```

### Full Deployment with PgBouncer

```yaml
# docker-compose-full.yml
version: '3.8'

services:
  ivorysql:
    image: ivorysql/ivorysql:5.3
    container_name: ivorysql
    restart: unless-stopped
    environment:
      POSTGRES_USER: ivorysql
      POSTGRES_PASSWORD: ivorysql_password
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
      - "1521:1521"
    volumes:
      - ivorysql_data:/var/lib/ivorysql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ivorysql"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - ivorysql_net

  pgbouncer:
    image: edoburu/pgbouncer:1.21.0
    container_name: pgbouncer
    restart: unless-stopped
    environment:
      DB_HOST: ivorysql
      DB_PORT: 5432
      DB_USER: ivorysql
      DB_PASSWORD: ivorysql_password
      DB_NAME: postgres
      POOL_MODE: transaction
      MAX_CLIENT_CONN: 1000
      DEFAULT_POOL_SIZE: 25
      RESERVE_POOL_SIZE: 10
      RESERVE_POOL_TIMEOUT: 3
      SERVER_IDLE_TIMEOUT: 300
      AUTH_TYPE: scram-sha-256
    ports:
      - "6432:5432"
    depends_on:
      ivorysql:
        condition: service_healthy
    networks:
      - ivorysql_net

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin_password
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    depends_on:
      ivorysql:
        condition: service_healthy
    networks:
      - ivorysql_net

volumes:
  ivorysql_data:
  pgadmin_data:

networks:
  ivorysql_net:
    driver: bridge
```

## Kubernetes Deployment

### Single Instance Deployment

```yaml
# ivorysql-deployment.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ivorysql-config
data:
  postgresql.conf: |
    listen_addresses = '*'
    port = 5432
    ivorysql.port = 1521
    ivorysql.listen_mode = '*'
    ivorysql.enable_oracle_compatible = true
    shared_buffers = 256MB
    max_connections = 100
    wal_level = replica
    max_wal_senders = 10
---
apiVersion: v1
kind: Secret
metadata:
  name: ivorysql-secret
type: Opaque
stringData:
  POSTGRES_USER: ivorysql
  POSTGRES_PASSWORD: ivorysql_password
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ivorysql
  labels:
    app: ivorysql
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ivorysql
  template:
    metadata:
      labels:
        app: ivorysql
    spec:
      containers:
        - name: ivorysql
          image: ivorysql/ivorysql:5.3
          ports:
            - containerPort: 5432
              name: pg-port
            - containerPort: 1521
              name: oracle-port
          env:
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: ivorysql-secret
                  key: POSTGRES_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ivorysql-secret
                  key: POSTGRES_PASSWORD
            - name: POSTGRES_DB
              value: "postgres"
            - name: PGDATA
              value: "/var/lib/ivorysql/data"
          volumeMounts:
            - name: ivorysql-data
              mountPath: /var/lib/ivorysql/data
            - name: config
              mountPath: /etc/ivorysql/postgresql.conf
              subPath: postgresql.conf
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "2Gi"
              cpu: "2000m"
          livenessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - ivorysql
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            exec:
              command:
                - pg_isready
                - -U
                - ivorysql
            initialDelaySeconds: 5
            periodSeconds: 10
      volumes:
        - name: ivorysql-data
          persistentVolumeClaim:
            claimName: ivorysql-pvc
        - name: config
          configMap:
            name: ivorysql-config
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ivorysql-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
  storageClassName: standard
---
apiVersion: v1
kind: Service
metadata:
  name: ivorysql
spec:
  selector:
    app: ivorysql
  ports:
    - name: pg-port
      port: 5432
      targetPort: 5432
    - name: oracle-port
      port: 1521
      targetPort: 1521
  type: ClusterIP
```

### StatefulSet Deployment (Recommended)

```yaml
# ivorysql-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ivorysql
spec:
  serviceName: ivorysql
  replicas: 3
  selector:
    matchLabels:
      app: ivorysql
  template:
    metadata:
      labels:
        app: ivorysql
    spec:
      containers:
        - name: ivorysql
          image: ivorysql/ivorysql:5.3
          ports:
            - containerPort: 5432
            - containerPort: 1521
          env:
            - name: POSTGRES_USER
              value: "ivorysql"
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: ivorysql-secret
                  key: POSTGRES_PASSWORD
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          volumeMounts:
            - name: ivorysql-data
              mountPath: /var/lib/ivorysql/data
          resources:
            requests:
              memory: "1Gi"
              cpu: "1"
            limits:
              memory: "4Gi"
              cpu: "4"
  volumeClaimTemplates:
    - metadata:
        name: ivorysql-data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi
```

## Build Custom Image

```dockerfile
# Dockerfile
FROM ivorysql/ivorysql:5.3

# Install additional extensions
RUN yum install -y ivorysql-pgaudit ivorysql-pgbackrest && \
    yum clean all

# Copy custom configuration
COPY postgresql.conf /etc/ivorysql/postgresql.conf
COPY pg_hba.conf /etc/ivorysql/pg_hba.conf

# Copy initialization scripts
COPY init-scripts/ /docker-entrypoint-initdb.d/

# Set environment variables
ENV ivorysql.enable_oracle_compatible=true
ENV ivorysql.port=1521
```

```bash
# Build image
docker build -t my-ivorysql:5.3 .

# Push to private registry
docker tag my-ivorysql:5.3 registry.example.com/ivorysql:5.3
docker push registry.example.com/ivorysql:5.3
```

## Container Management

```bash
# View logs
docker logs -f ivorysql

# Enter container
docker exec -it ivorysql bash

# Execute SQL
docker exec -it ivorysql psql -U ivorysql -d postgres

# Backup
docker exec ivorysql pg_dump -U ivorysql postgres > backup.sql

# Restore
docker exec -i ivorysql psql -U ivorysql postgres < backup.sql

# Monitor
docker stats ivorysql
```
