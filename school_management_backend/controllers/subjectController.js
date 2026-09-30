const db = require('../config/db')

// ==================== CREATE SUBJECT ====================
const createSubjects = (req, res) => {
  const { subject_name } = req.body

  if (!subject_name || !subject_name.trim()) {
    return res.status(400).json({
      message: 'Subject name is required.'
    })
  }

  const sql = 'INSERT INTO subjects (subject_name) VALUES (?)'

  db.query(sql, [subject_name.trim()], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    return res.status(201).json({
      message: 'Subject added successfully',
      id: results.insertId
    })
  })
}


// ==================== GET ALL SUBJECTS ====================
const getAllSubjects = (req, res) => {
  const sql = 'SELECT * FROM subjects ORDER BY subject_name ASC'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    return res.status(200).json({
      subjects: results
    })
  })
}


// ==================== GET SUBJECT BY ID ====================
const getSubjectsById = (req, res) => {
  const { id } = req.params

  const sql = 'SELECT * FROM subjects WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Subject not found'
      })
    }

    return res.status(200).json({
      subject: results[0]
    })
  })
}


// ==================== UPDATE SUBJECT ====================
const updateSubjects = (req, res) => {
  const { id } = req.params
  const { subject_name } = req.body

  if (!subject_name || !subject_name.trim()) {
    return res.status(400).json({
      message: 'Subject name is required.'
    })
  }

  const sql = 'UPDATE subjects SET subject_name = ? WHERE id = ?'

  db.query(sql, [subject_name.trim(), id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Subject not found'
      })
    }

    return res.status(200).json({
      message: 'Subject updated successfully'
    })
  })
}


// ==================== DELETE SUBJECT ====================
const deleteSubjects = (req, res) => {
  const { id } = req.params

  const sql = 'DELETE FROM subjects WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Subject not found'
      })
    }

    return res.status(200).json({
      message: 'Subject deleted successfully'
    })
  })
}


module.exports = {
  createSubjects,
  getAllSubjects,
  getSubjectsById,
  updateSubjects,
  deleteSubjects
}

