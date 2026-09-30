const db = require('../config/db')

// create announcement
const createAnnouncement = (req, res) => {
  const { title, body } = req.body

  if (!title || !body) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const sql = 'INSERT INTO announcements (title, body) VALUES (?,?)'
  db.query(sql, [title, body], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(201).json({
      message: 'Announcement posted successfully'
    })
  })
}

// get all announcements
const getAllAnnouncements = (req, res) => {
  const sql = 'SELECT * FROM announcements ORDER BY created_at DESC'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      announcements: results
    })
  })
}

// delete announcement
const deleteAnnouncement = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM announcements WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Announcement not found'
      })
    }
    return res.status(200).json({
      message: 'Announcement deleted successfully'
    })
  })
}

module.exports = { createAnnouncement, getAllAnnouncements, deleteAnnouncement }