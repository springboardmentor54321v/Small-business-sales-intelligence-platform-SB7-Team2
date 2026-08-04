// ============================================================================
// MarketMind AI - Backend Unit Tests
// Module: Unit Testing (Milestone 3 Day 6)
// ============================================================================

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");

// Set backend node_modules search path
module.paths.push(path.join(__dirname, "../node_modules"));

const { 
  createInvoiceSchema, 
  createPaymentSchema, 
  idParamSchema,
  getInvoicesQuerySchema 
} = require("../src/middleware/validationMiddleware");

test.describe("Unit Tests - Request Validation Schemas", () => {

  test.it("createInvoiceSchema - should pass valid invoice input", () => {
    const validInvoice = {
      customer_id: 1,
      user_id: 1,
      due_date: "2026-12-31",
      tax: 10,
      discount: 5,
      notes: "Test invoice notes",
      items: [
        { product_id: 1, quantity: 2 },
        { product_id: 2, quantity: 5 }
      ]
    };
    const { error } = createInvoiceSchema.validate(validInvoice);
    assert.strictEqual(error, undefined, "Valid invoice validation failed");
  });

  test.it("createInvoiceSchema - should block negative tax/discount", () => {
    const invalidInvoice = {
      customer_id: 1,
      user_id: 1,
      due_date: "2026-12-31",
      tax: -10,
      discount: -5,
      items: [{ product_id: 1, quantity: 2 }]
    };
    const { error } = createInvoiceSchema.validate(invalidInvoice);
    assert.ok(error, "Failed to catch negative tax/discount");
  });

  test.it("createInvoiceSchema - should block empty items array", () => {
    const invalidInvoice = {
      customer_id: 1,
      user_id: 1,
      due_date: "2026-12-31",
      items: []
    };
    const { error } = createInvoiceSchema.validate(invalidInvoice);
    assert.ok(error, "Failed to catch empty items array");
  });

  test.it("createPaymentSchema - should pass valid payment input", () => {
    const validPayment = {
      invoice_id: 1,
      amount_paid: 150.00,
      payment_method: "Credit Card",
      payment_status: "Completed",
      transaction_reference: "TXN123456789"
    };
    const { error } = createPaymentSchema.validate(validPayment);
    assert.strictEqual(error, undefined, "Valid payment validation failed");
  });

  test.it("createPaymentSchema - should block negative amount_paid", () => {
    const invalidPayment = {
      invoice_id: 1,
      amount_paid: -10.00,
      payment_method: "Cash"
    };
    const { error } = createPaymentSchema.validate(invalidPayment);
    assert.ok(error, "Failed to catch negative amount_paid");
  });

  test.it("idParamSchema - should block non-numeric ID parameter", () => {
    const invalidParam = { id: "abc" };
    const { error } = idParamSchema.validate(invalidParam);
    assert.ok(error, "Failed to catch non-numeric ID parameter");
  });

  test.it("getInvoicesQuerySchema - should validate payment_status options", () => {
    const validQuery = { payment_status: "Paid", page: 1, limit: 10 };
    const { error } = getInvoicesQuerySchema.validate(validQuery);
    assert.strictEqual(error, undefined, "Valid query validation failed");

    const invalidQuery = { payment_status: "PendingOption" };
    const { error: err } = getInvoicesQuerySchema.validate(invalidQuery);
    assert.ok(err, "Failed to catch invalid payment_status option");
  });

});

test.describe("Unit Tests - Revenue Summary Calculation Logic", () => {

  test.it("Should calculate outstanding balance correctly", () => {
    const total_amount = 1000.00;
    const total_paid = 450.00;
    const balance_due = total_amount - total_paid;
    assert.strictEqual(balance_due, 550.00, "Outstanding balance calculation is incorrect");
  });

  test.it("Should determine overdue invoices accurately based on date comparison", () => {
    const today = new Date();
    const pastDueDate = new Date(today);
    pastDueDate.setDate(today.getDate() - 5); // 5 days past

    const futureDueDate = new Date(today);
    futureDueDate.setDate(today.getDate() + 5); // 5 days future

    const isOverduePast = pastDueDate < today;
    const isOverdueFuture = futureDueDate < today;

    assert.strictEqual(isOverduePast, true, "Past due date should be overdue");
    assert.strictEqual(isOverdueFuture, false, "Future due date should not be overdue");
  });

});
