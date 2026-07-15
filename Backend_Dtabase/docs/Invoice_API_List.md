# Invoice API List

This document lists the REST API endpoints available for the **Invoice** module in the MarketMind AI application.

All routes are prefixed with `/api/invoices`.

## Endpoints Summary

| Endpoint | Method | Description | Authentication Required |
|---|---|---|---|
| `/api/invoices` | `POST` | Create a new invoice with its items | Yes (JWT Token via Bearer header) |
| `/api/invoices` | `GET` | Retrieve a list of all invoices | Yes (JWT Token via Bearer header) |
| `/api/invoices/:id` | `GET` | Retrieve details of a single invoice by its ID | Yes (JWT Token via Bearer header) |
| `/api/invoices/:id` | `PUT` | Update details of a specific invoice | Yes (JWT Token via Bearer header) |
| `/api/invoices/:id` | `DELETE` | Delete a specific invoice and its items | Yes (JWT Token via Bearer header) |

---

## Detailed Endpoints Specification

### 1. Create Invoice
* **Endpoint:** `/api/invoices`
* **Method:** `POST`
* **Description:** Creates a new invoice and returns its basic skeleton details.
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
    "message": "Invoice created successfully (Skeleton)"
  }
  ```

### 2. Get All Invoices
* **Endpoint:** `/api/invoices`
* **Method:** `GET`
* **Description:** Retrieves all invoices.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Invoices fetched successfully (Skeleton)",
    "invoices": []
  }
  ```

### 3. Get Invoice by ID
* **Endpoint:** `/api/invoices/:id`
* **Method:** `GET`
* **Description:** Retrieves a single invoice using the invoice ID parameter.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Invoice with ID <id> fetched successfully (Skeleton)",
    "invoice": {}
  }
  ```

### 4. Update Invoice
* **Endpoint:** `/api/invoices/:id`
* **Method:** `PUT`
* **Description:** Updates the specified invoice using the invoice ID parameter.
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
    "message": "Invoice with ID <id> updated successfully (Skeleton)"
  }
  ```

### 5. Delete Invoice
* **Endpoint:** `/api/invoices/:id`
* **Method:** `DELETE`
* **Description:** Deletes the specified invoice using the invoice ID parameter.
* **Authentication Required:** Yes
* **Headers:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
* **Success Response (Status: 200 OK):**
  ```json
  {
    "success": true,
    "message": "Invoice with ID <id> deleted successfully (Skeleton)"
  }
  ```
