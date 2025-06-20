const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Community = require('../models/Community');

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// @desc    Register a new user
const registerUser = async (req, res) => {
  try {
    const { user_name, user_email, user_id, password, user_role } = req.body;

    if (!user_name || !user_email || !user_id || !password || !user_role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await User.findOne({ user_id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      user_name,
      user_email,
      user_id,
      password: hashedPassword,
      user_role
    });

    await newUser.save();

    // ✅ Create community for teachers
    if (user_role === "teacher") {
      // Create a more user-friendly community name
      const communityName = `${user_name}'s Community`;
      
      // Check if community name already exists
      const existingCommunity = await Community.findOne({ name: communityName });
      const finalName = existingCommunity ? `${communityName} (${user_id})` : communityName;

      // Create community with teacher as a member
      await Community.create({
        name: finalName,
        teacherId: newUser._id,
        members: [newUser._id], // Add teacher as a member
        messages: [] // Initialize empty messages array
      });
    }

    res.status(201).json({ success: true, message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user and return JWT
const loginUser = async (req, res) => {
  try {
    const { emailOrId, password } = req.body;

    if (!emailOrId || !password) {
      return res.status(400).json({ success: false, message: 'Email/ID and password are required' });
    }

    const user = await User.findOne({
      $or: [{ user_id: emailOrId }, { user_email: emailOrId }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.user_role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.user_name,
        role: user.user_role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

module.exports = {
  registerUser,
  loginUser
};

// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

// module.exports = authMiddleware;