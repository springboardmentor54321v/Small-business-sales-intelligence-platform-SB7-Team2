# Express Rate Limiting & Brute-Force Protection - Day 7 Documentation

## 1. Executive Summary & Purpose
Rate limiting is a core defense mechanism in the **MarketMind AI Security & API Gateway**. By capping the number of incoming HTTP requests a single client IP address can make within a specified timeframe, rate limiting:
1. **Prevents Brute-Force Attacks:** Stops automated password guessing and credential stuffing on authentication endpoints (`/api/auth/login`, `/api/auth/register`).
2. **Mitigates Denial of Service (DoS):** Prevents malicious clients or buggy loops from flooding resource-intensive business APIs (`/api/invoices`, `/api/payments`, `/api/reports`).
3. **Saves Server & Database Resources:** Reduces unnecessary database connections and CPU consumption.

---

## 2. Rate Limiting Configurations

We use the production-ready `express-rate-limit` middleware, configured with two distinct tiers:

| Tier / Limiter Name | Target APIs | Window Duration | Max Requests | Custom Error Message |
|---|---|---|---|---|
| **`authLimiter` (Strict)** | `/api/auth/login`, `/api/auth/register` | 15 Minutes (`15 * 60 * 1000` ms) | **5 Requests** | "Too many authentication attempts from this IP. Please try again after 15 minutes." |
| **`apiLimiter` (Moderate)** | `/api/invoices`, `/api/payments`, `/api/products`, `/api/reports`, etc. | 15 Minutes (`15 * 60 * 1000` ms) | **100 Requests** | "Too many requests to business APIs from this IP. Please try again later." |

---

## 3. Middleware Integration Pipeline

The rate limiting middleware is positioned in Express pipeline as follows:

```text
Incoming Request ──> Helmet (Security Headers)
                  ──> CORS
                  ──> Morgan Logger
                  ──> Express JSON / URL-Encoded Body Parsers
                  ──> Activity & Security Logger (Audit Trail)
                  ──> Rate Limiters (authLimiter / apiLimiter)
                          │
                  (Exceeds Limit) ──> HTTP 429 Too Many Requests
                          │
                   (Within Limit)
                          ▼
                  JWT Protection Middleware (`protect`)
                          ▼
                  RBAC Authorization Middleware (`authorizeRoles`)
                          ▼
                  Controller Logic & Database Query
```

---

## 4. HTTP 429 Response Format & Standard Headers

When a client IP exceeds the configured threshold, Express immediately halts request execution and returns **HTTP Status 429 (Too Many Requests)**.

### Standard Response Headers:
* `RateLimit-Limit`: Total allowed request count per window.
* `RateLimit-Remaining`: Remaining request count in current window.
* `RateLimit-Reset`: Seconds remaining until window reset.

### Standard JSON Response Body:
```json
{
  "success": false,
  "message": "Too many authentication attempts from this IP. Please try again after 15 minutes.",
  "error": "Rate limit exceeded",
  "retryAfter": "15 minutes"
}
```

---

## 5. Postman Testing Procedures

### A. Testing Authentication Brute-Force Limit (`authLimiter`)
1. Open Postman and select `POST http://localhost:5000/api/auth/login`.
2. Send 5 sequential requests with invalid credentials within 15 minutes.
3. Observe successful HTTP 401 responses for requests 1 through 5.
4. Send the 6th request.
5. Verify response status is **`429 Too Many Requests`** with the custom error body.

### B. Testing Business API Limit (`apiLimiter`)
1. Open Postman and select `GET http://localhost:5000/api/invoices`.
2. Attach valid Bearer JWT token header `Authorization: Bearer <TOKEN>`.
3. Send requests continuously up to 100 hits within 15 minutes.
4. Request 101 returns **`429 Too Many Requests`**.
