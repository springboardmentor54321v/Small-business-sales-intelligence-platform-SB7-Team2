// ==========================================
// MarketMind AI - Invoice Controller
// Module: Invoice & Payment
// ==========================================

const { pool } = require("../config/db");

// Create Invoice
// POST /api/invoices
exports.createInvoice = async (req, res) => {
  const { customer_id, user_id, due_date, items, tax, discount, notes } = req.body;

  // 1. Validate request fields
  if (!customer_id || !user_id || !due_date || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Required fields are missing or invalid: customer_id, user_id, due_date, and items[] (non-empty) are required."
    });
  }

  // Validate each item
  for (const item of items) {
    if (!item.product_id || typeof item.quantity !== "number" || item.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Each item must have a valid product_id and a positive quantity."
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 2. Verify customer exists
    const customerRes = await client.query("SELECT customer_id FROM customers WHERE customer_id = $1", [customer_id]);
    if (customerRes.rows.length === 0) {
      const err = new Error("Customer not found");
      err.statusCode = 400;
      throw err;
    }

    // 3. Verify user exists
    const userRes = await client.query("SELECT user_id FROM users WHERE user_id = $1", [user_id]);
    if (userRes.rows.length === 0) {
      const err = new Error("User (salesperson) not found");
      err.statusCode = 400;
      throw err;
    }

    // 4. Verify products exist and check inventory stock
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const productRes = await client.query(
        `SELECT p.product_id, p.price, p.product_name, i.stock_quantity 
         FROM products p 
         LEFT JOIN inventory i ON p.product_id = i.product_id 
         WHERE p.product_id = $1`,
        [item.product_id]
      );

      if (productRes.rows.length === 0) {
        const err = new Error(`Product with ID ${item.product_id} does not exist`);
        err.statusCode = 400;
        throw err;
      }

      const product = productRes.rows[0];

      if (product.stock_quantity === null || product.stock_quantity === undefined) {
        const err = new Error(`Inventory record not found for product: ${product.product_name}`);
        err.statusCode = 400;
        throw err;
      }

      if (product.stock_quantity < item.quantity) {
        const err = new Error("Insufficient Stock");
        err.statusCode = 400;
        throw err;
      }

      const unitPrice = parseFloat(product.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      processedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        subtotal: itemSubtotal
      });
    }

    // 5. Generate invoice number automatically (INV-YYYY-XXXXX)
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    // Lock rows starting with this prefix for sequence number generation
    const latestInvoiceRes = await client.query(
      "SELECT invoice_no FROM invoices WHERE invoice_no LIKE $1 ORDER BY invoice_id DESC LIMIT 1 FOR UPDATE",
      [`${prefix}%`]
    );

    let nextSeq = 1;
    if (latestInvoiceRes.rows.length > 0) {
      const latestNo = latestInvoiceRes.rows[0].invoice_no;
      const parts = latestNo.split("-");
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq)) {
        nextSeq = seq + 1;
      }
    }
    const invoice_no = `${prefix}${String(nextSeq).padStart(5, "0")}`;

    // 6. Calculate tax, discount, total_amount
    const taxAmount = tax ? parseFloat(tax) : 0;
    const discountAmount = discount ? parseFloat(discount) : 0;
    const total_amount = subtotal + taxAmount - discountAmount;

    if (total_amount < 0) {
      const err = new Error("Total amount cannot be negative.");
      err.statusCode = 400;
      throw err;
    }

    const paymentStatus = req.body.payment_status || "Unpaid";

    // 7. Insert into invoices table
    const invoiceInsertRes = await client.query(
      `INSERT INTO invoices (invoice_no, customer_id, user_id, due_date, subtotal, tax, discount, total_amount, payment_status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING invoice_id`,
      [
        invoice_no,
        customer_id,
        user_id,
        due_date,
        subtotal,
        taxAmount,
        discountAmount,
        total_amount,
        paymentStatus,
        notes || null
      ]
    );

    const invoiceId = invoiceInsertRes.rows[0].invoice_id;

    // 8. Insert into invoice_items table and reduce stock
    for (const item of processedItems) {
      // Insert item
      await client.query(
        `INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [invoiceId, item.product_id, item.quantity, item.unit_price, item.subtotal]
      );

      // Reduce stock
      await client.query(
        `UPDATE inventory 
         SET stock_quantity = stock_quantity - $1, last_updated = CURRENT_TIMESTAMP
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // 9. Commit transaction
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      invoice_id: invoiceId,
      invoice_no: invoice_no,
      message: "Invoice created successfully"
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in createInvoice:", error);

    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : "Failed to create invoice";

    return res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    client.release();
  }
};

// Get All Invoices (with Search, Filtering, and Overdue calculations)
// GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const { search, payment_status, status, customer_id, start_date, end_date, overdue } = req.query;

    const filterStatus = payment_status || status;

    let whereClauses = [];
    let queryParams = [];
    let paramIndex = 1;

    // Search filter (invoice_no or customer_name)
    if (search && search.trim() !== "") {
      whereClauses.push(`(i.invoice_no ILIKE $${paramIndex} OR c.customer_name ILIKE $${paramIndex})`);
      queryParams.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Customer ID filter
    if (customer_id) {
      whereClauses.push(`i.customer_id = $${paramIndex}`);
      queryParams.push(customer_id);
      paramIndex++;
    }

    // Status filter (Paid, Unpaid, Partial, Overdue)
    if (filterStatus) {
      if (filterStatus === "Overdue") {
        whereClauses.push(`i.due_date < CURRENT_DATE AND i.payment_status != 'Paid'`);
      } else {
        whereClauses.push(`i.payment_status = $${paramIndex}`);
        queryParams.push(filterStatus);
        paramIndex++;
      }
    }

    // Overdue boolean flag filter
    if (overdue === true || overdue === "true") {
      whereClauses.push(`i.due_date < CURRENT_DATE AND i.payment_status != 'Paid'`);
    }

    // Date range filter
    if (start_date) {
      whereClauses.push(`i.invoice_date >= $${paramIndex}`);
      queryParams.push(start_date);
      paramIndex++;
    }

    if (end_date) {
      whereClauses.push(`i.invoice_date <= $${paramIndex}::timestamp + INTERVAL '1 day'`);
      queryParams.push(end_date);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT 
        i.*, 
        c.customer_name, 
        c.email as customer_email,
        u.full_name as user_name,
        COALESCE(p_sum.total_paid, 0) AS amount_paid,
        GREATEST(0, i.total_amount - COALESCE(p_sum.total_paid, 0)) AS balance_due,
        CASE 
          WHEN i.due_date < CURRENT_DATE AND i.payment_status != 'Paid' THEN true 
          ELSE false 
        END AS is_overdue,
        CASE 
          WHEN i.due_date < CURRENT_DATE AND i.payment_status != 'Paid' THEN (CURRENT_DATE - i.due_date::date)
          ELSE 0 
        END AS days_overdue
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.customer_id
      LEFT JOIN users u ON i.user_id = u.user_id
      LEFT JOIN (
        SELECT invoice_id, SUM(amount_paid) AS total_paid
        FROM payments
        WHERE payment_status = 'Completed'
        GROUP BY invoice_id
      ) p_sum ON i.invoice_id = p_sum.invoice_id
      ${whereSql}
      ORDER BY i.invoice_id DESC
    `;

    const result = await pool.query(query, queryParams);

    const invoices = result.rows.map(row => ({
      ...row,
      subtotal: parseFloat(row.subtotal),
      tax: parseFloat(row.tax),
      discount: parseFloat(row.discount),
      total_amount: parseFloat(row.total_amount),
      amount_paid: parseFloat(row.amount_paid),
      balance_due: parseFloat(row.balance_due),
      days_overdue: parseInt(row.days_overdue, 10)
    }));

    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      count: invoices.length,
      invoices
    });
  } catch (error) {
    console.error("Error in getInvoices:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoices"
    });
  }
};

// Get Single Invoice by ID
// GET /api/invoices/:id
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const invoiceRes = await pool.query(
      `SELECT 
        i.*, 
        c.customer_name, 
        c.email as customer_email, 
        u.full_name as user_name,
        COALESCE(p_sum.total_paid, 0) AS amount_paid,
        GREATEST(0, i.total_amount - COALESCE(p_sum.total_paid, 0)) AS balance_due,
        CASE 
          WHEN i.due_date < CURRENT_DATE AND i.payment_status != 'Paid' THEN true 
          ELSE false 
        END AS is_overdue,
        CASE 
          WHEN i.due_date < CURRENT_DATE AND i.payment_status != 'Paid' THEN (CURRENT_DATE - i.due_date::date)
          ELSE 0 
        END AS days_overdue
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN users u ON i.user_id = u.user_id
       LEFT JOIN (
         SELECT invoice_id, SUM(amount_paid) AS total_paid
         FROM payments
         WHERE payment_status = 'Completed'
         GROUP BY invoice_id
       ) p_sum ON i.invoice_id = p_sum.invoice_id
       WHERE i.invoice_id = $1`,
      [id]
    );

    if (invoiceRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    const itemsRes = await pool.query(
      `SELECT ii.*, p.product_name 
       FROM invoice_items ii
       LEFT JOIN products p ON ii.product_id = p.product_id
       WHERE ii.invoice_id = $1`,
      [id]
    );

    const paymentsRes = await pool.query(
      `SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_id DESC`,
      [id]
    );

    const invoice = invoiceRes.rows[0];
    invoice.subtotal = parseFloat(invoice.subtotal);
    invoice.tax = parseFloat(invoice.tax);
    invoice.discount = parseFloat(invoice.discount);
    invoice.total_amount = parseFloat(invoice.total_amount);
    invoice.amount_paid = parseFloat(invoice.amount_paid);
    invoice.balance_due = parseFloat(invoice.balance_due);
    invoice.days_overdue = parseInt(invoice.days_overdue, 10);
    invoice.items = itemsRes.rows.map(item => ({
      ...item,
      unit_price: parseFloat(item.unit_price),
      subtotal: parseFloat(item.subtotal)
    }));
    invoice.payments = paymentsRes.rows.map(pay => ({
      ...pay,
      amount_paid: parseFloat(pay.amount_paid)
    }));

    return res.status(200).json({
      success: true,
      message: "Invoice fetched successfully",
      invoice
    });
  } catch (error) {
    console.error("Error in getInvoiceById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice"
    });
  }
};

// Update Invoice by ID
// PUT /api/invoices/:id
exports.updateInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { due_date, notes, tax, discount, payment_status } = req.body;

    const numInvoiceId = parseInt(id, 10);
    if (isNaN(numInvoiceId) || numInvoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID must be a positive integer."
      });
    }

    await client.query("BEGIN");

    // Lock the invoice row
    const checkRes = await client.query(
      "SELECT * FROM invoices WHERE invoice_id = $1 FOR UPDATE", 
      [numInvoiceId]
    );
    if (checkRes.rows.length === 0) {
      const err = new Error("Invoice not found");
      err.statusCode = 404;
      throw err;
    }

    const invoice = checkRes.rows[0];

    const updatedDueDate = due_date || invoice.due_date;
    const updatedNotes = notes !== undefined ? notes : invoice.notes;
    const updatedTax = tax !== undefined ? parseFloat(tax) : parseFloat(invoice.tax);
    const updatedDiscount = discount !== undefined ? parseFloat(discount) : parseFloat(invoice.discount);

    if (isNaN(updatedTax) || updatedTax < 0) {
      const err = new Error("tax must be a non-negative number.");
      err.statusCode = 400;
      throw err;
    }
    if (isNaN(updatedDiscount) || updatedDiscount < 0) {
      const err = new Error("discount must be a non-negative number.");
      err.statusCode = 400;
      throw err;
    }

    const subtotal = parseFloat(invoice.subtotal);
    const total_amount = subtotal + updatedTax - updatedDiscount;

    if (total_amount < 0) {
      const err = new Error("Total amount cannot be negative.");
      err.statusCode = 400;
      throw err;
    }

    // Get completed payments
    const paymentsRes = await client.query(
      `SELECT COALESCE(SUM(amount_paid), 0) AS total_completed 
       FROM payments 
       WHERE invoice_id = $1 AND payment_status = 'Completed'`,
      [numInvoiceId]
    );
    const totalCompleted = parseFloat(paymentsRes.rows[0].total_completed);

    // Prevent reducing the invoice total amount to be less than the already completed payments amount
    if (total_amount < totalCompleted - 0.005) {
      const err = new Error(`Cannot update invoice: new total amount ($${total_amount.toFixed(2)}) is less than the already paid amount ($${totalCompleted.toFixed(2)}).`);
      err.statusCode = 400;
      throw err;
    }

    // Auto calculate payment status unless explicitly overridden and valid
    let updatedPaymentStatus = payment_status || invoice.payment_status || "Unpaid";
    if (totalCompleted >= total_amount - 0.005) {
      updatedPaymentStatus = "Paid";
    } else if (totalCompleted > 0.005) {
      updatedPaymentStatus = "Partial";
    }

    await client.query(
      `UPDATE invoices 
       SET due_date = $1, payment_status = $2, notes = $3, tax = $4, discount = $5, total_amount = $6, updated_at = CURRENT_TIMESTAMP
       WHERE invoice_id = $7`,
      [updatedDueDate, updatedPaymentStatus, updatedNotes, updatedTax, updatedDiscount, total_amount, numInvoiceId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice_status: updatedPaymentStatus,
      total_amount: total_amount
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in updateInvoice:", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to update invoice";


    return res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    client.release();
  }
};

// Delete Invoice by ID
// DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const numInvoiceId = parseInt(id, 10);

    if (isNaN(numInvoiceId) || numInvoiceId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID must be a positive integer."
      });
    }

    await client.query("BEGIN");

    // Lock the invoice row
    const checkRes = await client.query(
      "SELECT * FROM invoices WHERE invoice_id = $1 FOR UPDATE", 
      [numInvoiceId]
    );
    if (checkRes.rows.length === 0) {
      const err = new Error("Invoice not found");
      err.statusCode = 404;
      throw err;
    }

    // Check if any payments are associated with this invoice
    const paymentsCheck = await client.query(
      "SELECT COUNT(*) as count FROM payments WHERE invoice_id = $1",
      [numInvoiceId]
    );
    const paymentCount = parseInt(paymentsCheck.rows[0].count, 10);
    if (paymentCount > 0) {
      const err = new Error(`Cannot delete invoice: it has ${paymentCount} associated payment record(s). Delete payments first to maintain audit integrity.`);
      err.statusCode = 400;
      throw err;
    }

    // Fetch invoice items to restore stock
    const itemsRes = await client.query(
      "SELECT product_id, quantity FROM invoice_items WHERE invoice_id = $1",
      [numInvoiceId]
    );

    // Restore stock in inventory
    for (const item of itemsRes.rows) {
      await client.query(
        `UPDATE inventory 
         SET stock_quantity = stock_quantity + $1, last_updated = CURRENT_TIMESTAMP
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Delete invoice (cascades to invoice_items automatically)
    await client.query("DELETE FROM invoices WHERE invoice_id = $1", [numInvoiceId]);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully and stock restored."
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in deleteInvoice:", error);

    const statusCode = error.statusCode || 500;
    const message = error.message || "Failed to delete invoice";

    return res.status(statusCode).json({
      success: false,
      message: message
    });
  } finally {
    client.release();
  }
};

// Get Revenue Summary
// GET /api/invoices/revenue-summary
exports.getRevenueSummary = async (req, res) => {
  try {
    const summaryQuery = `
      SELECT
        COALESCE((SELECT SUM(amount_paid) FROM payments WHERE payment_status = 'Completed'), 0) AS total_revenue,
        COALESCE((SELECT COUNT(*) FROM invoices), 0) AS total_invoices,
        COALESCE((SELECT COUNT(*) FROM invoices WHERE payment_status = 'Paid'), 0) AS paid_invoices,
        COALESCE((SELECT COUNT(*) FROM invoices WHERE payment_status = 'Unpaid'), 0) AS unpaid_invoices,
        COALESCE((SELECT COUNT(*) FROM invoices WHERE payment_status = 'Partial'), 0) AS partial_invoices,
        GREATEST(0, COALESCE((SELECT SUM(total_amount) FROM invoices), 0) - COALESCE((SELECT SUM(amount_paid) FROM payments WHERE payment_status = 'Completed'), 0)) AS total_outstanding,
        COALESCE((SELECT SUM(amount_paid) FROM payments WHERE payment_status = 'Completed' AND payment_date >= CURRENT_DATE), 0) AS today_collection,
        COALESCE((SELECT SUM(amount_paid) FROM payments WHERE payment_status = 'Completed' AND payment_date >= date_trunc('month', CURRENT_DATE)), 0) AS this_month_collection;
    `;

    const result = await pool.query(summaryQuery);
    const row = result.rows[0];

    const totalRevenue = parseFloat(row.total_revenue);
    const totalInvoices = parseInt(row.total_invoices, 10);
    const paidInvoices = parseInt(row.paid_invoices, 10);
    const unpaidInvoices = parseInt(row.unpaid_invoices, 10);
    const partialInvoices = parseInt(row.partial_invoices, 10);
    const totalOutstanding = parseFloat(row.total_outstanding);
    const todayCollection = parseFloat(row.today_collection);
    const thisMonthCollection = parseFloat(row.this_month_collection);

    return res.status(200).json({
      success: true,
      message: "Revenue summary calculated successfully",
      totalRevenue,
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      partialInvoices,
      totalOutstanding,
      todayCollection,
      thisMonthCollection
    });
  } catch (error) {
    console.error("Error in getRevenueSummary:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to calculate revenue summary"
    });
  }
};


