# IvorySQL Skills

IvorySQL Skills — Empowering AI assistants to become IvorySQL database experts.

## Installation

### One-click install via npx

```bash
npx skills add IvorySQL/skills
```

### Install via Git clone

```bash
git clone https://github.com/IvorySQL/skills.git <target-directory>
```

### Direct download

Download the skills package archive and extract it to the OpenClaw skills directory.

## Directory Structure

```
skills/
├── SKILL.md                      # Package-level entry point (routing center)
├── README.md                     # Documentation
│
├── ivorysql/                    # Primary skill (product overview)
│   └── references/              # Reference documentation
├── ivorysql-app-builder/        # End-to-end application development
│   └── references/              # Reference documentation
├── ivorysql-architecture/        # Architecture design
│   └── references/              # Reference documentation
...
```

## Overview

This skills package provides AI assistants with professional expertise and development guidance for the IvorySQL database. IvorySQL is an open-source relational database built on the PostgreSQL kernel with Oracle compatibility.

This project originated from [ivorysql-skills](https://mp.weixin.qq.com/s/t27mnhLrt_EXB8BVnYIhpQ), a personal project by IvorySQL contributor Shawn Yan, who has also made many other contributions to the community. Special thanks to Shawn Yan!

## Skills Catalog (22 skills)

### Core Skills

| Skill | Description |
|-------|-------------|
| `ivorysql` | Primary skill entry point, product overview |
| `ivorysql-deployment` | Installation & deployment (Docker/K8s/source) |
| `ivorysql-architecture` | Architecture design (dual parser/dual port) |
| `ivorysql-config` | System configuration (GUC/parameters) |
| `ivorysql-security` | Security configuration (privileges/auditing/TDE) |
| `ivorysql-ha` | High availability (backup/replication/monitoring) |

### Development Skills

| Skill | Description |
|-------|-------------|
| `ivorysql-app-builder` | End-to-end application development |
| `ivorysql-jdbc` | Java JDBC development |
| `ivorysql-python` | Python development (psycopg/SQLAlchemy) |
| `ivorysql-go` | Go development (pgx/GORM) |
| `ivorysql-csharp` | C#/.NET development (Dapper/EF Core) |
| `ivorysql-nodejs` | Node.js development (pg/Sequelize/Prisma) |
| `ivorysql-c` | C language development (libpq/ECPG) |
| `ivorysql-odbc` | Cross-platform ODBC development |

### Feature Skills

| Skill | Description |
|-------|-------------|
| `ivorysql-sql` | SQL syntax (DDL/DML/queries) |
| `ivorysql-functions` | Built-in functions (string/date/aggregate) |
| `ivorysql-plisql` | PL/iSQL stored procedures |
| `ivorysql-oracle-compat` | Oracle compatibility features (21 items) |
| `ivorysql-migration` | Data migration (Oracle/MySQL → IvorySQL) |

### Auxiliary Skills

| Skill | Description |
|-------|-------------|
| `ivorysql-faq` | Frequently asked questions |
| `ivorysql-ecosystem` | Ecosystem integration |
| `ivorysql-tools` | Client tools |

## IvorySQL Key Features

- **Dual Port**: 5432 (PG mode) + 1521 (Oracle mode)
- **Dual Parser**: Oracle syntax + PostgreSQL syntax
- **Oracle Compatible**: 21 compatibility features
- **PG Kernel**: 100% compatible with the PostgreSQL ecosystem

## License

Apache 2.0

## Related Links

- [IvorySQL Official Website](https://ivorysql.org)
- [IvorySQL GitHub](https://github.com/IvorySQL/IvorySQL)
