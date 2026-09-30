const jwt = require('jsonwebtoken')

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    req.user = null
    return next()
  }

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    req.user = err ? null : decoded
    next()
  })
}

module.exports = optionalAuth