---
title: JSON/XML Functions
description: JSON/JSONB/XML processing functions complete reference
tags: ivorysql, json, xml, functions, jsonb
---

# JSON/XML Functions

## JSONB Functions

| Function | Description |
|------|------|
| to_jsonb(any) | Convert to JSONB |
| jsonb_build_object(key, value, ...) | Build object |
| jsonb_build_array(value, ...) | Build array |
| jsonb_object(keys, values) | Build object |
| jsonb_array_elements(jsonb) | Expand array |
| jsonb_each(jsonb) | Expand object |
| jsonb_each_text(jsonb) | Expand object (text values) |
| jsonb_typeof(jsonb) | Value type |
| jsonb_pretty(jsonb) | Format |
| jsonb_path_query(jsonb, path) | Path query |
| jsonb_path_query_array(jsonb, path) | Path query (array) |
| jsonb_path_query_first(jsonb, path) | Path query (first) |
| jsonb_path_exists(jsonb, path) | Path exists |
| jsonb_set(target, path, new_value) | Modify value |
| jsonb_insert(target, path, new_value) | Insert value |
| jsonb_strip_nulls(jsonb) | Strip nulls |
| jsonb_concat(a, b) | Concatenate |

## JSON Operators

| Operator | Description |
|--------|------|
| -> | Get object field (JSON) |
| ->> | Get object field (text) |
| #> | Get by path (JSON) |
| #>> | Get by path (text) |
| @> | Contains |
| <@ | Contained |
| ? | Key exists |
| ?\| | Any key exists |
| ?& | All keys exist |
| \|\| | Concatenate |

## XML Functions

| Function | Description |
|------|------|
| xmlparse(document text) | Parse XML |
| xmlserialize(document xml AS text) | Serialize XML |
| xpath(text, xml) | XPath query |
| xpath_exists(text, xml) | XPath exists |
| xmlexists(text PASSING xml) | XML exists |
| xml_is_well_formed(text) | Is valid XML |
