---
title: IvorySQL Operator Deployment Guide
description: IvorySQL Operator v5 usage guide, covering CRD definitions, cluster creation and management, high availability configuration, backup recovery, and monitoring
tags:
  - ivorysql
  - deployment
  - operator
  - kubernetes
  - crd
  - ha
---

# IvorySQL Operator Deployment Guide

## Overview

IvorySQL Operator is IvorySQL's Kubernetes-native operations tool, built on CloudNativePG (CNPG), providing complete lifecycle management capabilities including automated deployment, high availability management, backup recovery, and monitoring.

## Prerequisites

- Kubernetes cluster 1.27+
- kubectl command-line tool
- helm 3.0+
- StorageClass configured (supporting PVC)

## Install Operator

### Helm Installation

```bash
# Add Helm repository
helm repo add ivorysql-operator https://ivorysql.github.io/ivorysql-operator
helm repo update

# Install Operator
helm install ivorysql-operator ivorysql-operator/ivorysql-operator \
    --namespace ivorysql-system \
    --create-namespace \
    --set monitoring.enabled=true

# Verify installation
kubectl get pods -n ivorysql-system
kubectl get crd | grep ivorysql
```

### YAML Installation

```bash
# Download manifest
kubectl apply -f https://github.com/IvorySQL/ivorysql-operator/releases/download/v5.0/ivorysql-operator.yaml

# Verify
kubectl get deployment -n ivorysql-system
kubectl wait --for=condition=Available deployment/ivorysql-operator -n ivorysql-system --timeout=120s
```

## CRD Definitions

### IvorySQLCluster

Core CRD that defines IvorySQL cluster specifications:

```yaml
apiVersion: ivorysql.ivorysql.org/v1
kind: IvorySQLCluster
metadata:
  name: ivorysql-cluster
  namespace: ivorysql
spec:
  # Image configuration
  imageName: ivorysql/ivorysql:latest

  # Instance count
  instances: 3

  # Oracle compatible port configuration
  oraclePort:
    enabled: true
    port: 1521

  # Superuser configuration
  superuser:
    username: ivorysql
    passwordSecret:
      name: ivorysql-superuser-secret

  # Application user configuration
  appUser:
    username: app_user
    passwordSecret:
      name: ivorysql-app-secret

  # Database configuration
  databases:
    - name: app_db
      owner: app_user

  # Storage configuration
  storage:
    size: 50Gi
    storageClass: standard

  # WAL storage
  walStorage:
    size: 10Gi
    storageClass: standard

  # Resource limits
  resources:
    requests:
      memory: "1Gi"
      cpu: "1"
    limits:
      memory: "4Gi"
      cpu: "4"

  # PostgreSQL parameters
  parameters:
    shared_buffers: "1GB"
    max_connections: "200"
    ivorysql.enable_oracle_compatible: "true"
    ivorysql.port: "1521"
    ivorysql.listen_mode: "*"
    wal_level: "replica"
    max_wal_senders: "10"
    hot_standby: "on"

  # High availability configuration
  highAvailability:
    enabled: true
    syncReplica: true

  # Backup configuration
  backup:
    enabled: true
    destinationPath: "s3://ivorysql-backups"
    s3Credentials:
      accessKeyId:
        name: aws-creds
        key: ACCESS_KEY_ID
      secretAccessKey:
        name: aws-creds
        key: SECRET_ACCESS_KEY
    schedule:
      - name: daily
        schedule: "0 2 * * *"
        backupOwnerReference: cluster
    retentionPolicy: "30d"

  # Monitoring configuration
  monitoring:
    enabled: true
    podMonitorEnabled: true

  # Node affinity
  affinity:
    podAntiAffinityType: required
    topologyKey: topology.kubernetes.io/zone

  # Rolling update strategy
  rollingUpdate:
    maxUnavailable: 1
```

### Secret Configuration

```yaml
# Superuser secret
apiVersion: v1
kind: Secret
metadata:
  name: ivorysql-superuser-secret
  namespace: ivorysql
type: Opaque
stringData:
  username: ivorysql
  password: SuperSecurePassword123!
---
# Application user secret
apiVersion: v1
kind: Secret
metadata:
  name: ivorysql-app-secret
  namespace: ivorysql
type: Opaque
stringData:
  username: app_user
  password: AppUserPassword456!
```

## Cluster Management

### Create Cluster

```bash
# Apply cluster definition
kubectl apply -f ivorysql-cluster.yaml

# Check cluster status
kubectl get ivorysqlcluster -n ivorysql
kubectl describe ivorysqlcluster ivorysql-cluster -n ivorysql

# Check Pod status
kubectl get pods -n ivorysql -l ivorysql.ivorysql.org/cluster=ivorysql-cluster

# Check events
kubectl get events -n ivorysql --sort-by='.lastTimestamp'
```

### Connect to Cluster

```bash
# Get connection information
kubectl get ivorysqlcluster ivorysql-cluster -n ivorysql -o jsonpath='{.status.connection}'

# Port forwarding
kubectl port-forward -n ivorysql svc/ivorysql-cluster-rw 5432:5432 &
kubectl port-forward -n ivorysql svc/ivorysql-cluster-rw 1521:1521 &

# Connect via psql
psql -h localhost -p 5432 -U ivorysql -d postgres
psql -h localhost -p 1521 -U ivorysql -d postgres

# Get connection string
kubectl get secret ivorysql-cluster-superuser -n ivorysql \
    -o jsonpath='{.data.uri}' | base64 -d
```

### Scale Up/Down

```bash
# Scale to 5 instances
kubectl patch ivorysqlcluster ivorysql-cluster -n ivorysql \
    -p '{"spec":{"instances":5}}' --type merge

# Scale to 3 instances
kubectl patch ivorysqlcluster ivorysql-cluster -n ivorysql \
    -p '{"spec":{"instances":3}}' --type merge

# Check scaling progress
kubectl get pods -n ivorysql -w
```

### Version Upgrade

```bash
# Rolling upgrade image version
kubectl patch ivorysqlcluster ivorysql-cluster -n ivorysql \
    -p '{"spec":{"imageName":"ivorysql/ivorysql:latest"}}' --type merge

# Check upgrade progress
kubectl rollout status statefulset ivorysql-cluster -n ivorysql
```

### Parameter Modification

```bash
# Modify database parameters
kubectl patch ivorysqlcluster ivorysql-cluster -n ivorysql \
    --type merge -p '{
        "spec": {
            "parameters": {
                "shared_buffers": "2GB",
                "work_mem": "32MB"
            }
        }
    }'

# Parameter changes requiring restart
kubectl annotate ivorysqlcluster ivorysql-cluster -n ivorysql \
    ivorysql.ivorysql.org/restart=true
```

## High Availability Configuration

### Synchronous Replication

```yaml
spec:
  highAvailability:
    enabled: true
    syncReplica: true
    syncReplicaCount: 1
```

### Automatic Failover

Operator automatically detects primary node failures and executes failover:

```bash
# Check current primary
kubectl get ivorysqlcluster ivorysql-cluster -n ivorysql \
    -o jsonpath='{.status.currentPrimary}'

# Manually trigger failover
kubectl annotate ivorysqlcluster ivorysql-cluster -n ivorysql \
    ivorysql.ivorysql.org/failover=true

# Specify standby to promote
kubectl annotate ivorysqlcluster ivorysql-cluster -n ivorysql \
    ivorysql.ivorysql.org/promote-pod=ivorysql-cluster-2
```

### Topology Distribution

```yaml
spec:
  affinity:
    podAntiAffinityType: required
    topologyKey: topology.kubernetes.io/zone
    nodeSelector:
      node-role.kubernetes.io/database: "true"
    tolerations:
      - key: "dedicated"
        operator: "Equal"
        value: "database"
        effect: "NoSchedule"
```

## Backup Recovery

### Manual Backup

```bash
# Create on-demand backup
kubectl apply -f - <<EOF
apiVersion: ivorysql.ivorysql.org/v1
kind: IvorySQLBackup
metadata:
  name: manual-backup
  namespace: ivorysql
spec:
  cluster:
    name: ivorysql-cluster
EOF

# Check backup status
kubectl get ivorysqlbackup -n ivorysql
kubectl describe ivorysqlbackup manual-backup -n ivorysql
```

### Scheduled Backup

```yaml
spec:
  backup:
    enabled: true
    destinationPath: "s3://ivorysql-backups"
    s3Credentials:
      accessKeyId:
        name: aws-creds
        key: ACCESS_KEY_ID
      secretAccessKey:
        name: aws-creds
        key: SECRET_ACCESS_KEY
      region: us-east-1
    schedule:
      - name: daily-full
        schedule: "0 2 * * *"
        backupOwnerReference: cluster
      - name: weekly-full
        schedule: "0 3 * * 0"
        backupOwnerReference: cluster
    retentionPolicy: "30d"
```

### Restore Cluster

```yaml
apiVersion: ivorysql.ivorysql.org/v1
kind: IvorySQLCluster
metadata:
  name: ivorysql-restored
  namespace: ivorysql
spec:
  imageName: ivorysql/ivorysql:latest
  instances: 3

  # Restore from backup
  bootstrap:
    recovery:
      backup:
        name: manual-backup
      # Or specify point-in-time recovery
      recoveryTarget:
        targetTime: "2025-01-15 10:00:00+00"
        targetAction: "promote"

  storage:
    size: 50Gi
    storageClass: standard
```

```bash
# Create restored cluster
kubectl apply -f ivorysql-restored.yaml

# Verify recovery
kubectl get ivorysqlcluster ivorysql-restored -n ivorysql
```

## Monitoring

### Prometheus Integration

```yaml
spec:
  monitoring:
    enabled: true
    podMonitorEnabled: true
    customQueriesConfigMap:
      - name: ivorysql-queries
        key: queries.yaml
```

### Grafana Dashboard

Import Grafana dashboards provided by IvorySQL/CNPG community to monitor key metrics:

- Database connection count
- Transaction throughput
- Replication lag
- Buffer cache hit ratio
- Lock waits
- Table bloat

## Troubleshooting

```bash
# Check cluster events
kubectl describe ivorysqlcluster ivorysql-cluster -n ivorysql

# Check Pod logs
kubectl logs -n ivorysql ivorysql-cluster-1 -c ivorysql

# Enter container for debugging
kubectl exec -it -n ivorysql ivorysql-cluster-1 -- bash

# Check database status
kubectl exec -it -n ivorysql ivorysql-cluster-1 -- \
    psql -U ivorysql -c "SELECT * FROM pg_stat_replication;"

# Check Operator logs
kubectl logs -n ivorysql-system deployment/ivorysql-operator
```

### Common Issues

| Issue | Troubleshooting |
|------|---------|
| Pod startup failure | `kubectl describe pod <pod-name>` |
| PVC binding failure | `kubectl get pvc`, check StorageClass |
| Replication interrupted | Check wal_sender in `pg_stat_replication` |
| Backup failure | Check S3 credentials and permissions |
| Failover not triggered | Check Operator logs and health checks |
