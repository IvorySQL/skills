---
title: JDBC Driver Installation
description: pgJDBC driver Maven/Gradle installation configuration
tags: ivorysql, jdbc, installation, maven, gradle
---

# JDBC Driver Installation

IvorySQL uses the PostgreSQL JDBC driver (pgJDBC).

## Maven

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>
```

## Gradle

```groovy
implementation("org.postgresql:postgresql:42.7.3")
```

## Driver Information

| Item | Value |
|------|-------|
| Driver class | org.postgresql.Driver |
| URL prefix | jdbc:postgresql:// |
| JDBC version | 4.2+ |
| Minimum JDK | 1.8 |
