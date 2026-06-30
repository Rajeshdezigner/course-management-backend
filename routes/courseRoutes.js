// routes/courseRoutes.js
// Course management routes with role-based access control

const express = require("express");
const router = express.Router();

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadImage, uploadDocument } = require("../middleware/uploadMiddleware");
const multer = require("multer");

// ─── Combined Multer for Course (thumbnail + notes in one request) ────────────
// We use multer fields to accept both file types in a single form submission
const { imageStorage, documentStorage } = (() => {
  const path = require("path");
  const multer = require("multer");

  const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/images/"),
    filename: (req, file, cb) =>
      cb(null, `thumbnail-${Date.now()}${path.extname(file.originalname)}`),
  });

  const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/documents/"),
    filename: (req, file, cb) =>
      cb(null, `notes-${Date.now()}${path.extname(file.originalname)}`),
  });

  return { imageStorage, documentStorage };
})();

// Dynamic storage based on fieldname
const courseFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "thumbnail") {
      cb(null, "uploads/images/");
    } else if (file.fieldname === "notes") {
      cb(null, "uploads/documents/");
    } else {
      cb(new Error("Unknown field"), null);
    }
  },
  filename: (req, file, cb) => {
    const path = require("path");
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const courseFileFilter = (req, file, cb) => {
  const path = require("path");
  if (file.fieldname === "thumbnail") {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      return cb(null, true);
    }
    return cb(new Error("Thumbnail must be jpg, jpeg, png, or webp"));
  }

  if (file.fieldname === "notes") {
    const allowed = /pdf|doc|docx/;
    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowedMime.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Notes must be pdf, doc, or docx"));
  }

  cb(null, true);
};

const uploadCourseFiles = multer({
  storage: courseFileStorage,
  fileFilter: courseFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "notes", maxCount: 1 },
]);

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /api/courses     — All roles can view courses
router.get("/", getAllCourses);

// GET /api/courses/:id — All roles can view a course
router.get("/:id", getCourseById);

// ─── Protected Routes ─────────────────────────────────────────────────────────

// POST /api/courses    — Admin and Instructor only
router.post(
  "/",
  protect,
  authorize("admin", "instructor"),
  uploadCourseFiles,
  createCourse
);

// PUT /api/courses/:id  — Admin (any) | Instructor (own only)
router.put(
  "/:id",
  protect,
  authorize("admin", "instructor"),
  uploadCourseFiles,
  updateCourse
);

// DELETE /api/courses/:id — Admin (any) | Instructor (own only)
router.delete(
  "/:id",
  protect,
  authorize("admin", "instructor"),
  deleteCourse
);

module.exports = router;
