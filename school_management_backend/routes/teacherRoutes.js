const express = require('express')
const router = express.Router()

const { createTeachers, getAllTeachers, getTeachersById, updateTeachers, deleteTeachers } = require('../controllers/teacherController')

const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createTeachers)
router.get('/', verifyToken, getAllTeachers)
router.get('/:id', verifyToken, getTeachersById)
router.put('/:id', verifyToken, updateTeachers)
router.delete('/:id', verifyToken, deleteTeachers)

module.exports = router