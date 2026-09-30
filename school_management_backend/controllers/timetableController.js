const db = require('../config/db')

const createTimetable = (req, res) => {
  const { class_id, subject_id, day, start_time, end_time, term, session } = req.body
  
  if (!class_id || !subject_id || !day || !start_time || !end_time || !term || !session) {
    return res.status(400).json({
      message: 'All data are required'
    })
  }

  const sql = ` INSERT INTO timetable (class_id, subject_id, day, start_time, end_time, term, session) VALUES (?,?,?,?,?,?,?) `
  
  db.query(sql, [class_id, subject_id, day, start_time, end_time, term, session], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    return res.status(201).json({
      message: 'Timetable added successfully',
      id: results.insertId
    })
  })
}

const getAllTimetable = (req, res) => {
  const sql = `SELECT timetable.*, classes.class_name, classes.arm, subjects.subject_name FROM timetable 
  JOIN classes ON timetable.class_id = classes.id JOIN subjects ON timetable.subject_id = subjects.id 
  ORDER BY 
    timetable.day,timetable.start_time ASC`
  
  db.query(sql, (err, results) => {
  if (err) {
    return res.status(400).json({
        message: err.message
      })
  }
  return res.status(200).json({
    timetable: results
  })
  })
}

const getTimetableById = (req, res) => {
  const { id } = req.params

  const sql = `SELECT timetable.*, classes.class_name, classes.arm, subjects.subject_name
  FROM timetable 
  JOIN classes ON timetable.class_id = classes.id JOIN subjects ON timetable.subject_id = subjects.id
  WHERE timetable.id = ?`

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Timetable not found'
      })
    }
  
    return res.status(200).json({
      timetable: results[0]
    })
  })
}

const getTimetableByClass = (req, res) => {
  const { class_id } = req.params

  const sql = `
    SELECT 
      timetable.*,
      classes.class_name,
      classes.arm,
      subjects.subject_name
    FROM timetable
    JOIN classes ON timetable.class_id = classes.id
    JOIN subjects ON timetable.subject_id = subjects.id
    WHERE timetable.class_id = ?
    ORDER BY timetable.day, timetable.start_time ASC
  `

  db.query(sql, [class_id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    return res.status(200).json({
      timetable: results
    })
  })
}

const updateTimetable = (req, res) => {
  const { id } = req.params

  const {
    class_id,
    subject_id,
    day,
    start_time,
    end_time,
    term,
    session
  } = req.body

  if (
    !class_id ||
    !subject_id ||
    !day ||
    !start_time ||
    !end_time ||
    !term ||
    !session
  ) {
    return res.status(400).json({
      message: 'All data are required.'
    })
  }

  const sql = `
    UPDATE timetable
    SET
      class_id = ?,
      subject_id = ?,
      day = ?,
      start_time = ?,
      end_time = ?,
      term = ?,
      session = ?
    WHERE id = ?
  `

  db.query(
    sql,
    [
      class_id,
      subject_id,
      day,
      start_time,
      end_time,
      term,
      session,
      id
    ],
    (err, results) => {
      if (err) {
        return res.status(400).json({
          message: err.message
        })
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: 'Timetable not found'
        })
      }

      return res.status(200).json({
        message: 'Timetable updated successfully'
      })
    }
  )
}

const deleteTimetable = (req, res) => {
  const { id } = req.params

  const sql = 'DELETE FROM timetable WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Timetable not found'
      })
    }

    return res.status(200).json({
      message: 'Timetable deleted successfully'
    })
  })
}

module.exports = { createTimetable, getAllTimetable, getTimetableById, getTimetableByClass, updateTimetable, deleteTimetable}