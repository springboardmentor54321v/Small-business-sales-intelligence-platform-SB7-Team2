const { pool } = require("../config/db");

// Create Customer (Admin Only)
exports.createCustomer = async (req, res) => {
  try {
    const { customer_name, email, phone, address } = req.body;

    // Validation
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "customer_name is required and must be a valid string.",
      });
    }

    if (email !== undefined && email !== null && email.trim() !== "") {
      // Basic email regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format.",
        });
      }

      // Check if email already exists
      const emailCheck = await pool.query(
        "SELECT * FROM customers WHERE email = $1",
        [email]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (phone !== undefined && phone !== null && phone.trim() !== "") {
      // Check if phone already exists
      const phoneCheck = await pool.query(
        "SELECT * FROM customers WHERE phone = $1",
        [phone]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO customers (customer_name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        customer_name.trim(),
        email && email.trim() !== "" ? email.trim() : null,
        phone && phone.trim() !== "" ? phone.trim() : null,
        address !== undefined && address !== null ? address.trim() : null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
};

// Get All Customers (Authenticated Users)
exports.getCustomers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers ORDER BY customer_id ASC"
    );

    res.status(200).json({
      success: true,
      customers: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

// Update Customer (Admin Only)
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, email, phone, address } = req.body;

    // Validation
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "customer_name is required and must be a valid string.",
      });
    }

    if (email !== undefined && email !== null && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Invalid email format.",
        });
      }

      // Check if email already exists on another customer
      const emailCheck = await pool.query(
        "SELECT * FROM customers WHERE email = $1 AND customer_id != $2",
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (phone !== undefined && phone !== null && phone.trim() !== "") {
      // Check if phone already exists on another customer
      const phoneCheck = await pool.query(
        "SELECT * FROM customers WHERE phone = $1 AND customer_id != $2",
        [phone, id]
      );
      if (phoneCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    const result = await pool.query(
      `UPDATE customers
       SET customer_name = $1,
           email = $2,
           phone = $3,
           address = $4
       WHERE customer_id = $5
       RETURNING *`,
      [
        customer_name.trim(),
        email && email.trim() !== "" ? email.trim() : null,
        phone && phone.trim() !== "" ? phone.trim() : null,
        address !== undefined && address !== null ? address.trim() : null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
};

// Delete Customer (Admin Only)
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM customers WHERE customer_id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
};
