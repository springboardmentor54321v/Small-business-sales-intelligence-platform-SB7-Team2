const { pool } = require("../config/db");

// Helper function to update invoice payment status based on total paid amount
const syncInvoicePaymentStatus = async (client, invoiceId) => {
  // Get invoice details
  const invoiceRes = await client.query(
    "SELECT total_amount, invoice_no FROM invoices WHERE invoice_id = $1",
    [invoiceId]
  );
  if (invoiceRes.rows.length === 0) return;

  const invoice = invoiceRes.rows[0];
  const totalAmount = parseFloat(invoice.total_amount);

  // Sum all completed payments for this invoice
  const paymentsRes = await client.query(
    "SELECT SUM(amount_paid) as total_paid FROM payments WHERE invoice_id = $1 AND payment_status = 'Completed'",
    [invoiceId]
  );
  const totalPaid = parseFloat(paymentsRes.rows[0].total_paid || 0);

  let newStatus = "Unpaid";
  if (totalPaid >= totalAmount) {
    newStatus = "Paid";
  } else if (totalPaid > 0) {
    newStatus = "Partial";
  }

  // Update Invoices table
  await client.query(
    "UPDATE invoices SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE invoice_id = $2",
    [newStatus, invoiceId]
  );

  // Also search for a matching sales transaction by invoice_no and update its payment_status
  await client.query(
    "UPDATE sales_transactions SET payment_status = $1 WHERE invoice_no = $2",
    [newStatus === "Unpaid" ? "Pending" : newStatus, invoice.invoice_no]
  );
};

// Create Payment
// POST /api/payments
exports.createPayment = async (req, res) => {
  const client = await pool.connect();
  try {
    const { invoice_id, amount_paid, payment_method, transaction_reference, remarks } = req.body;

    if (!invoice_id || amount_paid === undefined) {
      return res.status(400).json({
        success: false,
        message: "invoice_id and amount_paid are required."
      });
    }

    if (parseFloat(amount_paid) < 0) {
      return res.status(400).json({
        success: false,
        message: "amount_paid cannot be negative."
      });
    }

    await client.query("BEGIN");

    // Check if invoice exists
    const invoiceCheck = await client.query("SELECT * FROM invoices WHERE invoice_id = $1", [invoice_id]);
    if (invoiceCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    // Insert payment
    const result = await client.query(
      `INSERT INTO payments (invoice_id, amount_paid, payment_method, payment_status, transaction_reference, remarks)
       VALUES ($1, $2, $3, 'Completed', $4, $5)
       RETURNING *`,
      [invoice_id, amount_paid, payment_method || "Cash", transaction_reference || null, remarks || null]
    );

    const payment = result.rows[0];

    // Sync invoice payment status
    await syncInvoicePaymentStatus(client, invoice_id);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in createPayment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record payment"
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
    const result = await pool.query(
      `SELECT p.*, i.invoice_no, c.customer_name 
       FROM payments p
       LEFT JOIN invoices i ON p.invoice_id = i.invoice_id
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       WHERE p.payment_id = $1`,
      [id]
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

    await client.query("BEGIN");

    // Check payment exists
    const checkRes = await client.query("SELECT * FROM payments WHERE payment_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const oldPayment = checkRes.rows[0];

    const result = await client.query(
      `UPDATE payments 
       SET amount_paid = COALESCE($1, amount_paid),
           payment_method = COALESCE($2, payment_method),
           payment_status = COALESCE($3, payment_status),
           transaction_reference = COALESCE($4, transaction_reference),
           remarks = COALESCE($5, remarks)
       WHERE payment_id = $6
       RETURNING *`,
      [amount_paid, payment_method, payment_status, transaction_reference, remarks, id]
    );

    const updatedPayment = result.rows[0];

    // Sync invoice status
    await syncInvoicePaymentStatus(client, oldPayment.invoice_id);
    if (updatedPayment.invoice_id !== oldPayment.invoice_id) {
      await syncInvoicePaymentStatus(client, updatedPayment.invoice_id);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in updatePayment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment"
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

    await client.query("BEGIN");

    const checkRes = await client.query("SELECT * FROM payments WHERE payment_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    const payment = checkRes.rows[0];

    await client.query("DELETE FROM payments WHERE payment_id = $1", [id]);

    // Sync invoice status
    await syncInvoicePaymentStatus(client, payment.invoice_id);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in deletePayment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment"
    });
  } finally {
    client.release();
  }
};
