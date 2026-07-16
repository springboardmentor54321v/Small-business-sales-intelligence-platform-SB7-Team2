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

// Get All Invoices
// GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, c.customer_name, u.full_name as user_name 
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN users u ON i.user_id = u.user_id
       ORDER BY i.invoice_id DESC`
    );
    return res.status(200).json({
      success: true,
      message: "Invoices fetched successfully",
      invoices: result.rows
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
      `SELECT i.*, c.customer_name, c.email as customer_email, u.full_name as user_name 
       FROM invoices i
       LEFT JOIN customers c ON i.customer_id = c.customer_id
       LEFT JOIN users u ON i.user_id = u.user_id
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

    const invoice = invoiceRes.rows[0];
    invoice.items = itemsRes.rows;

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
  try {
    const { id } = req.params;
    const { due_date, payment_status, notes, tax, discount } = req.body;

    const checkRes = await pool.query("SELECT * FROM invoices WHERE invoice_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    const invoice = checkRes.rows[0];

    const updatedDueDate = due_date || invoice.due_date;
    const updatedPaymentStatus = payment_status || invoice.payment_status;
    const updatedNotes = notes !== undefined ? notes : invoice.notes;
    const updatedTax = tax !== undefined ? parseFloat(tax) : parseFloat(invoice.tax);
    const updatedDiscount = discount !== undefined ? parseFloat(discount) : parseFloat(invoice.discount);

    const subtotal = parseFloat(invoice.subtotal);
    const total_amount = subtotal + updatedTax - updatedDiscount;

    await pool.query(
      `UPDATE invoices 
       SET due_date = $1, payment_status = $2, notes = $3, tax = $4, discount = $5, total_amount = $6, updated_at = CURRENT_TIMESTAMP
       WHERE invoice_id = $7`,
      [updatedDueDate, updatedPaymentStatus, updatedNotes, updatedTax, updatedDiscount, total_amount, id]
    );

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully"
    });
  } catch (error) {
    console.error("Error in updateInvoice:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update invoice"
    });
  }
};

// Delete Invoice by ID
// DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const checkRes = await client.query("SELECT * FROM invoices WHERE invoice_id = $1", [id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    // Delete invoice (cascades to invoice_items automatically)
    await client.query("DELETE FROM invoices WHERE invoice_id = $1", [id]);

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully"
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in deleteInvoice:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete invoice"
    });
  } finally {
    client.release();
  }
};

