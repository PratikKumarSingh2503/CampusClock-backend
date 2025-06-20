const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // ✅ needed for password hashing
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });
const userController = require('../controllers/userController');

// Profile_pic
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    res.json({ url: req.file.path });
  } catch (err) {
    res.status(500).json({ error: "Error uploading image" });
  }
});

// GET user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// GET user by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT update profile
router.put("/me", auth, async (req, res) => {
  try {
    const { user_name, password, profilePic } = req.body;

    // Validate input
    if (user_name && user_name.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters long" });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const updateFields = {};
    if (user_name) updateFields.user_name = user_name;
    if (password) updateFields.password = await bcrypt.hash(password, 10);
    if (profilePic) updateFields.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// Admin: List all users
router.get('/admin/users', auth, userController.listUsers);
// Admin: Delete a user
router.delete('/admin/users/:id', auth, userController.deleteUser);
// Admin: List all students
router.get('/admin/users/students', auth, userController.listStudents);
// Admin: List all teachers
router.get('/admin/users/teachers', auth, userController.listTeachers);

module.exports = router;