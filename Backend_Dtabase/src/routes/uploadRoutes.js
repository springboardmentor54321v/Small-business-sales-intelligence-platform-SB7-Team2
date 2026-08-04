const express = require("express");
const multer = require("multer");
const { uploadProducts, uploadSales } = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Setup multer storage destination
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// POST /api/upload/products
router.post(
  "/products",
  protect,
  authorizeRoles("System Administrator", "Business Owner", "Store Manager"),
  upload.single("file"),
  uploadProducts
);

// POST /api/upload/sales
router.post(
  "/sales",
  protect,
  authorizeRoles("System Administrator", "Business Owner", "Store Manager", "Sales Executive"),
  upload.single("file"),
  uploadSales
);

module.exports = router;
