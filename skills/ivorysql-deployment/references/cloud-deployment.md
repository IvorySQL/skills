---
title: IvorySQL Cloud Deployment Guide
description: IvorySQL Cloud v5 deployment and usage guide, covering cloud instance creation, management, network configuration, backup, and high availability
tags:
  - ivorysql
  - deployment
  - cloud
  - managed
  - dbaas
---

# IvorySQL Cloud Deployment Guide

## Overview

IvorySQL Cloud is the official fully-managed Database-as-a-Service (DBaaS) platform for IvorySQL, built on the IvorySQL v5 kernel, providing out-of-the-box Oracle-compatible database services without the burden of infrastructure operations and maintenance.

## Features

| Feature | Description |
|------|------|
| Fully Managed | Automatic backup, patching, monitoring |
| High Availability | Automatic failover |
| Oracle Compatible | Dual-port architecture, native Oracle syntax support |
| Elastic Scaling | Online CPU/memory/storage expansion |
| Security & Compliance | SSL encryption, VPC network isolation, audit logs |
| Monitoring & Alerting | Integrated Prometheus/Grafana |

## Quick Start

### 1. Register and Login

Access the IvorySQL Cloud console, register an account, and log in.

### 2. Create Instance

```bash
# Create instance using CLI (if supported)
ivorysql-cloud instance create \
    --name my-ivorysql \
    --plan standard \
    --cpu 4 \
    --memory 16GB \
    --storage 100GB \
    --region us-east-1 \
    --version 4.0 \
    --oracle-port-enabled true

# Or create via Web console
# 1. Click "Create Instance"
# 2. Select specifications
# 3. Configure network
# 4. Set admin password
# 5. Confirm creation
```

### 3. Connect to Instance

```bash
# Get connection information
ivorysql-cloud instance describe my-ivorysql

# PG port connection
psql -h my-ivorysql.cloud.ivorysql.org -p 5432 -U admin -d postgres

# Oracle port connection
psql -h my-ivorysql.cloud.ivorysql.org -p 1521 -U admin -d postgres

# JDBC connection (PG mode)
jdbc:postgresql://my-ivorysql.cloud.ivorysql.org:5432/postgres

# JDBC connection (Oracle mode)
jdbc:oracle:thin:@//my-ivorysql.cloud.ivorysql.org:1521/postgres
```

## Instance Specifications

### Standard Specifications

| Specification | CPU | Memory | Storage | Use Case |
|---------|-----|------|------|---------|
| micro | 1 Core | 2 GB | 20 GB | Development/testing |
| small | 2 Cores | 4 GB | 50 GB | Small applications |
| medium | 4 Cores | 16 GB | 100 GB | Medium applications |
| large | 8 Cores | 32 GB | 500 GB | Large applications |
| xlarge | 16 Cores | 64 GB | 1 TB | High-performance applications |
| 2xlarge | 32 Cores | 128 GB | 2 TB | Core business |

### High Availability Specifications

HA instances include primary-standby replication and automatic failover:

| Specification | Nodes | SLA |
|---------|--------|-----|
| ha-standard | 2 (1 primary, 1 standby) | 99.95% |
| ha-enterprise | 3 (1 primary, 2 standbys) | 99.99% |

## Network Configuration

### VPC Network

```bash
# Create VPC
ivorysql-cloud vpc create \
    --name my-vpc \
    --cidr 10.0.0.0/16 \
    --region us-east-1

# Create subnet
ivorysql-cloud subnet create \
    --name my-subnet \
    --vpc my-vpc \
    --cidr 10.0.1.0/24 \
    --zone us-east-1a

# Associate instance with VPC
ivorysql-cloud instance update my-ivorysql \
    --vpc my-vpc \
    --subnet my-subnet
```

### Whitelist Configuration

```bash
# Add IP whitelist
ivorysql-cloud security add-ip \
    --instance my-ivorysql \
    --ip 203.0.113.0/24 \
    --description "Office network"

# View whitelist
ivorysql-cloud security list-ips --instance my-ivorysql
```

## Backup and Recovery

### Automatic Backup

```bash
# Configure automatic backup
ivorysql-cloud backup configure \
    --instance my-ivorysql \
    --schedule "0 2 * * *" \
    --retention 30d \
    --enabled true
```

### Manual Backup

```bash
# Create manual backup
ivorysql-cloud backup create \
    --instance my-ivorysql \
    --name manual-backup-20250115

# View backup list
ivorysql-cloud backup list --instance my-ivorysql
```

### Recovery

```bash
# Restore from backup to new instance
ivorysql-cloud instance restore \
    --source my-ivorysql \
    --backup manual-backup-20250115 \
    --name my-ivorysql-restored

# Point-in-time recovery (PITR)
ivorysql-cloud instance restore \
    --source my-ivorysql \
    --pitr "2025-01-15T10:30:00Z" \
    --name my-ivorysql-pitr
```

## Monitoring and Alerting

### View Metrics

```bash
# View instance monitoring
ivorysql-cloud monitor metrics --instance my-ivorysql

# Key metrics
# - CPU usage
# - Memory usage
# - Disk usage
# - Connection count
# - QPS/TPS
# - Replication lag
```

### Configure Alerts

```bash
# Create alert rule
ivorysql-cloud alert create \
    --instance my-ivorysql \
    --metric cpu_usage \
    --threshold 80 \
    --operator greater-than \
    --duration 5m \
    --notification email:admin@example.com

# Common alert rules
ivorysql-cloud alert create --metric connection_count --threshold 80 --operator greater-than
ivorysql-cloud alert create --metric disk_usage --threshold 85 --operator greater-than
ivorysql-cloud alert create --metric replication_lag --threshold 30 --operator greater-than
```

## Scaling

```bash
# Vertical scaling (upgrade specifications)
ivorysql-cloud instance resize \
    --instance my-ivorysql \
    --plan large

# Storage expansion
ivorysql-cloud instance expand-storage \
    --instance my-ivorysql \
    --size 500GB
```

## Security

### SSL Configuration

IvorySQL Cloud enables SSL connections by default:

```bash
# Download CA certificate
ivorysql-cloud security download-ca --output ca.crt

# Connect using SSL
psql "host=my-ivorysql.cloud.ivorysql.org port=5432 \
      sslmode=verify-ca sslrootcert=ca.crt \
      user=admin dbname=postgres"
```

### Audit Logs

```bash
# Enable auditing
ivorysql-cloud audit enable --instance my-ivorysql

# View audit logs
ivorysql-cloud audit logs --instance my-ivorysql --since 24h
```

## Migration to IvorySQL Cloud

### Migrate from Self-Hosted IvorySQL

```bash
# 1. Create cloud instance
ivorysql-cloud instance create --name ivorysql-cloud --plan large

# 2. Export local data
pg_dump -h localhost -U ivorysql -Fc postgres > backup.dump

# 3. Import to cloud instance
pg_restore -h ivorysql-cloud.cloud.ivorysql.org -U admin -d postgres backup.dump

# 4. Use logical replication for real-time sync (reduce downtime)
# Create subscription on cloud instance
psql -h ivorysql-cloud.cloud.ivorysql.org -U admin -c "
CREATE SUBSCRIPTION migrate_sub
CONNECTION 'host=on-prem-host port=5432 dbname=postgres user=replicator password=xxx'
PUBLICATION migrate_pub;
"
```

### Migrate from Oracle

```bash
# 1. Use ora2pg for assessment and export
ora2pg -c ora2pg.conf --estimate_cost > migration_report.txt

# 2. Export data and schema
ora2pg -c ora2pg.conf --export > oracle_export.sql

# 3. Import to IvorySQL Cloud
psql -h ivorysql-cloud.cloud.ivorysql.org -p 1521 -U admin -d postgres -f oracle_export.sql
```

## Maintenance Windows

```bash
# View scheduled maintenance
ivorysql-cloud maintenance list --instance my-ivorysql

# Defer maintenance
ivorysql-cloud maintenance defer --instance my-ivorysql --id maint-123

# Execute maintenance immediately
ivorysql-cloud maintenance apply --instance my-ivorysql --id maint-123
```

## Best Practices

1. **Enable High Availability**: Always choose HA specifications for production environments
2. **Configure Automatic Backups**: Set daily backups with 30-day retention
3. **Use VPC Isolation**: Place instances in private networks
4. **Configure Alerts**: Set alerts for CPU, disk, and connections
5. **Use Connection Pooling**: Use PgBouncer to reduce direct connections
6. **Regularly Test Recovery**: Verify backup recoverability
