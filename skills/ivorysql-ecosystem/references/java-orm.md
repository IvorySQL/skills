---
title: IvorySQL Java ORM Integration
description: MyBatis/Hibernate/Spring Boot/JDBC Template
tags: ivorysql, ecosystem, java, mybatis, hibernate, spring-boot
---

# IvorySQL Java ORM Integration

## MyBatis

### Maven Dependencies

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>3.0.3</version>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>
```

### Configuration

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ivorysql
    username: ivorysql
    password: secret
    driver-class-name: org.postgresql.Driver
```

### Mapper Example

```xml
<select id="findEmployees" resultType="Employee">
    SELECT * FROM employees WHERE salary > #{minSalary}
</select>

<insert id="insertEmployee" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO employees (name, salary) VALUES (#{name}, #{salary})
</insert>
```

## Spring Boot JPA / Hibernate

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ivorysql
    username: ivorysql
    password: secret
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
```

### Entity

```java
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private BigDecimal salary;
    private LocalDate hireDate;
}
```

## Spring Boot JDBC Template

```java
@Repository
public class EmployeeRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Employee> findBySalary(Double minSalary) {
        return jdbcTemplate.query(
            "SELECT * FROM employees WHERE salary > ?",
            (rs, rowNum) -> new Employee(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getBigDecimal("salary")
            ),
            minSalary
        );
    }
}
```
