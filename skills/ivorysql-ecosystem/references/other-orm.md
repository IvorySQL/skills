---
title: IvorySQL Additional ORM Integration
description: Django/GORM/Prisma/TypeORM/SQLAlchemy
tags: ivorysql, ecosystem, django, gorm, prisma, typeorm, sqlalchemy
---

# IvorySQL Additional ORM Integration

## Python - SQLAlchemy

```python
from sqlalchemy import create_engine, Column, Integer, String, Numeric
from sqlalchemy.orm import declarative_base, Session

engine = create_engine("postgresql+psycopg://ivorysql:secret@localhost/ivorysql")
Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    salary = Column(Numeric(10, 2))

with Session(engine) as session:
    employees = session.query(Employee).filter(Employee.salary > 5000).all()
```

## Python - Django

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

## Go - GORM

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)

dsn := "host=localhost user=ivorysql password=secret dbname=ivorysql port=5432 sslmode=disable"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

type Employee struct {
    ID     uint
    Name   string
    Salary float64
}

var employees []Employee
db.Where("salary > ?", 5000).Find(&employees)
```

## Node.js - Prisma

```prisma
datasource db {
    provider = "postgresql"
    url      = "postgresql://ivorysql:secret@localhost:5432/ivorysql"
}

model Employee {
    id        Int      @id @default SERIAL()
    name      String
    salary    Decimal  @db.Decimal(10, 2)
    @@map("employees")
}
```

## Node.js - TypeORM

```typescript
import { DataSource, Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("employees")
class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column("decimal", { precision: 10, scale: 2 })
    salary: number;
}

const dataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "ivorysql",
    password: "secret",
    database: "ivorysql",
    entities: [Employee],
    synchronize: true,
});
```

## C# - Entity Framework Core

```csharp
public class AppDbContext : DbContext {
    public DbSet<Employee> Employees { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options) {
        options.UseNpgsql("Host=localhost;Database=ivorysql;Username=ivorysql;Password=secret");
    }
}
```
