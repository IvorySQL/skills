# IvorySQL API Specification

## RESTful API Design Principles

### Resource Naming

- Use plural nouns: `/users`, `/orders`, `/products`
- Use lowercase letters and hyphens: `/user-groups`
- Avoid verbs: `/users` instead of `/getUsers`

### HTTP Methods

| Method | Purpose | Example |
|------|------|------|
| GET | Query resources | `GET /users` |
| POST | Create resource | `POST /users` |
| PUT | Update resource (full) | `PUT /users/1` |
| PATCH | Update resource (partial) | `PATCH /users/1` |
| DELETE | Delete resource | `DELETE /users/1` |

### Status Codes

| Status Code | Meaning | Use Case |
|--------|------|----------|
| 200 | Success | GET/PUT/PATCH/DELETE success |
| 201 | Created | POST success |
| 204 | No Content | DELETE success |
| 400 | Bad Request | Parameter validation failed |
| 401 | Unauthorized | Login required |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource does not exist |
| 500 | Server Error | Internal error |

## Unified Response Format

### Success Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Zhang San"
  }
}
```

### List Response

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [...],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

### Error Response

```json
{
  "code": 40001,
  "message": "Username already exists",
  "data": null
}
```

## Pagination Parameters

```
GET /users?page=1&page_size=10&sort=created_at&order=desc
```

Response:
```json
{
  "code": 0,
  "data": {
    "list": [...],
    "pagination": {
      "total": 100,
      "page": 1,
      "page_size": 10,
      "total_pages": 10
    }
  }
}
```

## Filtering and Search

```
GET /users?status=1&department=IT
GET /users?keyword=ZhangSan
GET /users?created_at_from=2024-01-01&created_at_to=2024-12-31
```

## Related Resources

```
GET /users/1/orders           # Get all orders for a user
GET /users/1/orders/1/items   # Get order details for a user
```

## API Examples

### User Management

#### Get User List

```
GET /api/v1/users?page=1&page_size=10
```

Response:
```json
{
  "code": 0,
  "data": {
    "list": [
      {"id": 1, "name": "Zhang San", "email": "zhangsan@example.com"},
      {"id": 2, "name": "Li Si", "email": "lisi@example.com"}
    ],
    "pagination": {
      "total": 2,
      "page": 1,
      "page_size": 10
    }
  }
}
```

#### Create User

```
POST /api/v1/users
Content-Type: application/json

{
  "name": "Wang Wu",
  "email": "wangwu@example.com",
  "phone": "13800138000"
}
```

Response:
```json
{
  "code": 0,
  "message": "Created successfully",
  "data": {
    "id": 3,
    "name": "Wang Wu",
    "email": "wangwu@example.com"
  }
}
```

#### Update User

```
PUT /api/v1/users/3
Content-Type: application/json

{
  "name": "Wang Wuwu",
  "email": "wangwuwu@example.com"
}
```

#### Delete User

```
DELETE /api/v1/users/3
```

Response:
```json
{
  "code": 0,
  "message": "Deleted successfully"
}
```

## Authentication

Use JWT Token authentication:

```
Authorization: Bearer <token>
```

### Login API

```
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "password123"
}
```

Response:
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_in": 7200
  }
}
```

## Error Code Definitions

| Error Code | Meaning |
|--------|------|
| 0 | Success |
| 40001 | Parameter error |
| 40002 | Resource not found |
| 40003 | Resource already exists |
| 40101 | Not logged in |
| 40102 | Token expired |
| 40301 | No permission |
| 50001 | Server internal error |
| 50002 | Database error |

## OpenAPI Specification Example

```yaml
openapi: 3.0.0
info:
  title: MyApp API
  version: 1.0.0

paths:
  /users:
    get:
      summary: Get user list
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: page_size
          in: query
          schema:
            type: integer
            default: 10
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
    UserListResponse:
      type: object
      properties:
        code:
          type: integer
        data:
          type: object
          properties:
            list:
              type: array
              items:
                $ref: '#/components/schemas/User'
```
