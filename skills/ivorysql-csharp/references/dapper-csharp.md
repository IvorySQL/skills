# IvorySQL C#/.NET Dapper ORM

## Installation

```bash
dotnet add package Dapper
dotnet add package Npgsql
```

## Basic Queries

```csharp
using Dapper;
using Npgsql;

using var conn = new NpgsqlConnection("Host=localhost;Port=1521;Database=ivorysql;Username=ivorysql;Password=secret");

// Single record query
var emp = conn.QuerySingleOrDefault<Employee>(
    "SELECT * FROM employees WHERE id = @id", new { id = 1 });

// Multiple records query
var emps = conn.Query<Employee>(
    "SELECT * FROM employees WHERE salary > @min ORDER BY salary DESC",
    new { min = 5000 });

// Dynamic query
var rows = conn.Query("SELECT * FROM employees WHERE name = @name",
    new { name = "Zhang San" });
```

## Insert

```csharp
// Insert and return ID
var newId = conn.ExecuteScalar<int>(@"
    INSERT INTO employees (name, salary, department)
    VALUES (@Name, @Salary, @Department);
    SELECT lastval();",
    new Employee { Name = "Zhang San", Salary = 8000, Department = "IT" });

// Bulk insert
var list = new[] {
    new Employee { Name = "A", Salary = 8000, Department = "IT" },
    new Employee { Name = "B", Salary = 9000, Department = "HR" },
};
conn.Execute(@"
    INSERT INTO employees (name, salary, department)
    VALUES (@Name, @Salary, @Department)", list);
```

## Update and Delete

```csharp
// Update
conn.Execute("UPDATE employees SET salary = @Salary WHERE id = @Id",
    new { Salary = 9500, Id = 1 });

// Delete
conn.Execute("DELETE FROM employees WHERE id = @Id", new { Id = 5 });
```

## Transactions

```csharp
using var tx = conn.BeginTransaction();
try
{
    conn.Execute("UPDATE accounts SET balance = balance - @amt WHERE id = @id",
        new { amt = 100, id = 1 }, tx);
    conn.Execute("UPDATE accounts SET balance = balance + @amt WHERE id = @id",
        new { amt = 100, id = 2 }, tx);
    tx.Commit();
}
catch
{
    tx.Rollback();
    throw;
}
```

## Stored Procedures

```csharp
var p = new DynamicParameters();
p.Add("p_id", 1);
p.Add("p_name", dbType: DbType.String, direction: ParameterDirection.Output, size: 100);
p.Add("p_salary", dbType: DbType.Decimal, direction: ParameterDirection.Output);

conn.Execute("get_emp_info", p, commandType: CommandType.StoredProcedure);

Console.WriteLine($"Name: {p.Get<string>("p_name")}, Salary: {p.Get<decimal>("p_salary")}");
```

## QueryMultiple

```csharp
using var multi = conn.QueryMultiple(@"
    SELECT * FROM employees WHERE department = @dept;
    SELECT COUNT(*) FROM employees WHERE department = @dept",
    new { dept = "IT" });

var emps = multi.Read<Employee>();
var count = multi.ReadSingle<int>();
```

## Type Mapping

```csharp
// Custom type mapping
Dapper.SqlMapper.SetTypeMap(typeof(Employee), new CustomPropertyTypeMap(
    typeof(Employee),
    (type, columnName) => type.GetProperties().FirstOrDefault(p =>
        p.GetCustomAttributes(false).OfType<ColumnAttribute>().Any(a => a.Name == columnName))));

// Or use Column attribute
public class Employee
{
    [Column("emp_id")]
    public int Id { get; set; }

    [Column("emp_name")]
    public string Name { get; set; }
}
```

## Performance Optimization

```csharp
// Execute once per item, with a 300-second command timeout (not a batch size).
conn.Execute(sql, list, commandTimeout: 300);

// Buffering (default is full cache)
var emps = conn.Query<Employee>(sql, buffered: true);

// Command timeout
conn.Execute(sql, commandTimeout: 60);
```
