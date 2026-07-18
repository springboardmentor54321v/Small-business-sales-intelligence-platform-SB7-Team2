// ==========================================
// MarketMind AI - Payment Controller
// Module: Invoice & Payment
// ==========================================

const { pool } = require("../config/db");

// Create Payment
// POST /api/payments
exports.createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { invoice_id, amount_paid, payment_method, payment_status, transaction_reference, remarks } = req.body;

    // 1. Validate request fields
    if (invoice_id === undefined || amount_paid === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing: invoice_id and amount_paid are required."
      });
    }

    const numInvoiceId = parseInt(invoice_id, 10);
    const numAmountPaid = parseFloat(amount_paid);

    if (isNaN(numInvoiceId) || numInvoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "invoice_id must be a positive integer."
      });
    }

    if (isNaN(numAmountPaid) || numAmountPaid <= 0) {
      return res.status(400).json({
        success: false,
        message: "amount_paid must be a positive number."
      });
    }

    // Default status to 'Completed' if not provided
    const status = payment_status || "Completed";
    const allowedStatuses = ["Pending", "Completed", "Failed", "Refunded"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `payment_status must be one of: ${allowedStatuses.join(", ")}`
      });
    }

    if (payment_method && payment_method.length > 50) {
      return res.status(400).json({
        success: false,
        message: "payment_method length must not exceed 50 characters."
      });
    }

    // Start database transaction
    await client.query("BEGIN");

    // 2. Lock invoice row to prevent concurrency updates
    const invoiceRes = await client.query(
      "SELECT * FROM invoices WHERE invoice_id = $1 FOR UPDATE",
      [numInvoiceId]
    );

    if (invoiceRes.rows.length === 0) {
      const err = new Error("Invoice not found");
      err.statusCode = 404;
      throw err;
    }

    const invoice = invoiceRes.rows[0];
    const totalAmount = parseFloat(invoice.total_amount);

    // 3. Calculate sum of already completed payments for this invoice
    const completedPaymentsRes = await client.query(
      `SELECT COALESCE(SUM(amount_paid), 0) AS total_completed 
       FROM payments 
       WHERE invoice_id = $1 AND payment_status = 'Completed'`,
      [numInvoiceId]
    );
    const totalCompletedBefore = parseFloat(completedPaymentsRes.rows[0].total_completed);

    // 4. If status is Completed, check for overpayment
    if (status === "Completed") {
      const remainingBalance = totalAmount - totalCompletedBefore;
      // Use small epsilon for floating-point comparison
      if (numAmountPaid > remainingBalance + 0.005) {
        const err = new Error(`Payment exceeds remaining balance. Due: $${remainingBalance.toFixed(2)}, Paid: $${numAmountPaid.toFixed(2)}`);
        err.statusCode = 400;
        throw err;
      }
    }

    // 5. Insert payment
    const paymentInsertRes = await client.query(
      `INSERT INTO payments (invoice_id, amount_paid, payment_method, payment_status, transaction_reference, remarks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        numInvoiceId,
        numAmountPaid,
        payment_method || null,
        status,
        transaction_reference || null,
        remarks || null
      ]
    );
    const newPayment = paymentInsertRes.rows[0];

    // 6. Recalculate invoice status based on all completed payments (including the new one if completed)
    let totalCompletedAfter = totalCompletedBefore;
    if (status === "Completed") {
      totalCompletedAfter += numAmountPaid;
    }

    let newInvoiceStatus = "Unpaid";
    if (totalCompletedAfter >= totalAmount - 0.005) {
      newInvoiceStatus = "Paid";
    } else if (totalCompletedAfter > 0.005) {
      newInvoiceStatus = "Partial";
    }

    await client.query(
      `UPDATE invoices 
       SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE invoice_id = $2`,
      [newInvoiceStatus, numInvoiceId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment: newPayment,
      invoice_status: newInvoiceStatus
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in createPayment:", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to create payment";

    return res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    client.release();
  }
};

// Get All Payments
// GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, i.invoice_no, c.customer_name 
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.invoice_id
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       ORDER BY p.payment_id DESC`
    );

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      payments: result.rows
    });
  } catch (error) {
    console.error("Error in getPayments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments"
    });
  }
};

// Get Single Payment by ID
// GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const numId = parseInt(id, 10);

    if (isNaN(numId) || numId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment ID must be a positive integer."
      });
    }

    const result = await pool.query(
      `SELECT p.*, i.invoice_no, c.customer_name 
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.invoice_id
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       WHERE p.payment_id = $1`,
      [numId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      payment: result.rows[0]
    });
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment"
    });
  }
};

// Update Payment by ID
// PUT /api/payments/:id
exports.updatePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { amount_paid, payment_method, payment_status, transaction_reference, remarks } = req.body;

    const numPaymentId = parseInt(id, 10);
    if (isNaN(numPaymentId) || numPaymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment ID must be a positive integer."
      });
    }

    await client.query("BEGIN");

    // Lock payment row
    const paymentRes = await client.query(
      "SELECT * FROM payments WHERE payment_id = $1 FOR UPDATE",
      [numPaymentId]
    );

    if (paymentRes.rows.length === 0) {
      const err = new Error("Payment not found");
      err.statusCode = 404;
      throw err;
    }

    const currentPayment = paymentRes.rows[0];
    const invoiceId = currentPayment.invoice_id;

    // Lock invoice row
    const invoiceRes = await client.query(
      "SELECT * FROM invoices WHERE invoice_id = $1 FOR UPDATE",
      [invoiceId]
    );
    if (invoiceRes.rows.length === 0) {
      const err = new Error("Invoice associated with this payment not found");
      err.statusCode = 404;
      throw err;
    }

    const invoice = invoiceRes.rows[0];
    const totalAmount = parseFloat(invoice.total_amount);

    const updatedAmount = amount_paid !== undefined ? parseFloat(amount_paid) : parseFloat(currentPayment.amount_paid);
    if (isNaN(updatedAmount) || updatedAmount <= 0) {
      const err = new Error("amount_paid must be a positive number.");
      err.statusCode = 400;
      throw err;
    }

    const updatedStatus = payment_status !== undefined ? payment_status : currentPayment.payment_status;
    const allowedStatuses = ["Pending", "Completed", "Failed", "Refunded"];
    if (!allowedStatuses.includes(updatedStatus)) {
      const err = new Error(`payment_status must be one of: ${allowedStatuses.join(", ")}`);
      err.statusCode = 400;
      throw err;
    }

    const updatedMethod = payment_method !== undefined ? payment_method : currentPayment.payment_method;
    if (updatedMethod && updatedMethod.length > 50) {
      const err = new Error("payment_method length must not exceed 50 characters.");
      err.statusCode = 400;
      throw err;
    }

    const updatedRef = transaction_reference !== undefined ? transaction_reference : currentPayment.transaction_reference;
    const updatedRemarks = remarks !== undefined ? remarks : currentPayment.remarks;

    // Sum other completed payments
    const otherPaymentsRes = await client.query(
      `SELECT COALESCE(SUM(amount_paid), 0) AS total_completed 
       FROM payments 
       WHERE invoice_id = $1 AND payment_status = 'Completed' AND payment_id != $2`,
      [invoiceId, numPaymentId]
    );
    const totalOtherCompleted = parseFloat(otherPaymentsRes.rows[0].total_completed);

    if (updatedStatus === "Completed") {
      if (totalOtherCompleted + updatedAmount > totalAmount + 0.005) {
        const err = new Error(`Payment update exceeds remaining balance. Due: $${(totalAmount - totalOtherCompleted).toFixed(2)}, Proposed: $${updatedAmount.toFixed(2)}`);
        err.statusCode = 400;
        throw err;
      }
    }

    // Update payment
    const updatePaymentRes = await client.query(
      `UPDATE payments
       SET amount_paid = $1, payment_method = $2, payment_status = $3, transaction_reference = $4, remarks = $5
       WHERE payment_id = $6
       RETURNING *`,
      [updatedAmount, updatedMethod, updatedStatus, updatedRef, updatedRemarks, numPaymentId]
    );
    const updatedPayment = updatePaymentRes.rows[0];

    // Recompute invoice status
    let totalCompletedAfter = totalOtherCompleted;
    if (updatedStatus === "Completed") {
      totalCompletedAfter += updatedAmount;
    }

    let newInvoiceStatus = "Unpaid";
    if (totalCompletedAfter >= totalAmount - 0.005) {
      newInvoiceStatus = "Paid";
    } else if (totalCompletedAfter > 0.005) {
      newInvoiceStatus = "Partial";
    }

    await client.query(
      `UPDATE invoices 
       SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE invoice_id = $2`,
      [newInvoiceStatus, invoiceId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment,
      invoice_status: newInvoiceStatus
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in updatePayment:", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to update payment";

    return res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    client.release();
  }
};

// Delete Payment by ID
// DELETE /api/payments/:id
exports.deletePayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const numPaymentId = parseInt(id, 10);

    if (isNaN(numPaymentId) || numPaymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment ID must be a positive integer."
      });
    }

    await client.query("BEGIN");

    // Lock payment row to find invoice ID
    const paymentRes = await client.query(
      "SELECT * FROM payments WHERE payment_id = $1 FOR UPDATE",
      [numPaymentId]
    );

    if (paymentRes.rows.length === 0) {
      const err = new Error("Payment not found");
      err.statusCode = 404;
      throw err;
    }

    const currentPayment = paymentRes.rows[0];
    const invoiceId = currentPayment.invoice_id;

    // Lock invoice row
    const invoiceRes = await client.query(
      "SELECT * FROM invoices WHERE invoice_id = $1 FOR UPDATE",
      [invoiceId]
    );

    if (invoiceRes.rows.length === 0) {
      const err = new Error("Invoice associated with this payment not found");
      err.statusCode = 404;
      throw err;
    }

    const invoice = invoiceRes.rows[0];
    const totalAmount = parseFloat(invoice.total_amount);

    // Delete payment
    await client.query("DELETE FROM payments WHERE payment_id = $1", [numPaymentId]);

    // Recalculate sum of remaining completed payments
    const completedPaymentsRes = await client.query(
      `SELECT COALESCE(SUM(amount_paid), 0) AS total_completed 
       FROM payments 
       WHERE invoice_id = $1 AND payment_status = 'Completed'`,
      [invoiceId]
    );
    const totalCompletedAfter = parseFloat(completedPaymentsRes.rows[0].total_completed);

    let newInvoiceStatus = "Unpaid";
    if (totalCompletedAfter >= totalAmount - 0.005) {
      newInvoiceStatus = "Paid";
    } else if (totalCompletedAfter > 0.005) {
      newInvoiceStatus = "Partial";
    }

    await client.query(
      `UPDATE invoices 
       SET payment_status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE invoice_id = $2`,
      [newInvoiceStatus, invoiceId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      invoice_status: newInvoiceStatus
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in deletePayment:", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to delete payment";

    return res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    client.release();
  }
};
