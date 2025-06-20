const Attendance = require('../models/Attendance');
const Classroom = require('../models/Classroom');
const haversine = require('../utils/haversine'); // You'll create this helper
const { Parser } = require('json2csv');

// 1. Start Attendance (Teacher or Admin)
exports.startAttendance = async (req, res) => {
  try {
    if (req.user.user_role !== 'teacher' && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers or admins can start attendance' });
    }

    const { classroomId, latitude, longitude } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    if (classroom.createdBy.toString() !== req.user._id.toString() && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'You are not the creator of this classroom' });
    }

    const now = new Date();

    // Optional: prevent multiple active sessions
    const existing = await Attendance.findOne({
      classroom: classroomId,
      startTime: { $gte: new Date(now.getTime() - 2 * 60000) } // within last 2 mins
    });

    if (existing) {
      return res.status(400).json({ message: 'Attendance already started recently' });
    }

    const attendance = await Attendance.create({
      classroom: classroomId,
      startedBy: req.user._id,
      startTime: now,
      latitude,
      longitude
    });

    res.status(201).json({ message: 'Attendance started', attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Mark Attendance (Student only)
exports.markAttendance = async (req, res) => {
  try {
    if (req.user.user_role !== 'student') {
      return res.status(403).json({ message: 'Only students can mark attendance' });
    }

    const { classroomId, latitude, longitude } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    if (!classroom.joinedStudents.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are not part of this classroom' });
    }

    const now = new Date();

    const session = await Attendance.findOne({
      classroom: classroomId,
      startTime: { $lte: now },
    }).sort({ startTime: -1 });

    if (!session) {
      return res.status(404).json({ message: 'No active attendance session found' });
    }

    const sessionEnd = new Date(session.startTime.getTime() + session.durationMinutes * 60000);
    if (now > sessionEnd) {
      return res.status(400).json({ message: 'Attendance session has expired' });
    }

    const alreadyMarked = session.markedStudents.find(
      (m) => m.student.toString() === req.user._id.toString()
    );
    if (alreadyMarked) {
      return res.status(400).json({ message: 'Attendance already marked' });
    }

    const distance = haversine(
      { latitude, longitude },
      { latitude: session.latitude, longitude: session.longitude }
    );

    if (distance > 0.03) { // 30 meters
      return res.status(400).json({ message: 'You are not within the allowed geofence' });
    }

    session.markedStudents.push({
      student: req.user._id,
      markedAt: now,
      location: { latitude, longitude }
    });

    await session.save();

    res.json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Get Attendance Summary (Teacher or Student)
exports.getAttendanceByClassroom = async (req, res) => {
  try {
    const { classroomId } = req.params;
    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    const isMember =
      req.user.user_role === 'teacher'
        ? classroom.createdBy.toString() === req.user._id.toString()
        : classroom.joinedStudents.includes(req.user._id);

    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const records = await Attendance.find({ classroom: classroomId })
      .populate('markedStudents.student', 'user_name user_id')
      .sort({ startTime: -1 });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Get student's own attendance score
exports.getStudentAttendanceScore = async (req, res) => {
  try {
    const classroomId = req.params.classroomId;
    if (req.user.user_role !== 'student') {
      return res.status(403).json({ message: 'Only students can view attendance score' });
    }
    const totalSessions = await Attendance.countDocuments({ classroom: classroomId });
    const attendedSessions = await Attendance.countDocuments({
      classroom: classroomId,
      'markedStudents.student': req.user._id,
    });
    res.json({ totalSessions, attendedSessions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Get all students' attendance scores in a classroom (Teacher or Admin)
exports.getClassroomAttendanceScores = async (req, res) => {
  try {
    const classroomId = req.params.classroomId;
    if (req.user.user_role !== 'teacher' && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers or admins can access this data' });
    }
    const classroom = await Classroom.findById(classroomId).populate('joinedStudents', 'user_name user_email');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    const totalSessions = await Attendance.countDocuments({ classroom: classroomId });
    const scores = await Promise.all(
      classroom.joinedStudents.map(async (student) => {
        const attended = await Attendance.countDocuments({
          classroom: classroomId,
          'markedStudents.student': student._id,
        });
        return {
          studentId: student._id,
          name: student.user_name,
          email: student.user_email,
          attended,
          total: totalSessions,
        };
      })
    );
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Export attendance as CSV (Teacher or Admin)
exports.exportAttendanceCSV = async (req, res) => {
  try {
    const classroomId = req.params.classroomId;
    if (req.user.user_role !== 'teacher' && req.user.user_role !== 'admin') {
      return res.status(403).json({ message: 'Only teachers or admins can export attendance.' });
    }
    const classroom = await Classroom.findById(classroomId).populate('joinedStudents', 'user_name user_email');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    const totalSessions = await Attendance.countDocuments({ classroom: classroomId });
    const data = await Promise.all(
      classroom.joinedStudents.map(async (student) => {
        const attended = await Attendance.countDocuments({
          classroom: classroomId,
          'markedStudents.student': student._id,
        });
        return {
          Name: student.user_name,
          Email: student.user_email,
          Present: attended,
          Total: totalSessions,
          Percentage: totalSessions === 0 ? '0%' : ((attended / totalSessions) * 100).toFixed(2) + '%',
        };
      })
    );
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
