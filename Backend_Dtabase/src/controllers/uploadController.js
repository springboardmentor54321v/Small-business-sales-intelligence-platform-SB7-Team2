const fs = require("fs");
const csv = require("csv-parser");
const { pool } = require("../config/db");

// Helper function to parse CSV stream
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    if (!fs.existsSync(filePath)) {
      return reject(new Error("File does not exist."));
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

/**
 * Upload Products CSV
 * @route POST /api/upload/products
 * @access Private
 */
exports.uploadProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const filePath = req.file.path;
  let inserted = 0;
  let failed = 0;

  try {
    const rows = await parseCSV(filePath);
    const uniqueKeysInFile = new Set();

    for (const row of rows) {
      const productName = row.product_name ? row.product_name.trim() : null;
      const categoryId = row.category_id ? parseInt(row.category_id, 10) : null;
      const price = row.price ? parseFloat(row.price) : null;
      const description = row.description ? row.description.trim() : null;

      // 1. Validation for missing or invalid columns
      if (!productName || isNaN(categoryId) || isNaN(price) || price < 0) {
        failed++;
        continue;
      }

      // 2. Ignore duplicate rows within the CSV file
      const rowKey = `${productName.toLowerCase()}_${categoryId}`;
      if (uniqueKeysInFile.has(rowKey)) {
        failed++;
        continue;
      }
      uniqueKeysInFile.add(rowKey);

      try {
        // 3. Ignore duplicate products that already exist in the database
        const dbCheck = await pool.query(
          "SELECT * FROM products WHERE LOWER(product_name) = LOWER($1) AND category_id = $2",
          [productName, categoryId]
        );
        if (dbCheck.rows.length > 0) {
          failed++;
          continue;
        }

        // 4. Insert row into database (catches foreign key violations on category_id)
        await pool.query(
          `INSERT INTO products (product_name, category_id, price, description)
           VALUES ($1, $2, $3, $4)`,
          [productName, categoryId, price, description]
        );
        inserted++;
      } catch (err) {
        failed++;
      }
    }

    return res.status(200).json({
      success: true,
      inserted,
      failed
    });
  } catch (error) {
    console.error("Error parsing products CSV:", error);
    return res.status(500).json({ success: false, message: "Failed to process CSV file." });
  } finally {
    // Clean up uploaded file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Failed to delete temp file:", err);
    }
  }
};

/**
 * Upload Sales CSV
 * @route POST /api/upload/sales
 * @access Private
 */
exports.uploadSales = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded." });
  }

  const filePath = req.file.path;
  let inserted = 0;
  let failed = 0;

  try {
    const rows = await parseCSV(filePath);
    const uniqueSalesInFile = new Set();

    for (const row of rows) {
      const customerId = row.customer_id ? parseInt(row.customer_id, 10) : null;
      const productId = row.product_id ? parseInt(row.product_id, 10) : null;
      const quantity = row.quantity ? parseInt(row.quantity, 10) : null;
      const paymentMethod = row.payment_method ? row.payment_method.trim() : "Cash";
      const paymentStatus = row.payment_status ? row.payment_status.trim() : "Paid";

      // 1. Validation
      if (
        isNaN(customerId) || customerId <= 0 ||
        isNaN(productId) || productId <= 0 ||
        isNaN(quantity) || quantity <= 0
      ) {
        failed++;
        continue;
      }

      // Prevent duplicate row in same upload file
      const saleKey = `${customerId}_${productId}_${quantity}_${paymentMethod}_${paymentStatus}`;
      if (uniqueSalesInFile.has(saleKey)) {
        failed++;
        continue;
      }
      uniqueSalesInFile.add(saleKey);

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // 2. Validate customer exists
        const customerCheck = await client.query(
          "SELECT * FROM customers WHERE customer_id = $1",
          [customerId]
        );
        if (customerCheck.rows.length === 0) {
          throw new Error("Customer does not exist.");
        }

        // 3. Validate product exists and read price
        const productCheck = await client.query(
          "SELECT * FROM products WHERE product_id = $1",
          [productId]
        );
        if (productCheck.rows.length === 0) {
          throw new Error("Product does not exist.");
        }
        const product = productCheck.rows[0];
        const unitPrice = parseFloat(product.price);

        // 4. Validate inventory level
        const inventoryCheck = await client.query(
          "SELECT * FROM inventory WHERE product_id = $1 FOR UPDATE",
          [productId]
        );
        if (inventoryCheck.rows.length === 0) {
          throw new Error("Inventory record not found.");
        }
        const inventory = inventoryCheck.rows[0];
        if (inventory.stock_quantity < quantity) {
          throw new Error("Insufficient stock.");
        }

        // 5. Calculate totals and details
        const subtotal = unitPrice * quantity;
        const invoiceNo = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const userId = req.user.id;

        // 6. Decrease inventory quantity
        await client.query(
          `UPDATE inventory
           SET stock_quantity = stock_quantity - $1,
               last_updated = CURRENT_TIMESTAMP
           WHERE product_id = $2`,
          [quantity, productId]
        );

        // 7. Insert into sales_transactions
        const txResult = await client.query(
          `INSERT INTO sales_transactions (invoice_no, customer_id, user_id, total_amount, payment_method, payment_status)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING sale_id`,
          [invoiceNo, customerId, userId, subtotal, paymentMethod, paymentStatus]
        );
        const saleId = txResult.rows[0].sale_id;

        // 8. Insert into sales_items
        await client.query(
          `INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [saleId, productId, quantity, unitPrice, subtotal]
        );

        await client.query("COMMIT");
        inserted++;
      } catch (err) {
        await client.query("ROLLBACK");
        failed++;
      } finally {
        client.release();
      }
    }

    return res.status(200).json({
      success: true,
      inserted,
      failed
    });
  } catch (error) {
    console.error("Error parsing sales CSV:", error);
    return res.status(500).json({ success: false, message: "Failed to process CSV file." });
  } finally {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Failed to delete temp file:", err);
    }
  }
};
