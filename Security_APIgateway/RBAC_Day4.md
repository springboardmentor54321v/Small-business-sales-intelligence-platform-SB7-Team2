# Role-Based Access Control (RBAC) - Day 4 Documentation

## 1. What is RBAC?
**Role-Based Access Control (RBAC)** is a method of restricting system access to authorized users based on their organizational roles. In an enterprise system like MarketMind AI, different users perform different duties. Rather than assigning access permissions to individual accounts, permissions are associated with specific roles (e.g., Business Owner, Sales Executive), and users are assigned to those roles.

---

## 2. Why RBAC is Used
* **Security & Confidentiality:** Limits access to sensitive business data (e.g., revenue indicators and churn projections) to authorized administrators.
* **Audit Compliance:** Simplifies management tracking of actions by restricting critical database routines to appropriate personnel.
* **Separation of Duties:** Prevents unauthorized updates or deletions. For instance, store managers can view inventory reports, but only system administrators can delete customer records.
* **Developer Scalability:** Permits role adjustments in a centralized database schema without modifying backend endpoints or hardcoding authorization code.

---

## 3. JWT Authentication & Role Authorization Pipeline
Security authentication uses a two-tier interceptor pattern in Express.js:

1. **`protect` Middleware:**
   * Reads the `Authorization` header.
   * Extracts and verifies the token.
   * Attaches the decoded payload to the `req.user` context.
2. **`authorizeRoles` Middleware:**
   * Reads `req.user.role` (the user's role ID).
   * Queries the database or performs a fast check to see if the user's role matches any allowed role.
   * Passes the request to `next()` if valid; otherwise, returns a `403 Forbidden` response.

---

## 4. AI Report APIs Permission Matrix

The following matrix defines the access rules applied to the AI Report API endpoints:

| Role | Customer Groups | Churn Risk | Recommendations | Anomaly Alerts |
| :--- | :---: | :---: | :---: | :---: |
| **System Administrator** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Business Owner** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Store Manager** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes |
| **Sales Executive** | ❌ No | ❌ No | ✅ Yes | ❌ No |

---

## 5. Protected Endpoints Details & Request Examples

### A. Customer Groups (Customer Segmentation)
* **Endpoint:** `GET /api/reports/customer-groups`
* **RBAC Allowed Roles:** `System Administrator`, `Business Owner`, `Store Manager`
* **Description:** Identifies customer loyalties and buying patterns. Restricted from Sales Executives to protect strategic customer segment statistics.
* **Authorized Request Example:**
  ```http
  GET /api/reports/customer-groups HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer <Store_Manager_JWT>
  ```
* **Authorized Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Customer segmentation groups fetched successfully",
    "customers": [
      { "customer_id": 1, "customer_name": "Alice Smith", "category": "High Value" }
    ]
  }
  ```

### B. Churn Risk (Retention Analysis)
* **Endpoint:** `GET /api/reports/churn-risk`
* **RBAC Allowed Roles:** `System Administrator`, `Business Owner`
* **Description:** Calculates which customers are at risk of leaving the business. Highly strategic financial information, restricted from Store Managers and Sales Executives.
* **Unauthorized Request Example:**
  ```http
  GET /api/reports/churn-risk HTTP/1.1
  Host: localhost:5000
  Authorization: Bearer <Store_Manager_JWT>
  ```
* **Unauthorized Response (`403 Forbidden`):**
  ```json
  {
    "success": false,
    "message": "Access Denied"
  }
  ```

### C. Recommendations (Market Basket Recommendations)
* **Endpoint:** `GET /api/reports/recommendations`
* **RBAC Allowed Roles:** `System Administrator`, `Business Owner`, `Store Manager`, `Sales Executive`
* **Description:** Suggests products frequently bought together. Accessible to all roles, especially Sales Executives who need cross-selling recommendations during sales interactions.

### D. Anomaly Alerts (System Warning Flags)
* **Endpoint:** `GET /api/reports/anomaly-alerts`
* **RBAC Allowed Roles:** `System Administrator`, `Business Owner`, `Store Manager`
* **Description:** Reports overdue unpaid invoices and low-stock items. Restricting access prevents Sales Executives from viewing sensitive audit warnings while allowing Store Managers to oversee warehouse stock alerts.
