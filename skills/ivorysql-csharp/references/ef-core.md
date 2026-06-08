---
title: EF Core Integration
description: Entity Framework Core configuration and usage
tags: ivorysql, csharp, ef-core, entity-framework
---

# EF Core Integration

```csharp
public class AppDbContext : DbContext {
    public DbSet<Employee> Employees { get; set; }
    protected override void OnConfiguring(DbContextOptionsBuilder options) {
        options.UseNpgsql("Host=localhost;Database=ivorysql;Username=ivorysql;Password=password");
    }
}

public class Employee {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Dept { get; set; }
    public decimal Salary { get; set; }
}

// Usage
using var db = new AppDbContext();
var emp = db.Employees.FirstOrDefault(e => e.Dept == "IT");
```
