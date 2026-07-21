# Activity Logging & Security Event Storage - Day 6 Documentation

## 1. Overview & Architecture
The **Activity & Security Event Logging** module in MarketMind AI provides an audit trail for every incoming HTTP request and security event. 

### Key Features:
* **Real-time Request Interception:** Intercepts every Express request and records execution duration in milliseconds.
* **Persistent Event Storage:** Persists activity logs directly into the PostgreSQL `activity_logs` database table.
* **Security Event Categorization:** Tracks critical security events including successful logins, failed logins, invalid JWT token attempts, and forbidden role access attempts.
* **Sensitive Data Sanitization:** Strips passwords, raw authorization headers, and secret keys before storage.
* **Resilient Non-Blocking Logging:** Gracefully catches logging errors to ensure database logging failures never interrupt or crash API user responses.

---

## 2. Database Schema (`activity_logs` Table)

```sql
CREATE TABLE activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(255) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    response_status INTEGER NOT NULL,
    execution_time_ms NUMERIC(10,2) DEFAULT 0,
    client_ip VARCHAR(50),
    event_type VARCHAR(50) DEFAULT 'API_REQUEST',
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_log_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);
```

### Table Columns Description:
* `log_id`: Unique auto-incrementing primary key.
* `user_id`: ID of the authenticated user (NULL if anonymous/unauthenticated).
* `endpoint`: Full requested API route path (e.g., `/api/invoices/revenue-summary`).
* `http_method`: HTTP Method verb (`GET`, `POST`, `PUT`, `DELETE`).
* `response_status`: HTTP Status Code returned to the client (e.g., `200`, `201`, `401`, `403`, `500`).
* `execution_time_ms`: Processing time elapsed in milliseconds.
* `client_ip`: Remote IP address of the client request.
* `event_type`: Security classification event type.
* `details`: Sanitized JSON description or error message context.
* `created_at`: Automatic timestamp of when the event occurred.

---

## 3. Logged Event Classifications

| Event Type | Trigger Condition | Status Code | Logged Data |
|---|---|---|---|
| `API_REQUEST` | Normal API request execution | `200` / `201` | Endpoint, HTTP method, user ID, client IP, execution time |
| `LOGIN_SUCCESS` | Successful user authentication | `200` | Endpoint, method, user ID, email, client IP |
| `LOGIN_FAILURE` | Invalid email or incorrect password | `401` | Endpoint, method, email/user ID, client IP, failure detail |
| `AUTH_FAILURE` | Missing, malformed, or expired JWT | `401` | Endpoint, method, client IP, token error detail |
| `ACCESS_FORBIDDEN` | User role lacks route permission | `403` | Endpoint, method, user ID, user role, client IP |
| `CLIENT_ERROR` | Request validation or invalid request | `400` / `404` | Endpoint, method, client IP, execution time |
| `SERVER_ERROR` | Unhandled exception or database crash | `500` | Endpoint, method, user ID, error message |

---

## 4. Privacy & Data Sanitization Guidelines

To comply with data privacy standards and security compliance:
1. **Passwords Are Never Logged:** Plaintext or hashed passwords are completely stripped before constructing log entries.
2. **Tokens Are Sanitized:** Bearer tokens and authorization headers are scrubbed.
3. **Pointers Only:** User IDs and emails are logged without sensitive attributes.

---

## 5. Sample Database Log Records

### Example 1: Successful Login Event (`LOGIN_SUCCESS`)
```json
{
  "log_id": 101,
  "user_id": 1,
  "endpoint": "/api/auth/login",
  "http_method": "POST",
  "response_status": 200,
  "execution_time_ms": 42.15,
  "client_ip": "127.0.0.1",
  "event_type": "LOGIN_SUCCESS",
  "details": "User 1 (admin@marketmind.com) logged in successfully",
  "created_at": "2026-07-21 21:05:00"
}
```

### Example 2: Invalid JWT Event (`AUTH_FAILURE`)
```json
{
  "log_id": 102,
  "user_id": null,
  "endpoint": "/api/invoices",
  "http_method": "GET",
  "response_status": 401,
  "execution_time_ms": 3.50,
  "client_ip": "192.168.1.50",
  "event_type": "AUTH_FAILURE",
  "details": "Invalid or expired token: jwt expired",
  "created_at": "2026-07-21 21:05:12"
}
```

### Example 3: Forbidden Access Event (`ACCESS_FORBIDDEN`)
```json
{
  "log_id": 103,
  "user_id": 4,
  "endpoint": "/api/invoices/1",
  "http_method": "DELETE",
  "response_status": 403,
  "execution_time_ms": 8.10,
  "client_ip": "192.168.1.75",
  "event_type": "ACCESS_FORBIDDEN",
  "details": "Access denied for role_id: 3. Required: System Administrator",
  "created_at": "2026-07-21 21:05:25"
}
```
