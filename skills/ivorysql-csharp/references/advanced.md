---
title: IvorySQL C# Advanced Features
description: EF Core, stored procedures, Oracle compatibility mode
tags: ivorysql, csharp, advanced, ef-core, stored-procedure, oracle
---

# IvorySQL C# Advanced Features

## Entity Framework Core

```csharp
// DbContext
public class AppDbContext : DbContext {
    public DbSet<Employee> Employees { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder options) {
        options.UseNpgsql("Host=localhost;Database=ivorysql;Username=ivorysql;Password=secret");
    }
}

// Entity
public class Employee {
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Salary { get; set; }
    public DateTime HireDate { get; set; }
}

// Usage
await using var ctx = new AppDbContext();
var employees = await ctx.Employees
    .Where(e => e.Salary > 5000)
    .OrderByDescending(e => e.Salary)
    .ToListAsync();
```

## Stored Procedures

```csharp
await using var cmd = new NpgsqlCommand("CALL update_salary(@id, @salary)", conn);
cmd.Parameters.AddWithValue("id", 1);
cmd.Parameters.AddWithValue("salary", 10000m);
await cmd.ExecuteNonQueryAsync();

// Call function
await using var cmd = new NpgsqlCommand("SELECT get_emp_name(@id)", conn);
cmd.Parameters.AddWithValue("id", 1);
var name = (string)await cmd.ExecuteScalarAsync();
```

## Oracle Compatibility Mode

```csharp
await using var cmd = new NpgsqlCommand("SET ivorysql.compatible_mode TO oracle", conn);
await cmd.ExecuteNonQueryAsync();

// Use Oracle functions
await using var cmd = new NpgsqlCommand(
    "SELECT NVL(salary, 0), SYSDATE FROM DUAL", conn);
await using var reader = await cmd.ExecuteReaderAsync();
```
