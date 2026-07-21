# Dashboard Analytics API Documentation

This document lists the REST API endpoints available for the **Dashboard & Analytics** module in the MarketMind AI application.

All routes are prefixed with `/api/dashboard`.

---

## 1. Endpoints Summary

| Endpoint | Method | Description | Authentication Required |
|---|---|---|---|
| `/api/dashboard` | `GET` | Retrieve overall dashboard analytics (KPIs, recent invoices, top products) | Yes (JWT Bearer) |
| `/api/dashboard/summary` | `GET` | Alias for overall dashboard summary | Yes (JWT Bearer) |
| `/api/dashboard/monthly-revenue` | `GET` | Retrieve monthly revenue breakdown over the past 12 months | Yes (JWT Bearer) |
| `/api/dashboard/top-selling` | `GET` | Retrieve top-selling products by quantity sold & revenue | Yes (JWT Bearer) |
| `/api/dashboard/low-stock` | `GET` | Retrieve low-stock inventory alerts (`stock <= reorder_level`) | Yes (JWT Bearer) |
| `/api/dashboard/recent-invoices` | `GET` | Retrieve recent invoices with customer details | Yes (JWT Bearer) |
| `/api/dashboard/customer-stats` | `GET` | Retrieve customer metrics (total, new this month, active, top buyer) | Yes (JWT Bearer) |

---

## 2. Endpoints Detail Specification

### 1. Main Dashboard Summary Data
* **Endpoint:** `/api/dashboard` (or `/api/dashboard/summary`)
* **Method:** `GET`
* **Authentication Required:** Yes (JWT)
* **Response Example (Status: `200 OK`):**
```json
{
  "success": true,
  "message": "Dashboard analytics fetched successfully",
  "dashboard": {
    "totalRevenue": 215.00,
    "totalInvoices": 2,
    "paidInvoices": 1,
    "unpaidInvoices": 0,
    "partialInvoices": 1,
    "totalCustomers": 2,
    "lowStockProducts": 1,
    "recentInvoices": [],
    "topSellingProducts": []
  }
}
```

---

### 2. Monthly Revenue Analytics
* **Endpoint:** `/api/dashboard/monthly-revenue`
* **Method:** `GET`
* **Authentication Required:** Yes (JWT)
* **Response Example (Status: `200 OK`):**
```json
{
  "success": true,
  "message": "Monthly revenue analytics fetched successfully",
  "monthlyRevenue": [
    {
      "month_name": "Jul 2026",
      "month_key": "2026-07",
      "total_revenue": 215.00
    }
  ]
}
```

---

### 3. Top Selling Products
* **Endpoint:** `/api/dashboard/top-selling?limit=5`
* **Method:** `GET`
* **Authentication Required:** Yes (JWT)
* **Response Example (Status: `200 OK`):**
```json
{
  "success": true,
  "message": "Top selling products fetched successfully",
  "count": 2,
  "topSellingProducts": [
    {
      "product_id": 2,
      "product_name": "Mechanical Keyboard",
      "category_name": "Electronics",
      "price": 75.00,
      "total_quantity_sold": 2,
      "total_revenue": 150.00
    }
  ]
}
```

---

### 4. Low Stock Products
* **Endpoint:** `/api/dashboard/low-stock`
* **Method:** `GET`
* **Authentication Required:** Yes (JWT)
* **Response Example (Status: `200 OK`):**
```json
{
  "success": true,
  "message": "Low stock products fetched successfully",
  "count": 1,
  "lowStockProducts": [
    {
      "inventory_id": 1,
      "product_id": 1,
      "product_name": "Wireless Mouse",
      "category_name": "Electronics",
      "stock_quantity": 4,
      "reorder_level": 10,
      "warehouse_location": "Aisle 3",
      "last_updated": "2026-07-21T15:00:00.000Z"
    }
  ]
}
```

---

### 5. Recent Invoices
* **Endpoint:** `/api/dashboard/recent-invoices?limit=5`
* **Method:** `GET`
* **Authentication Required:** Yes (JWT)
* **Response Example (Status: `200 OK`):**
```json
{
  "success": true,
  "message": "Recent invoices fetched successfully",
  "count": 2,
  "recentInvoices": [
    {
      "invoice_id": 2,
      "invoice_no": "INV-2026-002",
      "customer_id": 2,
      "customer_name": "Bob Jones",
      "customer_email": "bob.jones@example.com",
      "total_amount": 165.00,
      "payment_status": "Paid",
      "invoice_date": "2026-07-21T15:00:00.000Z",
      "due_date": "2026-08-20T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Customer Statistics
* **Endpoint:** `/api/dashboard/customer-stats`
* **Method:** `GET`
* **Authentication Required:** Yes (JWT)
* **Response Example (Status: `200 OK`):**
```json
{
  "success": true,
  "message": "Customer statistics fetched successfully",
  "customerStats": {
    "totalCustomers": 2,
    "newCustomersThisMonth": 2,
    "activeCustomers": 2,
    "topCustomer": {
      "customer_id": 2,
      "customer_name": "Bob Jones",
      "email": "bob.jones@example.com",
      "total_spent": 165.00,
      "total_invoices": 1
    }
  }
}
```
