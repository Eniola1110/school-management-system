const express = require('express')
const router = express.Router()

const { createFees, getAllFees, getFeesById, updateFees, deleteFees } = require('../controllers/feeController')

const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createFees)
router.get('/', verifyToken, getAllFees)
router.get('/:id', verifyToken, getFeesById)
router.put('/:id', verifyToken, updateFees)
router.delete('/:id', verifyToken, deleteFees)

module.exports = router