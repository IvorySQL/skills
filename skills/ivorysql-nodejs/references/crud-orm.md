---
title: IvorySQL Node.js CRUD and ORM
description: Query, batch operations, Prisma/Sequelize ORM
tags: ivorysql, nodejs, crud, prisma, sequelize
---

# IvorySQL Node.js CRUD and ORM

## Basic CRUD

```javascript
// Query
const { rows } = await pool.query('SELECT * FROM employees WHERE salary > $1', [5000]);

// Insert
await pool.query('INSERT INTO employees (name, salary) VALUES ($1, $2)', ['Zhang San', 8000]);

// Update
await pool.query('UPDATE employees SET salary = $1 WHERE id = $2', [9000, 1]);

// Delete
await pool.query('DELETE FROM employees WHERE id = $1', [1]);
```

## Prisma ORM

```bash
npm install prisma @prisma/client
npx prisma init
```

```prisma
// schema.prisma
datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
}

generator client {
    provider = "prisma-client-js"
}

model Employee {
    id        Int      @id @default SERIAL()
    name      String
    salary    Decimal  @db.Decimal(10, 2)
    hireDate  DateTime @default(now()) @map("hire_date")
    @@map("employees")
}
```

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Query
const employees = await prisma.employee.findMany({
    where: { salary: { gt: 5000 } },
});

// Insert
await prisma.employee.create({
    data: { name: 'Zhang San', salary: 8000 },
});
```

## Sequelize ORM

```javascript
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('ivorysql', 'ivorysql', 'secret', {
    host: 'localhost',
    dialect: 'postgres',
});

const Employee = sequelize.define('Employee', {
    name: DataTypes.STRING,
    salary: DataTypes.DECIMAL(10, 2),
}, { tableName: 'employees', timestamps: false });

// Query
const employees = await Employee.findAll({ where: { salary: { [Op.gt]: 5000 } } });

// Insert
await Employee.create({ name: 'Zhang San', salary: 8000 });
```
