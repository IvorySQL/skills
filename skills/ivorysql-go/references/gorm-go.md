# IvorySQL GORM Integration

## Install Dependencies

```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
```

## Connection Configuration

```go
import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

dsn := "host=localhost user=ivorysql password=secret dbname=ivorysql port=1521 sslmode=disable"
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
if err != nil {
    log.Fatal(err)
}
```

## Model Definition

```go
type Employee struct {
    ID         uint      `gorm:"primaryKey"`
    Name       string    `gorm:"size:100;not null"`
    Salary     float64   `gorm:"type:numeric(10,2)"`
    Department string    `gorm:"size:50"`
    CreatedAt  time.Time
    UpdatedAt  time.Time
}

// Specify table name
func (Employee) TableName() string {
    return "employees"
}
```

## CRUD Operations

### Query

```go
// Query by primary key
var emp Employee
db.First(&emp, 1)

// Conditional query
db.Where("salary > ?", 5000).Find(&emps)

// Multiple conditions
db.Where("department = ? AND salary > ?", "IT", 5000).Find(&emps)

// Or
db.Where("department = ?", "IT").Or("department = ?", "HR").Find(&emps)

// Sort and paginate
db.Order("salary desc").Limit(10).Offset(20).Find(&emps)

// Count
var count int64
db.Model(&Employee{}).Where("salary > ?", 5000).Count(&count)
```

### Create

```go
// Single insert
emp := Employee{Name: "Zhang San", Salary: 8000, Department: "IT"}
db.Create(&emp)
fmt.Println(emp.ID)  // Auto-populated ID

// Batch insert
employees := []Employee{
    {Name: "Li Si", Salary: 9000, Department: "HR"},
    {Name: "Wang Wu", Salary: 7500, Department: "IT"},
}
db.CreateInBatches(employees, 100)  // 100 per batch
```

### Update

```go
// Update single field
db.Model(&emp).Update("salary", 9000)

// Update multiple fields
db.Model(&emp).Updates(Employee{Salary: 9500, Department: "Sales"})

// Conditional update
db.Model(&Employee{}).Where("department = ?", "IT").Update("salary", gorm.Expr("salary * ?", 1.1))

// Update all fields (Save updates zero values too)
db.Save(&emp)
```

### Delete

```go
// Delete by primary key
db.Delete(&emp, 1)

// Conditional delete
db.Where("salary < ?", 3000).Delete(&Employee{})

// Soft delete (requires gorm.DeletedAt field)
type Employee struct {
    ID        uint
    Name      string
    DeletedAt gorm.DeletedAt
}
db.Delete(&emp)  // Sets DeletedAt
db.Unscoped().Find(&emps)  // Includes deleted records
```

## Transactions

```go
// Automatic transaction
db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&Employee{Name: "A"}).Error; err != nil {
        return err
    }
    if err := tx.Create(&Employee{Name: "B"}).Error; err != nil {
        return err
    }
    return nil
})

// Manual transaction
tx := db.Begin()
defer func() {
    if r := recover(); r != nil {
        tx.Rollback()
    }
}()

if err := tx.Create(&Employee{Name: "A"}).Error; err != nil {
    tx.Rollback()
    return
}

tx.Commit()
```

## Associations

### One-to-Many

```go
type Department struct {
    ID   uint
    Name string
    Employees []Employee
}

type Employee struct {
    ID           uint
    Name         string
    DepartmentID uint
}

// Preload
db.Preload("Employees").Find(&departments)
```

### Many-to-Many

```go
type Employee struct {
    ID     uint
    Name   string
    Roles  []Role `gorm:"many2many:employee_roles;"`
}

type Role struct {
    ID   uint
    Name string
}

// Preload
db.Preload("Roles").Find(&employees)
```

## Raw SQL

```go
// Query
var emps []Employee
db.Raw("SELECT * FROM employees WHERE salary > ?", 5000).Scan(&emps)

// Execute
db.Exec("UPDATE employees SET salary = salary * 1.1 WHERE department = ?", "IT")

// Oracle compatible functions
var result []map[string]interface{}
db.Raw("SELECT NVL(bonus, 0), DECODE(dept, 'IT', 'Tech', 'Other') FROM employees").Scan(&result)
```

## Oracle Compatibility

```go
// Use NVL, DECODE and other Oracle functions
var emps []Employee
db.Raw(`SELECT id, name, NVL(bonus, 0) as bonus
        FROM employees
        WHERE ROWNUM <= 10`).Scan(&emps)

// Use DUAL
var sysdate time.Time
db.Raw("SELECT SYSDATE FROM DUAL").Scan(&sysdate)
```

## Performance Optimization

```go
// Select specific fields (avoid SELECT *)
db.Select("id", "name").Find(&emps)

// Batch size
db.FindInBatches(&results, 100, func(tx *gorm.DB, batch int) error {
    // Process 100 records per batch
    return nil
})

// Disable hooks
db.Omit("CreatedAt").Create(&emp)

// Debug
db.Debug().Find(&emps)
```

## Connection Pool Configuration

```go
import "gorm.io/driver/postgres"

dsn := "host=localhost user=ivorysql password=secret dbname=ivorysql port=1521"
db, _ := gorm.Open(postgres.Open(dsn), &gorm.Config{})

sqlDB, _ := db.DB()
sqlDB.SetMaxOpenConns(50)
sqlDB.SetMaxIdleConns(10)
sqlDB.SetConnMaxLifetime(time.Hour)
```
