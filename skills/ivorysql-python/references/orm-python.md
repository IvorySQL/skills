# IvorySQL Python ORM Integration

## SQLAlchemy ORM

### Installation

```bash
pip install sqlalchemy psycopg2-binary
```

### Model Definition

```python
from sqlalchemy import create_engine, Column, Integer, String, Numeric, Date
from sqlalchemy.orm import declarative_base, Session

Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    salary = Column(Numeric(10, 2))
    department = Column(String(50))
    hire_date = Column(Date)
```

### Connection

```python
engine = create_engine(
    "postgresql+psycopg2://ivorysql:secret@localhost:1521/ivorysql",
    pool_size=10,
    echo=False
)

# Create tables
Base.metadata.create_all(engine)
```

### Queries

```python
with Session(engine) as session:
    # Filtered query
    emps = session.query(Employee).filter(
        Employee.salary > 5000,
        Employee.department.in_(['IT', 'HR'])
    ).order_by(Employee.salary.desc()).all()

    # Single record
    emp = session.query(Employee).filter_by(id=1).first()

    # Raw SQL
    from sqlalchemy import text
    result = session.execute(
        text("SELECT * FROM employees WHERE department = :dept"),
        {"dept": "IT"}
    )
```

### Insert

```python
with Session(engine) as session:
    emp = Employee(name="Zhang San", salary=8000, department="IT")
    session.add(emp)
    session.commit()
    print(f"New employee ID: {emp.id}")

    # Batch insert
    session.add_all([
        Employee(name="Li Si", salary=9000, department="HR"),
        Employee(name="Wang Wu", salary=7500, department="IT"),
    ])
    session.commit()
```

### Update

```python
with Session(engine) as session:
    emp = session.query(Employee).filter_by(id=1).first()
    emp.salary = 9000
    session.commit()
```

### Delete

```python
with Session(engine) as session:
    emp = session.query(Employee).filter_by(id=1).first()
    session.delete(emp)
    session.commit()
```

## Django Integration

### Configure settings.py

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ivorysql',
        'USER': 'ivorysql',
        'PASSWORD': 'secret',
        'HOST': 'localhost',
        'PORT': 1521,
        'OPTIONS': {
            'options': '-c ivorysql.compatible_mode=oracle'
        }
    }
}
```

### Model Definition

```python
from django.db import models

class Employee(models.Model):
    name = models.CharField(max_length=100)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    department = models.CharField(max_length=50)
    hire_date = models.DateField()

    class Meta:
        db_table = 'employees'
```

### Queries

```python
# Filtered query
emps = Employee.objects.filter(salary__gt=5000, department='IT')

# Ordering
emps = Employee.objects.order_by('-salary')[:10]

# Create
emp = Employee.objects.create(name="Zhang San", salary=8000, department="IT")

# Update
Employee.objects.filter(id=1).update(salary=9000)

# Delete
Employee.objects.filter(id=1).delete()
```

### Raw SQL

```python
from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM employees WHERE salary > %s", [5000])
    rows = cursor.fetchall()
```

## Oracle-Compatible Functions

```python
# SQLAlchemy raw SQL
from sqlalchemy import text

with Session(engine) as session:
    result = session.execute(text("""
        SELECT name, NVL(bonus, 0), DECODE(dept, 'IT', 'Tech Dept', 'Other')
        FROM employees
        WHERE ROWNUM <= 10
    """))
```

## Connection Pool Configuration

### SQLAlchemy

```python
engine = create_engine(
    "postgresql+psycopg2://...",
    pool_size=10,           # Persistent connections
    max_overflow=20,        # Extra connections
    pool_pre_ping=True,     # Test before use
    pool_recycle=3600,      # Recycle after 1 hour
)
```

### Django

```python
DATABASES = {
    'default': {
        'CONN_MAX_AGE': 600,  # Connection lives for 10 minutes
    }
}
```
