const express = require("express");
const { getDashboardData } = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/dashboard
router.get("/", protect, getDashboardData);

module.exports = router;
