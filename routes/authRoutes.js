const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', loginUser);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Load environment variables
// require('dotenv').config();
// const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// // @route   POST /api/auth/register
// // @desc    Register a new user
// // @access  Public
// router.post('/register', async (req, res) => {
//   try {
//     const { user_name, user_email, user_id, password, user_role } = req.body;

//     // Basic validation
//     if (!user_name || !user_email || !user_id || !password || !user_role) {
//       return res.status(400).json({ success: false, message: 'All fields are required' });
//     }

//     // Check for existing user
//     const existing = await User.findOne({ user_id });
//     if (existing) {
//       return res.status(400).json({ success: false, message: 'User ID already exists' });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create and save new user
//     const newUser = new User({
//       user_name,
//       user_email,
//       user_id,
//       password: hashedPassword,
//       user_role
//     });

//     await newUser.save();

//     res.status(201).json({ success: true, message: 'User registered successfully' });

//   } catch (err) {
//     console.error('Registration error:', err);
//     res.status(500).json({ success: false, message: 'Server error during registration' });
//   }
// });

// // @route   POST /api/auth/login
// // @desc    Login user and return JWT token
// // @access  Public
// router.post('/login', async (req, res) => {
//   try {
//     const { emailOrId, password } = req.body;

//     if (!emailOrId || !password) {
//       return res.status(400).json({ success: false, message: 'Email/ID and password are required' });
//     }

//     // Find user by user_id or email
//     const user = await User.findOne({
//       $or: [{ user_id: emailOrId }, { user_email: emailOrId }]
//     });

//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }

//     // Create token
//     const token = jwt.sign(
//       { id: user._id, role: user.user_role },
//       JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     res.json({
//       success: true,
//       token,
//       user: {
//         id: user._id,
//         name: user.user_name,
//         role: user.user_role
//       }
//     });

//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ success: false, message: 'Server error during login' });
//   }
// });

// module.exports = router;
