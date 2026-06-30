// routes/authRoutes.js
// Authentication routes: Register, Login, Logout

const express = require("express");
const router = express.Router();

const { register, login, logout } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// POST /api/auth/register — Public
router.post("/register", register);

// POST /api/auth/login — Public
router.post("/login", login);

// POST /api/auth/logout — Private (requires valid token)
router.post("/logout", protect, logout);

module.exports = router;
