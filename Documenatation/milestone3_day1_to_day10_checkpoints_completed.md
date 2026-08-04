# Milestone 3 - Day 1 to Day 10 Checkpoints Completion Report
**Project:** MarketMind AI Platform  
**Modules Covered:** Backend Development, Database Storage, Security & API Gateway Hardening  
**Target Folder:** `Documenatation/`

---

## Executive Summary
This document serves as the final sign-off and verification report for **Milestone 3** of the MarketMind AI Platform. Every single daily task and checkpoint spanning from **Day 1 to Day 10** has been successfully completed, verified, and integrated into the primary backend system.

All APIs are secured with Role-Based Access Control (RBAC), sanitized against SQL Injection (SQLi) and Cross-Site Scripting (XSS), rate-limited, paginated, and validated with a suite of automated unit and integration tests yielding a **100% pass rate**.

---

## 1. Day-Wise Checkpoint Completion Matrix

### Intern 1 — Backend & Database Developer (Notifications, Pagination & Bulk Features)

| Day | Task & Scope | Checkpoint Description | Status | Verification Reference / File |
| :---: | :--- | :--- | :---: | :--- |
| **Day 1** | Notification Planning & Rules | • Notification rules defined (low-stock & overdue invoice parameters)<br>• Confirmed Milestone 1/2 dataset reuse<br>• Stand-up plan shared & approved | **[PASS]** | [notificationController.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/controllers/notificationController.js) |
| **Day 2** | Low-Stock Alerts Logic | • Low-stock check logic built (`stock_quantity <= reorder_level`)<br>• Tested against seeded inventory records<br>• Low-stock API response validated<br>• Confirmed no duplicate/fake data was created | **[PASS]** | [notificationController.js:L50-L80](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/controllers/notificationController.js#L50-L80) |
| **Day 3** | Overdue Invoices & Combined API | • Combined Alerts API built (low-stock alerts + overdue invoices)<br>• Verified overdue checks using invoice due dates<br>• API structure fully documented | **[PASS]** | GET `/api/notifications` in [notificationRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/notificationRoutes.js) |
| **Day 4** | Pagination, Filtering & Search | • Added pagination (`page`, `limit`) to Sales, Inventory, and Invoice APIs<br>• Implemented query filter options (date range, status, category)<br>• Validated query logic under heavy load conditions | **[PASS]** | [salesController.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/controllers/salesController.js), [invoiceController.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/controllers/invoiceController.js), [inventoryController.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/controllers/inventoryController.js) |
| **Day 5** | Bulk-Update Features | • Bulk-update API built for invoices (paying multiple at once)<br>• Bulk-update API built for inventory stock adjustments<br>• Handled edge cases (empty lists, non-existent IDs, type mismatches) | **[PASS]** | PATCH `/api/invoices/bulk`, PATCH `/api/inventory/bulk` |
| **Day 6** | Automated Unit Tests | • Written unit tests for invoice creation constraints<br>• Written unit tests for notification rules<br>• Written unit tests for revenue calculations<br>• Verified all unit tests pass locally | **[PASS]** | [unit.test.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/tests/unit.test.js) |
| **Day 7** | Automated Integration Tests | • Integration test suite created checking Sales -> Inventory -> Invoice -> Notification chain<br>• Resolved SIP restricted-port conflict (by moving server to port 5055)<br>• Verified database stock decrement and low-stock alert trigger | **[PASS]** | [integration.test.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/tests/integration.test.js) |
| **Day 8** | RBAC Enforcement & Mappings | • Notifications and Bulk APIs protected by custom user roles<br>• Audited data structure mismatch between backend models and frontend panels<br>• Confirmed visual notifications render properly | **[PASS]** | [notificationRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/notificationRoutes.js), [invoiceRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/invoiceRoutes.js), [inventoryRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/inventoryRoutes.js) |
| **Day 9** | Bug Mitigation & Docker Runs | • Fixed model ReferenceError bug in `customerRoutes.js`<br>• Verified container routing under docker-compose local network<br>• Confirmed 100% test success across core backend services | **[PASS]** | [customerRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/customerRoutes.js) |
| **Day 10** | Teardown Safety & final notes | • Code refactored and comments cleaned up<br>• Added try-finally structure in test setups ensuring ports are released on failure<br>• Created production deployment guide for Milestone 4 | **[PASS]** | [milestone3_backend_db_developer_report.md](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Documenatation/milestone3_backend_db_developer_report.md) |

---

### Intern 2 — Security & API Gateway Developer (API Protection, Rate Limiting & Sanitization)

| Day | Task & Scope | Checkpoint Description | Status | Verification Reference / File |
| :---: | :--- | :--- | :---: | :--- |
| **Day 1** | Security Audit & Modeling | • Audited backend codebase for OWASP API Top 10 vulnerabilities<br>• Documented security gaps (missing rate limiting, raw queries, insecure headers)<br>• Formulated mitigation strategy | **[PASS]** | [milestone3_security_api_engineer_report.md](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Security_APIgateway/milestone3_security_api_engineer_report.md) |
| **Day 2** | Authentication Hardening | • Secured standard routes against anonymous access<br>• Added secure HTTP Header validation middleware | **[PASS]** | [authMiddleware.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/middleware/authMiddleware.js) |
| **Day 3** | Role-Based Access Control | • Enforced role check validation on all critical business routes<br>• Restricted invoice details and payments lists from `Store Manager` role<br>• Restricted reports configuration to Owner and Admin roles | **[PASS]** | [reportRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/reportRoutes.js), [invoiceRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/invoiceRoutes.js), [paymentRoutes.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/routes/paymentRoutes.js) |
| **Day 4** | Input Sanitization Middleware | • Wrote custom middleware filtering query, params, and body structures<br>• Strip HTML tags (XSS protection) and escape single quotes (SQL Injection check)<br>• Blocked prototype pollution attacks | **[PASS]** | [sanitizer.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/middleware/sanitizer.js) |
| **Day 5** | Rate-Limiting & Limits | • Applied `express-rate-limit` configuration globally<br>• Implemented 10KB payload body size limitation to block DoS attempts<br>• Set up rate limit bypass rules for automated E2E test runs | **[PASS]** | [rateLimiter.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/middleware/rateLimiter.js), [app.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/app.js) |
| **Day 6** | Secure Headers & CORS | • Configured Helmet secure headers configuration in Express pipeline<br>• Set up strict CORS configurations blocking unauthorized domains | **[PASS]** | [app.js:L28-L50](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/app.js#L28-L50) |
| **Day 7** | Audit Logging API | • Configured database activity logging middleware capturing request paths, IPs, and user actions<br>• Built a secure aggregated audit API for managers to view transaction histories | **[PASS]** | [activityLogger.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Backend_Dtabase/src/middleware/activityLogger.js), GET `/api/reports/audit-summary` |
| **Day 8** | Security Test Run | • Created 22 automated E2E security verification tests in `Security_APIgateway/security_test.js`<br>• Verified role block validation, rate limits, SQLi evasion, and body bounds | **[PASS]** | [security_test.js](file:///e:/Small-business-sales-intelligence-platform-SB7-Team2/Security_APIgateway/security_test.js) |
| **Day 9-10**| Support & Verification | • Assisted team with container environment routing and solved port sharing binds<br>• Executed regression checks with all security layers enabled | **[PASS]** | `node Security_APIgateway/security_test.js` (100% success) |

---

## 2. Code Verification Logs & Outputs

We ran the complete test suites to verify that both the Backend features and Security policies are operating in absolute alignment:

### A. E2E Security Tests Summary
Run using `node Security_APIgateway/security_test.js`:
```text
=== STARTING AUTOMATED SECURITY TESTS ===
✔ Connected to Database for seeding test roles & users.
✔ Test roles seeded/verified successfully.
✔ Test users seeded successfully.
✔ All test role JWTs successfully generated.

[PASS] Test #1: Auth: Block request without authorization token
[PASS] Test #2: Auth: Block request with malformed token
[PASS] Test #3: RBAC #1: GET /api/reports/churn-risk (Admin Allowed)
[PASS] Test #4: RBAC #2: GET /api/reports/churn-risk (Store Manager Blocked)
[PASS] Test #5: RBAC #3: GET /api/products (Manager Allowed)
[PASS] Test #6: RBAC #4: GET /api/products (Sales Executive Blocked)
[PASS] Test #7: RBAC #5: GET /api/inventory (Manager Allowed)
[PASS] Test #8: RBAC #6: GET /api/inventory (Sales Executive Blocked)
[PASS] Test #9: RBAC #7: GET /api/invoices/revenue-summary (Sales Executive Allowed)
[PASS] Test #10: RBAC #8: GET /api/invoices/revenue-summary (Store Manager Blocked)
[PASS] Test #11: RBAC #9: GET /api/reports/audit-summary (Owner Allowed)
[PASS] Test #12: RBAC #10: GET /api/reports/audit-summary (Sales Executive Blocked)
[PASS] Test #13: RBAC #11: POST /api/upload/products (Sales Executive Blocked)
[PASS] Test #14: RBAC #12: POST /api/upload/sales (Sales Executive Allowed)
[PASS] Test #15: RBAC #13: DELETE /api/invoices/1 (Sales Executive Blocked)
[PASS] Test #16: RBAC #14: DELETE /api/categories/1 (Store Manager Blocked)
[PASS] Test #17: RBAC #15: GET /api/reports/sales (Sales Executive Blocked)
[PASS] Test #18: Sanitization: Block SQL Injection pattern
[PASS] Test #19: Sanitization: XSS script tag stripping validation
[PASS] Test #20: Validation: Block invalid ID param format
[PASS] Test #21: Validation: Block negative amount values
[PASS] Test #22: Rate Limit hit validation (Status: 429 Too Many Requests)

========================================
       SECURITY TESTING REPORT SUMMARY      
========================================
Total Security Checks Run: 22
Passed Security Checks:   22
Failed Security Checks:   0
========================================
✔ Cleanup complete: Temporary test users deleted.
```

### B. Business logic Unit & Integration Tests Summary
Run using `node Backend_Dtabase/tests/unit.test.js` and `node Backend_Dtabase/tests/integration.test.js`:
```text
TAP version 13
# Subtest: Unit Tests - Request Validation Schemas
    ok 1 - createInvoiceSchema - should pass valid invoice input
    ok 2 - createInvoiceSchema - should block negative tax/discount
    ok 3 - createInvoiceSchema - should block empty items array
    ok 4 - createPaymentSchema - should pass valid payment input
    ok 5 - createPaymentSchema - should block negative amount_paid
    ok 6 - idParamSchema - should block non-numeric ID parameter
    ok 7 - getInvoicesQuerySchema - should validate payment_status options
# Subtest: Unit Tests - Revenue Summary Calculation Logic
    ok 1 - Should calculate outstanding balance correctly
    ok 2 - Should determine overdue invoices accurately based on date comparison
1..2
# tests 9
# suites 2
# pass 9
# fail 0

TAP version 13
✅ PostgreSQL Connected Successfully
# Subtest: Integration Tests - Sales -> Inventory -> Invoice -> Notification Chain
    ok 1 - Step 1: Check initial stock quantity is 15
    ok 2 - Step 2: Create invoice purchasing 6 units of test product
    ok 3 - Step 3: Verify inventory stock was automatically decremented to 9
    ok 4 - Step 4: Check if low stock notification has been triggered for the product
    ok 5 - Step 5: Verify GET /api/invoices/revenue-summary returns valid metrics
Integration test server stopped.
1..1
# tests 5
# suites 1
# pass 5
# fail 0
```

---

## 3. Deployment Safety Guidelines

1. **Security Configurations**:
   - Double check that `NODE_ENV=production` is set in environment files to prevent verbose log leaks.
   - Maintain Helmet custom rules and CORS whitelisting constraints.
2. **Database Connection Pool limits**:
   - Production workloads should use connection limit pooling rules inside `db.js` configurations to avoid thread locking.
3. **Database teardowns in Test runners**:
   - Running automated scripts in development/staging will execute setup-teardown automatically without affecting live client schemas.
