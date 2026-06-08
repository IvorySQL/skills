---
title: IvorySQL Dual Parser Architecture
description: Dual parser implementation principles, Oracle Parser syntax extension, parser selection mechanism
tags: ivorysql, architecture, dual-parser, oracle-parser, parser-selection
---

# IvorySQL Dual Parser Architecture

## Architecture Principles

IvorySQL maintains two independent SQL parsers within the PG kernel:

```
SQL Input
    │
    ├── Oracle Port Connection ──→ Oracle Parser ──┐
    │                                               │
    ├── PG Native Port Connection → PG Parser ─────┤
    │                                               │
    └── GUC Parameter Switch ───────────────────────┤
                                                    │
                                              ┌─────▼──────┐
                                              │ Analysis &   │
                                              │   Rewrite    │
                                              └─────┬──────┘
                                                    │
                                              ┌─────▼──────┐
                                              │ Query       │
                                              │ Optimizer   │
                                              └─────┬──────┘
                                                    │
                                              ┌─────▼──────┐
                                              │ Execution   │
                                              │   Engine    │
                                              └────────────┘
```

## Oracle Parser Syntax Extension

### Supported Oracle Syntax

| Syntax Category | Oracle Syntax | Description |
|-----------------|---------------|-------------|
| Pseudo-table | SELECT ... FROM DUAL | Oracle-style single-row query |
| Outer join | WHERE a.id = b.id(+) | Oracle legacy outer join |
| Hierarchical query | CONNECT BY ... START WITH | Hierarchical data query |
| Row number | ROWNUM | Row number pseudo-column |
| Data types | VARCHAR2, NUMBER, DATE | Oracle data types |
| Functions | NVL, DECODE, SYSDATE | Oracle built-in functions |
| Sequences | seq.NEXTVAL, seq.CURRVAL | Oracle sequence syntax |
| Anonymous blocks | DECLARE ... BEGIN ... END; | PL/SQL anonymous blocks |
| Packages | CREATE PACKAGE | Oracle package definition |
| Invisible columns | INVISIBLE | Column visibility control |
| CALL | CALL proc_name(args) | Stored procedure call |

### Implementation

The Oracle Parser extends PG's parser framework:
1. Modify grammar definitions (gram.y) to add Oracle-specific syntax rules.
2. Extend the keyword list to include Oracle reserved words.
3. Handle Oracle-specific syntax nodes during semantic analysis.
4. Convert Oracle syntax nodes into PG internal executable nodes.

## Parser Selection Mechanism

### Selection Flow

```
1. New connection arrives
   ├── Port 1521 → Default Oracle Parser
   └── Port 5432 → Default PG Parser

2. Switch within session
   └── SET ivorysql.compatible_mode TO oracle/pg

3. Switch in psql
   └── \parser command

4. initdb initialization
   ├── -m oracle → Default Oracle Parser
   └── -m pg → Default PG Parser
```

### Parser Switching Implementation

```c
// Simplified parser selection logic
ParserSetupHook = (compatible_mode == ORACLE) ?
    oracle_parser_setup : pg_parser_setup;
```
