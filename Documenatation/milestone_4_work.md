# Milestone 4 Work — Final Testing & Live Deployment Guide
**Project:** MarketMind AI — Small Business Sales Intelligence Platform  
**Target:** Intern 1 (Backend & Database Developer)  
**Goal:** Guide you through final testing, database integration, live server deployment, load testing, and demo preparation in a clear, simple, and step-by-step manner.

---

## Overview

In Milestone 4, the focus shifts from local development (`localhost`) to a **Live Production Environment**. By the end of this milestone, your backend APIs will be running on a public server (Render/Railway), reading from a cloud database (Supabase/Neon), and successfully responding to requests from the deployed React frontend.

---

## Pre-requisites & Tools Needed

Before starting, ensure you have access to:
1.  **Postman** or **Thunder Client** (for API testing).
2.  **Apache Bench (ab)** (for load testing. Pre-installed on macOS/Linux; for Windows, it comes with Apache or can be run via WSL).
3.  **Render** (render.com) or **Railway** (railway.app) free tier accounts for deployment.
4.  **Supabase** (supabase.com) or **Neon** (neon.tech) account for hosting the cloud PostgreSQL database.

---

## Day-by-Day Simplified Action Plan

### Day 1: API Inspection & Bug Hunting
**Goal:** Review all backend APIs built in Milestones 1–3 and catalog any errors before pushing to the cloud.

*   **What to Do:**
    1.  Start your local server:
        ```bash
        cd Backend_Dtabase
        npm run dev
        ```
    2.  Open Postman and execute requests against all core endpoints:
        *   `POST /api/auth/register` and `/api/auth/login`
        *   `POST /api/invoices` (test creating an invoice with valid and invalid stocks)
        *   `GET /api/notifications` (verify that low stock and overdue invoices show up)
        *   `GET /api/reports/sales` (check date filtering: `?start_date=2026-08-01&end_date=2026-08-10`)
    3.  Confirm that the test database uses the exact same sample dataset seeded in Milestone 1. Do not overwrite or change this schema.
    4.  Create a simple file `known_bugs.txt` in your project folder if you discover any crash loops or formatting errors.
*   **Checkpoints:**
    - [ ] List of all APIs reviewed.
    - [ ] Documented any bugs found.
    - [ ] Checked that database schema uses the original dataset.

---

### Day 2: Error Handling Hardening & Bug Fixing
**Goal:** Fix the issues found on Day 1 and ensure the server is robust enough to handle malformed requests without crashing.

*   **What to Do:**
    1.  Fix the critical bugs listed on Day 1 (such as database query formatting, validation bugs, or path mismatch).
    2.  Improve route controllers: Make sure all database queries are wrapped in `try-catch` blocks and errors are passed to the global handler:
        ```javascript
        try {
          // database query code
        } catch (error) {
          next(error); // Routes to Express centralized error handler
        }
        ```
    3.  Verify the server does not expose raw stack traces to the client in production mode.
    4.  Run unit tests to verify your code alterations didn't break core business rules:
        ```bash
        node tests/unit.test.js
        ```
*   **Checkpoints:**
    - [ ] Bugs fixed and tested.
    - [ ] central error handler in `app.js` catches all uncaught exceptions.
    - [ ] Bad requests (such as negative numbers or missing parameters) return a friendly `400 Bad Request` instead of crashing the server.
    - [ ] Unit tests pass successfully.

---

### Day 3: Environment Variables & Live Deployment
**Goal:** Secure your secrets and deploy the backend container to Render or Railway.

*   **What to Do:**
    1.  Verify that all sensitive data in your files has been removed and replaced with `process.env`. Double-check the following in your database config (`db.js`):
        *   `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
        *   `JWT_SECRET`
    2.  Push your final code branch to GitHub.
    3.  **Deployment Steps (e.g., Render Web Service):**
        *   Connect your GitHub repository.
        *   Select the `Backend_Dtabase` directory.
        *   Set **Build Command** to `npm install`.
        *   Set **Start Command** to `npm start`.
        *   Add Environment Variables matching your local `.env` values (point the database variables to your live Supabase/Neon cloud database URL).
    4.  Copy the live URL (e.g. `https://marketmind-api.onrender.com`). Run a basic health check:
        ```bash
        curl https://marketmind-api.onrender.com/
        ```
*   **Checkpoints:**
    - [ ] Secrets are moved out of code into `.env`.
    - [ ] App successfully deployed to Render/Railway.
    - [ ] Live URL returns running status.

---

### Day 4: Live Link Testing
**Goal:** Verify that your APIs respond correctly when requested over the public internet.

*   **What to Do:**
    1.  Open Postman. Change the base URL of your endpoints from `http://localhost:5000` to your live URL (e.g., `https://marketmind-api.onrender.com`).
    2.  Register and login to obtain a JWT token.
    3.  Verify that requests (such as fetching reports or notifications) succeed.
    4.  Check the cloud database (using Supabase dashboard) to confirm that the entries correspond to the actions performed on the live link.
*   **Checkpoints:**
    - [ ] Deployed APIs successfully respond to requests.
    - [ ] Verified database records update properly in the cloud database.
    - [ ] Resolved any deployment-specific errors (e.g., CORS errors or database connect timeouts).

---

### Day 5: Cross-Intern Integration (Frontend & Security)
**Goal:** Connect the frontend React app to the live backend and double-check roles.

*   **What to Do:**
    1.  Work with **Intern 3 (Frontend)**. Provide them with your live backend URL to set as `VITE_API_URL` in their configuration.
    2.  Test the full login-to-dashboard workflow from their deployed React app.
    3.  Work with **Intern 2 (Security)**. Attempt to make requests to the live backend using wrong roles (e.g., accessing audit logs as a Sales Executive) and verify they are correctly rejected with a `403 Forbidden` status.
*   **Checkpoints:**
    - [ ] Deployed frontend and backend communicate successfully.
    - [ ] Role checks and security validation are functional on the live link.

---

### Day 6: Performance Load Testing
**Goal:** Run traffic tests against the live API to check performance constraints.

*   **What to Do:**
    1.  Open your terminal.
    2.  Run Apache Bench to send 100 requests (with a concurrency of 10) to a public endpoint:
        ```bash
        ab -n 100 -c 10 https://your-backend-url/
        ```
    3.  Review the output metrics:
        *   **Failed requests:** Should be 0.
        *   **Time per request (mean):** Indicates the server latency.
        *   **Requests per second:** Shows the maximum throughput.
    4.  Note down these statistics for the performance section of the documentation.
*   **Checkpoints:**
    - [ ] Load test completed.
    - [ ] Performance metrics documented in `Day8_Test_Report.md` or similar log file.

---

### Day 7: Final Demo Rehearsal
**Goal:** Comment your code, clean up files, and participate in the walkthrough.

*   **What to Do:**
    1.  Inspect your codebase and delete any temporary scripts or unused consoles.
    2.  Ensure code is documented with simple, clear comments.
    3.  Go through the complete flow with your team: Register User -> Login -> Upload Sales -> View Dashboard -> Create Invoice -> Record Payment -> Check Alerts -> Verify AI recommendations.
*   **Checkpoints:**
    - [ ] Walkthrough rehearsed with no bugs.
    - [ ] Code formatted and commented.
    - [ ] Backend is fully ready to hand over.
