const express = require('express')
const router = express.Router()
const { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, approveStudent} = require('../controllers/studentController')
const verifyToken = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/auth')

router.post('/', optionalAuth, createStudent)
router.get('/', verifyToken, getAllStudents)
router.get('/:id', verifyToken, getStudentById)
router.put('/:id', verifyToken, updateStudent)
router.delete('/:id', verifyToken, deleteStudent)
router.put('/:id/approve', verifyToken, approveStudent)
module.exports = router