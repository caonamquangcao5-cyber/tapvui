import db from '../config/db.js'

export function createWorkout(req, res) {
  const { studentId, title, date, tasks } = req.body

  if (!studentId || !title || !date || !tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Thiếu thông tin buổi tập' })
  }

  const student = db.find('students', s => s.id === studentId && s.pt_id === req.user.id)
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học viên' })
  }

  const result = db.insert('workouts', {
    student_id: studentId,
    pt_id: req.user.id,
    title,
    date,
    tasks,
    status: 'pending',
  })

  const workout = db.find('workouts', w => w.id === result.lastInsertRowid)
  res.json({ workout })
}

export function getWorkouts(req, res) {
  const studentId = parseInt(req.params.studentId)

  if (req.user.role === 'pt') {
    const student = db.find('students', s => s.id === studentId && s.pt_id === req.user.id)
    if (!student) {
      return res.status(404).json({ error: 'Không tìm thấy học viên' })
    }
  } else {
    const student = db.find('students', s => s.id === studentId && s.user_id === req.user.id)
    if (!student) {
      return res.status(403).json({ error: 'Không có quyền' })
    }
  }

  const workouts = db.findAll('workouts', w => w.student_id === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  res.json({ workouts })
}

export function getTodayWorkout(req, res) {
  const studentId = parseInt(req.params.studentId)
  const today = new Date().toISOString().split('T')[0]

  if (req.user.role === 'student') {
    const student = db.find('students', s => s.id === studentId && s.user_id === req.user.id)
    if (!student) {
      return res.status(403).json({ error: 'Không có quyền' })
    }
  }

  const workouts = db.findAll('workouts', w => w.student_id === studentId && w.date === today)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  const workout = workouts[0] || null
  const checkin = workout ? db.find('checkins', c => c.workout_id === workout.id) : null

  res.json({ workout, checkin })
}
