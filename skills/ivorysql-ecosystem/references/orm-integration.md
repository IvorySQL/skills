---
title: ORM Framework Integration
description: Integration configuration of IvorySQL with mainstream ORM frameworks, including MyBatis, Hibernate, Spring Boot, SQLAlchemy, etc.
tags:
  - ecosystem
  - orm
  - integration
  - mybatis
  - hibernate
---

# ORM Framework Integration

IvorySQL is compatible with the PostgreSQL protocol, and mainstream ORM frameworks can connect directly via the PostgreSQL driver.

## Connection Parameters

| Parameter | PG Mode | Oracle Mode |
|------|---------|------------|
| JDBC URL | `jdbc:postgresql://host:5432/db` | `jdbc:postgresql://host:1521/db` |
| Driver Class | `org.postgresql.Driver` | `org.postgresql.Driver` |
| Port | 5432 | 1521 |
| Dialect | PostgreSQL | PostgreSQL (recommended) / Oracle-compatible |

## Java Frameworks

### MyBatis

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.2</version>
</dependency>
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.13</version>
</dependency>
```

```xml
<!-- mybatis-config.xml -->
<configuration>
    <environments default="ivorysql">
        <environment id="ivorysql">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="org.postgresql.Driver"/>
                <property name="url" value="jdbc:postgresql://localhost:1521/mydb"/>
                <property name="username" value="sysadmin"/>
                <property name="password" value="yourpassword"/>
                <property name="poolMaximumActiveConnections" value="20"/>
                <property name="poolMaximumIdleConnections" value="10"/>
            </dataSource>
        </environment>
    </environments>
</configuration>
```

```xml
<!-- Mapper XML (Oracle Compatible Mode) -->
<select id="selectByDate" resultType="User">
    SELECT * FROM users
    WHERE created_at BETWEEN TO_DATE(#{startDate}, 'YYYY-MM-DD')
        AND TO_DATE(#{endDate}, 'YYYY-MM-DD')
    ORDER BY created_at DESC
</select>

<select id="selectPage" resultType="User">
    SELECT * FROM users
    WHERE ROWNUM &lt;= #{limit}
    ORDER BY id
</select>
```

### Hibernate

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.2</version>
</dependency>
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>6.4.4.Final</version>
</dependency>
```

```xml
<!-- hibernate.cfg.xml -->
<hibernate-configuration>
    <session-factory>
        <property name="connection.driver_class">org.postgresql.Driver</property>
        <property name="connection.url">jdbc:postgresql://localhost:1521/mydb</property>
        <property name="connection.username">sysadmin</property>
        <property name="connection.password">yourpassword</property>
        <property name="dialect">org.hibernate.dialect.PostgreSQLDialect</property>
        <property name="show_sql">true</property>
        <property name="format_sql">true</property>
        <property name="hbm2ddl.auto">update</property>
        <property name="connection_pool_size">20</property>
    </session-factory>
</hibernate-configuration>
```

```java
// Java configuration
Configuration cfg = new Configuration()
    .setProperty("hibernate.connection.driver_class", "org.postgresql.Driver")
    .setProperty("hibernate.connection.url", "jdbc:postgresql://localhost:1521/mydb")
    .setProperty("hibernate.connection.username", "sysadmin")
    .setProperty("hibernate.connection.password", "yourpassword")
    .setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect")
    .setProperty("hibernate.hbm2ddl.auto", "update");
```

### Spring Boot

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:1521/mydb?currentSchema=public
    username: sysadmin
    password: yourpassword
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    show-sql: true
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        format_sql: true
        jdbc:
          batch_size: 50
        order_inserts: true
        order_updates: true
```

```java
// Entity Definition
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", length = 100, nullable = false)
    private String username;

    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // getters and setters
}
```

## Python Frameworks

### SQLAlchemy

```bash
pip install sqlalchemy psycopg2-binary
```

```python
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Connection configuration
DATABASE_URL = "postgresql://sysadmin:yourpassword@localhost:1521/mydb"

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=True
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Model definition
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(100), nullable=False)
    email = Column(String(200))
    created_at = Column(DateTime)

# Usage
session = SessionLocal()
users = session.query(User).filter(User.username.like('%admin%')).all()
session.close()
```

### Django

```bash
pip install django psycopg2-binary
```

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'mydb',
        'USER': 'sysadmin',
        'PASSWORD': 'yourpassword',
        'HOST': 'localhost',
        'PORT': '1521',
        'OPTIONS': {
            'connect_timeout': 10,
            'options': '-c search_path=public',
        },
        'CONN_MAX_AGE': 60,
        'ATOMIC_REQUESTS': True,
    }
}
```

```python
# models.py
from django.db import models

class User(models.Model):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['created_at']),
        ]
```

## Go Frameworks

### GORM

```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
```

```go
package main

import (
    "fmt"
    "time"

    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

type User struct {
    ID        uint      `gorm:"primaryKey"`
    Username  string    `gorm:"size:100;not null"`
    Email     string    `gorm:"size:200"`
    CreatedAt time.Time
}

func main() {
    dsn := "host=localhost port=1521 user=sysadmin password=yourpassword dbname=mydb sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })
    if err != nil {
        panic(err)
    }

    // Auto migration
    db.AutoMigrate(&User{})

    // CRUD operations
    db.Create(&User{Username: "alice", Email: "alice@example.com"})

    var user User
    db.First(&user, "username = ?", "alice")
    fmt.Println(user)
}
```

## Node.js Frameworks

### Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

```yaml
# prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @db.VarChar(100)
  email     String?  @db.VarChar(200)
  createdAt DateTime @default(now()) @map("created_at")

  @@map("users")
}
```

```bash
# .env
DATABASE_URL="postgresql://sysadmin:yourpassword@localhost:1521/mydb?schema=public"
```

```typescript
// Usage
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    where: { username: { contains: 'admin' } }
  })
  console.log(users)
}

main()
```

### TypeORM

```bash
npm install typeorm pg reflect-metadata
```

```typescript
// data-source.ts
import { DataSource } from 'typeorm'
import { User } from './entity/User'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 1521,
  username: 'sysadmin',
  password: 'yourpassword',
  database: 'mydb',
  synchronize: true,
  logging: true,
  entities: [User],
  poolSize: 20,
})
```

```typescript
// entity/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 100 })
  username: string

  @Column({ length: 200, nullable: true })
  email: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date
}
```

## .NET Frameworks

### Entity Framework Core

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

```csharp
// DbContext
public class AppDbContext : DbContext
{
    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=1521;Database=mydb;Username=sysadmin;Password=yourpassword",
            options => options.SetPostgresVersion(new Version(15, 0))
        );
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).HasMaxLength(100).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(200);
        });
    }
}

// Entity
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

```csharp
// Program.cs (ASP.NET Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("IvorySQL"))
);

// appsettings.json
{
  "ConnectionStrings": {
    "IvorySQL": "Host=localhost;Port=1521;Database=mydb;Username=sysadmin;Password=yourpassword"
  }
}
```

## Oracle Mode Special Configuration

When using Oracle compatibility mode, some ORM frameworks require additional configuration:

```yaml
# Spring Boot - Oracle mode search path
spring:
  datasource:
    url: jdbc:postgresql://localhost:1521/mydb?currentSchema=sys,public
    hikari:
      connection-init-sql: "SET ivorysql.compatible_mode = oracle"
```

```python
# SQLAlchemy - Oracle Mode
engine = create_engine(
    "postgresql://sysadmin:yourpassword@localhost:1521/mydb",
    connect_args={"options": "-c ivorysql.compatible_mode=oracle -c search_path=sys,public"}
)
```

```go
// GORM - Oracle Mode
dsn := "host=localhost port=1521 user=sysadmin password=yourpassword dbname=mydb sslmode=disable search_path=sys,public"
```

## Notes

1. **Driver Selection**: IvorySQL uses the PostgreSQL protocol, so all frameworks uniformly use the PostgreSQL driver.
2. **Dialect Configuration**: It is recommended to use the PostgreSQL Dialect; Oracle syntax is handled by IvorySQL server-side compatibility.
3. **Connection Pooling**: A connection pool must be configured in production environments to avoid frequent connection creation.
4. **Schema Search Path**: In Oracle mode, the `search_path` needs to be set to include `sys,ora,public`.
5. **Transaction Isolation**: IvorySQL defaults to the Read Committed isolation level, which is consistent with Oracle.
