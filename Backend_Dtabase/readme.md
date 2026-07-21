# MarketMind AI - Backend & Database Module

Production-ready backend REST API service built with **Node.js**, **Express.js**, and **PostgreSQL / Supabase**.

---

## 1. Quick Start & Setup Instructions

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL / Supabase**: Active PostgreSQL instance

### Installation Steps
1. Navigate to backend directory:
   ```bash
   cd Backend_Dtabase
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=aws-0-ap-northeast-1.pooler.supabase.com
   DB_PORT=6543
   DB_NAME=postgres
   DB_USER=postgres.your_project_id
   DB_PASSWORD=your_secure_password
   JWT_SECRET=supersecretkey123_marketmind_ai
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```
4. Run Database Schema Migrations:
   - Execute SQL scripts located in `Database/` folder (`invoice_schema.sql`, `activity_logs_schema.sql`, etc.) on your PostgreSQL instance.
5. Start development server:
   ```bash
   npm run dev
   ```

---

## 2. API Directory & Module Overview

### A. Authentication Module (`/api/auth`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user with hashed password | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | No |
| `GET` | `/api/auth/profile` | Get logged-in user profile | Yes |

### B. Invoices Module (`/api/invoices`)
| Method | Endpoint | Description | Auth | Roles |
|---|---|---|---|---|
| `GET` | `/api/invoices/revenue-summary` | Get financial revenue summary | Yes | Owner, Sales, Manager, Admin |
| `POST` | `/api/invoices` | Create invoice & update inventory stock | Yes | Owner, Sales, Admin |
| `GET` | `/api/invoices` | List invoices with search/filters | Yes | Owner, Sales, Manager, Admin |
| `GET` | `/api/invoices/:id` | Get single invoice details | Yes | Owner, Sales, Manager, Admin |
| `PUT` | `/api/invoices/:id` | Update invoice metadata | Yes | Owner, Admin |
| `DELETE` | `/api/invoices/:id` | Delete invoice | Yes | Admin |

### C. Payments Module (`/api/payments`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/payments` | Process payment & update invoice status | Yes |
| `GET` | `/api/payments` | List payment transactions | Yes |
| `GET` | `/api/payments/:id` | Get single payment detail | Yes |

### D. Dashboard Analytics Module (`/api/dashboard`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/dashboard` | Main dashboard KPI summary | Yes |
| `GET` | `/api/dashboard/monthly-revenue` | 12-month revenue trend | Yes |
| `GET` | `/api/dashboard/top-selling` | Top selling products | Yes |
| `GET` | `/api/dashboard/low-stock` | Low stock inventory alerts | Yes |
| `GET` | `/api/dashboard/recent-invoices` | Latest invoices list | Yes |
| `GET` | `/api/dashboard/customer-stats` | Customer metrics & top spenders | Yes |

### E. Reports Module (`/api/reports`)
| Method | Endpoint | Description | Date Filter | Auth |
|---|---|---|---|---|
| `GET` | `/api/reports/sales` | Sales report with AOV & status counts | Yes (`start_date`, `end_date`) | Yes |
| `GET` | `/api/reports/revenue` | Revenue report with method breakdown | Yes (`start_date`, `end_date`) | Yes |
| `GET` | `/api/reports/customers` | Customer report with total spent | Yes (`start_date`, `end_date`) | Yes |
| `GET` | `/api/reports/products` | Product sales performance & valuation | No | Yes |

---

## 3. Security & Gateway Protections

* **Helmet HTTP Security Headers**: HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff.
* **Rate Limiting**: Strict (5 req/15min) on Auth; Moderate (100 req/15min) on Business APIs.
* **Input Sanitization**: XSS tag stripping, SQLi pattern detection, NoSQL operator removal.
* **Activity Audit Trail**: Asynchronous PostgreSQL event logging in `activity_logs`.
