---
name: IvorySQL Client Tools
name_for_command: ivorysql-tools
description: |
  IvorySQL client tools reference: psql command-line tool (including \parser command), pgAdmin graphical management,
  DBeaver universal database client, IvorySQL Cloud management platform.
---

# IvorySQL Client Tools

## Workflow

Trigger this skill when encountering the following issues:
- psql command-line usage
- pgAdmin/DBeaver configuration
- IvorySQL Cloud management platform
- SQL execution and script running

**Sub-skill routing**:
- SQL syntax → `ivorysql-sql`
- Configuration reference → `ivorysql-config`

IvorySQL inherits the PostgreSQL client tool system with enhancements.

## psql Command-Line Tool

> For details: [psql](references/psql.md)

### Basic Usage

```bash
# Connect to IvorySQL
psql -h localhost -p 5432 -U ivorysql -d ivorysql

# Connect to Oracle-compatible port
psql -h localhost -p 1521 -U ivorysql -d ivorysql
```

### IvorySQL Enhanced Commands

```sql
-- Switch parser (IvorySQL-specific)
\parser

-- View current compatibility mode
SHOW ivorysql.compatible_mode;

-- Switch compatibility mode
SET ivorysql.compatible_mode TO oracle;
SET ivorysql.compatible_mode TO pg;
```

### Common Meta-Commands

| Command | Description |
|------|------|
| \l | List databases |
| \dt | List tables |
| \d table | View table structure |
| \du | List roles |
| \df | List functions |
| \dx | List extensions |
| \dn | List schemas |
| \dp | View permissions |
| \di | List indexes |
| \dv | List views |
| \timing | Show execution time |
| \parser | Switch parser (IvorySQL) |
| \q | Quit |

## pgAdmin

pgAdmin is the official PostgreSQL graphical management tool, fully compatible with IvorySQL.

### Connection Configuration

1. Add new server
2. Host: localhost
3. Port: 5432 (PG) / 1521 (Oracle)
4. Database: ivorysql
5. Username: ivorysql

## DBeaver

DBeaver is a universal database client that supports IvorySQL.

### Connection Configuration

1. New connection → PostgreSQL
2. Host: localhost
3. Port: 5432
4. Database: ivorysql
5. Username: ivorysql
6. Driver: PostgreSQL JDBC driver (auto-download)

> **Note**: Select PostgreSQL connection type in DBeaver to connect to IvorySQL.

## Reference Documents

- [psql Command-Line](references/psql.md) — psql usage guide, \parser command
- [Graphical Tools](references/gui-tools.md) — pgAdmin/DBeaver/IvorySQL Cloud
