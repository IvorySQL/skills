---
title: IvorySQL GUC Compatibility Framework
description: GUC parameter framework extension design, compatibility parameters, parameter priority
tags: ivorysql, architecture, guc, framework, parameters
---

# IvorySQL GUC Compatibility Framework

## GUC Framework Extension

IvorySQL adds Oracle compatibility parameters on top of PG's GUC framework.

### New Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| ivorysql.compatible_mode | enum | oracle | Compatibility mode (oracle/pg) |
| ivorysql.port | integer | 1521 | Oracle compatibility port |
| ivorysql.charset | string | - | Character set |

### Parameter Priority

```
1. SQL command (SET)              -- Highest priority
2. User-level (ALTER ROLE SET)
3. Database-level (ALTER DATABASE SET)
4. Configuration file (postgresql.conf)
5. Command-line argument (postgres -c)
6. Compile-time default           -- Lowest priority
```

## Impact Scope of Compatibility Parameters

### ivorysql.compatible_mode = oracle

| Scope | Behavior Change |
|-------|-----------------|
| SQL parsing | Uses Oracle Parser |
| Data types | VARCHAR2/NUMBER/DATE etc. available |
| Built-in functions | NVL/DECODE/SYSDATE etc. available |
| System views | ALL_TABLES/DBA_TABLES etc. available |
| Identifiers | Case preserved |
| Empty string | Treated as NULL |
| Date format | NLS_DATE_FORMAT |
| DUAL | Available |
| (+) outer join | Available |
| CONNECT BY | Available |

### ivorysql.compatible_mode = pg

| Scope | Behavior Change |
|-------|-----------------|
| SQL parsing | Uses PG Parser |
| Data types | PG native types only |
| Built-in functions | PG native functions only |
| Identifiers | Converted to lowercase |
| Empty string | Empty string (not NULL) |
| Date format | DateStyle |

## Implementation Mechanism

### Parameter Definition

```c
// Simplified GUC parameter definition
static const struct config_enum_entry compatible_mode_options[] = {
    {"oracle", COMPAT_ORACLE, false},
    {"pg", COMPAT_PG, false},
    {NULL, 0, false}
};

DefineCustomEnumVariable(
    "ivorysql.compatible_mode",
    "Sets the compatibility mode.",
    "Valid values are oracle and pg.",
    &ivorysql_compatible_mode,
    COMPAT_ORACLE,
    compatible_mode_options,
    PGC_USERSET,
    0,
    NULL, NULL, NULL
);
```

### Parameter Change Callback

When the compatibility mode parameter changes, it triggers parser switching and related behavior changes.
