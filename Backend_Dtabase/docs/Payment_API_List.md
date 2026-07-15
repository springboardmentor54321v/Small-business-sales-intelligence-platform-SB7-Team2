# Payment API List

This document lists the REST API endpoints available for the **Payment** module in the MarketMind AI application.

All routes are prefixed with `/api/payments`.

## Endpoints Summary

| Endpoint | Method | Description | Authentication Required |
|---|---|---|---|
| `/api/payments` | `POST` | Record a new payment transaction against an invoice | Yes (JWT Token via Bearer header) |
| `/api/payments` | `GET` | Retrieve a list of all payments | Yes (JWT Token via Bearer header) |
| `/api/payments/:id` | `GET` | Retrieve details of a single payment by its ID | Yes (JWT Token via Bearer header) |
| `/api/payments/:id` | `PUT` | Update details of a specific payment record | Yes (JWT Token via Bearer header) |
| `/api/payments/:id` | `DELETE` | Delete a specific payment record | Yes (JWT Token via Bearer header) |

---

## Detailed Endpoints Specification

### 1. Create Payment
* **Endpoint:** `/api/payments`
* **Method:** `POST`
* **Description:** Creates a new payment record and returns its basic skeleton details.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Success Response (Status: 201 Created):**
  ```json
  {
    "success": true,
    "message": "Payment created successfully (Skeleton)"
  }
  ```

### 2. Get All Payments
* **Endpoint:** `/api/payments`
* **Method:** `GET`
* **Description:** Retrieves all payment transactions.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Payments fetched successfully (Skeleton)",
    "payments": []
  }
  ```

### 3. Get Payment by ID
* **Endpoint:** `/api/payments/:id`
* **Method:** `GET`
* **Description:** Retrieves a single payment using the payment ID parameter.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Payment with ID <id> fetched successfully (Skeleton)",
    "payment": {}
  }
  ```

### 4. Update Payment
* **Endpoint:** `/api/payments/:id`
* **Method:** `PUT`
* **Description:** Updates the specified payment record using the payment ID parameter.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  Content-Type: application/json
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Payment with ID <id> updated successfully (Skeleton)"
  }
  ```

### 5. Delete Payment
* **Endpoint:** `/api/payments/:id`
* **Method:** `DELETE`
* **Description:** Deletes the specified payment record using the payment ID parameter.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Payment with ID <id> deleted successfully (Skeleton)"
  }
  ```
