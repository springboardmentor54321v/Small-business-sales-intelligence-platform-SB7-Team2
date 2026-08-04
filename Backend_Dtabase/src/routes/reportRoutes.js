// ==========================================
// MarketMind AI - Report Routes
// Module: AI Report & Security
// ==========================================

const express = require("express");
const {
  getSalesReport,
  getInventoryReport,
  getProductReport,
  getCustomersReport,
  getRevenueReport,
  getCustomerGroups,
  getChurnRisk,
  getRecommendations,
  getAnomalyAlerts,
  getAuditSummary
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply protection middleware to all report routes
router.use(protect);

// Standard Reports (Business Owner, Store Manager, System Administrator)
router.get(
  "/sales",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getSalesReport
);
router.get(
  "/inventory",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getInventoryReport
);
router.get(
  "/products",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getProductReport
);
router.get(
  "/customers",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getCustomersReport
);
router.get(
  "/revenue",
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  getRevenueReport
);

// Audit Summary Report (System Administrator & Business Owner Only)
router.get(
  "/audit-summary",
  authorizeRoles("System Administrator", "Business Owner"),
  getAuditSummary
);


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
