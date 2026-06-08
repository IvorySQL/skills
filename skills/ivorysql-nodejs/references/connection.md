---
title: IvorySQL Node.js Connection Management
description: node-postgres connection, connection pool, SSL
tags: ivorysql, nodejs, connection, pg, pool, ssl
---

# IvorySQL Node.js Connection Management

## Connection Configuration

```javascript
const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'ivorysql',
    user: 'ivorysql',
    password: 'secret',
    // SSL
    ssl: { rejectUnauthorized: false },
});

await client.connect();
```

## Connection String

```javascript
const client = new Client(
    'postgres://ivorysql:secret@localhost:5432/ivorysql?sslmode=disable'
);
```

## Connection Pool

```javascript
const { Pool } = require('pg');

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ivorysql',
    user: 'ivorysql',
    password: 'secret',
    max: 20,                    // Maximum connections
    idleTimeoutMillis: 30000,   // Idle timeout
    connectionTimeoutMillis: 2000, // Connection timeout
});

// Acquire a connection from the pool
const client = await pool.connect();
try {
    const result = await client.query('SELECT NOW()');
} finally {
    client.release();
}

// Or use pool.query directly (auto acquire/release connection)
const result = await pool.query('SELECT NOW()');
```
