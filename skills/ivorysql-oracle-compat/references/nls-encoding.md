---
title: IvorySQL NLS Parameters and Encoding
description: Oracle NLS compatibility parameters, GB18030 encoding support
tags: ivorysql, oracle-compat, nls, encoding, gb18030
---

# NLS Parameters and Encoding

## NLS Parameters

| Parameter | Description | Example Value |
|------|------|--------|
| nls_date_format | Date display format | YYYY-MM-DD HH24:MI:SS |
| nls_timestamp_format | Timestamp format | YYYY-MM-DD HH24:MI:SS.FF |
| nls_timestamp_tz_format | Timezone-aware timestamp | YYYY-MM-DD HH24:MI:SS.FF TZH:TZM |
| nls_numeric_characters | Numeric separators | '.,' |
| nls_sort | Sort rule | BINARY |

## Usage Examples

```sql
-- Set NLS date format
SET nls_date_format = 'YYYY-MM-DD HH24:MI:SS';

-- View current settings
SHOW nls_date_format;

-- TO_CHAR uses NLS format
SELECT TO_CHAR(SYSDATE) FROM DUAL;
```

## GB18030 Encoding

IvorySQL supports the GB18030-2022 Chinese character encoding standard, which is China's national character set.

```bash
# Specify encoding during initialization
initdb -D /path/to/data -m oracle --encoding=UTF8 --locale=C

# Create a database with GB18030 support
CREATE DATABASE chinadb ENCODING 'UTF8' LC_COLLATE 'zh_CN.UTF8';
```

| Encoding | Description | Support Level |
|------|------|---------|
| UTF8 | Unicode | Fully supported |
| GB18030 | National standard Chinese | Supported in IvorySQL 5.3 |
| EUC_CN | Simplified Chinese | Supported |
| LATIN1 | Western European | Supported |
