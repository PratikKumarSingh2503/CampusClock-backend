const User = require('../models/User');

// List all users (admin only)
exports.listUsers = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all students (admin only)
exports.listStudents = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find({ user_role: 'student' }, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List all teachers (admin only)
exports.listTeachers = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find({ user_role: 'teacher' }, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 