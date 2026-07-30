const express = require("express");
const { getNotifications } = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");
const { validateQuery, getNotificationsQuerySchema } = require("../middleware/validationMiddleware");

const router = express.Router();

// GET /api/notifications - Get all combined notifications or filter by type
router.get("/", protect, validateQuery(getNotificationsQuerySchema), getNotifications);

module.exports = router;
