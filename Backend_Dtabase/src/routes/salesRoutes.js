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

// View Sales History (Logged-in Users)
router.get("/", protect, validateQuery(getSalesQuerySchema), getSales);

// Create Sale (Admin Only)
router.post("/", protect, authorizeRoles(1), createSale);

// Update Sale Quantity (Admin Only)
router.put("/:id", protect, authorizeRoles(1), updateSale);

// Delete Sale (Admin Only)
router.delete("/:id", protect, authorizeRoles(1), deleteSale);

module.exports = router;
