const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { pool } = require("../config/db");

// Register User
const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, role_id } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users(full_name,email,password,phone,role_id)
       VALUES($1,$2,$3,$4,$5)
       RETURNING user_id,full_name,email,role_id`,
      [full_name, email, hashedPassword, phone, role_id]
    );

    const token = generateToken({
      id: result.rows[0].user_id,
      role: result.rows[0].role_id,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      id: user.user_id,
      role: user.role_id,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Logged-in User Profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        user_id,
        full_name,
        email,
        phone,
        role_id,
        created_at
       FROM users
       WHERE user_id = $1`,
      [req.user.id]
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
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
};