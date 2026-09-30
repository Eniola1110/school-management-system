const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const cors = require('cors')
const db = require('./config/db')

const app = express()
const PORT = process.env.PORT

const authRoutes = require('./routes/authRoutes')
const studentRoutes = require('./routes/studentRoutes')
const teacherRoutes = require('./routes/teacherRoutes')
const classRoutes = require('./routes/classRoutes')
const subjectRoutes = require('./routes/subjectRoutes')
const attendanceRoutes = require('./routes/attendanceRoutes')
const resultRoutes = require('./routes/resultRoutes')
const feesRoutes = require('./routes/feeRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const parentRoutes = require('./routes/parentRoutes')
const announcementsRoutes = require('./routes/announcementsRoutes')
const timetableRoutes = require('./routes/timetableRoutes')

app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use('/api/payment', paymentRoutes)
const authMiddleware = require('./middleware/authMiddleware')
require('dotenv').config()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*', // 
  },
})

app.set('io', io)

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/teachers', teacherRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/results', resultRoutes)
app.use('/api/fees', feesRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/parents', parentRoutes)
app.use('/api/announcements', announcementsRoutes)
app.use('/api/timetable', timetableRoutes)

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})