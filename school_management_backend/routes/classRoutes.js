const express = require('express')
const router = express.Router()

const {createClass, getAllClasses, getClassById, updateClass, deleteClass} = require('../controllers/classController')

const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createClass)
router.get('/', getAllClasses)
router.get('/:id', verifyToken, getClassById)
router.put('/:id', verifyToken, updateClass)
router.delete('/:id', verifyToken, deleteClass)

module.exports = router