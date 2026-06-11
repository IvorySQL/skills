# IvorySQL Application Deployment Guide

## Deployment Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Nginx     │────▶│  Go API     │────▶│  IvorySQL   │
│   (Frontend)│     │  (Backend)  │     │  (Database) │
└─────────────┘     └─────────────┘     └─────────────┘
     :80                 :8080               :1521
```

## Method 1: Docker Compose Deployment

### docker-compose.yml

```yaml
version: '3.8'

services:
  # Frontend
  frontend:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./frontend/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - backend

  # Backend
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=ivorysql
      - DB_PORT=1521
      - DB_USER=ivorysql
      - DB_PASSWORD=secret
      - DB_NAME=ivorysql
    depends_on:
      - ivorysql

  # Database
  ivorysql:
    image: ivorysql/ivorysql:latest
    ports:
      - "5432:5432"
      - "1521:1521"
    volumes:
      - ivorysql_data:/var/lib/ivorysql/data
    environment:
      - POSTGRES_PASSWORD=secret

volumes:
  ivorysql_data:
```

### Start

```bash
docker-compose up -d
```

## Method 2: Manual Deployment

### 1. Deploy IvorySQL

#### Using Docker

```bash
docker run -d --name ivorysql \
    -p 5432:5432 \
    -p 1521:1521 \
    -v /data/ivorysql:/var/lib/ivorysql/data \
    -e POSTGRES_PASSWORD=secret \
    ivorysql/ivorysql:latest
```

#### Using Package Manager

```bash
# CentOS/RHEL
yum install -y ivorysql-server

# Initialize
initdb -D /var/lib/ivorysql -m oracle

# Start
pg_ctl -D /var/lib/ivorysql start
```

### 2. Deploy Backend

```bash
# Build
go build -o myapp cmd/api/main.go

# Create systemd service
cat > /etc/systemd/system/myapp.service << EOF
[Unit]
Description=MyApp API
After=network.target

[Service]
Type=simple
User=app
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/myapp
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start
systemctl daemon-reload
systemctl enable myapp
systemctl start myapp
```

### 3. Deploy Frontend

```bash
# Build
cd frontend
npm run build

# Deploy to Nginx
cp -r dist/* /var/www/html/
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name example.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Method 3: Kubernetes Deployment

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: backend
        image: myapp:latest
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          value: ivorysql-service
        - name: DB_PORT
          value: "1521"
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
```

### IvorySQL StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ivorysql
spec:
  serviceName: ivorysql
  replicas: 1
  template:
    spec:
      containers:
      - name: ivorysql
        image: ivorysql/ivorysql:latest
        ports:
        - containerPort: 5432
        - containerPort: 1521
        volumeMounts:
        - name: data
          mountPath: /var/lib/ivorysql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 100Gi
```

## Environment Variable Configuration

### Backend Configuration

| Variable | Description | Default |
|------|------|--------|
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 1521 |
| DB_USER | Database user | ivorysql |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | ivorysql |
| SERVER_PORT | Service port | 8080 |
| GIN_MODE | Gin mode | debug |

### Example

```bash
export DB_HOST=ivorysql.example.com
export DB_PORT=1521
export DB_USER=ivorysql
export DB_PASSWORD=secret
export DB_NAME=myapp
export GIN_MODE=release

./myapp
```

## Health Checks

### Backend Health Check

```go
r.GET("/health", func(c *gin.Context) {
    c.JSON(200, gin.H{
        "status": "ok",
        "db": checkDBConnection(),
    })
})
```

### Docker Health Check

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## Log Configuration

### Log Rotation

```yaml
# logrotate
/var/log/myapp/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
```

### Structured Logging

```go
import "github.com/sirupsen/logrus"

log := logrus.New()
log.SetFormatter(&logrus.JSONFormatter{})
log.SetOutput(file)
```

## Monitoring

### Prometheus Metrics

```go
import "github.com/prometheus/client_golang/prometheus/promhttp"

r.GET("/metrics", gin.WrapH(promhttp.Handler()))
```

### Grafana Dashboard

Monitor metrics:
- Requests/second
- Response time (P50/P95/P99)
- Error rate
- Database connections
- CPU/memory usage

## Backup Strategy

### Database Backup

```bash
# Full backup
pg_dump -h localhost -p 1521 -U ivorysql myapp > backup_$(date +%Y%m%d).sql

# Scheduled backup (crontab)
0 2 * * * pg_dump -h localhost -p 1521 -U ivorysql myapp | gzip > /backup/myapp_$(date +\%Y\%m\%d).sql.gz
```

### Restore

```bash
psql -h localhost -p 1521 -U ivorysql myapp < backup_20240101.sql
```

## Troubleshooting

### Common Issues

| Issue | Possible Cause | Solution |
|------|----------|----------|
| Connection timeout | Firewall/network | Check port and firewall rules |
| Authentication failed | Wrong password | Check pg_hba.conf |
| Connection pool exhausted | High concurrency | Increase connection pool size |
| Slow query | Missing index | Analyze EXPLAIN output |

### View Logs

```bash
# Docker
docker logs myapp

# systemd
journalctl -u myapp -f

# Application logs
tail -f /var/log/myapp/app.log
```
