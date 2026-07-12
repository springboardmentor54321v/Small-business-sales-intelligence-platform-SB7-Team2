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

// View Products (Logged-in Users)
router.get("/", protect, getProducts);

// Create Product (Admin Only)
router.post("/", protect, authorizeRoles(1), createProduct);

// Update Product (Admin Only)
router.put("/:id", protect, authorizeRoles(1), updateProduct);

// Delete Product (Admin Only)
router.delete("/:id", protect, authorizeRoles(1), deleteProduct);

module.exports = router;