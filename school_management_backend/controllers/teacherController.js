const db = require('../config/db')

// create teacher
const createTeachers = (req, res) => {
  const { user_id, full_name, gender, phone, specialization} = req.body

  if ( !user_id || !full_name || !gender || !phone || !specialization) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const sql = 'INSERT INTO teachers (user_id, full_name, gender, phone, specialization) VALUES (?,?,?,?,?)'
  db.query(sql, [ user_id, full_name, gender, phone, specialization], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(201).json({
      message: 'Teacher added successfully'
    })
  })
}

// get all teachers
const getAllTeachers = (req, res) => {
  const sql = 'SELECT * FROM teachers'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      teachers: results
    })
  })
}

// get a teacher
const getTeachersById = (req, res) => {
  const {id} = req.params
  const sql = 'SELECT * FROM teachers WHERE id = ?'
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Teacher not found'
      })
    }
    return res.status(200).json({
      teachers: results[0]
    })
  })
}

// update a teacher
const updateTeachers = (req, res) => {
  const { id } = req.params
  const { user_id, full_name, gender, phone, specialization } = req.body
  
  const sql = 'UPDATE teachers SET user_id = ?, full_name = ?, gender = ?, phone = ?, specialization = ? WHERE id=?'

  db.query(sql, [ user_id, staff_id, full_name, gender, phone, specialization, id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Teacher not found'
      })
    }
    return res.status(200).json({
      message: 'Teacher updated successfully'
    })
  })
}

// delete a teacher
const deleteTeachers = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM teachers WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Teacher not found'
      })
    }
    return res.status(200).json({
      message: 'Teacher deleted successfully'
    })
  })
}
module.exports = {createTeachers, getAllTeachers, getTeachersById, updateTeachers, deleteTeachers}
