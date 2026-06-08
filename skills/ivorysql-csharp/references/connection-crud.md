---
title: C# Connection and CRUD
description: ADO.NET operations, transactions
tags: ivorysql, csharp, connection, crud, adonet
---

# C# Connection and CRUD

```csharp
var connString = "Host=localhost;Port=5432;Database=ivorysql;Username=ivorysql;Password=password";
using var conn = new NpgsqlConnection(connString);
conn.Open();

// INSERT
using (var cmd = new NpgsqlCommand("INSERT INTO employees (name, dept, salary) VALUES (@name, @dept, @salary)", conn)) {
    cmd.Parameters.AddWithValue("name", "Zhang");
    cmd.Parameters.AddWithValue("dept", "IT");
    cmd.Parameters.AddWithValue("salary", 15000m);
    cmd.ExecuteNonQuery();
}

// SELECT
using (var cmd = new NpgsqlCommand("SELECT id, name FROM employees WHERE dept = @dept", conn)) {
    cmd.Parameters.AddWithValue("dept", "IT");
    using var reader = cmd.ExecuteReader();
    while (reader.Read()) Console.WriteLine($"{reader["id"]}: {reader["name"]}");
}
```
