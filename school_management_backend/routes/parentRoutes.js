const express = require('express')
const router = express.Router()

const { createParents, getAllParents, getParentsById, updateParents, deleteParents } = require('../controllers/parentController')

const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createParents)
router.get('/', verifyToken, getAllParents)
router.get('/:id', verifyToken, getParentsById)
router.put('/:id', verifyToken, updateParents)
router.delete('/:id', verifyToken, deleteParents)

module.exports = router