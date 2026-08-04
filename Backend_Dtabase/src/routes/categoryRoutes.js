const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get Categories is restricted to authorized roles
router.get("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), getCategories);

// Modify categories requires Admin (role_id 1) or Manager (role_id 2) or Owner (role_id 4)
router.post("/", protect, authorizeRoles(1, 2, 4, "System Administrator", "Store Manager", "Business Owner"), createCategory);
router.put("/:id", protect, authorizeRoles(1, 2, 4, "System Administrator", "Store Manager", "Business Owner"), updateCategory);

// Delete category is restricted to Admin (role_id 1)
router.delete("/:id", protect, authorizeRoles(1, "System Administrator"), deleteCategory);

module.exports = router;
