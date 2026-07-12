const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles(1),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin!"
    });
  }
);

module.exports = router;