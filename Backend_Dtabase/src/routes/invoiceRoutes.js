// ==========================================
// MarketMind AI - Invoice Routes
// Module: Invoice & Payment
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

const router = express.Router();

// Apply protection middleware to all invoice routes (executed first)
router.use(protect);

// Invoice Routes with RBAC (executed after protect)
router.post(
  "/",
  authorizeRoles("Business Owner", "Sales Executive", "System Administrator"),
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
  getInvoiceById
);

router.put(
  "/:id",
  authorizeRoles("Business Owner", "System Administrator"),
  updateInvoice
);

router.delete(
  "/:id",
  authorizeRoles("System Administrator"),
  deleteInvoice
);

module.exports = router;
