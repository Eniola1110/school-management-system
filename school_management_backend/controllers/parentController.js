const db = require('../config/db')

// create parent
const createParents = (req, res) => {
  const { user_id, full_name, phone, gender, student_id } = req.body

  if (!user_id || !full_name || !phone || !gender || !student_id) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const sql = 'INSERT INTO parents (user_id, full_name, phone, gender, student_id) VALUES (?,?,?,?,?)'

  db.query(sql, [user_id, full_name, phone, gender, student_id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(201).json({
      message: 'Parent added successfully'
    })
  })
}

// get all parents
const getAllParents = (req, res) => {
  const sql = 'SELECT * FROM parents'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      parents: results
    })
  })
}

// get a parent
const getParentsById = (req, res) => {
  const {id} = req.params
  const sql = 'SELECT * FROM parents WHERE id = ?'
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Parent not found'
      })
    }
    return res.status(200).json({
      parents: results[0]
    })
  })
}

// update a parent
const updateParents = (req, res) => {
  const { id } = req.params
  const { user_id, full_name, phone, gender, student_id} = req.body
  
  const sql = 'UPDATE parents SET user_id = ?, full_name = ?, phone = ?, gender = ?, student_id = ?  WHERE id=?'

  db.query(sql, [ user_id, full_name, phone, gender, student_id, id ], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Parent not found'
      })
    }
    return res.status(200).json({
      message: 'Parent updated successfully'
    })
  })
}

// delete a parent
const deleteParents = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM parents WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Parent not found'
      })
    }
    return res.status(200).json({
      message: 'Parent deleted successfully'
    })
  })
}
module.exports = {createParents, getAllParents, getParentsById, updateParents, deleteParents}
