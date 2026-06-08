# IvorySQL C#/.NET Entity Framework Core

## Installation

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

## DbContext Configuration

```csharp
using Microsoft.EntityFrameworkCore;

public class IvorySqlContext : DbContext
{
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Department> Departments { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder opt)
    {
        opt.UseNpgsql("Host=localhost;Port=1521;Database=ivorysql;Username=ivorysql;Password=secret");
    }
}
```

## Entity Definitions

```csharp
public class Employee
{
    public int Id { get; set; }
    public string Name { get; set; }
    public decimal Salary { get; set; }
    public string Department { get; set; }
    public DateTime HireDate { get; set; }

    // Navigation property
    public Department Dept { get; set; }
    public int DepartmentId { get; set; }
}

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; }
    public ICollection<Employee> Employees { get; set; }
}
```

## Queries

```csharp
using var ctx = new IvorySqlContext();

// Conditional query
var emps = await ctx.Employees
    .Where(e => e.Salary > 5000)
    .OrderByDescending(e => e.Salary)
    .ToListAsync();

// Pagination
var page = await ctx.Employees
    .OrderBy(e => e.Name)
    .Skip(20)
    .Take(10)
    .ToListAsync();

// Eager loading
var emps = await ctx.Employees
    .Include(e => e.Dept)
    .ToListAsync();

// Raw SQL
var emps = await ctx.Employees
    .FromSqlRaw("SELECT * FROM employees WHERE salary > {0}", 5000)
    .ToListAsync();
```

## Insert

```csharp
var emp = new Employee
{
    Name = "Zhang San",
    Salary = 8000,
    Department = "IT"
};

ctx.Employees.Add(emp);
await ctx.SaveChangesAsync();

Console.WriteLine($"New ID: {emp.Id}");
```

## Update

```csharp
var emp = await ctx.Employees.FindAsync(1);
emp.Salary = 9000;
await ctx.SaveChangesAsync();
```

## Delete

```csharp
var emp = await ctx.Employees.FindAsync(1);
ctx.Employees.Remove(emp);
await ctx.SaveChangesAsync();
```

## Transactions

```csharp
using var tx = await ctx.Database.BeginTransactionAsync();
try
{
    ctx.Employees.Add(new Employee { Name = "A" });
    await ctx.SaveChangesAsync();

    ctx.Employees.Add(new Employee { Name = "B" });
    await ctx.SaveChangesAsync();

    await tx.CommitAsync();
}
catch
{
    await tx.RollbackAsync();
    throw;
}
```

## Migrations

```bash
# Create migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update

# Rollback
dotnet ef database update 0
```

## Connection Pooling

```csharp
// Program.cs (ASP.NET Core)
builder.Services.AddDbContextPool<IvorySqlContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("IvorySql")));
```
