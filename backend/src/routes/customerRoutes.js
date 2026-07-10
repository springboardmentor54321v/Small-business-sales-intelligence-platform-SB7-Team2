const express = require("express");
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// View Customers (Logged-in Users)
router.get("/", protect, getCustomers);

// Create Customer (Admin Only)
router.post("/", protect, authorizeRoles(1), createCustomer);

// Update Customer (Admin Only)
router.put("/:id", protect, authorizeRoles(1), updateCustomer);

// Delete Customer (Admin Only)
router.delete("/:id", protect, authorizeRoles(1), deleteCustomer);

module.exports = router;
