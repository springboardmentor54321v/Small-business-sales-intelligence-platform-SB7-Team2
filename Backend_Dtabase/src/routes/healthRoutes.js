const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  res.json({
    success: true,
    service: "MarketMind AI Backend",
    status: "Running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;