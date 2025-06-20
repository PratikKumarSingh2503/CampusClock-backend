const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const communityRoutes = require("./routes/communityRoutes");
const classroomRoutes = require('./routes/classroomRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Error Handling Middleware
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
//   res.status(err.status || 500).json({
//     error: err.message || 'Internal Server Error',
//     stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// Multer error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error", error: err.message });
  } else if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({ message: err.message });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error", error: err.message });
});


// Routes
app.use('/api/auth', authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/uploads', express.static('uploads'));

// MongoDB Connect (No deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Global Error Catchers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  if (process.env.NODE_ENV === 'development') process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  if (process.env.NODE_ENV === 'development') process.exit(1);
});