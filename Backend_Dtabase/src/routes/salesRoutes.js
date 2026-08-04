const express = require("express");
const {
  getSales,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/salesController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { validateQuery, getSalesQuerySchema } = require("../middleware/validationMiddleware");

const router = express.Router();

// View Sales History (System Administrator, Business Owner, Store Manager, Sales Executive)
router.get("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), validateQuery(getSalesQuerySchema), getSales);

// Create Sale (System Administrator, Business Owner, Store Manager, Sales Executive)
router.post("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), createSale);

// Update Sale Quantity (System Administrator, Business Owner, Store Manager, Sales Executive)
router.put("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), updateSale);

// Delete Sale (System Administrator, Business Owner, Store Manager, Sales Executive)
router.delete("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), deleteSale);

module.exports = router;
