const Classroom = require('../models/Classroom');
const User = require('../models/User');
const generateCode = require('../utils/generateCode');

// Create a classroom (Teacher only)
exports.createClassroom = async (req, res) => {
  try {
    if (!req.user || (req.user.user_role !== 'teacher' && req.user.user_role !== 'admin')) {
      return res.status(403).json({ message: 'Only teachers or admins can create classrooms' });
    }

    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Classroom name is required' });
    }

    let code, exists = true;
    while (exists) {
      code = generateCode(); // e.g. 6-digit string
      exists = await Classroom.findOne({ code });
    }

    const classroom = await Classroom.create({
      code,
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: req.user._id,
      joinedStudents: [req.user._id],
    });

    res.status(201).json({ message: 'Classroom created', classroom });

  } catch (err) {
    console.error('Error creating classroom:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Join a classroom (Student only)
exports.joinClassroom = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'student') {
      return res.status(403).json({ message: 'Only students can join classrooms' });
    }

    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Classroom code is required' });
    }

    const classroom = await Classroom.findOne({ code });

    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    if (classroom.joinedStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already joined this classroom' });
    }

    classroom.joinedStudents.push(req.user._id);
    await classroom.save();

    res.json({ message: 'Joined classroom', classroom });

  } catch (err) {
    console.error('Error joining classroom:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all classrooms for a user (teacher or student)
exports.getClassrooms = async (req, res) => {
  try {
    let classrooms;

    if (req.user.user_role === 'teacher' || req.user.user_role === 'admin') {
      classrooms = await Classroom.find({ createdBy: req.user._id });
    } else {
      classrooms = await Classroom.find({ joinedStudents: req.user._id }).populate('createdBy', 'user_name profilePic');
    }

    res.json(classrooms);
  } catch (err) {
    console.error('Error fetching classrooms:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get classroom by ID (for details page)
exports.getClassroomById = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('joinedStudents', 'user_name user_id')
      .populate('createdBy', 'user_name profilePic');

    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    res.json(classroom);
  } catch (err) {
    console.error('Error fetching classroom:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Edit classroom (Teacher only, must be creator)
exports.editClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const classroom = await Classroom.findById(id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    if (req.user.user_role !== 'teacher' && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Only the creator (teacher or admin) can edit this classroom' });
    }

    if (name) classroom.name = name.trim();
    if (description !== undefined) classroom.description = description.trim();

    await classroom.save();

    res.json({ message: 'Classroom updated', classroom });

  } catch (err) {
    console.error('Error editing classroom:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete classroom (Teacher only, must be creator)
exports.deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;

    const classroom = await Classroom.findById(id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    if (req.user.user_role !== 'teacher' && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Only the creator (teacher or admin) can delete this classroom' });
    }

    await classroom.deleteOne();

    res.json({ message: 'Classroom deleted' });

  } catch (err) {
    console.error('Error deleting classroom:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Leave a classroom (Student only)
exports.leaveClassroom = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'student') {
      return res.status(403).json({ message: 'Only students can leave classrooms' });
    }

    const { id } = req.params;
    const classroom = await Classroom.findById(id);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    const idx = classroom.joinedStudents.indexOf(req.user._id);
    if (idx === -1) {
      return res.status(400).json({ message: 'You are not a member of this classroom' });
    }

    classroom.joinedStudents.splice(idx, 1);
    await classroom.save();

    res.json({ message: 'Left classroom', classroom });
  } catch (err) {
    console.error('Error leaving classroom:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// List all classrooms (admin only)
exports.listClassrooms = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const classrooms = await Classroom.find().populate('createdBy', 'user_name user_email');
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a classroom (admin only)
exports.deleteClassroomAdmin = async (req, res) => {
  try {
    if (!req.user || req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: 'Classroom deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// const Classroom = require('../models/Classroom');
// const User = require('../models/User');
// const generateCode = require('../utils/generateCode');

// // Create a classroom (Teacher only)
// exports.createClassroom = async (req, res) => {
//   try {
//     if (req.user.user_role !== 'teacher') {
//       return res.status(403).json({ message: 'Only teachers can create classrooms' });
//     }
//     const { name, description } = req.body;
//     let code;
//     let exists = true;
//     // Ensure unique code
//     while (exists) {
//       code = generateCode();
//       exists = await Classroom.findOne({ code });
//     }
//     const classroom = await Classroom.create({
//       code,
//       createdBy: req.user._id,
//       name,
//       description,
//       joinedStudents: [req.user._id],
//     });
//     res.status(201).json({ message: 'Classroom created', classroom });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Join a classroom (Student only)
// exports.joinClassroom = async (req, res) => {
//   try {
//     if (req.user.user_role !== 'student') {
//       return res.status(403).json({ message: 'Only students can join classrooms' });
//     }
//     const { code } = req.body;
//     const classroom = await Classroom.findOne({ code });
//     if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
//     if (classroom.joinedStudents.includes(req.user._id)) {
//       return res.status(400).json({ message: 'Already joined this classroom' });
//     }
//     classroom.joinedStudents.push(req.user._id);
//     await classroom.save();
//     res.json({ message: 'Joined classroom', classroom });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get all classrooms for a user (teacher or student)
// exports.getClassrooms = async (req, res) => {
//   try {
//     let classrooms;
//     if (req.user.user_role === 'teacher') {
//       classrooms = await Classroom.find({ createdBy: req.user._id });
//     } else {
//       classrooms = await Classroom.find({ joinedStudents: req.user._id });
//     }
//     res.json(classrooms);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get classroom by ID (for details page)
// exports.getClassroomById = async (req, res) => {
//   try {
//     const classroom = await Classroom.findById(req.params.id).populate('joinedStudents', 'user_name user_id');
//     if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
//     res.json(classroom);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Edit classroom (Teacher only, must be creator)
// exports.editClassroom = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description } = req.body;
//     const classroom = await Classroom.findById(id);
//     if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
//     if (classroom.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Only the creator can edit this classroom' });
//     }
//     if (name) classroom.name = name;
//     if (description) classroom.description = description;
//     await classroom.save();
//     res.json({ message: 'Classroom updated', classroom });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete classroom (Teacher only, must be creator)
// exports.deleteClassroom = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const classroom = await Classroom.findById(id);
//     if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
//     if (classroom.createdBy.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: 'Only the creator can delete this classroom' });
//     }
//     await classroom.deleteOne();
//     res.json({ message: 'Classroom deleted' });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }; 