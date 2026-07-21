# Security Testing Guide - MarketMind AI Platform

This guide provides step-by-step instructions for security engineers, QA testers, and developers to verify API Gateway security controls.

---

## 1. Prerequisites & Test Setup
* **Target Host:** `http://localhost:5000` (or staging API URL)
* **Postman Collection:** Use `MarketMind_AI_Milestone2.postman_collection.json`
* **Test Accounts:**
  - System Administrator: `admin@marketmind.com` / `Admin123!`
  - Sales Executive: `sales@marketmind.com` / `Sales123!`

---

## 2. Test Cases & Verification Procedures

### Test Case 1: Brute-Force Password Attack (Strict Rate Limit)
* **Objective:** Verify `authLimiter` blocks repeated login attempts.
* **Endpoint:** `POST /api/auth/login`
* **Payload:** `{"email": "admin@marketmind.com", "password": "wrongpassword"}`
* **Steps:**
  1. Execute request 5 times in rapid succession.
  2. Requests 1 through 5 must return `401 Unauthorized`.
  3. Execute 6th request.
* **Expected Result:** HTTP Status **`429 Too Many Requests`** with JSON message: `"Too many authentication attempts from this IP. Please try again after 15 minutes."`.

---

### Test Case 2: SQL Injection Defense (Input Sanitizer)
* **Objective:** Verify `sanitizerMiddleware` detects and blocks SQLi.
* **Endpoint:** `POST /api/auth/login`
* **Payload:** `{"email": "admin' OR '1'='1", "password": "password"}`
* **Steps:** Send request via Postman.
* **Expected Result:** HTTP Status **`400 Bad Request`** with JSON message: `"Security Error: Invalid input or potential injection attempt detected"`.

---

### Test Case 3: XSS Script Injection Sanitization
* **Objective:** Verify HTML markup and script tags are stripped.
* **Endpoint:** `POST /api/auth/register`
* **Payload:** `{"full_name": "<script>alert('XSS')</script>Jane Doe", "email": "jane.xss@example.com", "password": "Pass123!", "phone": "5551112222", "role_id": 2}`
* **Steps:** Send request via Postman.
* **Expected Result:** HTTP Status **`201 Created`**. In database and response JSON, `full_name` is sanitized to `"Jane Doe"`.

---

### Test Case 4: Broken Object Level & Role Authorization (RBAC)
* **Objective:** Verify low-privileged users cannot access admin endpoints.
* **Endpoint:** `DELETE /api/invoices/1`
* **Header:** `Authorization: Bearer <SALES_EXECUTIVE_TOKEN>`
* **Steps:** Send DELETE request with token of Sales Executive (role_id 2).
* **Expected Result:** HTTP Status **`403 Forbidden`** with JSON message: `"Access Denied: You do not have permission to perform this action."`.

---

### Test Case 5: Malformed & Expired JWT Tokens
* **Objective:** Verify token verification rejects invalid JWT signatures.
* **Endpoint:** `GET /api/invoices`
* **Header:** `Authorization: Bearer malformed.jwt.token`
* **Steps:** Send GET request with invalid token string.
* **Expected Result:** HTTP Status **`401 Unauthorized`** with JSON message: `"Malformed or invalid token signature."`.

---

### Test Case 6: Payload Size Limit (DoS Protection)
* **Objective:** Verify request body larger than 10KB is rejected.
* **Endpoint:** `POST /api/invoices`
* **Payload:** Large JSON string > 10KB.
* **Expected Result:** HTTP Status **`413 Payload Too Large`**.
