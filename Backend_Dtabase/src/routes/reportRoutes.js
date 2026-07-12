const express = require("express");
const {
  getSalesReport,
  getInventoryReport,
  getCustomersReport,
  getRevenueReport
} = require("../controllers/reportController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/sales", protect, getSalesReport);
router.get("/inventory", protect, getInventoryReport);
router.get("/customers", protect, getCustomersReport);
router.get("/revenue", protect, getRevenueReport);

module.exports = router;
