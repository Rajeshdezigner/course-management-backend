// routes/userRoutes.js
// User management routes — Admin access only

const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/authMiddleware");

// All user routes require authentication + admin role
router.use(protect);
router.use(authorize("admin"));

// GET  /api/users       — Get all users
// POST /api/users       — Create a new user
router.route("/").get(getAllUsers).post(createUser);

// GET    /api/users/:id — Get single user
// PUT    /api/users/:id — Update user
// DELETE /api/users/:id — Delete user
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

module.exports = router;
