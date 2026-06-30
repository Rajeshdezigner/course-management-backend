// routes/uploadRoutes.js
// Standalone file upload routes — Admin and Instructor only

const express = require("express");
const router = express.Router();

const {
  uploadImage: handleUploadImage,
  uploadDocument: handleUploadDocument,
} = require("../controllers/uploadController");

const { uploadImage, uploadDocument } = require("../middleware/uploadMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// All upload routes require auth
router.use(protect);
router.use(authorize("admin", "instructor"));

// POST /api/upload/image    — Upload single image
router.post("/image", uploadImage.single("image"), handleUploadImage);

// POST /api/upload/document — Upload single document
router.post("/document", uploadDocument.single("document"), handleUploadDocument);

module.exports = router;
