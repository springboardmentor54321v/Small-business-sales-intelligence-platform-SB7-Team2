const { pool } = require("../config/db");

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.category_id 
       ORDER BY p.product_id ASC`
    );

    res.status(200).json({
      success: true,
      products: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      product_name,
      category_id,
      price,
      description,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products
      (product_name, category_id, price, description)
      VALUES ($1,$2,$3,$4)
      RETURNING *`,
      [product_name, category_id, price, description]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create product",
    });
  }
};
// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      product_name,
      category_id,
      price,
      description,
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET product_name = $1,
           category_id = $2,
           price = $3,
           description = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE product_id = $5
       RETURNING *`,
      [product_name, category_id, price, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
    });
  }
};
// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};