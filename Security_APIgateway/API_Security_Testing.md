# API Security Testing - Guidelines & Runbook

This runbook documents the API security testing procedures for authentication, authorization, and input validation checks in MarketMind AI.

---

## 1. Authentication Security Tests

### A. Valid JWT Token
* **Test Objective:** Verify that a request with a valid, non-expired JWT accesses resources.
* **Setup:** Obtain JWT via `/api/auth/login`. Attach as `Authorization: Bearer <VALID_TOKEN>`.
* **Expected Result:** `200 OK` or `201 Created`.

### B. Invalid JWT Token
* **Test Objective:** Verify that requests with tampered or expired tokens are rejected.
* **Setup:** Modify characters in the JWT signature or send an expired token.
* **Expected Result:** `401 Unauthorized`.
* **Response Body:**
  ```json
  {
    "success": false,
    "message": "Invalid or expired token."
  }
  ```

### C. Missing JWT Token
* **Test Objective:** Verify that requests without authorization headers are blocked.
* **Setup:** Omit the `Authorization` header entirely.
* **Expected Result:** `401 Unauthorized`.
* **Response Body:**
  ```json
  {
    "success": false,
    "message": "Access denied. No token provided."
  }
  ```

---

## 2. Authorization (RBAC) Security Tests

We verify role-based routes access by sending valid JWT tokens signed with various database role memberships.

### A. System Administrator & Business Owner (Full Access)
* **Test Route:** `GET /api/reports/churn-risk`
* **Headers:** `Authorization: Bearer <Admin_or_Owner_JWT>`
* **Expected Result:** `200 OK`.

### B. Store Manager (Restricted Access)
* **Test Route:** `GET /api/reports/customer-groups` (Allowed)
  * **Expected Result:** `200 OK`.
* **Test Route:** `GET /api/reports/churn-risk` (Blocked)
  * **Expected Result:** `403 Forbidden` (`Access Denied`).

### C. Sales Executive (Minimum Access)
* **Test Route:** `GET /api/reports/recommendations` (Allowed)
  * **Expected Result:** `200 OK`.
* **Test Route:** `GET /api/reports/customer-groups` (Blocked)
  * **Expected Result:** `403 Forbidden` (`Access Denied`).
* **Test Route:** `GET /api/reports/anomaly-alerts` (Blocked)
  * **Expected Result:** `403 Forbidden` (`Access Denied`).

---

## 3. Input Validation Security Tests

### A. Missing Required Fields
* **Test Endpoint:** `POST /api/invoices`
* **Payload:** Omit `due_date` or `items`.
* **Expected Result:** `400 Bad Request` with list of missing fields.

### B. Invalid Route ID Parameter
* **Test Endpoint:** `GET /api/invoices/abc` (alphanumeric parameter)
* **Expected Result:** `400 Bad Request`.
* **Response Details:** `"id parameter must be a number"`.

### C. Negative Value Boundary Checks
* **Test Endpoint:** `POST /api/payments`
* **Payload:** `{"invoice_id": 1, "amount_paid": -10.00}`
* **Expected Result:** `400 Bad Request`.
* **Response Details:** `"amount_paid must be a positive number greater than 0"`.

### D. Invalid Dates
* **Test Endpoint:** `POST /api/invoices`
* **Payload:** `{"due_date": "2026/13/45"}`
* **Expected Result:** `400 Bad Request`.
* **Response Details:** `"due_date must be in ISO format (YYYY-MM-DD)"`.

### E. Empty Request Body
* **Test Endpoint:** `POST /api/invoices`
* **Payload:** `{}`
* **Expected Result:** `400 Bad Request` listing all required schema elements.

---

## 4. Expected HTTP Response Status Codes Reference

The API Gateway and validation pipelines map request outcomes to the following standard HTTP statuses:

* **`200 OK`**: Requests succeeded. Returned for successful fetches, updates, and deletes.
* **`201 Created`**: Resource successfully created (e.g., invoice created, payment recorded).
* **`400 Bad Request`**: Structural validation failure, Joi schema check failures, negative value bounds, or invalid ID parameter format.
* **`401 Unauthorized`**: Authentication is missing, token signature is invalid, or the JWT has expired.
* **`403 Forbidden`**: RBAC permissions violation. The client has a valid token but lacks roles privileges for the route.
* **`422 Validation Error`**: Schema constraints violated (used in custom complex validation instances).
* **`500 Internal Server Error`**: Database connection drops or unhandled server-side exceptions.
