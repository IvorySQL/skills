# IvorySQL Project Template

## Go + Gin + GORM Project Template

### Directory Structure

```
myapp/
├── cmd/
│   └── api/
│       └── main.go
├── internal/
│   ├── handler/
│   │   └── user.go
│   ├── service/
│   │   └── user.go
│   ├── repository/
│   │   └── user.go
│   └── models/
│       └── user.go
├── configs/
│   └── config.yaml
├── database/
│   └── migrations/
│       └── 001_init.sql
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   └── api/
│   ├── package.json
│   └── vite.config.js
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### main.go Template

```go
package main

import (
    "log"
    "myapp/internal/handler"
    "myapp/internal/repository"
    "myapp/internal/service"
    "myapp/configs"

    "github.com/gin-gonic/gin"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

func main() {
    // Load configuration
    cfg := configs.Load()

    // Connect to database
    db, err := gorm.Open(postgres.Open(cfg.DSN), &gorm.Config{})
    if err != nil {
        log.Fatal("Database connection failed:", err)
    }

    // Auto migrate
    db.AutoMigrate(&models.User{})

    // Initialize layers
    userRepo := repository.NewUserRepository(db)
    userService := service.NewUserService(userRepo)
    userHandler := handler.NewUserHandler(userService)

    // Routes
    r := gin.Default()
    api := r.Group("/api/v1")
    {
        api.GET("/users", userHandler.List)
        api.GET("/users/:id", userHandler.Get)
        api.POST("/users", userHandler.Create)
        api.PUT("/users/:id", userHandler.Update)
        api.DELETE("/users/:id", userHandler.Delete)
    }

    // Start service
    r.Run(":8080")
}
```

### config.yaml Template

```yaml
server:
  port: 8080
  mode: debug  # debug / release

database:
  host: localhost
  port: 1521
  user: ivorysql
  password: secret
  dbname: ivorysql
  sslmode: disable
```

### models/user.go Template

```go
package models

import "time"

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:100;not null" json:"name"`
    Email     string    `gorm:"size:100;unique" json:"email"`
    Phone     string    `gorm:"size:20" json:"phone"`
    Status    int       `gorm:"default:1" json:"status"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

func (User) TableName() string {
    return "users"
}
```

### handler/user.go Template

```go
package handler

import (
    "net/http"
    "strconv"
    "myapp/internal/models"
    "myapp/internal/service"

    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    service *service.UserService
}

func NewUserHandler(s *service.UserService) *UserHandler {
    return &UserHandler{service: s}
}

func (h *UserHandler) List(c *gin.Context) {
    users, err := h.service.List()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, users)
}

func (h *UserHandler) Get(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    user, err := h.service.Get(uint(id))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Create(c *gin.Context) {
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    if err := h.service.Create(&user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) Update(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    var user models.User
    if err := c.ShouldBindJSON(&user); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    user.ID = uint(id)
    if err := h.service.Update(&user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    if err := h.service.Delete(uint(id)); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusNoContent, nil)
}
```

### Makefile Template

```makefile
.PHONY: build run test clean

build:
	go build -o bin/api cmd/api/main.go

run:
	go run cmd/api/main.go

test:
	go test ./... -v

clean:
	rm -rf bin/

docker-build:
	docker build -t myapp:latest .

docker-run:
	docker run -p 8080:8080 myapp:latest
```

## Frontend Template

### package.json

```json
{
  "name": "myapp-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "axios": "^1.6.0",
    "vue-router": "^4.2.0",
    "element-plus": "^2.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### src/api/index.js

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000
})

export default {
  // Users
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
}
```
