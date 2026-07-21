# Invoice API Documentation

This document lists the REST API endpoints available for the **Invoice** module in the MarketMind AI application.

All routes are prefixed with `/api/invoices`.

---

## 1. Endpoints Summary & RBAC Permissions

| Endpoint | Method | Description | Authentication Required | Roles Permitted |
|---|---|---|---|---|
| `/api/invoices/revenue-summary` | `GET` | Get overall revenue summary metrics directly from invoices & payments | Yes (JWT Bearer) | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/invoices` | `POST` | Create a new invoice and deduct stock | Yes (JWT Bearer) | `Business Owner`, `Sales Executive`, `System Administrator` |
| `/api/invoices` | `GET` | Retrieve a list of all invoices | Yes (JWT Bearer) | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/invoices/:id` | `GET` | Retrieve details of a single invoice by ID | Yes (JWT Bearer) | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/invoices/:id` | `PUT` | Update details of an invoice | Yes (JWT Bearer) | `Business Owner`, `System Administrator` |
| `/api/invoices/:id` | `DELETE` | Delete an invoice and cascade items | Yes (JWT Bearer) | `System Administrator` |

---

## 2. Endpoints Detail Specification

### 1. Get Revenue Summary
* **Endpoint:** `/api/invoices/revenue-summary` (also available at `/api/invoices/summary`)
* **Method:** `GET`
* **Description:** Calculates financial metrics directly from the `invoices` and `payments` PostgreSQL tables using aggregate SQL queries (`SUM`, `COUNT`, `COALESCE`, `GREATEST`).
* **Authentication Required:** Yes (JWT)
* **Permitted Roles:** `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator`

#### Postman Example Request:
**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Postman Example Response (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Revenue summary calculated successfully",
  "totalRevenue": 215.00,
  "totalInvoices": 2,
  "paidInvoices": 1,
  "unpaidInvoices": 0,
  "partialInvoices": 1,
  "totalOutstanding": 55.00,
  "todayCollection": 215.00,
  "thisMonthCollection": 215.00
}
```

---

### 2. Create Invoice
* **Endpoint:** `/api/invoices`
* **Method:** `POST`
* **Description:** Initiates a PostgreSQL transaction to verify customer & products, checks and reduces inventory stock, generates an invoice number automatically, and stores the invoice.
* **Authentication Required:** Yes (JWT)
* **Permitted Roles:** `Business Owner`, `Sales Executive`, `System Administrator`

#### Request Payload fields (Required):
* `customer_id` (Integer, Required) - ID of the customer.
* `user_id` (Integer, Required) - ID of the user/salesperson creating the invoice.
* `due_date` (Date string, Required) - Date when payment is due.
* `items` (Array, Required) - Non-empty array of invoice items:
  * `product_id` (Integer, Required)
  * `quantity` (Integer, Required, > 0)
* `tax` (Numeric, Optional) - Fixed tax amount. Defaults to `0.00`.
* `discount` (Numeric, Optional) - Fixed discount amount. Defaults to `0.00`.
* `notes` (String, Optional) - Custom notes for the invoice.
* `payment_status` (String, Optional) - One of `Paid`, `Unpaid`, `Partial`. Defaults to `Unpaid`.

#### Postman Example Request:
**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "customer_id": 1,
  "user_id": 1,
  "due_date": "2026-08-15",
  "tax": 10.00,
  "discount": 5.00,
  "notes": "First invoice on the new platform.",
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ]
}
```

#### Postman Example Responses:

**A. Success Response (Status: `201 Created`):**
```json
{
  "success": true,
  "invoice_id": 5,
  "invoice_no": "INV-2026-00001",
  "message": "Invoice created successfully"
}
```

**B. Invalid Request Validation Failure (Status: `400 Bad Request`):**
```json
{
  "success": false,
  "message": "Required fields are missing or invalid: customer_id, user_id, due_date, and items[] (non-empty) are required."
}
```

**C. Insufficient Stock (Status: `400 Bad Request`):**
```json
{
  "success": false,
  "message": "Insufficient Stock"
}
```

---

### 3. Get All / Search / Filter Invoices
* **Endpoint:** `/api/invoices`
* **Method:** `GET`
* **Description:** Retrieves all invoices sorted by `invoice_id` in descending order. Supports searching by invoice number or customer name, filtering by payment status (`Paid`, `Unpaid`, `Partial`, `Overdue`), customer ID, date range, and overdue flag. Also returns calculated fields `amount_paid`, `balance_due`, `is_overdue`, and `days_overdue`.
* **Authentication Required:** Yes (JWT)
* **Permitted Roles:** `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator`

#### Supported Query Parameters:
* `search` (String, Optional) - Search term matching `invoice_no` or `customer_name`. (e.g. `?search=INV-2026`)
* `payment_status` / `status` (String, Optional) - Filter by `Paid`, `Unpaid`, `Partial`, or `Overdue`.
* `customer_id` (Integer, Optional) - Filter invoices by customer ID.
* `start_date` / `end_date` (ISO Date string, Optional) - Filter invoices within an invoice date range.
* `overdue` (Boolean, Optional) - Filter overdue invoices when set to `true`.

#### Postman Example Request:
**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```
**URL with Filters:**
```http
GET /api/invoices?search=INV&payment_status=Unpaid&overdue=true
```

#### Postman Example Response (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "count": 1,
  "invoices": [
    {
      "invoice_id": 5,
      "invoice_no": "INV-2026-00001",
      "customer_id": 1,
      "user_id": 1,
      "invoice_date": "2026-07-16T13:00:00.000Z",
      "due_date": "2026-08-15T00:00:00.000Z",
      "subtotal": 125.00,
      "tax": 10.00,
      "discount": 5.00,
      "total_amount": 130.00,
      "payment_status": "Unpaid",
      "notes": "First invoice on the new platform.",
      "created_at": "2026-07-16T13:00:00.000Z",
      "updated_at": "2026-07-16T13:00:00.000Z",
      "customer_name": "Alice Smith",
      "user_name": "Admin Test",
      "amount_paid": 0.00,
      "balance_due": 130.00,
      "is_overdue": false,
      "days_overdue": 0
    }
  ]
}
```

---

### 3. Get Invoice by ID
* **Endpoint:** `/api/invoices/:id`
* **Method:** `GET`
* **Description:** Retrieves a single invoice's details and all its line items by ID.
* **Authentication Required:** Yes (JWT)
* **Permitted Roles:** `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator`

#### Postman Example Request:
**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

#### Postman Example Response (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Invoice fetched successfully",
  "invoice": {
    "invoice_id": 5,
    "invoice_no": "INV-2026-00001",
    "customer_id": 1,
    "user_id": 1,
    "invoice_date": "2026-07-16T13:00:00.000Z",
    "due_date": "2026-08-15T00:00:00.000Z",
    "subtotal": "125.00",
    "tax": "10.00",
    "discount": "5.00",
    "total_amount": "130.00",
    "payment_status": "Unpaid",
    "notes": "First invoice on the new platform.",
    "created_at": "2026-07-16T13:00:00.000Z",
    "updated_at": "2026-07-16T13:00:00.000Z",
    "customer_name": "Alice Smith",
    "customer_email": "alice.smith@example.com",
    "user_name": "Admin Test",
    "items": [
      {
        "invoice_item_id": 12,
        "invoice_id": 5,
        "product_id": 1,
        "quantity": 2,
        "unit_price": "25.00",
        "subtotal": "50.00",
        "product_name": "Wireless Mouse"
      },
      {
        "invoice_item_id": 13,
        "invoice_id": 5,
        "product_id": 2,
        "quantity": 1,
        "unit_price": "75.00",
        "subtotal": "75.00",
        "product_name": "Mechanical Keyboard"
      }
    ]
  }
}
```

---

### 4. Update Invoice
* **Endpoint:** `/api/invoices/:id`
* **Method:** `PUT`
* **Description:** Updates invoice metadata (due_date, payment_status, notes, tax, discount) and recalculates the total.
* **Authentication Required:** Yes (JWT)
* **Permitted Roles:** `Business Owner`, `System Administrator`

#### Request Payload:
```json
{
  "payment_status": "Paid",
  "notes": "Fully paid via credit card."
}
```

#### Postman Example Response (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Invoice updated successfully"
}
```

---

### 5. Delete Invoice
* **Endpoint:** `/api/invoices/:id`
* **Method:** `DELETE`
* **Description:** Deletes the specified invoice and cascades to automatically delete all associated invoice items.
* **Authentication Required:** Yes (JWT)
* **Permitted Roles:** `System Administrator`

#### Postman Example Response (Status: `200 OK`):
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```
