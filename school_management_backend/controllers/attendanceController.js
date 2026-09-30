const db = require('../config/db')

// create attendance
const createAttendance = (req, res) => {
  const { student_id, class_id, date, status, term, session } = req.body

  if (!student_id || !class_id || !date || !status || !term || !session) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const sql = 'INSERT INTO attendance ( student_id, class_id, date, status, term, session) VALUES (?,?,?,?,?,?)'
  db.query(sql, [student_id, class_id, date, status, term, session], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(201).json({
      message: 'Attendance added successfully'
    })
  })
}

// get all attendance
const getAllAttendance = (req, res) => {
  const sql = 'SELECT * FROM attendance'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      attendance: results
    })
  })
}

// get attendance by student
const getAttendanceByStudent = (req, res) => {
  const { studentId } = req.params
  const sql = ` SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC `
  db.query(sql, [studentId], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    } return res.status(200).json({
      attendance: results
    })
  })
}

// get a attendance
const getAttendanceById = (req, res) => {
  const { id } = req.params
  
  const sql = 'SELECT * FROM attendance WHERE id = ?'
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Attendance not found'
      })
    }
    return res.status(200).json({
      attendance: results[0]
    })
  })
}

// update an attendance
const updateAttendance = (req, res) => {
  const { id } = req.params
  const { student_id, class_id, status, term, session, date } = req.body
  
  const sql = 'UPDATE attendance SET  student_id = ?, class_id = ?, date = ?, status = ?, term = ?, session = ? WHERE id=?'

  db.query(sql, [ student_id, class_id, date, status, term, session,id ], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Attendance not found'
      })
    }
    return res.status(200).json({
      message: 'Attendance updated successfully'
    })
  })
}

// delete an attendance
const deleteAttendance = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM attendance WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Attendance not found'
      })
    }
    return res.status(200).json({
      message: 'Attendance deleted successfully'
    })
  })
}
module.exports = {createAttendance, getAllAttendance, getAttendanceByStudent, getAttendanceById, updateAttendance, deleteAttendance}
