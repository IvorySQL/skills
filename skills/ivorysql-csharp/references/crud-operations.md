---
title: IvorySQL C# CRUD Operations
description: Queries, parameterization, batch operations, transaction control
tags: ivorysql, csharp, crud, query, batch, transaction
---

# IvorySQL C# CRUD Operations

## Queries

```csharp
await using var cmd = new NpgsqlCommand("SELECT * FROM employees WHERE salary > @sal", conn);
cmd.Parameters.AddWithValue("sal", 5000m);
await using var reader = await cmd.ExecuteReaderAsync();
while (await reader.ReadAsync()) {
    var name = reader.GetString(reader.GetOrdinal("name"));
    var salary = reader.GetDecimal(reader.GetOrdinal("salary"));
}
```

## Insert/Update/Delete

```csharp
// Insert
await using var cmd = new NpgsqlCommand(
    "INSERT INTO employees (name, salary) VALUES (@name, @salary) RETURNING id", conn);
cmd.Parameters.AddWithValue("name", "Zhang San");
cmd.Parameters.AddWithValue("salary", 8000m);
var id = await cmd.ExecuteScalarAsync();

// Update
await using var cmd = new NpgsqlCommand(
    "UPDATE employees SET salary = @salary WHERE id = @id", conn);
cmd.Parameters.AddWithValue("salary", 9000m);
cmd.Parameters.AddWithValue("id", 1);
await cmd.ExecuteNonQueryAsync();

// Delete
await using var cmd = new NpgsqlCommand("DELETE FROM employees WHERE id = @id", conn);
cmd.Parameters.AddWithValue("id", 1);
await cmd.ExecuteNonQueryAsync();
```

## Batch Operations

```csharp
await using var batch = new NpgsqlBatch(conn);
for (int i = 0; i < 1000; i++) {
    var cmd = new NpgsqlBatchCommand(
        "INSERT INTO employees (name, salary) VALUES (@name, @salary)");
    cmd.Parameters.AddWithValue("name", $"Employee{i}");
    cmd.Parameters.AddWithValue("salary", 5000m + i);
    batch.BatchCommands.Add(cmd);
}
await batch.ExecuteNonQueryAsync();
```

## Transaction Control

```csharp
await using var tx = await conn.BeginTransactionAsync();
try {
    await using var cmd1 = new NpgsqlCommand(
        "UPDATE accounts SET balance = balance - @amt WHERE id = @id", conn, tx);
    cmd1.Parameters.AddWithValue("amt", 100m);
    cmd1.Parameters.AddWithValue("id", 1);
    await cmd1.ExecuteNonQueryAsync();

    await using var cmd2 = new NpgsqlCommand(
        "UPDATE accounts SET balance = balance + @amt WHERE id = @id", conn, tx);
    cmd2.Parameters.AddWithValue("amt", 100m);
    cmd2.Parameters.AddWithValue("id", 2);
    await cmd2.ExecuteNonQueryAsync();

    await tx.CommitAsync();
} catch {
    await tx.RollbackAsync();
}
```
