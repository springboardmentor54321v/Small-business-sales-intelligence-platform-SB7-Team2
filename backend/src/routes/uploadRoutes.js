const express = require("express");
const multer = require("multer");
const { uploadProducts, uploadSales } = require("../controllers/uploadController");
const protect = require("../middleware/authMiddleware");

// Setup multer storage destination
const upload = multer({ dest: "uploads/" });

const router = express.Router();

// POST /api/upload/products
router.post("/products", protect, upload.single("file"), uploadProducts);

// POST /api/upload/sales
router.post("/sales", protect, upload.single("file"), uploadSales);

module.exports = router;
