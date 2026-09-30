const express = require('express')
const router = express.Router()

const { createResults, getAllResults, getResultsById, getStudentResults, updateResults, deleteResults } = require('../controllers/resultController')

const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createResults)
router.get('/', verifyToken, getAllResults)
router.get('/student/:studentId', verifyToken, getStudentResults)
router.get('/:id', verifyToken, getResultsById)
router.put('/:id', verifyToken, updateResults)
router.delete('/:id', verifyToken, deleteResults)

module.exports = router