 

const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { successResponse, errorResponse } = require("../utils/apiResponse");
 
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, "Name, email, and password are required.");
    }
    if (password.length < 6) {
      return errorResponse(res, 400, "Password must be at least 6 characters.");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email already registered. Please use a different email.");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student", // Default to student if role not provided
    });

    // Generate JWT token
    const token = generateToken(user._id);

    return successResponse(res, 201, "Registration successful.", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Register Error:", error.message);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, 400, messages.join(". "));
    }

    return errorResponse(res, 500, "Registration failed. Please try again.");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return errorResponse(res, 400, "Email and password are required.");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    // Compare entered password with hashed password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    // Generate JWT token
    const token = generateToken(user._id);

    return successResponse(res, 200, "Login successful.", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    return errorResponse(res, 500, "Login failed. Please try again.");
  }
};

 
const logout = async (req, res) => {
  try {
    
    return successResponse(res, 200, "Logged out successfully. Please remove your token on the client.");
  } catch (error) {
    console.error("Logout Error:", error.message);
    return errorResponse(res, 500, "Logout failed.");
  }
};

module.exports = { register, login, logout };
