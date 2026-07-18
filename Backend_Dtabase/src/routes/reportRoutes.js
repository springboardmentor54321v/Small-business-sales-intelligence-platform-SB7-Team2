// ==========================================
// MarketMind AI - Report Routes
// Module: AI Report & Security
// ==========================================

const express = require("express");
const {
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getRevenueReport,
  getCustomerGroups,
  getChurnRisk,
  getRecommendations,
  getAnomalyAlerts
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply protection middleware to all report routes
router.use(protect);

// Standard Reports
router.get("/sales", getSalesReport);
router.get("/inventory", getInventoryReport);
router.get("/customers", getCustomersReport);
router.get("/revenue", getRevenueReport);

// AI Report Routes with RBAC role authorization
router.get(
  "/customer-groups",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getCustomerGroups
);

router.get(
  "/churn-risk",
  authorizeRoles("System Administrator", "Business Owner"),
  getChurnRisk
);

router.get(
  "/recommendations",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"),
  getRecommendations
);

router.get(
  "/anomaly-alerts",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getAnomalyAlerts
);

module.exports = router;
