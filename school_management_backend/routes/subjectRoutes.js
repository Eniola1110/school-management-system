const express = require('express')
const router = express.Router()

const { createSubjects, getAllSubjects, getSubjectsById, updateSubjects, deleteSubjects } = require('../controllers/subjectController')

const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createSubjects)
router.get('/', verifyToken, getAllSubjects)
router.get('/:id', verifyToken, getSubjectsById)
router.put('/:id', verifyToken, updateSubjects)
router.delete('/:id', verifyToken, deleteSubjects)

module.exports = router