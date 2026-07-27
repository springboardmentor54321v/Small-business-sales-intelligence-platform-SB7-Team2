const { pool } = require("../config/db");

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY category_id ASC");
    res.status(200).json({
      success: true,
      categories: result.rows,
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// Create Category (Admin / Manager)
exports.createCategory = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name || category_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "category_name is required.",
      });
    }

    const checkExist = await pool.query(
      "SELECT * FROM categories WHERE LOWER(category_name) = LOWER($1)",
      [category_name.trim()]
    );

    if (checkExist.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists.",
      });
    }

    const result = await pool.query(
      "INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING *",
      [category_name.trim(), description || null]
    );

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error in createCategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
};

// Update Category (Admin / Manager)
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "category_name is required.",
      });
    }

    // Check if category name is taken by another record
    const checkName = await pool.query(
      "SELECT * FROM categories WHERE LOWER(category_name) = LOWER($1) AND category_id != $2",
      [category_name.trim(), id]
    );

    if (checkName.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists.",
      });
    }

    const result = await pool.query(
      `UPDATE categories
       SET category_name = $1,
           description = $2
       WHERE category_id = $3
       RETURNING *`,
      [category_name.trim(), description || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: result.rows[0],
    });
  } catch (error) {
    console.error("Error in updateCategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
};

// Delete Category (Admin Only)
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is linked to products
    const productCheck = await pool.query("SELECT * FROM products WHERE category_id = $1 LIMIT 1", [id]);
    if (productCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category as it is currently linked to one or more products.",
      });
    }

    const result = await pool.query("DELETE FROM categories WHERE category_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
