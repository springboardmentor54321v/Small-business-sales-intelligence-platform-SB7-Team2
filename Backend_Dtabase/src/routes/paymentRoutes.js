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
const {
  validateBody,
  validateParams,
  createPaymentSchema,
  updatePaymentSchema,
  idParamSchema
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Apply protection middleware to all payment routes
router.use(protect);

// Payment Routes with RBAC and Joi Validation
router.post(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  validateBody(createPaymentSchema),
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
  validateParams(idParamSchema),
  getPaymentById
);

router.put(
  "/:id",
  authorizeRoles("Business Owner", "System Administrator"),
  validateParams(idParamSchema),
  validateBody(updatePaymentSchema),
  updatePayment
);

router.delete(
  "/:id",
  authorizeRoles("System Administrator"),
  validateParams(idParamSchema),
  deletePayment
);

module.exports = router;
