const express = require('express')
const router = express.Router()

const { createTimetable, getAllTimetable, getTimetableById, getTimetableByClass, updateTimetable, deleteTimetable } = require('../controllers/timetableController')
const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createTimetable)
router.get('/', verifyToken, getAllTimetable)
router.get('/class/:class_id', verifyToken, getTimetableByClass)
router.get('/:id', verifyToken, getTimetableById)
router.put('/:id', verifyToken, updateTimetable)
router.delete('/:id', verifyToken, deleteTimetable)

module.exports = router