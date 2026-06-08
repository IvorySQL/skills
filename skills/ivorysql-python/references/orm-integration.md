---
title: Python ORM Integration
description: SQLAlchemy/Django ORM integration
tags: ivorysql, python, orm, sqlalchemy, django
---

# Python ORM Integration

## SQLAlchemy

```python
from sqlalchemy import create_engine, Column, Integer, String, Numeric
from sqlalchemy.orm import declarative_base, Session

engine = create_engine("postgresql+psycopg2://ivorysql:password@localhost:5432/ivorysql")
Base = declarative_base()

class Employee(Base):
    __tablename__ = 'employees'
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    dept = Column(String(50))
    salary = Column(Numeric(10, 2))

with Session(engine) as session:
    emp = session.query(Employee).filter_by(dept="IT").first()
```

## Django

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ivorysql',
        'USER': 'ivorysql',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
