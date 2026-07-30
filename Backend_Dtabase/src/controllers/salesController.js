const { pool } = require("../config/db");

// Create Sale (Admin Only)
exports.createSale = async (req, res) => {
  const client = await pool.connect();
  try {
    const { customer_id, product_id, quantity } = req.body;

    // Validation
    if (customer_id === undefined || product_id === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "customer_id, product_id, and quantity are required.",
      });
    }

    if (!Number.isInteger(customer_id) || customer_id <= 0) {
      return res.status(400).json({
        success: false,
        message: "customer_id must be a positive integer.",
      });
    }

    if (!Number.isInteger(product_id) || product_id <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_id must be a positive integer.",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a positive integer.",
      });
    }

    // 1. Check if customer exists
    const customerCheck = await client.query(
      "SELECT * FROM customers WHERE customer_id = $1",
      [customer_id]
    );
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 2. Check if product exists
    const productCheck = await client.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const product = productCheck.rows[0];

    // 3. Check inventory exists and availability
    const inventoryCheck = await client.query(
      "SELECT * FROM inventory WHERE product_id = $1",
      [product_id]
    );
    if (inventoryCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found for this product",
      });
    }
    const inventory = inventoryCheck.rows[0];

    if (inventory.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${inventory.stock_quantity}, Requested: ${quantity}`,
      });
    }

    // Calculate total amount
    const totalAmount = parseFloat(product.price) * quantity;
    const invoiceNo = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Begin Transaction
    await client.query("BEGIN");

    // Reduce inventory stock
    await client.query(
      `UPDATE inventory
       SET stock_quantity = stock_quantity - $1,
           last_updated = CURRENT_TIMESTAMP
       WHERE product_id = $2`,
      [quantity, product_id]
    );

    // Insert into sales_transactions
    const transactionResult = await client.query(
      `INSERT INTO sales_transactions (invoice_no, customer_id, user_id, total_amount, payment_method, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [invoiceNo, customer_id, req.user.id, totalAmount, "Cash", "Paid"]
    );
    const saleTransaction = transactionResult.rows[0];

    // Insert into sales_items
    const itemResult = await client.query(
      `INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, subtotal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [saleTransaction.sale_id, product_id, quantity, product.price, totalAmount]
    );
    const saleItem = itemResult.rows[0];

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Sale created successfully",
      sale: {
        ...saleTransaction,
        item: saleItem,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create sale",
    });
  } finally {
    client.release();
  }
};

// Get All Sales (Authenticated Users)
exports.getSales = async (req, res) => {
  try {
    const { search, start_date, end_date, payment_method, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offsetNum = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM sales_transactions st
      JOIN customers c ON st.customer_id = c.customer_id
      JOIN sales_items si ON st.sale_id = si.sale_id
      JOIN products p ON si.product_id = p.product_id
    `;

    const whereClauses = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      whereClauses.push(`(st.invoice_no ILIKE $${values.length} OR c.customer_name ILIKE $${values.length} OR p.product_name ILIKE $${values.length})`);
    }

    if (start_date) {
      values.push(start_date);
      whereClauses.push(`st.sale_date >= $${values.length}`);
    }

    if (end_date) {
      values.push(end_date);
      whereClauses.push(`st.sale_date <= $${values.length}`);
    }

    if (payment_method) {
      values.push(payment_method);
      whereClauses.push(`st.payment_method = $${values.length}`);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Count query
    const countQuery = `SELECT COUNT(*) AS total ${baseQuery} ${whereStr}`;
    const countRes = await pool.query(countQuery, values);
    const totalItems = parseInt(countRes.rows[0].total, 10);
    const totalPages = Math.ceil(totalItems / limitNum);

    // Rows query
    const dataQuery = `
      SELECT 
        st.sale_id,
        st.invoice_no,
        st.customer_id,
        c.customer_name,
        st.user_id,
        st.total_amount,
        st.payment_method,
        st.payment_status,
        st.sale_date,
        si.sales_item_id,
        si.product_id,
        p.product_name,
        si.quantity,
        si.unit_price,
        si.subtotal
      ${baseQuery}
      ${whereStr}
      ORDER BY st.sale_date DESC, st.sale_id DESC, si.sales_item_id ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const dataRes = await pool.query(dataQuery, [...values, limitNum, offsetNum]);

    res.status(200).json({
      success: true,
      message: "Sales history fetched successfully",
      sales: dataRes.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      }
    });
  } catch (error) {
    console.error("Error in getSales:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales history",
    });
  }
};

// Update Sale (Admin Only) - Allows updating quantity only
exports.updateSale = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validation
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "quantity is required.",
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a positive integer.",
      });
    }

    // 1. Get the existing sale transaction and items
    const saleTransactionResult = await client.query(
      "SELECT * FROM sales_transactions WHERE sale_id = $1",
      [id]
    );

    if (saleTransactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    const salesItemResult = await client.query(
      "SELECT * FROM sales_items WHERE sale_id = $1",
      [id]
    );

    if (salesItemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sale items not found for this sale",
      });
    }

    const oldItem = salesItemResult.rows[0];
    const productId = oldItem.product_id;
    const oldQuantity = oldItem.quantity;
    const unitPrice = parseFloat(oldItem.unit_price);

    // 2. Check inventory availability
    const inventoryResult = await client.query(
      "SELECT * FROM inventory WHERE product_id = $1",
      [productId]
    );

    if (inventoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found for this product",
      });
    }

    const inventory = inventoryResult.rows[0];
    const diff = quantity - oldQuantity;

    // If we are increasing quantity, check stock
    if (diff > 0 && inventory.stock_quantity < diff) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock to increase quantity. Available: ${inventory.stock_quantity}, Additional requested: ${diff}`,
      });
    }

    // Begin Transaction
    await client.query("BEGIN");

    // Adjust stock in inventory
    await client.query(
      `UPDATE inventory
       SET stock_quantity = stock_quantity - $1,
           last_updated = CURRENT_TIMESTAMP
       WHERE product_id = $2`,
      [diff, productId]
    );

    // Calculate new total amount / subtotal
    const newTotalAmount = unitPrice * quantity;

    // Update sales_items
    const updatedItemResult = await client.query(
      `UPDATE sales_items
       SET quantity = $1,
           subtotal = $2
       WHERE sales_item_id = $3
       RETURNING *`,
      [quantity, newTotalAmount, oldItem.sales_item_id]
    );
    const updatedItem = updatedItemResult.rows[0];

    // Update sales_transactions
    const updatedTransactionResult = await client.query(
      `UPDATE sales_transactions
       SET total_amount = $1
       WHERE sale_id = $2
       RETURNING *`,
      [newTotalAmount, id]
    );
    const updatedTransaction = updatedTransactionResult.rows[0];

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Sale updated successfully",
      sale: {
        ...updatedTransaction,
        item: updatedItem,
      },
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update sale",
    });
  } finally {
    client.release();
  }
};

// Delete Sale (Admin Only) - Restores inventory stock automatically
exports.deleteSale = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // 1. Get the existing sale items to know what to restore
    const salesItemsResult = await client.query(
      "SELECT * FROM sales_items WHERE sale_id = $1",
      [id]
    );

    if (salesItemsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Begin Transaction
    await client.query("BEGIN");

    // Restore inventory stock for each sales item
    for (const item of salesItemsResult.rows) {
      await client.query(
        `UPDATE inventory
         SET stock_quantity = stock_quantity + $1,
             last_updated = CURRENT_TIMESTAMP
         WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    // Delete sale transaction (this cascades to sales_items automatically)
    const result = await client.query(
      "DELETE FROM sales_transactions WHERE sale_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Sale deleted successfully",
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete sale",
    });
  } finally {
    client.release();
  }
};
