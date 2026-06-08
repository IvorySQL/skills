---
title: Node.js Driver Installation and Connection
description: node-postgres installation, connection pool configuration
tags: ivorysql, nodejs, installation, connection, pg
---

# Node.js Driver Installation and Connection

```bash
npm install pg
```

```javascript
const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost', port: 5432,
  database: 'ivorysql', user: 'ivorysql', password: 'password',
  max: 20, idleTimeoutMillis: 30000,
});
```
