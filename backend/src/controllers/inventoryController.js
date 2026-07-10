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
    const result = await pool.query(
      `SELECT 
        i.inventory_id,
        i.product_id,
        i.stock_quantity,
        i.reorder_level,
        i.warehouse_location,
        i.last_updated,
        p.product_name
       FROM inventory i
       JOIN products p ON i.product_id = p.product_id
       ORDER BY i.inventory_id ASC`
    );

    res.status(200).json({
      success: true,
      inventory: result.rows,
    });
  } catch (error) {
    console.error(error);
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
