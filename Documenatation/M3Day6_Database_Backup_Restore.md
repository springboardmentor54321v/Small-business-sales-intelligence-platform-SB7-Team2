# Day 6 – Database Backup and Restore Report

## Project

**MarketMind AI – Small Business Sales Intelligence Platform**

## Role

**Intern 5 – Database & DevOps Engineer**

## Date

**05 August 2026**

---

## Objective

To create a backup of the PostgreSQL database, restore it into a new database, verify the restoration process, identify missing database tables in the Docker environment, and ensure the application database is fully functional.

---

## Environment

- Operating System: macOS
- Database: PostgreSQL 16
- Container Platform: Docker
- Database Container: `devops_integration-database-1`
- Database Name: `marketmind`

---

# Activities Performed

## 1. Started Docker Services

Started all project services using Docker Compose.

```bash
docker compose -f DevOps_Integration/docker-compose.yml up -d
```

Verified running containers.

```bash
docker ps
```

Running Containers:

- Frontend
- Backend
- AI Service
- PostgreSQL Database

---

## 2. Created Database Backup

Created a backup of the Docker PostgreSQL database.

```bash
docker exec devops_integration-database-1 pg_dump -U postgres marketmind > Database/Backups/marketmind_backup.sql
```

Created an additional backup before applying the database fix.

```bash
docker exec devops_integration-database-1 pg_dump -U postgres marketmind > Database/Backups/docker_before_invoice_fix.sql
```

Verified backup files.

```bash
ls -lh Database/Backups
```

Backup Files:

- marketmind_backup.sql
- docker_before_invoice_fix.sql

---

## 3. Tested Database Restore

Created a new PostgreSQL database.

```bash
psql -U postgres -c "CREATE DATABASE marketmind_restore;"
```

Restored the backup.

```bash
psql -U postgres -d marketmind_restore < Database/Backups/marketmind_backup.sql
```

The restore process completed successfully.

---

## 4. Verified Restored Database

Connected to the restored database.

```bash
psql -U postgres -d marketmind_restore
```

Verified tables.

```sql
\dt
```

Verified sample records.

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM sales_transactions;
```

The restored database was verified successfully.

---

## 5. Investigated Database Differences

Compared the Local PostgreSQL database with the Docker PostgreSQL database.

### Local PostgreSQL

- 12 Tables Available

### Docker PostgreSQL

- 9 Tables Available

Missing Tables:

- invoices
- invoice_items
- payments

---

## 6. Root Cause Analysis

Reviewed the project schema and confirmed that the missing tables already existed in:

```
Database/invoice_schema.sql
```

Reviewed backend controllers and verified that the application depends on these tables.

Controllers Reviewed:

- Invoice Controller
- Payment Controller
- Dashboard Controller
- Report Controller

The investigation confirmed that the invoice schema had not been imported into the Docker PostgreSQL database.

---

## 7. Applied Missing Database Schema

Imported the invoice schema into the Docker PostgreSQL database.

```bash
docker exec -i devops_integration-database-1 psql -U postgres -d marketmind < Database/invoice_schema.sql
```

Execution Result:

```
CREATE TABLE
CREATE TABLE
CREATE TABLE
```

Successfully created:

- invoices
- invoice_items
- payments

---

## 8. Verified Updated Database

Connected to the Docker PostgreSQL database.

```bash
docker exec -it devops_integration-database-1 psql -U postgres -d marketmind
```

Verified database tables.

```sql
\dt
```

Database Tables:

- activity_logs
- categories
- customers
- inventory
- invoices
- invoice_items
- payments
- products
- roles
- sales_items
- sales_transactions
- users

**Total Tables: 12**

---

## 9. Tested the Application

Started the application after updating the database.

Verified:

- Docker containers running successfully.
- Backend connected successfully.
- Frontend loaded successfully.
- Dashboard opened successfully.
- Invoice and Payment modules loaded correctly.
- No database relation errors were observed.

The dashboard currently displays zero values because no sample business data has been inserted yet.

---

# Technologies Used

- PostgreSQL
- Docker
- Docker Compose
- Node.js
- Express.js
- React
- SQL
- pg_dump
- psql

---

# Outcome

Successfully completed:

- Docker service verification
- Database backup
- Database restoration
- Restore verification
- Database comparison
- Root cause investigation
- Missing schema identification
- Invoice schema import
- Database verification
- Application testing

---

# Conclusion

The database backup and restore process was successfully completed and verified. Missing invoice-related tables were identified in the Docker PostgreSQL database and imported successfully using the project SQL schema. After verification, the Docker database contained all required tables, and the application operated successfully without any missing database relation errors. The development environment is now ready for future testing with sample or production data.
