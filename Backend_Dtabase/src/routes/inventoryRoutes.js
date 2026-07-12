const express = require("express");
const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
} = require("../controllers/inventoryController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// View Inventory (Logged-in Users)
router.get("/", protect, getInventory);

// Create Inventory (Admin Only)
router.post("/", protect, authorizeRoles(1), createInventory);

// Update Inventory (Admin Only)
router.put("/:id", protect, authorizeRoles(1), updateInventory);

// Delete Inventory (Admin Only)
router.delete("/:id", protect, authorizeRoles(1), deleteInventory);

module.exports = router;
