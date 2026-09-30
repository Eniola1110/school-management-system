const express = require('express')
const router = express.Router()

const { createAttendance, getAllAttendance, getAttendanceByStudent, getAttendanceById, updateAttendance, deleteAttendance } = require('../controllers/attendanceController')
const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createAttendance);
router.get('/', verifyToken, getAllAttendance)
router.get('/student/:studentId', verifyToken, getAttendanceByStudent)
router.get('/:id', verifyToken, getAttendanceById)
router.put('/:id', verifyToken, updateAttendance)
router.delete('/:id', verifyToken, deleteAttendance)

module.exports = router