const express = require("express");
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Roles routes (accessible by Admin / System Administrator)
router.get("/roles", getRoles);
router.post("/roles", authorizeRoles(1), createRole);
router.put("/roles/:id", authorizeRoles(1), updateRole);
router.delete("/roles/:id", authorizeRoles(1), deleteRole);

// Users routes
router.get("/", authorizeRoles(1), getUsers);
router.get("/:id", authorizeRoles(1), getUserById);
router.post("/", authorizeRoles(1), createUser);
router.put("/:id", authorizeRoles(1), updateUser);
router.delete("/:id", authorizeRoles(1), deleteUser);

module.exports = router;
