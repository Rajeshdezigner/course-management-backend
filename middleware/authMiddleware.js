// middleware/authMiddleware.js
// JWT token verification and role-based authorization middleware

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { errorResponse } = require("../utils/apiResponse");

// ─── Protect Route: Verify JWT Token ─────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return errorResponse(res, 401, "Access denied. No token provided. Please log in.");
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return errorResponse(res, 401, "User not found. Token is invalid.");
    }

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token. Please log in again.");
    }
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token has expired. Please log in again.");
    }
    return errorResponse(res, 401, "Authentication failed.");
  }
};

// ─── Authorize Roles: Restrict Access by Role ─────────────────────────────────
// Usage: authorize("admin") or authorize("admin", "instructor")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Only ${roles.join(", ")} can perform this action.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
