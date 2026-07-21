# MarketMind AI - Invoice & Payment Module API Guide

This one-page API usage document describes all REST API endpoints for Invoices, Payments, and Revenue Summary in the **MarketMind AI Platform**.

---

## 1. Overview & RBAC Permissions Matrix

| Endpoint | Method | Description | Auth | Permitted Roles |
|---|---|---|---|---|
| `/api/auth/login` | `POST` | Authenticate user and receive JWT token | No | All Users |
| `/api/invoices` | `POST` | Create a new invoice and deduct stock | Yes | `Business Owner`, `Sales Executive`, `System Administrator` |
| `/api/invoices` | `GET` | List/search/filter invoices | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/invoices/:id` | `GET` | Get single invoice with items and payments | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/invoices/:id` | `PUT` | Update invoice metadata/totals/status | Yes | `Business Owner`, `System Administrator` |
| `/api/invoices/:id` | `DELETE` | Delete invoice and restore stock | Yes | `System Administrator` |
| `/api/invoices/revenue-summary` | `GET` | Calculate overall financial summary | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/payments` | `POST` | Record payment and recalculate status | Yes | `Business Owner`, `Sales Executive`, `System Administrator` |
| `/api/payments` | `GET` | List all recorded payments | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/payments/:id` | `GET` | Get single payment details | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `/api/payments/:id` | `PUT` | Update payment details | Yes | `Business Owner`, `System Administrator` |
| `/api/payments/:id` | `DELETE` | Delete payment and recalculate invoice status | Yes | `System Administrator` |

---

## 2. API Endpoints Specification

### 2.1 Revenue Summary API
* **Endpoint:** `/api/invoices/revenue-summary` (also `/api/invoices/summary`)
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Response (Status 200 OK):**
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

### 2.2 Create Invoice API
* **Endpoint:** `/api/invoices`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
```json
{
  "customer_id": 1,
  "user_id": 1,
  "due_date": "2026-08-15",
  "tax": 10.00,
  "discount": 5.00,
  "notes": "First invoice on platform.",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 2, "quantity": 1 }
  ]
}
```
* **Success Response (Status 201 Created):**
```json
{
  "success": true,
  "invoice_id": 1,
  "invoice_no": "INV-2026-00001",
  "message": "Invoice created successfully"
}
```

---

### 2.3 List, Search & Filter Invoices API
* **Endpoint:** `/api/invoices`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Query Parameters:**
  - `search` (String): Search string matching `invoice_no` or `customer_name`. (e.g. `?search=INV-2026`)
  - `payment_status` / `status` (String): Filter by `Paid`, `Unpaid`, `Partial`, or `Overdue`.
  - `customer_id` (Integer): Filter invoices belonging to a customer.
  - `start_date` / `end_date` (ISO Date): Date range filtering.
  - `overdue` (Boolean): Set to `true` to filter overdue invoices.
* **Success Response (Status 200 OK):**
```json
{
  "success": true,
  "message": "Invoices fetched successfully",
  "count": 1,
  "invoices": [
    {
      "invoice_id": 1,
      "invoice_no": "INV-2026-00001",
      "customer_id": 1,
      "user_id": 1,
      "due_date": "2026-08-15T00:00:00.000Z",
      "subtotal": 125.00,
      "tax": 10.00,
      "discount": 5.00,
      "total_amount": 130.00,
      "payment_status": "Unpaid",
      "customer_name": "Alice Smith",
      "user_name": "Admin User",
      "amount_paid": 0.00,
      "balance_due": 130.00,
      "is_overdue": false,
      "days_overdue": 0
    }
  ]
}
```

---

### 2.4 Record Payment API
* **Endpoint:** `/api/payments`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Body:**
```json
{
  "invoice_id": 1,
  "amount_paid": 50.00,
  "payment_method": "Credit Card",
  "payment_status": "Completed",
  "transaction_reference": "TXN-998877",
  "remarks": "Partial payment online"
}
```
* **Success Response (Status 201 Created):**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "payment": {
    "payment_id": 1,
    "invoice_id": 1,
    "amount_paid": 50.00,
    "payment_method": "Credit Card",
    "payment_status": "Completed",
    "transaction_reference": "TXN-998877"
  },
  "invoice_status": "Partial"
}
```

---

## 3. Error Codes & Handling

| HTTP Status Code | Reason / Description | Error Response Example |
|---|---|---|
| `400 Bad Request` | Missing required fields, invalid Joi schema, negative amount, or overpayment | `{"success": false, "message": "Validation Error", "errors": [...]}` |
| `401 Unauthorized` | Missing or invalid JWT token | `{"success": false, "message": "Not authorized, token failed"}` |
| `403 Forbidden` | Insufficient role permissions | `{"success": false, "message": "Access denied: insufficient permissions"}` |
| `404 Not Found` | Requested invoice or customer does not exist | `{"success": false, "message": "Invoice not found"}` |
| `500 Internal Server Error` | Database connection error or unexpected failure | `{"success": false, "message": "Failed to calculate revenue summary"}` |
