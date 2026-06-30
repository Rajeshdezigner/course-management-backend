const Course = require("../models/Course");
const { successResponse, errorResponse } = require("../utils/apiResponse");
 
const getAllCourses = async (req, res) => {
  try {
     const courses = await Course.find()
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return successResponse(res, 200, `${courses.length} course(s) found.`, courses);
  } catch (error) {
    console.error("Get All Courses Error:", error.message);
    return errorResponse(res, 500, "Failed to retrieve courses.");
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    return successResponse(res, 200, "Course retrieved successfully.", course);
  } catch (error) {
    console.error("Get Course Error:", error.message);

    if (error.name === "CastError") {
      return errorResponse(res, 404, "Course not found. Invalid ID format.");
    }

    return errorResponse(res, 500, "Failed to retrieve course.");
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, description, category, price } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return errorResponse(res, 400, "Title, description, and category are required.");
    }

    // Handle uploaded file paths if present
    const thumbnail = req.files?.thumbnail
      ? req.files.thumbnail[0].path.replace(/\\/g, "/")
      : null;

    const notes = req.files?.notes
      ? req.files.notes[0].path.replace(/\\/g, "/")
      : null;

    const course = await Course.create({
      title,
      description,
      category,
      price: price || 0,
      thumbnail,
      notes,
      createdBy: req.user._id, // Logged-in user is the creator
    });

    // Populate creator info in response
    await course.populate("createdBy", "name email role");

    return successResponse(res, 201, "Course created successfully.", course);
  } catch (error) {
    console.error("Create Course Error:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, 400, messages.join(". "));
    }

    return errorResponse(res, 500, "Failed to create course.");
  }
};

// ─── @desc    Update a course
// ─── @route   PUT /api/courses/:id
// ─── @access  Private/Admin, Instructor (own courses only)
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    // Authorization: Instructor can only edit their own courses
    if (
      req.user.role === "instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, "Access denied. You can only edit your own courses.");
    }

    const { title, description, category, price } = req.body;

    // Update fields if provided
    if (title) course.title = title;
    if (description) course.description = description;
    if (category) course.category = category;
    if (price !== undefined) course.price = price;

    // Update thumbnail if a new image was uploaded
    if (req.files?.thumbnail) {
      course.thumbnail = req.files.thumbnail[0].path.replace(/\\/g, "/");
    }

    // Update notes if a new document was uploaded
    if (req.files?.notes) {
      course.notes = req.files.notes[0].path.replace(/\\/g, "/");
    }

    const updatedCourse = await course.save();
    await updatedCourse.populate("createdBy", "name email role");

    return successResponse(res, 200, "Course updated successfully.", updatedCourse);
  } catch (error) {
    console.error("Update Course Error:", error.message);

    if (error.name === "CastError") {
      return errorResponse(res, 404, "Course not found. Invalid ID format.");
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(res, 400, messages.join(". "));
    }

    return errorResponse(res, 500, "Failed to update course.");
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    // Authorization: Instructor can only delete their own courses
    if (
      req.user.role === "instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 403, "Access denied. You can only delete your own courses.");
    }

    await course.deleteOne();

    return successResponse(res, 200, "Course deleted successfully.");
  } catch (error) {
    console.error("Delete Course Error:", error.message);

    if (error.name === "CastError") {
      return errorResponse(res, 404, "Course not found. Invalid ID format.");
    }

    return errorResponse(res, 500, "Failed to delete course.");
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
