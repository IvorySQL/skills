---
name: IvorySQL Kernel Architecture Design
name_for_command: ivorysql-architecture
description: |
  IvorySQL kernel architecture design details: dual parser architecture principles,
  GUC compatibility framework design, dual-mode switching principles, initdb process,
  Oracle compatibility feature implementation principles, developer contribution guide.
  Intended for kernel developers and technical decision-makers.
---

# IvorySQL Kernel Architecture Design

IvorySQL adds an Oracle compatibility layer on top of the PostgreSQL kernel. Core technologies include dual parsers, GUC framework, and dual-mode design.

## Workflow

Trigger this skill when dealing with the following topics:
- IvorySQL architecture principles (dual parser/dual port)
- GUC compatibility framework design
- Oracle compatibility feature implementation principles
- Kernel developer contribution guide

**Sub-skill routing**:
- Installation and deployment → `ivorysql-deployment`
- Oracle compatibility features → `ivorysql-oracle-compat`
- High availability → `ivorysql-ha`

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Client Connection                │
├──────────────────┬──────────────────────────────┤
│  Oracle Port(1521)│     PG Port(5432)            │
├──────────────────┴──────────────────────────────┤
│            Session Management & GUC Framework     │
├──────────────────┬──────────────────────────────┤
│  Oracle Parser   │    PG Parser                  │
├──────────────────┴──────────────────────────────┤
│              Query Optimizer (PG CBO)             │
├─────────────────────────────────────────────────┤
│              Execution Engine                     │
├─────────────────────────────────────────────────┤
│           ivorysql_ora Compatibility Plugin        │
├─────────────────────────────────────────────────┤
│              Storage Engine                       │
└─────────────────────────────────────────────────┘
```

## Dual Parser Architecture

> See details: [dual-parser](references/dual-parser.md)

### Design Principles

IvorySQL adds a second Oracle-compatible parser (modified based on PG's parser) into the PG kernel. Both parsers share the same query optimizer and execution engine.

### Key Implementation

- **Parser selection**: The parser is selected based on the connection port or GUC parameter.
- **Syntax extension**: Oracle Parser supports PL/SQL, DUAL, (+) outer join, and other Oracle-specific syntax.
- **AST compatibility**: Both parsers generate ASTs that can be processed by the same optimizer.

## GUC Compatibility Framework

> See details: [guc-framework](references/guc-framework.md)

### Design Principles

Extends PG's GUC framework by adding compatibility parameters such as `ivorysql.compatible_mode` to control runtime behavior.

### Key Parameters

| Parameter | Description | Impact |
|-----------|-------------|--------|
| ivorysql.compatible_mode | Compatibility mode | Parser selection, function visibility, type mapping |
| ivorysql.port | Oracle port | Independent listening port |

## Dual-Mode Design

> See details: [dual-mode-design](references/dual-mode-design.md)

### initdb Mode Selection

- `-m oracle`: Installs the ivorysql_ora plugin, defaults to Oracle parser.
- `-m pg`: Does not install ivorysql_ora, defaults to PG parser.

### Runtime Switching

```sql
SET ivorysql.compatible_mode TO oracle;  -- Switch parser and compatibility behavior
SET ivorysql.compatible_mode TO pg;
```

## Developer Contribution

### Source Code Structure

```
IvorySQL/
├── src/
│   ├── backend/
│   │   ├── parser/          # Dual parser implementation
│   │   ├── commands/        # Compatibility command extensions
│   │   └── utils/
│   │       └── guc/         # GUC framework extension
│   ├── include/
│   └── pl/                  # PL/iSQL implementation
├── contrib/
│   ├── ivorysql_ora/        # Oracle compatibility plugin
│   └── ...
└── doc/
```

### Development Environment

```bash
# Docker development environment
docker compose up -d
docker compose exec dev bash

# Build
./configure --prefix=/home/ivorysql/ivorysql --enable-debug --enable-cassert
make -j$(nproc)
make install

# Test
make oracle-check
```

## Reference Documents

- [Dual Parser Architecture](references/dual-parser.md) — Parser implementation details, syntax extension
- [GUC Framework](references/guc-framework.md) — Compatibility parameter framework design
- [Dual-Mode Design](references/dual-mode-design.md) — initdb process, mode switching principles
