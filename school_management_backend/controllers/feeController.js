const db = require('../config/db')

// create fees
const createFees = (req, res) => {
  const { class_id, fee_type, amount, term, session } = req.body

  if (!class_id || !fee_type || !amount || !term || !session) {
    return res.status(400).json({
      message: "All data are required."
    })
  }

  const sql = 'INSERT INTO fees (class_id, fee_type, amount, term, session) VALUES (?,?,?,?,?)'
  db.query(sql, [class_id, fee_type, amount, term, session], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(201).json({
      message: 'Fees added successfully'
    })
  })
}

// get all fees
const getAllFees = (req, res) => {
  const sql = 'SELECT * FROM fees'

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    return res.status(200).json({
      fees: results
    })
  })
}

// get a class
const getFeesById = (req, res) => {
  const {id} = req.params
  const sql = 'SELECT * FROM fees WHERE id = ?'
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Fees not found'
      })
    }
    return res.status(200).json({
      fees: results[0]
    })
  })
}

// update a fees
const updateFees = (req, res) => {
  const { id } = req.params
  const { class_id, fee_type, amount, term, session} = req.body
  
  const sql = 'UPDATE fees SET class_id = ?, fee_type = ?, amount = ?, term = ?, session = ? WHERE id=?'

  db.query(sql, [ class_id, fee_type, amount, term, session, id ], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Fees not found'
      })
    }
    return res.status(200).json({
      message: 'Fees updated successfully'
    })
  })
}

// delete a fees
const deleteFees = (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM fees WHERE id = ?'

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: 'Fees not found'
      })
    }
    return res.status(200).json({
      message: 'Fees deleted successfully'
    })
  })
}


// const getOutstandingFees = (req, res) => {
//   const { studentId } = req.params
//   const { term, session } = req.query

//   if (!term || !session) {
//     return res.status(400).json({
//       message: 'term and session are required'
//     })
//   }

//   // 1. get the student's class
//   const studentSql = 'SELECT class_id FROM students WHERE id = ?'
//   db.query(studentSql, [studentId], (err, studentResults) => {
//     if (err) {
//       return res.status(400).json({
//         message: err.message
//       })
//     }

//     if (studentResults.length === 0) {
//       return res.status(404).json({
//         message: 'Student not found'
//       })
//     }

//     const classId = studentResults[0].class_id

//     // 2. get all fees for that class/term/session
//     const feesSql = 'SELECT id, fee_type, amount, term, session FROM fees WHERE class_id = ? AND term = ? AND session = ?'
//     db.query(feesSql, [classId, term, session], (err, feesResults) => {
//       if (err) {
//         return res.status(400).json({
//           message: err.message
//         })
//       }

//       if (feesResults.length === 0) {
//         return res.status(200).json({
//           outstandingFees: []
//         })
//       }

//       const feeIds = feesResults.map(f => f.id)

//       // 3. get fees already paid successfully by this student
//       const paidSql = 'SELECT fee_id FROM payments WHERE student_id = ? AND status = ? AND fee_id IN (?)'
//       db.query(paidSql, [studentId, 'success', feeIds], (err, paidResults) => {
//         if (err) {
//           return res.status(400).json({
//             message: err.message
//           })
//         }

//         const paidFeeIds = paidResults.map(p => p.fee_id)
//         const outstandingFees = feesResults.filter(f => !paidFeeIds.includes(f.id))

//         return res.status(200).json({
//           outstandingFees
//         })
//       })
//     })
//   })
// }

module.exports = {createFees, getAllFees, getFeesById, updateFees, deleteFees}
