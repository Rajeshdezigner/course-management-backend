// controllers/uploadController.js
// Standalone file upload endpoints for images and documents

const { successResponse, errorResponse } = require("../utils/apiResponse");

// ─── @desc    Upload a single image
// ─── @route   POST /api/upload/image
// ─── @access  Private/Admin, Instructor
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No image file uploaded. Please select a jpg, jpeg, png, or webp file.");
    }

    // Normalize path separators for cross-platform support
    const filePath = req.file.path.replace(/\\/g, "/");

    return successResponse(res, 200, "Image uploaded successfully.", {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Image Upload Error:", error.message);
    return errorResponse(res, 500, "Image upload failed.");
  }
};

// ─── @desc    Upload a single document
// ─── @route   POST /api/upload/document
// ─── @access  Private/Admin, Instructor
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No document file uploaded. Please select a pdf, doc, or docx file.");
    }

    const filePath = req.file.path.replace(/\\/g, "/");

    return successResponse(res, 200, "Document uploaded successfully.", {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: filePath,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Document Upload Error:", error.message);
    return errorResponse(res, 500, "Document upload failed.");
  }
};

module.exports = { uploadImage, uploadDocument };
