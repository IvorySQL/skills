---
name: IvorySQL C#/.NET Development
name_for_command: ivorysql-csharp
description: |
  Complete IvorySQL C#/.NET development guide: Npgsql connection (Oracle port 1521), Dapper lightweight ORM,
  Entity Framework Core, async programming, batch operations, transaction control, connection pool configuration.
---

# IvorySQL C#/.NET Development

## Workflow

Trigger this skill when encountering the following issues:
- C# connects to IvorySQL
- Npgsql / Dapper / EF Core usage
- Async programming / batch operations
- Connection pool configuration

**Sub-skill routing**:
- Dapper ORM → [dapper-csharp](references/dapper-csharp.md)
- EF Core → [efcore-csharp](references/efcore-csharp.md)

## Drivers and Dependencies

```xml
<PackageReference Include="Npgsql" Version="8.0.0" />
<PackageReference Include="Dapper" Version="2.1.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
```

## Connection Methods

```csharp
using Npgsql;

var connString = "Host=localhost;Port=1521;Database=ivorysql;Username=ivorysql;Password=secret";
using var conn = new NpgsqlConnection(connString);
conn.Open();

// Oracle compatibility mode
var connOra = "Host=localhost;Port=1521;Database=ivorysql;Username=ivorysql;Password=secret;Options=-c ivorysql.compatible_mode=oracle";
```

## CRUD Operations

### Query

```csharp
using var cmd = new NpgsqlCommand("SELECT * FROM employees WHERE id = @id", conn);
cmd.Parameters.AddWithValue("id", 1);
using var reader = cmd.ExecuteReader();
while (reader.Read()) {
    Console.WriteLine($"{reader["id"]}: {reader["name"]}");
}
```

### Insert

```csharp
using var cmd = new NpgsqlCommand(@"
    INSERT INTO employees (name, salary, department)
    VALUES (@name, @salary, @dept) RETURNING id", conn);
cmd.Parameters.AddWithValue("name", "Zhang San");
cmd.Parameters.AddWithValue("salary", 8000m);
cmd.Parameters.AddWithValue("dept", "IT");
var newId = (int)cmd.ExecuteScalar();
```

### Batch Operations

```csharp
using var batch = new NpgsqlBatch(conn);
batch.BatchCommands.Add(new NpgsqlBatchCommand(
    "INSERT INTO employees (name, salary) VALUES (@n, @s)"));
batch.BatchCommands[0].Parameters.AddWithValue("n", "Li Si");
batch.BatchCommands[0].Parameters.AddWithValue("s", 9000m);
await batch.ExecuteNonQueryAsync();
```

## Dapper Lightweight ORM

```csharp
using Dapper;

var emps = conn.Query<Employee>(
    "SELECT * FROM employees WHERE salary > @min",
    new { min = 5000 });

conn.Execute(@"
    INSERT INTO employees (name, salary, department)
    VALUES (@Name, @Salary, @Department)", list);
```

> For details: [dapper-csharp](references/dapper-csharp.md)

## Entity Framework Core

```csharp
using var ctx = new IvorySqlContext();

var emps = await ctx.Employees
    .Where(e => e.Salary > 5000)
    .ToListAsync();

ctx.Employees.Add(new Employee { Name = "Zhang San", Salary = 8000 });
await ctx.SaveChangesAsync();
```

> For details: [efcore-csharp](references/efcore-csharp.md)

## Transactions

```csharp
using var tx = conn.BeginTransaction();
try {
    cmd.Transaction = tx;
    cmd.ExecuteNonQuery();
    tx.Commit();
} catch {
    tx.Rollback();
}
```

## Async Programming

```csharp
await conn.OpenAsync();
await using var cmd = new NpgsqlCommand("SELECT ...", conn);
await using var reader = await cmd.ExecuteReaderAsync();
while (await reader.ReadAsync()) { }
```

## Oracle-Compatible Functions

```csharp
using var cmd = new NpgsqlCommand(@"
    SELECT name, NVL(bonus, 0), DECODE(dept, 'IT', 'Tech Dept', 'Other')
    FROM employees WHERE ROWNUM <= 10", conn);
```

## Error Handling

```csharp
try {
    cmd.ExecuteNonQuery();
} catch (PostgresException ex) when (ex.SqlState == "23505") {
    Console.WriteLine("Unique constraint violation");
} catch (PostgresException ex) when (ex.SqlState == "23503") {
    Console.WriteLine("Foreign key violation");
}
```

## Connection Pool

```csharp
// Connection string
var poolConnString = "Host=localhost;Port=1521;Database=ivorysql;Username=ivorysql;Password=secret;Pooling=true;Minimum Pool Size=5;Maximum Pool Size=50";
```

## Reference Documents

- [Dapper ORM](references/dapper-csharp.md)
- [Entity Framework Core](references/efcore-csharp.md)
