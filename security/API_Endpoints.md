# API Endpoints

## Base URL

```
http://localhost:5000
```

---

# Authentication APIs

## 1. User Registration

### Endpoint

```
POST /api/auth/register
```

### Description

Creates a new user account.

### Request Body

```json
{
  "full_name": "Lokesh",
  "email": "lokesh@example.com",
  "password": "Lokesh@123",
  "phone": "9876543210",
  "role_id": 1
}
```

### Success Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "JWT_TOKEN",
  "user": {
    "user_id": 1,
    "full_name": "Lokesh",
    "email": "lokesh@example.com",
    "role_id": 1
  }
}
```

### Status

✅ Completed

---

## 2. User Login

### Endpoint

```
POST /api/auth/login
```

### Description

Authenticates a user and returns a JWT token.

### Request Body

```json
{
  "email": "lokesh@example.com",
  "password": "Lokesh@123"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN",
  "user": {
    "user_id": 1,
    "full_name": "Lokesh",
    "email": "lokesh@example.com",
    "role_id": 1
  }
}
```

### Status

✅ Completed

---

## 3. User Profile

### Endpoint

```
GET /api/auth/profile
```

### Description

Returns the authenticated user's profile.

### Headers

```
Authorization: Bearer <JWT_TOKEN>
```

### Success Response

```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "full_name": "Lokesh",
    "email": "lokesh@example.com",
    "phone": "9876543210",
    "role_id": 1
  }
}
```

### Status

✅ Completed

---

# Upcoming APIs

- Product Management APIs
- Inventory APIs
- Customer APIs
- Sales APIs
- CSV Upload API
- Dashboard APIs

Status: ⏳ Pending