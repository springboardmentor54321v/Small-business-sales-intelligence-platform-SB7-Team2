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

const router = express.Router();

// Apply protection middleware to all invoice routes
router.use(protect);

// Invoice Routes
router.post("/", createInvoice);
router.get("/", getInvoices);
router.get("/:id", getInvoiceById);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;
