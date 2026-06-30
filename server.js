 
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

 dotenv.config();

const PORT = process.env.PORT || 3000;

 const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
       console.log(` URL: http://localhost:${PORT}`);
     });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

 process.on("unhandledRejection", (err) => {
  console.error(" Unhandled Rejection:", err.message);
  process.exit(1);
});
