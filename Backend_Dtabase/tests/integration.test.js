// ============================================================================
// MarketMind AI - Backend Integration Tests
// Module: Integration Testing (Milestone 3 Day 7)
// ============================================================================

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const bcrypt = require("bcrypt");

// Set backend node_modules search path
module.paths.push(path.join(__dirname, "../node_modules"));

const app = require("../src/app");
const { pool, connectDB } = require("../src/config/db");

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

test.describe("Integration Tests - Sales -> Inventory -> Invoice -> Notification Chain", () => {
  let server;
  let adminToken = "";
  const testEmail = "integration.admin@marketmind.com";
  const testPhone = "9998887776";
  const testPass = "TestPass@123";
  let testUserId;
  let testProductId;

  test.before(async () => {
    // 1. Ensure DB connection is active
    await connectDB();

    // 2. Start local integration test server
    server = app.listen(TEST_PORT, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    // 3. Clear any existing test data to ensure clean run
    const existingUserRes = await pool.query("SELECT user_id FROM users WHERE email = $1 OR phone = $2", [testEmail, testPhone]);
    if (existingUserRes.rows.length > 0) {
      const existingUserId = existingUserRes.rows[0].user_id;
      await pool.query("DELETE FROM invoice_items WHERE invoice_id IN (SELECT invoice_id FROM invoices WHERE user_id = $1)", [existingUserId]);
      await pool.query("DELETE FROM invoices WHERE user_id = $1", [existingUserId]);
    }
    await pool.query("DELETE FROM users WHERE email = $1 OR phone = $2", [testEmail, testPhone]);

    // 4. Create Test Roles (specifically Admin/1 if not exists)
    await pool.query(
      "INSERT INTO roles (role_id, role_name, description) VALUES (1, 'System Administrator', 'Admin access') ON CONFLICT (role_id) DO NOTHING"
    );

    // 5. Seed Test Admin User
    const hashedPassword = await bcrypt.hash(testPass, 10);
    const userRes = await pool.query(
      `INSERT INTO users (full_name, email, password, phone, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id`,
      ["Integration Admin", testEmail, hashedPassword, testPhone, 1]
    );
    testUserId = userRes.rows[0].user_id;

    // 6. Authenticate and retrieve JWT token
    let loginRes;
    try {
      loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-test-rate-limit": "true" },
        body: JSON.stringify({ email: testEmail, password: testPass })
      });
    } catch (err) {
      console.error("Fetch failed in before hook! Cause:", err.cause);
      throw err;
    }
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, "Test login failed");
    adminToken = loginData.token;

    // 7. Seed Test Customer if not exists
    await pool.query(
      "INSERT INTO customers (customer_id, customer_name, email, phone) VALUES (999, 'Test Customer', 'test.cust@integration.com', '1231231234') ON CONFLICT (customer_id) DO NOTHING"
    );

    // 8. Seed Test Category & Product with Inventory
    await pool.query(
      "INSERT INTO categories (category_id, category_name, description) VALUES (999, 'Test Integration Cat', 'Unit testing category') ON CONFLICT (category_id) DO NOTHING"
    );

    const productRes = await pool.query(
      `INSERT INTO products (product_name, category_id, price, description)
       VALUES ($1, $2, $3, $4)
       RETURNING product_id`,
      ["Test Integration Product", 999, 50.00, "Product used for testing the stock and notification chain"]
    );
    testProductId = productRes.rows[0].product_id;

    // Seed inventory: Stock = 15, Reorder Level = 10
    await pool.query(
      `INSERT INTO inventory (product_id, stock_quantity, reorder_level, warehouse_location)
       VALUES ($1, $2, $3, $4)`,
      [testProductId, 15, 10, "Aisle 99"]
    );
  });

  test.after(async () => {
    try {
      // Cleanup seeded integration test data in correct dependency order
      if (testUserId) {
        // 1. Delete invoice items referencing this user's invoices
        await pool.query("DELETE FROM invoice_items WHERE invoice_id IN (SELECT invoice_id FROM invoices WHERE user_id = $1)", [testUserId]);
        // 2. Delete invoices referencing this user
        await pool.query("DELETE FROM invoices WHERE user_id = $1", [testUserId]);
      }

      if (testProductId) {
        // 3. Delete invoice items referencing the test product
        await pool.query("DELETE FROM invoice_items WHERE product_id = $1", [testProductId]);
        // 4. Delete inventory referencing the test product
        await pool.query("DELETE FROM inventory WHERE product_id = $1", [testProductId]);
        // 5. Delete test product
        await pool.query("DELETE FROM products WHERE product_id = $1", [testProductId]);
      }

      // 6. Delete categories and customers
      await pool.query("DELETE FROM categories WHERE category_id = 999");
      await pool.query("DELETE FROM customers WHERE customer_id = 999");
      
      if (testUserId) {
        // 7. Delete test user
        await pool.query("DELETE FROM users WHERE user_id = $1", [testUserId]);
      }
    } catch (err) {
      console.error("❌ Cleanup failed:", err.message);
    } finally {
      // Close express server and pool connection
      if (server) {
        server.close();
        console.log("Integration test server stopped.");
      }
    }
  });

  test.it("Step 1: Check initial stock quantity is 15", async () => {
    const invRes = await pool.query("SELECT stock_quantity FROM inventory WHERE product_id = $1", [testProductId]);
    assert.strictEqual(invRes.rows[0].stock_quantity, 15, "Initial stock should be 15");
  });

  test.it("Step 2: Create invoice purchasing 6 units of test product (stock will decrease 15 -> 9, triggering reorder warning <= 10)", async () => {
    const invoicePayload = {
      customer_id: 999,
      user_id: testUserId,
      due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      tax: 0,
      discount: 0,
      notes: "Integration test invoice",
      payment_status: "Unpaid",
      items: [
        { product_id: testProductId, quantity: 6 }
      ]
    };

    const res = await fetch(`${BASE_URL}/api/invoices`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify(invoicePayload)
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201, `Failed to create invoice: ${JSON.stringify(data)}`);
    assert.strictEqual(data.success, true);
  });

  test.it("Step 3: Verify inventory stock was automatically decremented to 9", async () => {
    const invRes = await pool.query("SELECT stock_quantity FROM inventory WHERE product_id = $1", [testProductId]);
    assert.strictEqual(invRes.rows[0].stock_quantity, 9, "Stock should be 9 after invoice creation");
  });

  test.it("Step 4: Check if low stock notification has been triggered for the product", async () => {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);

    const lowStockAlert = data.notifications.find(n => n.type === "low_stock" && n.metadata.product_id === testProductId);
    assert.ok(lowStockAlert, "Low stock notification should be triggered for the product");
    assert.strictEqual(lowStockAlert.metadata.stock_quantity, 9, "Notification stock should reflect current stock");
  });

  test.it("Step 5: Verify GET /api/invoices/revenue-summary returns valid metrics", async () => {
    const res = await fetch(`${BASE_URL}/api/invoices/revenue-summary`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${adminToken}` }
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok("totalRevenue" in data, "Summary response should calculate total revenue");
    assert.ok("totalOutstanding" in data, "Summary response should calculate total outstanding balance");
  });
});
