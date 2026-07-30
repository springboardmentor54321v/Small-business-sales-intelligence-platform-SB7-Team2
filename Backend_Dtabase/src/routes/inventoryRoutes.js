const express = require("express");
const {
  getInventory,
  createInventory,
  updateInventory,
  deleteInventory,
  bulkUpdateInventory
} = require("../controllers/inventoryController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { 
  validateQuery, 
  validateBody,
  getInventoryQuerySchema,
  bulkUpdateInventorySchema
} = require("../middleware/validationMiddleware");

const router = express.Router();

// View Inventory (Logged-in Users)
router.get("/", protect, validateQuery(getInventoryQuerySchema), getInventory);

// Bulk Update Inventory (Admin, Business Owner, System Administrator)
router.patch("/bulk", protect, authorizeRoles(1, "Business Owner", "System Administrator"), validateBody(bulkUpdateInventorySchema), bulkUpdateInventory);

// Create Inventory (Admin Only)
router.post("/", protect, authorizeRoles(1), createInventory);

// Update Inventory (Admin Only)
router.put("/:id", protect, authorizeRoles(1), updateInventory);

// Delete Inventory (Admin Only)
router.delete("/:id", protect, authorizeRoles(1), deleteInventory);

module.exports = router;
