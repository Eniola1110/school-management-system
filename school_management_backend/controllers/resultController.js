const db = require("../config/db");

// Create Result
const createResults = (req, res) => {
  const { student_id, subject_id, class_id, ca_score, exam_score, term, session} = req.body;

  if ( !student_id || !subject_id || !class_id || ca_score == null || exam_score == null || !term || !session ) {
    return res.status(400).json({
      message: "All fields are required.",
    });
  }

  const total = Number(ca_score) + Number(exam_score);

  let grade;
  if (total >= 70) grade = "A";
  else if (total >= 60) grade = "B";
  else if (total >= 50) grade = "C";
  else if (total >= 45) grade = "D";
  else if (total >= 40) grade = "E";
  else grade = "F";

  // Prevent duplicate result
  const checkSql = `SELECT * FROM results WHERE student_id = ? AND subject_id = ? AND term = ? AND session = ?`;

  db.query( checkSql, [student_id, subject_id, term, session], (err, rows) => {
      if (err) {
        return res.status(500).json({
          message: err.message
        });
      }

      if (rows.length > 0) {
        return res.status(409).json({
          message: "Result already exists for this subject.",
        });
      }

      const sql = `INSERT INTO results (student_id, subject_id, class_id, ca_score, exam_score, total, grade, term, session) VALUES (?,?,?,?,?,?,?,?,?)`;

      db.query(sql, [ student_id, subject_id, class_id, ca_score, exam_score, total, grade, term, session, ], (err) => {
          if (err) {
            return res.status(500).json({
              message: err.message,
            });
          }

          return res.status(201).json({
            message: "Result added successfully",
          });
        }
      );
    }
  );
};

// Get all results
const getAllResults = (req, res) => {
  const sql = `SELECT r.id, r.student_id, r.subject_id, r.class_id, st.full_name AS student_name, sub.subject_name, c.class_name, r.ca_score, r.exam_score, r.total, r.grade, r.term, r.session FROM results r

    JOIN students st ON r.student_id = st.id

    JOIN subjects sub ON r.subject_id = sub.id

    JOIN classes c ON r.class_id = c.id

    ORDER BY student_name, sub.subject_name`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    return res.status(200).json(results);
  });
};

// Get one result
const getResultsById = (req, res) => {
  const { id } = req.params;

  const sql = ` SELECT r.*, st.full_name AS student_name, sub.subject_name,  c.class_name FROM results r

    JOIN students st ON r.student_id = st.id

    JOIN subjects sub ON r.subject_id = sub.id

    JOIN classes c ON r.class_id = c.id

    WHERE r.id = ?`;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    return res.status(200).json(results[0]);
  });
};

// Get all results for one student
const getStudentResults = (req, res) => {
  const { studentId } = req.params;

  const sql = ` SELECT r.id, r.student_id, r.subject_id, r.class_id, st.full_name AS student_name, c.class_name, sub.subject_name, r.ca_score, r.exam_score, r.total, r.grade, r.term, r.session FROM results r

    JOIN subjects sub ON r.subject_id = sub.id
    JOIN students st ON r.student_id = st.id
    JOIN classes c ON r.class_id = c.id
    WHERE r.student_id = ?

    ORDER BY sub.subject_name
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    return res.status(200).json(results);
  });
};

// Update Result
const updateResults = (req, res) => {
  const { id } = req.params;

  const { student_id, subject_id, class_id, ca_score, exam_score, term, session, } = req.body;

  const total = Number(ca_score) + Number(exam_score);

  let grade;
  if (total >= 70) grade = "A";
  else if (total >= 60) grade = "B";
  else if (total >= 50) grade = "C";
  else if (total >= 45) grade = "D";
  else if (total >= 40) grade = "E";
  else grade = "F";

  const sql = `UPDATE results SET student_id=?, subject_id=?, class_id=?, ca_score=?, exam_score=?, total=?, grade=?, term=?, session=? WHERE id=?`;

  db.query( sql, [ student_id, subject_id, class_id, ca_score, exam_score, total, grade, term, session, id, ], (err, results) => {
      if (err) {
        return res.status(500).json({
          message: err.message,
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          message: "Result not found",
        });
      }

      return res.status(200).json({
        message: "Result updated successfully",
      });
    }
  );
};

// Delete Result
const deleteResults = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM results WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: err.message,
      });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({
        message: "Result not found",
      });
    }

    return res.status(200).json({
      message: "Result deleted successfully",
    });
  });
};

module.exports = {createResults, getAllResults, getResultsById, getStudentResults, updateResults, deleteResults};