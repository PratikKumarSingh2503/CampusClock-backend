const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const attendanceController = require("../controllers/attendanceController");

// TEACHER: Start Attendance
router.post("/start", auth, attendanceController.startAttendance);

// STUDENT: Mark Attendance
router.post("/mark", auth, attendanceController.markAttendance);

// STUDENT: View Their Own Attendance Score
router.get("/score/:classroomId", auth, attendanceController.getStudentAttendanceScore);

// TEACHER: View All Students' Attendance Scores
router.get("/classroom-score/:classroomId", auth, attendanceController.getClassroomAttendanceScores);

// TEACHER: Export Attendance as CSV
router.get("/export/:classroomId", auth, attendanceController.exportAttendanceCSV);

module.exports = router;
