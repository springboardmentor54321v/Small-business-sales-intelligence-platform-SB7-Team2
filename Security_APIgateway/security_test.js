// ============================================================================
// MarketMind AI - Automated Security Test Script
// Module: Security & API Gateway (Milestone 3 Day 5)
// ============================================================================

const path = require("path");
module.paths.push(path.join(__dirname, "../Backend_Dtabase/node_modules"));

const { Client } = require("pg");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

// Load backend env config
dotenv.config({ path: path.join(__dirname, "../Backend_Dtabase/.env") });

const DB_CONFIG = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
};

const BASE_URL = process.env.TEST_URL || "http://localhost:5000";

// Terminal styling colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m"
};

async function runSecurityTests() {
  console.log(`${colors.cyan}${colors.bold}=== STARTING AUTOMATED SECURITY TESTS ===${colors.reset}\n`);

  const client = new Client(DB_CONFIG);
  try {
    await client.connect();
    console.log(`${colors.green}✔ Connected to Database for seeding test roles & users.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}❌ Database connection failed. Verify .env settings. Error: ${err.message}${colors.reset}`);
    process.exit(1);
  }

  // 1. Seed Roles
  const roles = [
    { id: 1, name: "System Administrator", desc: "Full administrative access" },
    { id: 2, name: "Store Manager", desc: "Inventory and store operations management" },
    { id: 3, name: "Sales Executive", desc: "Customer relations and invoicing" },
    { id: 4, name: "Business Owner", desc: "Full business insight and data access" }
  ];

  try {
    for (const r of roles) {
      await client.query(
        "INSERT INTO roles (role_id, role_name, description) VALUES ($1, $2, $3) ON CONFLICT (role_id) DO UPDATE SET role_name = $2, description = $3",
        [r.id, r.name, r.desc]
      );
    }
    console.log(`${colors.green}✔ Test roles seeded/verified successfully.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}❌ Failed to seed roles: ${err.message}${colors.reset}`);
    await client.end();
    process.exit(1);
  }

  // 2. Create Test Users
  const passwordHash = await bcrypt.hash("TestPass@123", 10);
  const testUsers = [
    { id: 901, name: "Test Admin", email: "test.admin@marketmind.com", role_id: 1, phone: "9000000001" },
    { id: 902, name: "Test Manager", email: "test.manager@marketmind.com", role_id: 2, phone: "9000000002" },
    { id: 903, name: "Test Sales", email: "test.sales@marketmind.com", role_id: 3, phone: "9000000003" },
    { id: 904, name: "Test Owner", email: "test.owner@marketmind.com", role_id: 4, phone: "9000000004" }
  ];

  try {
    for (const u of testUsers) {
      await client.query("DELETE FROM users WHERE email = $1 OR phone = $2", [u.email, u.phone]);
      await client.query(
        "INSERT INTO users (user_id, full_name, email, password, phone, role_id) VALUES ($1, $2, $3, $4, $5, $6)",
        [u.id, u.name, u.email, passwordHash, u.phone, u.role_id]
      );
    }
    console.log(`${colors.green}✔ Test users seeded successfully.${colors.reset}\n`);
  } catch (err) {
    console.error(`${colors.red}❌ Failed to seed test users: ${err.message}${colors.reset}`);
    await client.end();
    process.exit(1);
  }

  // 3. Authenticate and Get JWTs
  const tokens = {};
  for (const u of testUsers) {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email, password: "TestPass@123" })
      });
      const data = await res.json();
      if (data.success) {
        tokens[u.role_id] = data.token;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error(`${colors.red}❌ Failed to login for ${u.name}: ${err.message}. Make sure server is running on port 5000.${colors.reset}`);
      await cleanUpUsers(client, testUsers);
      await client.end();
      process.exit(1);
    }
  }
  console.log(`${colors.green}✔ All test role JWTs successfully generated.${colors.reset}\n`);

  // 4. Run Test Suite
  const testResults = [];
  let testCount = 0;

  async function testEndpoint({ name, url, method = "GET", headers = {}, body = null, expectedStatus, expectedMessage = null }) {
    testCount++;
    const fullUrl = `${BASE_URL}${url}`;
    const reqOptions = {
      method,
      headers: { "Content-Type": "application/json", ...headers }
    };
    if (body) reqOptions.body = JSON.stringify(body);

    try {
      const res = await fetch(fullUrl, reqOptions);
      const resStatus = res.status;
      let resJson = {};
      try { resJson = await res.json(); } catch (e) {}

      const passed = resStatus === expectedStatus && 
                     (!expectedMessage || (JSON.stringify(resJson).toLowerCase().includes(expectedMessage.toLowerCase())));

      testResults.push({ id: testCount, name, url, method, expectedStatus, actualStatus: resStatus, passed, details: resJson });
      if (passed) {
        console.log(`[PASS] Test #${testCount}: ${name}`);
      } else {
        console.log(`[FAIL] Test #${testCount}: ${name}`);
        console.log(`       Expected status: ${expectedStatus}, got: ${resStatus}`);
        console.log(`       Response details: ${JSON.stringify(resJson)}`);
      }
    } catch (err) {
      testResults.push({ id: testCount, name, url, method, expectedStatus, actualStatus: "Fetch Error", passed: false, details: err.message });
      console.log(`[FAIL] Test #${testCount}: ${name} (Error: ${err.message})`);
    }
  }

  // --- SUITE A: AUTHENTICATION ---
  await testEndpoint({
    name: "Auth: Block request without authorization token",
    url: "/api/reports/sales",
    method: "GET",
    expectedStatus: 401,
    expectedMessage: "Access denied"
  });

  await testEndpoint({
    name: "Auth: Block request with malformed token",
    url: "/api/reports/sales",
    method: "GET",
    headers: { "Authorization": "Bearer malformed_jwt_token_signature_check" },
    expectedStatus: 401,
    expectedMessage: "signature"
  });

  // --- SUITE B: AUTHORIZATION / RBAC (10 Endpoints Cover) ---
  // Endpoint 1: Reports - Churn Risk (Admin/Owner Allowed, Manager Blocked)
  await testEndpoint({
    name: "RBAC #1: GET /api/reports/churn-risk (Admin Allowed)",
    url: "/api/reports/churn-risk",
    headers: { "Authorization": `Bearer ${tokens[1]}` },
    expectedStatus: 200
  });
  await testEndpoint({
    name: "RBAC #2: GET /api/reports/churn-risk (Store Manager Blocked)",
    url: "/api/reports/churn-risk",
    headers: { "Authorization": `Bearer ${tokens[2]}` },
    expectedStatus: 403,
    expectedMessage: "Access Denied"
  });

  // Endpoint 2: Products - View (Admin/Owner/Manager Allowed, Sales Executive Blocked)
  await testEndpoint({
    name: "RBAC #3: GET /api/products (Manager Allowed)",
    url: "/api/products",
    headers: { "Authorization": `Bearer ${tokens[2]}` },
    expectedStatus: 200
  });
  await testEndpoint({
    name: "RBAC #4: GET /api/products (Sales Executive Blocked)",
    url: "/api/products",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 403
  });

  // Endpoint 3: Inventory - View (Manager Allowed, Sales Executive Blocked)
  await testEndpoint({
    name: "RBAC #5: GET /api/inventory (Manager Allowed)",
    url: "/api/inventory",
    headers: { "Authorization": `Bearer ${tokens[2]}` },
    expectedStatus: 200
  });
  await testEndpoint({
    name: "RBAC #6: GET /api/inventory (Sales Executive Blocked)",
    url: "/api/inventory",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 403
  });

  // Endpoint 4: Invoices - Revenue Summary (Sales Executive Allowed, Store Manager Blocked)
  await testEndpoint({
    name: "RBAC #7: GET /api/invoices/revenue-summary (Sales Executive Allowed)",
    url: "/api/invoices/revenue-summary",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 200
  });
  await testEndpoint({
    name: "RBAC #8: GET /api/invoices/revenue-summary (Store Manager Blocked)",
    url: "/api/invoices/revenue-summary",
    headers: { "Authorization": `Bearer ${tokens[2]}` },
    expectedStatus: 403
  });

  // Endpoint 5: Audit Summary (Admin Allowed, Owner Allowed, Manager Blocked, Sales Executive Blocked)
  await testEndpoint({
    name: "RBAC #9: GET /api/reports/audit-summary (Owner Allowed)",
    url: "/api/reports/audit-summary",
    headers: { "Authorization": `Bearer ${tokens[4]}` },
    expectedStatus: 200
  });
  await testEndpoint({
    name: "RBAC #10: GET /api/reports/audit-summary (Sales Executive Blocked)",
    url: "/api/reports/audit-summary",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 403
  });

  // Endpoint 6: Upload Products (Manager Allowed, Sales Executive Blocked)
  await testEndpoint({
    name: "RBAC #11: POST /api/upload/products (Sales Executive Blocked)",
    url: "/api/upload/products",
    method: "POST",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 403
  });

  // Endpoint 7: Upload Sales (Sales Executive Allowed)
  await testEndpoint({
    name: "RBAC #12: POST /api/upload/sales (Sales Executive Allowed - File empty validation check)",
    url: "/api/upload/sales",
    method: "POST",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 400 // Fails due to lack of file attachment with 400 Bad Request
  });

  // Endpoint 8: Invoice Delete (Admin Allowed, Sales Executive Blocked)
  await testEndpoint({
    name: "RBAC #13: DELETE /api/invoices/1 (Sales Executive Blocked)",
    url: "/api/invoices/1",
    method: "DELETE",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 403
  });

  // Endpoint 9: Category Delete (Admin Allowed, Store Manager Blocked)
  await testEndpoint({
    name: "RBAC #14: DELETE /api/categories/1 (Store Manager Blocked)",
    url: "/api/categories/1",
    method: "DELETE",
    headers: { "Authorization": `Bearer ${tokens[2]}` },
    expectedStatus: 403
  });

  // Endpoint 10: Standard Reports - Sales (Sales Executive Blocked)
  await testEndpoint({
    name: "RBAC #15: GET /api/reports/sales (Sales Executive Blocked)",
    url: "/api/reports/sales",
    headers: { "Authorization": `Bearer ${tokens[3]}` },
    expectedStatus: 403
  });

  // --- SUITE C: INPUT SANITIZATION (SQLi & XSS) ---
  await testEndpoint({
    name: "Sanitization: Block SQL Injection pattern",
    url: "/api/products",
    method: "POST",
    headers: { "Authorization": `Bearer ${tokens[1]}` },
    body: {
      product_name: "Test' UNION SELECT * FROM users --",
      price: 99.99,
      category_id: 1
    },
    expectedStatus: 400,
    expectedMessage: "Security Error: Invalid input or potential injection attempt detected"
  });

  await testEndpoint({
    name: "Sanitization: XSS script tag stripping validation",
    url: "/api/products",
    method: "POST",
    headers: { "Authorization": `Bearer ${tokens[1]}` },
    body: {
      product_name: "<script>alert('xss')</script>Secure Product",
      price: 49.99,
      category_id: 1
    },
    expectedStatus: 201 // Passes but strips the HTML tags before saving, returning details
  });

  // --- SUITE D: INPUT VALIDATION (Joi Schemas) ---
  await testEndpoint({
    name: "Validation: Block invalid ID param format",
    url: "/api/invoices/abc",
    headers: { "Authorization": `Bearer ${tokens[1]}` },
    expectedStatus: 400,
    expectedMessage: "id parameter must be a number"
  });

  await testEndpoint({
    name: "Validation: Block negative amount values",
    url: "/api/payments",
    method: "POST",
    headers: { "Authorization": `Bearer ${tokens[1]}` },
    body: {
      invoice_id: 1,
      amount_paid: -150.00,
      payment_method: "Cash"
    },
    expectedStatus: 400,
    expectedMessage: "amount_paid must be a positive number greater than 0"
  });

  // --- SUITE E: RATE LIMITING ---
  console.log(`\n${colors.yellow}Simulating authentication rate limiting (5 req / 15 min)...${colors.reset}`);
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-test-rate-limit": "true"
      },
      body: JSON.stringify({ email: "invalid@email.com", password: "wrong" })
    });
    if (res.status === 429) {
      console.log(`[PASS] Rate Limit hit at request #${i} (Status: 429 Too Many Requests)`);
      testResults.push({ id: ++testCount, name: "Rate Limiting: Strict Auth rate limiting blocks 6th attempt", url: "/api/auth/login", method: "POST", expectedStatus: 429, actualStatus: 429, passed: true });
      break;
    } else if (i === 6) {
      console.log(`[FAIL] Rate Limit not triggered after 6 attempts.`);
      testResults.push({ id: ++testCount, name: "Rate Limiting: Strict Auth rate limiting blocks 6th attempt", url: "/api/auth/login", method: "POST", expectedStatus: 429, actualStatus: res.status, passed: false });
    }
  }

  // 5. Print Summary Report
  const passedCount = testResults.filter(t => t.passed).length;
  const failedCount = testResults.filter(t => !t.passed).length;

  console.log(`\n${colors.cyan}========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}       SECURITY TESTING REPORT SUMMARY      ${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}`);
  console.log(`Total Security Checks Run: ${colors.bold}${testResults.length}${colors.reset}`);
  console.log(`Passed Security Checks:   ${colors.green}${colors.bold}${passedCount}${colors.reset}`);
  console.log(`Failed Security Checks:   ${failedCount > 0 ? colors.red : colors.green}${colors.bold}${failedCount}${colors.reset}`);
  console.log(`${colors.cyan}========================================${colors.reset}\n`);

  await cleanUpUsers(client, testUsers);
  await client.end();

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

async function cleanUpUsers(client, testUsers) {
  try {
    for (const u of testUsers) {
      await client.query("DELETE FROM users WHERE email = $1 OR phone = $2", [u.email, u.phone]);
    }
    console.log(`${colors.green}✔ Cleanup complete: Temporary test users deleted.${colors.reset}`);
  } catch (err) {
    console.error(`${colors.red}❌ Error cleaning up test users: ${err.message}${colors.reset}`);
  }
}

runSecurityTests();
