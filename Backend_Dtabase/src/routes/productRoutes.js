const express = require("express");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// View Products (System Administrator, Business Owner, Store Manager)
router.get("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), getProducts);

// Create Product (System Administrator, Business Owner, Store Manager)
router.post("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), createProduct);

// Update Product (System Administrator, Business Owner, Store Manager)
router.put("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), updateProduct);

// Delete Product (System Administrator, Business Owner, Store Manager)
router.delete("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager"), deleteProduct);

module.exports = router;