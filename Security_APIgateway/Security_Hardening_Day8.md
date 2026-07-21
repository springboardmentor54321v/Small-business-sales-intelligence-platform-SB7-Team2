# API Gateway Security Hardening - Day 8 Documentation

## 1. Overview & OWASP Security Architecture
Milestone Day 8 introduces comprehensive **API Gateway Security Hardening** to defend MarketMind AI against modern OWASP API Security Top 10 vulnerabilities (including Broken Object Level Authorization, Broken Authentication, Excessive Data Exposure, SQL Injection, and Cross-Site Scripting).

---

## 2. Hardened Security Features & Implementations

### A. Secure HTTP Headers (`helmet`)
* **HSTS (HTTP Strict Transport Security):** Enforces HTTPS connections with `maxAge: 31536000` (1 year), `includeSubDomains`, and `preload`.
* **Clickjacking Protection (`X-Frame-Options`):** Set to `DENY` via `frameguard` to prevent framing attacks.
* **MIME Sniffing Prevention (`X-Content-Type-Options`):** Set to `nosniff` via `noSniff`.
* **XSS Filter (`X-XSS-Protection`):** Enabled in blocking mode (`1; mode=block`).
* **Content Security Policy (CSP):** Restricts script, style, image, and iframe sources.
* **Server Information Disclosure:** `X-Powered-By` header is stripped.

### B. Input Sanitization & Injection Defense (`sanitizerMiddleware.js`)
* **XSS Protection:** Automatically inspects all incoming `req.body`, `req.query`, and `req.params`. Strips `<script>` tags, HTML markup, `javascript:` protocols, and `on*` event handlers (`onload`, `onerror`, `onclick`).
* **SQL Injection (SQLi) Defense:** Scans input values against SQL command signatures (`UNION SELECT`, `' OR 1=1`, `DROP TABLE`, etc.). Rejects malicious payloads immediately with HTTP 400 Bad Request.
* **NoSQL / Object Injection & Prototype Pollution:** Strips `$operator` keys (e.g. `{$gt: ""}`) and prototype pollution vectors (`__proto__`, `constructor`, `prototype`).

### C. CORS Policy Review
* **Origin Whitelisting:** Restricts cross-origin requests to explicit front-end origins (`http://localhost:3000`, `http://localhost:5173`).
* **Header & Method Restrictions:** Explicitly specifies allowed HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`) and headers (`Content-Type`, `Authorization`).
* **Preflight Caching:** Sets `maxAge: 86400` (24 hours) to reduce preflight overhead.

### D. Request Payload Size Protection
* Limits `express.json` and `express.urlencoded` to `10kb`. Large payload attacks return **HTTP 413 Payload Too Large**.

### E. Hardened JWT Authentication & RBAC (`authMiddleware.js` & `roleMiddleware.js`)
* **Algorithm Restriction:** Explicitly enforces `algorithms: ["HS256"]` during token verification to prevent algorithm confusion attacks (`none` algorithm or asymmetric key substitution).
* **Security Event Logging:** Logs `AUTH_FAILURE` and `ACCESS_FORBIDDEN` events to `activity_logs`.

### F. Centralized Error Handling (`errorMiddleware.js`)
* Standardizes JSON error payloads for syntax errors, payload size errors, and 404 routes:
```json
{
  "success": false,
  "message": "Invalid JSON format in request body",
  "error": "Malformed JSON payload"
}
```

---

## 3. Postman Security Testing Procedures

1. **SQL Injection Attack Test**:
   - Request: `POST http://localhost:5000/api/auth/login`
   - Body: `{"email": "admin' OR '1'='1", "password": "pass"}`
   - Expected Response: **`400 Bad Request`** with `"Security Error: Invalid input or potential injection attempt detected"`.

2. **XSS Payload Test**:
   - Request: `POST http://localhost:5000/api/auth/register`
   - Body: `{"full_name": "<script>alert('XSS')</script>John", "email": "xss@test.com", "password": "pass"}`
   - Expected Response: Sanitized input strips `<script>` tags automatically.

3. **Malformed JWT Token Test**:
   - Request: `GET http://localhost:5000/api/invoices`
   - Header: `Authorization: Bearer invalid.jwt.token`
   - Expected Response: **`401 Unauthorized`** with `"Malformed or invalid token signature."`.

4. **Payload Size Limit Test**:
   - Send JSON payload > 10KB.
   - Expected Response: **`413 Payload Too Large`**.
