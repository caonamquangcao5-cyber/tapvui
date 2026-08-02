import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import workoutRoutes from './routes/workouts.js'
import checkinRoutes from './routes/checkins.js'
import adminRoutes from './routes/admin.js'
import { MOODS, BADGES, PT_REACTIONS, POST_FEELINGS, POST_WORKOUT_LABELS } from './config/constants.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    if (origin.startsWith('http://localhost:')) return cb(null, true)
    if (origin.startsWith('http://127.0.0.1:')) return cb(null, true)
    return cb(null, false)
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tập Vui API đang chạy 💪🎉' })
})

app.get('/api/constants', (req, res) => {
  res.json({ moods: MOODS, badges: BADGES, ptReactions: PT_REACTIONS, postFeelings: POST_FEELINGS, postWorkoutLabels: POST_WORKOUT_LABELS })
})

app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/workouts', workoutRoutes)
app.use('/api/checkins', checkinRoutes)
app.use('/api/admin', adminRoutes)

app.use((err, req, res, next) => {
  console.error('Lỗi server:', err)
  res.status(500).json({ error: 'Có lỗi xảy ra, vui lòng thử lại' })
})

const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist')
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath))
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'))
  })
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Tập Vui API chạy tại http://localhost:${PORT}`)
})
