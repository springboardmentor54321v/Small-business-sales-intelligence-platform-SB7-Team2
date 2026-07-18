// ==========================================
// MarketMind AI - Payment Routes
// Module: Invoice & Payment
// ==========================================

const express = require("express");
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply protection middleware to all payment routes
router.use(protect);

// Payment Routes with RBAC
router.post(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  createPayment
);

router.get(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "Store Manager", "System Administrator"),
  getPayments
);

router.get(
  "/:id",
  authorizeRoles("Business Owner", "Sales Executive", "Store Manager", "System Administrator"),
  getPaymentById
);

router.put(
  "/:id",
  authorizeRoles("Business Owner", "System Administrator"),
  updatePayment
);

router.delete(
  "/:id",
  authorizeRoles("System Administrator"),
  deletePayment
);

module.exports = router;
