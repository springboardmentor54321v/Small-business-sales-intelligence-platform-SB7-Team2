const { pool } = require("../config/db");
const bcrypt = require("bcrypt");

// ==========================================
// USER CONTROLLER FUNCTIONS
// ==========================================

// Get All Users
exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.role_id, r.role_name, u.created_at, u.updated_at 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id 
       ORDER BY u.user_id ASC`
    );
    res.status(200).json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.phone, u.role_id, r.role_name, u.created_at, u.updated_at 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.role_id 
       WHERE u.user_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// Create User (Admin Only)
exports.createUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, role_id } = req.body;

    if (!full_name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: "full_name, email, password, and role_id are required.",
      });
    }

    // Check if email already exists
    const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, phone, role_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, full_name, email, phone, role_id, created_at`,
      [full_name, email, hashedPassword, phone || null, role_id]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
    });
  }
};

// Update User (Admin Only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, password, phone, role_id } = req.body;

    // Check if user exists
    const checkUser = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingUser = checkUser.rows[0];

    // If email changes, check uniqueness
    if (email && email !== existingUser.email) {
      const emailCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    let hashedPassword = existingUser.password;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedFullName = full_name || existingUser.full_name;
    const updatedEmail = email || existingUser.email;
    const updatedPhone = phone !== undefined ? phone : existingUser.phone;
    const updatedRoleId = role_id !== undefined ? role_id : existingUser.role_id;

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1, email = $2, password = $3, phone = $4, role_id = $5, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING user_id, full_name, email, phone, role_id, updated_at`,
      [updatedFullName, updatedEmail, hashedPassword, updatedPhone, updatedRoleId, id]
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM users WHERE user_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ==========================================
// ROLE CONTROLLER FUNCTIONS
// ==========================================

// Get All Roles
exports.getRoles = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM roles ORDER BY role_id ASC");
    res.status(200).json({
      success: true,
      roles: result.rows,
    });
  } catch (error) {
    console.error("Error in getRoles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
    });
  }
};

// Create Role
exports.createRole = async (req, res) => {
  try {
    const { role_name, description } = req.body;
    if (!role_name) {
      return res.status(400).json({
        success: false,
        message: "role_name is required.",
      });
    }

    const result = await pool.query(
      "INSERT INTO roles (role_name, description) VALUES ($1, $2) RETURNING *",
      [role_name, description || null]
    );

    res.status(201).json({
      success: true,
      message: "Role created successfully",
      role: result.rows[0],
    });
  } catch (error) {
    console.error("Error in createRole:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create role",
    });
  }
};

// Update Role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_name, description } = req.body;

    const result = await pool.query(
      `UPDATE roles
       SET role_name = COALESCE($1, role_name),
           description = COALESCE($2, description)
       WHERE role_id = $3
       RETURNING *`,
      [role_name, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      role: result.rows[0],
    });
  } catch (error) {
    console.error("Error in updateRole:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update role",
    });
  }
};

// Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM roles WHERE role_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteRole:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete role. It may be currently assigned to one or more users.",
    });
  }
};
