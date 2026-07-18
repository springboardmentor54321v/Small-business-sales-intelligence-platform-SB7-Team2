// ==========================================
// MarketMind AI - Invoice Routes
// Module: Invoice & Security Validation
// ==========================================

const express = require("express");
const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  validateBody,
  validateParams,
  createInvoiceSchema,
  updateInvoiceSchema,
  idParamSchema
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Apply protection middleware to all invoice routes
router.use(protect);

// Invoice Routes with RBAC and Joi Validation
router.post(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  validateBody(createInvoiceSchema),
  createInvoice
);

router.get(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "Store Manager", "System Administrator"),
  getInvoices
);

router.get(
  "/:id",
  authorizeRoles("Business Owner", "Sales Executive", "Store Manager", "System Administrator"),
  validateParams(idParamSchema),
  getInvoiceById
);

router.put(
  "/:id",
  authorizeRoles("Business Owner", "System Administrator"),
  validateParams(idParamSchema),
  validateBody(updateInvoiceSchema),
  updateInvoice
);

router.delete(
  "/:id",
  authorizeRoles("System Administrator"),
  validateParams(idParamSchema),
  deleteInvoice
);

module.exports = router;
