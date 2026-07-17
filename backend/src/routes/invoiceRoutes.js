const express = require("express");
const router = express.Router();

const { 
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
 } = require("../controllers/invoiceController");

// GET all invoices
router.get("/", getInvoices);

// GET invoice by ID
router.get("/:id", getInvoiceById);

// POST create invoice
router.post("/", createInvoice);

// PUT update invoice
router.put("/:id", updateInvoice);

// delete invoice
router.delete("/:id", deleteInvoice);

module.exports = router;