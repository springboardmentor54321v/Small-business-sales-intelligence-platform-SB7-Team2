// ==========================================
// MarketMind AI - Dashboard Routes
// Module: Dashboard & Analytics
// ==========================================

const express = require("express");
const {
  getDashboardData,
  getMonthlyRevenue,
  getTopSellingProducts,
  getLowStockProducts,
  getRecentInvoices,
  getCustomerStats
} = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protect middleware to all dashboard routes
router.use(protect);

// Dashboard Routes
router.get("/", getDashboardData);
router.get("/summary", getDashboardData);
router.get("/monthly-revenue", getMonthlyRevenue);
router.get("/top-selling", getTopSellingProducts);
router.get("/low-stock", getLowStockProducts);
router.get("/recent-invoices", getRecentInvoices);
router.get("/customer-stats", getCustomerStats);

module.exports = router;
