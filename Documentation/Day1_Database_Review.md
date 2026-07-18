# Milestone 2 - Day 1 Database Review

## Objective
Review the Milestone 1 database and plan the new Invoice service.

---

## Existing Database Tables

- roles
- users
- customers
- sales_transactions
- invoices

---

## New Service

Invoice Service

---

## Invoice APIs

GET /api/invoices

GET /api/invoices/:id

POST /api/invoices

PUT /api/invoices/:id

DELETE /api/invoices/:id

---

## Database Relationships

customers.customer_id → invoices.customer_id

sales_transactions.sale_id → invoices.sale_id

users.user_id → sales_transactions.user_id

---

## Testing Completed

✓ GET Invoice

✓ GET Invoice by ID

✓ POST Invoice

✓ PUT Invoice

✓ DELETE Invoice

---

## Status

Day 1 Database Review Completed