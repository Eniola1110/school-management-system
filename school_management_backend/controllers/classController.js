const db = require('../config/db')

// create class
const createClass = (req, res) => {
  const { class_name, arm, level, class_teacher_id } = req.body

  if (!class_name || !arm || !level) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const sql = 'INSERT INTO classes (class_name, arm, level, class_teacher_id) VALUES (?,?,?,?)'
  
  db.query(sql, [class_name, arm, level, class_teacher_id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(201).json({
      message: 'Class added successfully'
    })
  })
}

// get all class
const getAllClasses = (req, res) => {
  const sql = 'SELECT * FROM classes'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      classes: results
    })
  })
}

// get a class
const getClassById = (req, res) => {
  const {id} = req.params
  const sql = 'SELECT * FROM classes WHERE id = ?'
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Class not found'
      })
    }
    return res.status(200).json({
      class: results[0]
    })
  })
}

// update a class
const updateClass = (req, res) => {
  const { id } = req.params
  const { class_name, arm, level, class_teacher_id} = req.body
  
  const sql = 'UPDATE classes SET class_name = ?, arm = ?, level = ?, class_teacher_id = ? WHERE id=?'

  db.query(sql, [ class_name, arm, level, class_teacher_id, id ], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Class not found'
      })
    }
    return res.status(200).json({
      message: 'Class updated successfully'
    })
  })
}

// delete a class
const deleteClass = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM classes WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Classes not found'
      })
    }
    return res.status(200).json({
      message: 'Class deleted successfully'
    })
  })
}
module.exports = {createClass, getAllClasses, getClassById, updateClass, deleteClass}
