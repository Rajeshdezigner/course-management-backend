// utils/generateToken.js
// Utility to generate JWT token for authentication

const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token
 * @param {string} userId - MongoDB user _id
 * @returns {string} - Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );
};

module.exports = generateToken;
