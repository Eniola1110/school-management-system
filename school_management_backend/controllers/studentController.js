const db = require('../config/db')

// create student
const createStudent = (req, res) => {
  const { class_id, full_name, date_of_birth, gender, guardian_name, guardian_phone } = req.body

  if (!class_id || !full_name || !gender || !guardian_name || !guardian_phone) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const status = req.user ? 'approved' : 'pending'

  const sql = 'INSERT INTO students (class_id, full_name, date_of_birth, gender, guardian_name, guardian_phone, status) VALUES (?,?,?,?,?,?,?)'

  db.query(sql, [class_id, full_name, date_of_birth, gender, guardian_name, guardian_phone, status], (err, results) => {
   
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    const newStudent = { id: results.insertId, class_id, full_name, date_of_birth, gender, guardian_name, guardian_phone, status }

    const io = req.app.get('io')
    io.emit('student:added', newStudent)

    return res.status(201).json({
      message: 'Student added successfully'
    })
  })
}

// get all students
const getAllStudents = (req, res) => {
  const sql = 'SELECT * FROM students ORDER BY id DESC'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      students: results
    })
  })
}
// get a student
const getStudentById = (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM students WHERE id = ?'
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Student not found'
      })
    }
    return res.status(200).json({
      student: results[0]
    })
  })
}

// update a student
const updateStudent = (req, res) => {
  const { id } = req.params
  const { class_id, full_name, date_of_birth, gender, guardian_name, guardian_phone } = req.body

  const sql = 'UPDATE students SET class_id = ?, full_name = ?, date_of_birth = ?, gender = ?, guardian_name = ?, guardian_phone = ? WHERE id=?'

  db.query(sql, [class_id, full_name, date_of_birth, gender, guardian_name, guardian_phone, id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Student not found'
      })
    }
    return res.status(200).json({
      message: 'Student updated successfully'
    })
  })
}

// delete a student
const deleteStudent = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM students WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Student not found'
      })
    }
    return res.status(200).json({
      message: 'Student deleted successfully'
    })
  })
}

// approve a pending student (admin only)
const approveStudent = (req, res) => {
  const { id } = req.params
  const sql = 'UPDATE students SET status = ? WHERE id = ?'

  db.query(sql, ['approved', id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Student not found'
      })
    }
    return res.status(200).json({
      message: 'Student approved successfully'
    })
  })
}

module.exports = { createStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, approveStudent }