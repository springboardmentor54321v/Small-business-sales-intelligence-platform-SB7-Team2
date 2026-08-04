# MarketMind AI - Security & Access Guide (Milestone 3)
**Module:** Gateway & Application Protection Layer  
**Owner:** Intern 2 — Security & API Gateway Developer

---

## 1. Authentication Strategy (JWT Bearer)
The application utilizes JSON Web Tokens (JWT) for stateless session authentication.
* **Algorithm:** Restricted to `HS256`. All header variations attempting algorithm swaps (e.g. `none`) are rejected.
* **Format:** Token must be supplied in the HTTP Authorization header: `Authorization: Bearer <JWT_TOKEN>`.
* **Token Expiry:** Configured to 24 hours.

---

## 2. Role-Based Access Control (RBAC) Matrix
Endpoints are protected by the `authorizeRoles` route middleware. The permission matrix is enforced as follows:

| Module / Endpoint | Method | System Administrator | Business Owner | Store Manager | Sales Executive |
|---|---|:---:|:---:|:---:|:---:|
| **Auth** (Register/Login) | `POST` | Public | Public | Public | Public |
| **Auth** (Get Profile) | `GET` | ✅ | ✅ | ✅ | ✅ |
| **Products** (View/Create) | `GET/POST` | ✅ | ✅ | ✅ | ❌ |
| **Products** (Update/Delete) | `PUT/DELETE` | ✅ | ✅ | ✅ | ❌ |
| **Categories** (View/Create) | `GET/POST` | ✅ | ✅ | ✅ | ❌ |
| **Categories** (Update) | `PUT` | ✅ | ✅ | ✅ | ❌ |
| **Categories** (Delete) | `DELETE` | ✅ | ❌ | ❌ | ❌ |
| **Inventory** (View/Update) | `GET/PATCH` | ✅ | ✅ | ✅ | ❌ |
| **Customers** (All Actions) | `ALL` | ✅ | ✅ | ✅ | ✅ |
| **Sales Transactions** (All) | `ALL` | ✅ | ✅ | ✅ | ✅ |
| **Invoices** (View/Create) | `GET/POST` | ✅ | ✅ | ❌ | ✅ |
| **Invoices** (Update/Delete) | `PUT/DELETE` | ✅ | ✅ | ❌ | ❌ |
| **Payments** (All Actions) | `ALL` | ✅ | ✅ | ❌ | ✅ |
| **CSV Uploads** (Products) | `POST` | ✅ | ✅ | ✅ | ❌ |
| **CSV Uploads** (Sales) | `POST` | ✅ | ✅ | ❌ | ✅ |
| **Audit Logs Summary** | `GET` | ✅ | ✅ | ❌ | ❌ |
| **Low-Stock Alerts** | `GET` | ✅ | ✅ | ✅ | ❌ |
| **Overdue Invoices** | `GET` | ✅ | ✅ | ❌ | ✅ |

---

## 3. Dynamic Notification Filtering
To prevent privilege escalation and unauthorized data access:
* **Overdue Invoices** are dynamically stripped from API notification list results if the user is a `Store Manager` or `Sales Executive` without billing permissions.
* **Low-Stock Alerts** are dynamically stripped from results if the user is a `Sales Executive` without inventory permissions.

---

## 4. Gateway Hardening Policies
1. **Helmet HTTP Headers:** Sets `Content-Security-Policy`, prevents MIME sniffing (`nosniff`), disables Frame inclusion to block Clickjacking (`DENY`), and forces HTTPS via HSTS.
2. **Strict CORS Filter:** Whitelists only configured frontend domains (`CORS_ALLOWED_ORIGINS`).
3. **Payload Limit:** Restricts incoming JSON payloads to `10KB` maximum to defend against Resource Exhaustion Denial of Service (DoS).
4. **Input Sanitization:** Automatically strips XSS script injections and blocks SQL Injection strings (`UNION SELECT`, `' OR 1=1`) at the gateway layer.
5. **Rate Limiting:** Enforces strict 5 req/15 min limit on auth points and 100 req/15 min on data APIs.

---

## 5. Milestone 4 Deployment Security Checklist

Prior to production deployment, complete the following validation steps:

* [ ] **SSL/TLS Certificates:** Verify that Let's Encrypt or AWS ACM SSL certificates are bound, enforcing all client connections to run over HTTPS (Port 443).
* [ ] **Environment Secret Rotation:** Rotate `JWT_SECRET` and database passwords in production, using at least 256-bit cryptographically secure strings.
* [ ] **Database Connection Hardening:** Update the db pool configuration to use SSL with `rejectUnauthorized: true` so that backend-to-database connections are encrypted.
* [ ] **CORS Production Whitelist:** Set `CORS_ALLOWED_ORIGINS` to the exact production domain (no wildcards `*` or localhost references).
* [ ] **Log Level Configurations:** Set `NODE_ENV=production` to disable verbose development error logging, ensuring database schema and trace dumps are not returned to the user.
