// const db = require('../config/db')

// // create payment
// const createPayments = (req, res) => {
//   const { student_id, fee_id, amount_paid, date_paid, receipt_no, recorded_by } = req.body

//   if (!student_id || !fee_id || !amount_paid || !date_paid || !receipt_no) {
//     return res.status(400).json({
//       message: "All data are required."
//     })
//   }

//   const sql = 'INSERT INTO payments (student_id, fee_id, amount_paid, date_paid, receipt_no, recorded_by) VALUES (?,?,?,?,?,?)'
//   db.query(sql, [student_id, fee_id, amount_paid, date_paid, receipt_no, recorded_by], (err, results) => {
//     if (err) {
//       return res.status(400).json({
//         message: err.message
//       })
//     }
//     return res.status(201).json({
//       message: 'Payments added successfully'
//     })
//   })
// }

// // get all payments
// const getAllPayments = (req, res) => {
//   const sql = 'SELECT * FROM payments'

//   db.query(sql, (err, results) => {
//     if (err) {
//       return res.status(400).json({
//         message: err.message
//       })
//     }
//     return res.status(200).json({
//       payments: results
//     })
//   })
// }

// // get a payments
// const getPaymentsById = (req, res) => {
//   const {id} = req.params
//   const sql = 'SELECT * FROM payments WHERE id = ?'
//   db.query(sql, [id], (err, results) => {
//     if (err) {
//       return res.status(400).json({
//         message: err.message
//       })
//     }

//     if (results.length === 0) {
//       return res.status(404).json({
//         message: 'Payments not found'
//       })
//     }
//     return res.status(200).json({
//       payments: results[0]
//     })
//   })
// }

// // update a payments
// const updatePayments = (req, res) => {
//   const { id } = req.params
//   const { student_id, fee_id, amount_paid, date_paid, receipt_no, recorded_by} = req.body
  
//   const sql = 'UPDATE payments SET student_id = ?, fee_id = ?, amount_paid = ?, date_paid = ?, receipt_no = ?, recorded_by = ? WHERE id=?'

//   db.query(sql, [ student_id, fee_id, amount_paid, date_paid, receipt_no, recorded_by, id ], (err, results) => {
//     if (err) {
//       return res.status(400).json({
//         message: err.message
//       })
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({
//         message: 'Payments not found'
//       })
//     }
//     return res.status(200).json({
//       message: 'Payments updated successfully'
//     })
//   })
// }

// // delete a payments
// const deletePayments = (req, res) => {
//   const { id } = req.params
//   const sql = 'DELETE FROM payments WHERE id = ?'

//   db.query(sql, [id], (err, results) => {
//     if (err) {
//       return res.status(400).json({
//         message: err.message
//       })
//     }
//     if (results.affectedRows === 0) {
//       return res.status(404).json({
//         message: 'Payments not found'
//       })
//     }
//     return res.status(200).json({
//       message: 'Payments deleted successfully'
//     })
//   })
// }
// module.exports = {createPayments, getAllPayments, getPaymentsById, updatePayments, deletePayments}
