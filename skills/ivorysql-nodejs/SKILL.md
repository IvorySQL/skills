---
name: IvorySQL Node.js Development
name_for_command: ivorysql-nodejs
description: |
  Complete IvorySQL Node.js development guide: node-postgres (pg) connection (Oracle port 1521),
  connection pool configuration, transaction control, CRUD, COPY batch import, Sequelize/Prisma ORM.
---

# IvorySQL Node.js Development

## Workflow

Trigger this skill when encountering the following issues:
- Node.js connects to IvorySQL
- pg module usage
- Sequelize / Prisma ORM
- COPY batch import
- Transaction control

**Sub-skill routing**:
- ORM integration → [orm-nodejs](references/orm-nodejs.md)

## Driver and Dependencies

```bash
npm install pg
```

## Connection Methods

```javascript
const { Pool } = require('pg');

// Connection pool
const pool = new Pool({
  host: 'localhost',
  port: 1521,
  database: 'ivorysql',
  user: 'ivorysql',
  password: 'secret',
  max: 20,  // Maximum connections
});

// Oracle compatibility mode
const poolOra = new Pool({
  host: 'localhost',
  port: 1521,
  database: 'ivorysql',
  user: 'ivorysql',
  password: 'secret',
  options: '-c ivorysql.compatible_mode=oracle',
});
```

## CRUD Operations

### Query

```javascript
// Single row
const { rows } = await pool.query('SELECT * FROM employees WHERE id = $1', [1]);

// Multiple rows
const { rows } = await pool.query('SELECT * FROM employees WHERE salary > $1', [5000]);
```

### Insert

```javascript
const { rows } = await pool.query(
  'INSERT INTO employees (name, salary) VALUES ($1, $2) RETURNING id',
  ['Zhang San', 8000]
);
console.log('New ID:', rows[0].id);
```

### Batch Insert

```javascript
const values = [['A', 8000], ['B', 9000], ['C', 7500]];
const query = 'INSERT INTO employees (name, salary) VALUES ($1, $2)';
await Promise.all(values.map(v => pool.query(query, v)));
```

## COPY Batch Import (Fastest)

```javascript
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');

const data = 'Zhang San,8000,IT\nLi Si,9000,HR\n';
const source = Readable.from([data]);

const client = await pool.connect();
try {
  await client.query('BEGIN');
  const stream = client.query(require('pg-copy-streams').from('COPY employees FROM STDIN WITH CSV'));
  await pipeline(source, stream);
  await client.query('COMMIT');
} finally {
  client.release();
}
```

## Transactions

```javascript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [100, 1]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [100, 2]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

## Sequelize ORM

```javascript
const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize('ivorysql', 'ivorysql', 'secret', {
  host: 'localhost', port: 1521, dialect: 'postgres'
});

const Employee = sequelize.define('Employee', {
  name: DataTypes.STRING,
  salary: DataTypes.DECIMAL,
});

const emps = await Employee.findAll({ where: { salary: { [Op.gt]: 5000 } } });
```

> For details: [orm-nodejs](references/orm-nodejs.md)

## Prisma ORM

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const emps = await prisma.employee.findMany({
  where: { salary: { gt: 5000 } },
});
```

> For details: [orm-nodejs](references/orm-nodejs.md)

## Error Handling

```javascript
try {
  await pool.query('INSERT ...');
} catch (e) {
  if (e.code === '23505') console.log('Unique constraint violation');
  if (e.code === '23503') console.log('Foreign key violation');
}
```

## Reference Documents

- [ORM Integration](references/orm-nodejs.md)
