const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const classroomController = require('../controllers/classroomController');

// Create classroom (teacher)
router.post('/create', auth, classroomController.createClassroom);
// Join classroom (student)
router.post('/join', auth, classroomController.joinClassroom);
// Get all classrooms for user
router.get('/my', auth, classroomController.getClassrooms);
// Get classroom by id
router.get('/:id', auth, classroomController.getClassroomById);
// Edit classroom (teacher, must be creator)
router.put('/:id', auth, classroomController.editClassroom);
// Delete classroom (teacher, must be creator)
router.delete('/:id', auth, classroomController.deleteClassroom);
// Leave classroom (student)
router.delete('/:id/leave', auth, classroomController.leaveClassroom);
// Admin: List all classrooms
router.get('/admin/classrooms', auth, classroomController.listClassrooms);
// Admin: Delete a classroom
router.delete('/admin/classrooms/:id', auth, classroomController.deleteClassroomAdmin);

module.exports = router; 