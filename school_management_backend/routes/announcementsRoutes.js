const express = require('express')
const router = express.Router()

const { createAnnouncement, getAllAnnouncements, deleteAnnouncement } = require('../controllers/announcementController')
const verifyToken = require('../middleware/authMiddleware')

router.post('/', verifyToken, createAnnouncement)
router.get('/', verifyToken, getAllAnnouncements)
router.delete('/:id', verifyToken, deleteAnnouncement)

module.exports = router