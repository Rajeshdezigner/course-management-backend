 
const express = require("express");
const cors = require("cors");
const path = require("path");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

 const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

 const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5000", "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
       if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} is not allowed.`));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

 app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

 app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running.",
     endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      courses: "/api/courses",
      upload: "/api/upload",
    },
  });
});

 app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/upload", uploadRoutes);

 app.use(notFound);

 app.use(errorHandler);

module.exports = app;
