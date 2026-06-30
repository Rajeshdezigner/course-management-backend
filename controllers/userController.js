// controllers/userController.js
// User CRUD — Admin Only

const User = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── @desc    Get all users
// ─── @route   GET /api/users
// ─── @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return successResponse(res, 200, `${users.length} user(s) found.`, users);
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    return errorResponse(res, 500, "Failed to retrieve users.");
  }
};

// ─── @desc    Get single user by ID
// ─── @route   GET /api/users/:id
// ─── @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, "User retrieved successfully.", user);
  } catch (error) {
    console.error("Get User Error:", error.message);

    // Handle invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return errorResponse(res, 404, "User not found. Invalid ID format.");
    }

    return errorResponse(res, 500, "Failed to retrieve user.");
  }
};

// ─── @desc    Create a new user (Admin)
// ─── @route   POST /api/users
// ─── @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return errorResponse(res, 400, "Name, email, and password are required.");
    }

    if (password.length < 6) {
      return errorResponse(res, 400, "Password must be at least 6 characters.");
    }

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, "Email already exists.");
    }

    const user = await User.create({ name, email, password, role });

    return successResponse(res, 201, "User created successfully.", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("Create User Error:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, 400, messages.join(". "));
    }

    if (error.code === 11000) {
      return errorResponse(res, 400, "Email already exists.");
    }

    return errorResponse(res, 500, "Failed to create user.");
  }
};

// ─── @desc    Update user by ID
// ─── @route   PUT /api/users/:id
// ─── @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Find user
    const user = await User.findById(req.params.id).select("+password");
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // Update password only if provided (pre-save hook will hash it)
    if (password) {
      if (password.length < 6) {
        return errorResponse(res, 400, "Password must be at least 6 characters.");
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    return successResponse(res, 200, "User updated successfully.", {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error) {
    console.error("Update User Error:", error.message);

    if (error.name === "CastError") {
      return errorResponse(res, 404, "User not found. Invalid ID format.");
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, 400, messages.join(". "));
    }

    if (error.code === 11000) {
      return errorResponse(res, 400, "Email already exists.");
    }

    return errorResponse(res, 500, "Failed to update user.");
  }
};

// ─── @desc    Delete user by ID
// ─── @route   DELETE /api/users/:id
// ─── @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return errorResponse(res, 400, "You cannot delete your own account.");
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    await user.deleteOne();

    return successResponse(res, 200, "User deleted successfully.");
  } catch (error) {
    console.error("Delete User Error:", error.message);

    if (error.name === "CastError") {
      return errorResponse(res, 404, "User not found. Invalid ID format.");
    }

    return errorResponse(res, 500, "Failed to delete user.");
  }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
