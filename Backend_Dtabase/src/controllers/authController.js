const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const { pool } = require("../config/db");
const { logSecurityEvent } = require("../middleware/activityLogger");

// Register User
const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, role_id } = req.body;

    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const existingPhone = await pool.query(
      "SELECT * FROM users WHERE phone = $1",
      [phone]
    );

    if (existingPhone.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
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

    if (error?.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "A user with this email or phone number already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress || "").split(",")[0].trim();
  const endpoint = req.originalUrl || req.url;

  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      logSecurityEvent({
        endpoint,
        httpMethod: req.method,
        responseStatus: 401,
        clientIp,
        eventType: "LOGIN_FAILURE",
        details: `Login failed for non-existent email: ${email}`
      }).catch(err => console.error("Error logging LOGIN_FAILURE:", err.message));

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logSecurityEvent({
        userId: user.user_id,
        endpoint,
        httpMethod: req.method,
        responseStatus: 401,
        clientIp,
        eventType: "LOGIN_FAILURE",
        details: `Login failed due to invalid password for user_id: ${user.user_id}`
      }).catch(err => console.error("Error logging LOGIN_FAILURE:", err.message));

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken({
      id: user.user_id,
      role: user.role_id,
    });

    logSecurityEvent({
      userId: user.user_id,
      endpoint,
      httpMethod: req.method,
      responseStatus: 200,
      clientIp,
      eventType: "LOGIN_SUCCESS",
      details: `User ${user.user_id} (${user.email}) logged in successfully`
    }).catch(err => console.error("Error logging LOGIN_SUCCESS:", err.message));

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

// Change Password
const changePassword = async (req, res) => {
  const clientIp = (
    req.headers["x-forwarded-for"] ||
    req.ip ||
    req.socket.remoteAddress ||
    ""
  )
    .split(",")[0]
    .trim();

  const endpoint = req.originalUrl || req.url;

  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    // Basic password validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Prevent using the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from your current password",
      });
    }

    // Get logged-in user's password
    const result = await pool.query(
      `SELECT user_id, password
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

    const user = result.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      logSecurityEvent({
        userId: user.user_id,
        endpoint,
        httpMethod: req.method,
        responseStatus: 401,
        clientIp,
        eventType: "PASSWORD_CHANGE_FAILURE",
        details: `Incorrect current password for user_id: ${user.user_id}`,
      }).catch((err) =>
        console.error(
          "Error logging PASSWORD_CHANGE_FAILURE:",
          err.message
        )
      );

      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password using the same bcrypt system as registration
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      `UPDATE users
       SET password = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [hashedNewPassword, user.user_id]
    );

    // Log successful password change
    logSecurityEvent({
      userId: user.user_id,
      endpoint,
      httpMethod: req.method,
      responseStatus: 200,
      clientIp,
      eventType: "PASSWORD_CHANGE_SUCCESS",
      details: `Password changed successfully for user_id: ${user.user_id}`,
    }).catch((err) =>
      console.error(
        "Error logging PASSWORD_CHANGE_SUCCESS:",
        err.message
      )
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  changePassword,
};
