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

// View Inventory (System Administrator, Business Owner, Store Manager)
router.get("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), validateQuery(getInventoryQuerySchema), getInventory);

// Bulk Update Inventory (System Administrator, Business Owner, Store Manager)
router.patch("/bulk", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), validateBody(bulkUpdateInventorySchema), bulkUpdateInventory);

// Create Inventory (System Administrator, Business Owner, Store Manager)
router.post("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), createInventory);

// Update Inventory (System Administrator, Business Owner, Store Manager)
router.put("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), updateInventory);

// Delete Inventory (System Administrator, Business Owner, Store Manager)
router.delete("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), deleteInventory);

module.exports = router;
