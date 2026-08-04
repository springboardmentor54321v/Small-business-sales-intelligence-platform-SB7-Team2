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
  deleteInvoice,
  getRevenueSummary,
  bulkUpdateInvoices
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  validateBody,
  validateParams,
  validateQuery,
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoicesQuerySchema,
  idParamSchema,
  bulkUpdateInvoicesSchema
} = require("../middleware/validationMiddleware");

const router = express.Router();

// Apply protection middleware to all invoice routes
router.use(protect);

// Revenue Summary Routes (must be defined before /:id)
router.get(
  "/revenue-summary",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  getRevenueSummary
);

router.get(
  "/summary",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  getRevenueSummary
);

// Invoice Routes with RBAC and Joi Validation
router.patch(
  "/bulk",
  authorizeRoles("Business Owner", "System Administrator"),
  validateBody(bulkUpdateInvoicesSchema),
  bulkUpdateInvoices
);

router.post(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  validateBody(createInvoiceSchema),
  createInvoice
);

router.get(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
  validateQuery(getInvoicesQuerySchema),
  getInvoices
);

router.get(
  "/:id",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
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
