---
name: IvorySQL Ecosystem Integration
name_for_command: ivorysql-ecosystem
description: |
  Complete IvorySQL ecosystem integration reference: MyBatis/Hibernate/Spring Boot (Java),
  SQLAlchemy/Django/Flask (Python), GORM (Go), Entity Framework (C#),
  Prisma/Sequelize/TypeORM (Node.js), pgvector (PostGIS/pg_cron and other extensions).
---

# IvorySQL Ecosystem Integration

IvorySQL inherits the complete PostgreSQL ecosystem; all PG-compatible ORMs and tools can be used directly.

## Workflow

Trigger this skill when encountering the following issues:
- ORM integration (MyBatis/Hibernate/SQLAlchemy/Django, etc.)
- Extension usage (pgvector/PostGIS/pg_cron, etc.)
- Toolchain configuration (DBeaver/pgAdmin, etc.)

**Sub-skill routing**:
- Java development → `ivorysql-jdbc`
- Python development → `ivorysql-python`
- Go development → `ivorysql-go`
- Node.js development → `ivorysql-nodejs`

## Java Ecosystem

### MyBatis

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>

<!-- application.yml -->
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ivorysql
    username: ivorysql
    password: secret
    driver-class-name: org.postgresql.Driver
```

### Hibernate / Spring Boot JPA

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ivorysql
    username: ivorysql
    password: secret
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
```

> For details: [java-orm](references/java-orm.md)

## Python Ecosystem

### SQLAlchemy

```python
from sqlalchemy import create_engine
engine = create_engine("postgresql+psycopg://ivorysql:secret@localhost/ivorysql")
```

### Django

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ivorysql',
        'USER': 'ivorysql',
        'PASSWORD': 'secret',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### FastAPI + SQLAlchemy

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql+psycopg://ivorysql:secret@localhost/ivorysql"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## Go Ecosystem

### GORM

```go
import "gorm.io/driver/postgres"

dsn := "host=localhost user=ivorysql password=secret dbname=ivorysql port=5432"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
```

## Node.js Ecosystem

### Prisma

```prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}
```

### TypeORM

```typescript
import { DataSource } from "typeorm";
const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "ivorysql",
    password: "secret",
    database: "ivorysql",
});
```

> For details: [other-orm](references/other-orm.md)

## Extension Ecosystem

| Extension | Purpose | Installation |
|------|------|------|
| PostGIS | Spatial data | CREATE EXTENSION postgis |
| pgvector | Vector search (AI/ML) | CREATE EXTENSION vector |
| pg_cron | Scheduled tasks | CREATE EXTENSION pg_cron |
| pgAudit | Audit logging | CREATE EXTENSION pgaudit |
| PGroonga | Full-text search | CREATE EXTENSION pgroonga |
| pgRouting | Path analysis | CREATE EXTENSION pgrouting |
| pg_hint_plan | Execution plan hints | CREATE EXTENSION pg_hint_plan |
| pg_stat_monitor | Performance monitoring | CREATE EXTENSION pg_stat_monitor |
| system_stats | System statistics | CREATE EXTENSION system_stats |
| age | Graph database | CREATE EXTENSION age |

## Reference Documents

- [Java ORM Integration](references/java-orm.md) — MyBatis/Hibernate/Spring Boot
- [Other ORM Integration](references/other-orm.md) — Django/GORM/Prisma/TypeORM
