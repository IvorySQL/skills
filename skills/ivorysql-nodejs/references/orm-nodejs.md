# IvorySQL Node.js ORM Integration

## Sequelize ORM

### Installation

```bash
npm install sequelize pg
```

### Connection

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('ivorysql', 'ivorysql', 'secret', {
  host: 'localhost',
  port: 1521,
  dialect: 'postgres',
});
```

### Model Definition

```javascript
const { DataTypes } = require('sequelize');

const Employee = sequelize.define('Employee', {
  name: { type: DataTypes.STRING(100), allowNull: false },
  salary: { type: DataTypes.DECIMAL(10, 2) },
  department: { type: DataTypes.STRING(50) },
});
```

### CRUD

```javascript
// Query
const emps = await Employee.findAll({
  where: { salary: { [Op.gt]: 5000 } },
  order: [['salary', 'DESC']],
  limit: 10,
});

// Create
const emp = await Employee.create({ name: 'Zhang San', salary: 8000, department: 'IT' });

// Update
await Employee.update({ salary: 9000 }, { where: { id: 1 } });

// Delete
await Employee.destroy({ where: { id: 1 } });
```

## Prisma ORM

### Installation

```bash
npm install prisma @prisma/client
npx prisma init
```

### schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://ivorysql:secret@localhost:1521/ivorysql"
}

generator client {
  provider = "prisma-client-js"
}

model Employee {
  id         Int      @id @default(autoincrement())
  name       String
  salary     Decimal  @db.Decimal(10, 2)
  department String?
  createdAt  DateTime @default(now())
}
```

### CRUD

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Query
const emps = await prisma.employee.findMany({
  where: { salary: { gt: 5000 } },
  orderBy: { salary: 'desc' },
});

// Create
const emp = await prisma.employee.create({
  data: { name: 'Zhang San', salary: 8000, department: 'IT' },
});

// Update
await prisma.employee.update({
  where: { id: 1 },
  data: { salary: 9000 },
});

// Delete
await prisma.employee.delete({ where: { id: 1 } });
```

## Transactions

### Sequelize

```javascript
const tx = await sequelize.transaction();
try {
  await Employee.create({ name: 'A' }, { transaction: tx });
  await Employee.create({ name: 'B' }, { transaction: tx });
  await tx.commit();
} catch (e) {
  await tx.rollback();
}
```

### Prisma

```javascript
await prisma.$transaction([
  prisma.employee.create({ data: { name: 'A' } }),
  prisma.employee.create({ data: { name: 'B' } }),
]);
```
