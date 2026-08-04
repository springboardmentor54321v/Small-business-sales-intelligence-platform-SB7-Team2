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

// View Customers (System Administrator, Business Owner, Store Manager, Sales Executive)
router.get("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), getCustomers);

// Create Customer (System Administrator, Business Owner, Store Manager, Sales Executive)
router.post("/", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), createCustomer);

// Update Customer (System Administrator, Business Owner, Store Manager, Sales Executive)
router.put("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), updateCustomer);

// Delete Customer (System Administrator, Business Owner, Store Manager, Sales Executive)
router.delete("/:id", protect, authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"), deleteCustomer);

module.exports = router;
