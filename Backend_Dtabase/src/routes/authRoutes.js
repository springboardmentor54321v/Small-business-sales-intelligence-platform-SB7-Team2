const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

// Public Routes protected by Strict Auth Rate Limiter (Brute-Force Protection)
router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);

// Protected Route
router.get("/profile", protect, getProfile);

module.exports = router;