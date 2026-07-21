# MarketMind AI - Security & API Gateway Module

Production-ready **API Gateway & Security Architecture** for MarketMind AI built on OWASP API Security best practices.

---

## 1. Gateway Security Layers

```text
Incoming Client Request
         │
         ├──> 1. Helmet HTTP Security Headers (HSTS, CSP, Frameguard, NoSniff)
         ├──> 2. Strict CORS Origin Whitelist Filter
         ├──> 3. Body Parser Payload Size Limiter (10KB Max)
         ├──> 4. Activity & Security Event Audit Logger (PostgreSQL activity_logs)
         ├──> 5. Global Input Sanitizer (XSS, SQLi & NoSQLi Defense)
         ├──> 6. Express Rate Limiters (Strict 5 req/15min | Moderate 100 req/15min)
         ├──> 7. JWT Authentication (HS256 Algorithm Restricted)
         ├──> 8. Role-Based Access Control (RBAC Authorization)
         └──> 9. Centralized Error Handler (Uniform JSON Error Format)
```

---

## 2. Key Security Features

### A. Helmet Secure HTTP Headers
* **HSTS**: Forces HTTPS with `maxAge: 31536000` (1 year).
* **Clickjacking Defense**: `X-Frame-Options: DENY`.
* **MIME Sniffing Defense**: `X-Content-Type-Options: nosniff`.
* **XSS Defense**: `X-XSS-Protection: 1; mode=block`.
* **Information Concealment**: `X-Powered-By` hidden.

### B. Input Sanitization (`sanitizerMiddleware.js`)
* **XSS Protection**: Automatically strips `<script>` tags, HTML markup, `javascript:` URIs, and event attributes (`onload=`, `onerror=`) across `req.body`, `req.query`, and `req.params`.
* **SQL Injection Protection**: Detects SQLi signatures (`UNION SELECT`, `' OR 1=1`, `DROP TABLE`). Rejects with HTTP 400 Bad Request.
* **NoSQL / Prototype Pollution**: Strips `$operator` keys and `__proto__`, `constructor`, `prototype`.

### C. Rate Limiting (`rateLimiter.js`)
* **Auth Limiter**: 5 requests / 15 minutes on `/api/auth/login` and `/register`. Returns HTTP 429.
* **API Limiter**: 100 requests / 15 minutes on business routes. Returns HTTP 429.

### D. Activity & Security Event Audit Logging (`activityLogger.js`)
* Non-blocking, asynchronous execution capturing response status, client IP, execution duration, and event types (`LOGIN_SUCCESS`, `LOGIN_FAILURE`, `AUTH_FAILURE`, `ACCESS_FORBIDDEN`).
* Sensitive data (passwords, tokens) is scrubbed automatically before writing to `activity_logs`.

---

## 3. Environment Configuration Guide

Ensure the following variables are defined in `.env`:

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_256bit
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```
