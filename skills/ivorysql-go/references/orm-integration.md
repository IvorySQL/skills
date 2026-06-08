---
title: Go ORM Integration
description: GORM/Ent integration
tags: ivorysql, go, orm, gorm, ent
---

# Go ORM Integration

## GORM

```go
import (
    "gorm.io/gorm"
    "gorm.io/driver/postgres"
)

dsn := "host=localhost port=5432 dbname=ivorysql user=ivorysql password=password"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

type Employee struct {
    ID     uint    `gorm:"primaryKey"`
    Name   string
    Dept   string
    Salary float64
}

var emp Employee
db.First(&emp, 1)
db.Where("dept = ?", "IT").Find(&emps)
```
