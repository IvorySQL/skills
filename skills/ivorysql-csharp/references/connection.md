---
title: IvorySQL C# Connection Management
description: Npgsql connection strings, connection pooling, SSL
tags: ivorysql, csharp, connection, npgsql, pool, ssl
---

# IvorySQL C# Connection Management

## Connection Strings

```
Host=localhost;Port=5432;Database=ivorysql;Username=ivorysql;Password=secret
Host=localhost;Port=1521;Database=ivorysql;Username=ivorysql;Password=secret  // Oracle port
```

### Common Parameters

| Parameter | Description | Default |
|------|------|--------|
| Host | Server address | localhost |
| Port | Port | 5432 |
| Database | Database name | - |
| Username | Username | - |
| Password | Password | - |
| Pooling | Enable connection pooling | true |
| MaxPoolSize | Maximum connections | 100 |
| MinPoolSize | Minimum connections | 0 |
| SSL Mode | SSL mode | Prefer |
| Command Timeout | Command timeout (seconds) | 30 |

## Connection Pooling

```csharp
var connString = "Host=localhost;Database=ivorysql;Username=ivorysql;Password=secret;Pooling=true;MaxPoolSize=20;MinPoolSize=5";
await using var conn = new NpgsqlConnection(connString);
await conn.OpenAsync();
```

## SSL Connection

```csharp
var connString = "Host=localhost;Database=ivorysql;Username=ivorysql;Password=secret;SSL Mode=Require;Trust Server Certificate=true";
```
