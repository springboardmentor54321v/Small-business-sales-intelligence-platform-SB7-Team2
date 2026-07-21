# MarketMind AI - Backend & Database Module

Backend REST API service built with Node.js, Express.js, and PostgreSQL / Supabase.

## API Endpoints

### Invoices Module (`/api/invoices`)

| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/invoices/revenue-summary` | Get financial revenue summary calculated directly from invoices & payments | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `POST` | `/api/invoices` | Create invoice and update inventory stock | Yes | `Business Owner`, `Sales Executive`, `System Administrator` |
| `GET` | `/api/invoices` | List all invoices | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `GET` | `/api/invoices/:id` | Get invoice details by ID | Yes | `Business Owner`, `Sales Executive`, `Store Manager`, `System Administrator` |
| `PUT` | `/api/invoices/:id` | Update invoice metadata | Yes | `Business Owner`, `System Administrator` |
| `DELETE` | `/api/invoices/:id` | Delete invoice | Yes | `System Administrator` |

### Revenue Summary Response Format

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
