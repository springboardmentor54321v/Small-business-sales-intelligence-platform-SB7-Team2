# MarketMind AI - Reports & Business Intelligence API Guide

This document lists the REST API endpoints available for the **Reporting** module in MarketMind AI.

All routes are prefixed with `/api/reports`.

---

## 1. Endpoints Summary

| Endpoint | Method | Description | Date Filter Support | Auth Required |
|---|---|---|---|---|
| `/api/reports/sales` | `GET` | Retrieve Sales Report with total sales, average sale, paid/unpaid counts | Yes (`start_date`, `end_date`, `payment_status`) | Yes |
| `/api/reports/revenue` | `GET` | Retrieve Revenue Report with payment method breakdown, max/min values | Yes (`start_date`, `end_date`) | Yes |
| `/api/reports/customers` | `GET` | Retrieve Customer Report with total spend, active buyers & summary stats | Yes (`start_date`, `end_date`) | Yes |
| `/api/reports/products` | `GET` | Retrieve Product & Inventory Report with units sold, revenue & valuation | No | Yes |
| `/api/reports/inventory` | `GET` | Alias for Product & Inventory Report | No | Yes |

---

## 2. Endpoints Detail Specification

### 1. Sales Report API
* **Endpoint:** `/api/reports/sales`
* **Method:** `GET`
* **Query Parameters:**
  - `start_date` (ISO Date, Optional) e.g., `2026-07-01`
  - `end_date` (ISO Date, Optional) e.g., `2026-07-31`
  - `payment_status` (String, Optional) `Paid`, `Unpaid`, `Pending`
* **Download-Ready Response Format (Status: `200 OK`):**
```json
{
  "success": true,
  "report_type": "Sales Report",
  "metadata": {
    "generated_at": "2026-07-21T21:37:00.000Z",
    "start_date": "2026-07-01",
    "end_date": "2026-07-31",
    "payment_status_filter": "All",
    "total_records": 2
  },
  "summary": {
    "totalSalesAmount": 270.00,
    "averageSaleAmount": 135.00,
    "totalSalesCount": 2,
    "paidCount": 1,
    "unpaidCount": 0,
    "pendingCount": 1
  },
  "data": [
    {
      "sale_id": 1,
      "invoice_no": "INV-2026-001",
      "customer_id": 1,
      "customer_name": "Alice Smith",
      "payment_method": "Cash",
      "payment_status": "Paid",
      "total_amount": 105.00,
      "sale_date": "2026-07-21"
    }
  ]
}
```

---

### 2. Revenue Report API
* **Endpoint:** `/api/reports/revenue`
* **Method:** `GET`
* **Query Parameters:** `start_date`, `end_date`
* **Download-Ready Response Format (Status: `200 OK`):**
```json
{
  "success": true,
  "report_type": "Revenue Report",
  "metadata": {
    "generated_at": "2026-07-21T21:37:00.000Z",
    "start_date": null,
    "end_date": null,
    "total_records": 2
  },
  "summary": {
    "totalRevenue": 215.00,
    "averagePayment": 107.50,
    "highestPayment": 165.00,
    "lowestPayment": 50.00,
    "totalPaymentsCount": 2
  },
  "paymentMethodBreakdown": [
    {
      "payment_method": "Bank Transfer",
      "total_amount": 165.00,
      "transaction_count": 1
    },
    {
      "payment_method": "Credit Card",
      "total_amount": 50.00,
      "transaction_count": 1
    }
  ],
  "data": [
    {
      "payment_id": 2,
      "invoice_id": 2,
      "invoice_no": "INV-2026-002",
      "customer_name": "Bob Jones",
      "amount_paid": 165.00,
      "payment_method": "Bank Transfer",
      "transaction_reference": "TXN-665544",
      "payment_date": "2026-07-21"
    }
  ]
}
```

---

### 3. Customer Report API
* **Endpoint:** `/api/reports/customers`
* **Method:** `GET`
* **Query Parameters:** `start_date`, `end_date`
* **Download-Ready Response Format (Status: `200 OK`):**
```json
{
  "success": true,
  "report_type": "Customer Report",
  "metadata": {
    "generated_at": "2026-07-21T21:37:00.000Z",
    "start_date": null,
    "end_date": null,
    "total_records": 2
  },
  "summary": {
    "totalCustomers": 2,
    "activeCustomers": 2,
    "totalCustomerSpend": 270.00,
    "averageSpendPerCustomer": 135.00
  },
  "data": [
    {
      "customer_id": 2,
      "customer_name": "Bob Jones",
      "email": "bob.jones@example.com",
      "phone": "5559876543",
      "address": "101 Maple Ave, Mountain View",
      "created_at": "2026-07-21",
      "total_spent": 165.00,
      "total_invoices": 1
    }
  ]
}
```

---

### 4. Product & Inventory Report API
* **Endpoint:** `/api/reports/products` (also `/api/reports/inventory`)
* **Method:** `GET`
* **Download-Ready Response Format (Status: `200 OK`):**
```json
{
  "success": true,
  "report_type": "Product & Inventory Report",
  "metadata": {
    "generated_at": "2026-07-21T21:37:00.000Z",
    "total_records": 2
  },
  "summary": {
    "totalProducts": 2,
    "totalStockQuantity": 15,
    "totalInventoryValue": 450.00,
    "lowStockCount": 1
  },
  "data": [
    {
      "product_id": 2,
      "product_name": "Mechanical Keyboard",
      "category_name": "Electronics",
      "price": 75.00,
      "stock_quantity": 10,
      "reorder_level": 5,
      "warehouse_location": "Shelf B",
      "total_units_sold": 2,
      "total_revenue_generated": 150.00,
      "inventory_value": 750.00
    }
  ]
}
```
