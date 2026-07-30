const { pool } = require("../config/db");

// Create Inventory (Admin Only)
exports.createInventory = async (req, res) => {
  try {
    const { product_id, quantity, reorder_level } = req.body;

    // Validation
    if (product_id === undefined || quantity === undefined || reorder_level === undefined) {
      return res.status(400).json({
        success: false,
        message: "product_id, quantity, and reorder_level are required.",
      });
    }

    if (!Number.isInteger(product_id) || product_id <= 0) {
      return res.status(400).json({
        success: false,
        message: "product_id must be a positive integer.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative integer.",
      });
    }

    if (!Number.isInteger(reorder_level) || reorder_level < 0) {
      return res.status(400).json({
        success: false,
        message: "reorder_level must be a non-negative integer.",
      });
    }

    // Verify if product exists
    const productCheck = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Verify if inventory already exists for this product
    const inventoryCheck = await pool.query(
      "SELECT * FROM inventory WHERE product_id = $1",
      [product_id]
    );

    if (inventoryCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Inventory record for this product already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO inventory (product_id, stock_quantity, reorder_level)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [product_id, quantity, reorder_level]
    );

    res.status(201).json({
      success: true,
      message: "Inventory created successfully",
      inventory: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create inventory record",
    });
  }
};

// Get All Inventory Records (Authenticated Users)
exports.getInventory = async (req, res) => {
  try {
    const { search, category_id, stock_status, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offsetNum = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM inventory i
      JOIN products p ON i.product_id = p.product_id
    `;

    const whereClauses = [];
    const values = [];

    if (search) {
      values.push(`%${search}%`);
      whereClauses.push(`(p.product_name ILIKE $${values.length} OR i.warehouse_location ILIKE $${values.length})`);
    }

    if (category_id) {
      values.push(parseInt(category_id, 10));
      whereClauses.push(`p.category_id = $${values.length}`);
    }

    if (stock_status) {
      if (stock_status === "low") {
        whereClauses.push(`i.stock_quantity <= i.reorder_level`);
      } else if (stock_status === "normal") {
        whereClauses.push(`i.stock_quantity > i.reorder_level`);
      }
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
        i.inventory_id,
        i.product_id,
        i.stock_quantity,
        i.reorder_level,
        i.warehouse_location,
        i.last_updated,
        p.product_name
      ${baseQuery}
      ${whereStr}
      ORDER BY i.inventory_id ASC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const dataRes = await pool.query(dataQuery, [...values, limitNum, offsetNum]);

    res.status(200).json({
      success: true,
      inventory: dataRes.rows,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      }
    });
  } catch (error) {
    console.error("Error in getInventory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
};

// Update Inventory Record (Admin Only)
exports.updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reorder_level } = req.body;

    // Validation
    if (quantity === undefined || reorder_level === undefined) {
      return res.status(400).json({
        success: false,
        message: "quantity and reorder_level are required.",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative integer.",
      });
    }

    if (!Number.isInteger(reorder_level) || reorder_level < 0) {
      return res.status(400).json({
        success: false,
        message: "reorder_level must be a non-negative integer.",
      });
    }

    const result = await pool.query(
      `UPDATE inventory
       SET stock_quantity = $1,
           reorder_level = $2,
           last_updated = CURRENT_TIMESTAMP
       WHERE inventory_id = $3
       RETURNING *`,
      [quantity, reorder_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      inventory: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update inventory record",
    });
  }
};

// Delete Inventory Record (Admin Only)
exports.deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM inventory WHERE inventory_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory record deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete inventory record",
    });
  }
};

// Bulk Update Inventory
// PATCH /api/inventory/bulk
exports.bulkUpdateInventory = async (req, res) => {
  const client = await pool.connect();
  try {
    const { updates } = req.body;

    await client.query("BEGIN");

    // Extract product IDs for existence check
    const productIds = updates.map(u => u.product_id);

    // Verify all products exist in inventory table
    const checkRes = await client.query(
      "SELECT product_id FROM inventory WHERE product_id = ANY($1::int[])",
      [productIds]
    );

    const foundProductIds = checkRes.rows.map(r => r.product_id);
    const missingProductIds = productIds.filter(id => !foundProductIds.includes(id));

    if (missingProductIds.length > 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: `Inventory records not found for product IDs: ${missingProductIds.join(", ")}`
      });
    }

    const updatedRecords = [];

    // Perform updates sequentially within transaction
    for (const updateItem of updates) {
      const { product_id, stock_quantity, reorder_level } = updateItem;
      const setClauses = ["last_updated = CURRENT_TIMESTAMP"];
      const updateVals = [];

      if (stock_quantity !== undefined) {
        updateVals.push(stock_quantity);
        setClauses.push(`stock_quantity = $${updateVals.length}`);
      }

      if (reorder_level !== undefined) {
        updateVals.push(reorder_level);
        setClauses.push(`reorder_level = $${updateVals.length}`);
      }

      updateVals.push(product_id);
      const queryStr = `
        UPDATE inventory 
        SET ${setClauses.join(", ")} 
        WHERE product_id = $${updateVals.length} 
        RETURNING *
      `;

      const result = await client.query(queryStr, updateVals);
      updatedRecords.push(result.rows[0]);
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedRecords.length} inventory records.`,
      updatedInventory: updatedRecords
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error in bulkUpdateInventory:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform bulk inventory update"
    });
  } finally {
    client.release();
  }
};
