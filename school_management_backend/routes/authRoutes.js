const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('../config/db.js')

// register
router.post('/register', async (req, res) => {
  const {  password, full_name, username, role } = req.body
  
  if (!full_name || !password || !role || !username) {
    return res.status(400).json({
      message: 'All field are required'
    })
  }

  try {
    const checkSql = 'SELECT * FROM users WHERE username = ?'
    db.query(checkSql, [username], async (err, results) => {
      if (err) {
        return res.status(400).json({
          message: err.message
        })
      }
      if (results.length > 0) {
        return res.status(400).json({
         message: 'Username already exists'
       })
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // save user to database

      const sql = 'INSERT INTO users (full_name, password, role, username) VALUES(?,?,?,?)'

      db.query(sql, [full_name, hashedPassword, role, username], (err, results) => {
        if (err) {
          return res.status(400).json({
            message: err.message
          })
        }
        res.status(201).json({
          message: 'User registered successfully',
          user_id: results.insertId
        })
      })
    })
  }
  catch (err) {
    return res.status(400).json({
      message: err.message
    })
  }
})

router.post('/login', (req, res) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.status(400).json({
      message: 'Enter username and password'
    })
  }

  const sql = 'SELECT * FROM users WHERE username = ?'
  db.query(sql, [username], async (err, results) => {
    if (err) {
      return res.status(400).json({
        message: err.message
      })
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: 'Invalid username'
      })
    }
    // console.log('password during login:', password)

    const user = results[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Incorrect password'
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {expiresIn: '24h'}
    )

    return res.status(200).json({
      message: 'login successful',
      token,
      user:{
        id: user.id,
        full_name: user.full_name,
        role: user.role
      }
    })
  })
})

//  change password
router.put('/change-password', async (req, res) => {
  const { current_password, new_password } = req.body
  const authHeader = req.headers.authorization

  if (!authHeader) return res.status(401).json({
    message: 'No token provided'
  })

  const token = authHeader.split(' ')[1]
  const jwt = require('jsonwebtoken')

  let decoded 
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  }
  catch (err) {
    return res.status(403).json({
      message: 'Invalid token'
    })
  }
  const sql = 'SELECT * FROM users WHERE id = ?'
  db.query(sql, [decoded.id], async (err, results) => {
    if (err) return res.status(400).json({
      message: err.message
    })
    if (results.length === 0) return res.status(404).json({
      message: 'User not found'
    })

    const user = results[0]
    const isMatch = await bcrypt.compare(current_password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        message: 'Current password is incorrect'
      })
    }

    const hashedNew = await bcrypt.hash(new_password, 10)
    const updateSql = 'UPDATE users SET password = ? WHERE id = ?'

    db.query(updateSql, [hashedNew, decoded.id], (err) => {
      if (err) return res.status(400).json({
        message: err.message
      })
      res.status(200).json({
        message: 'Password changed successfully'
      })
    })
  })
})

module.exports = router