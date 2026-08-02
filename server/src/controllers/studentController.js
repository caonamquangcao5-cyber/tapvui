import bcrypt from 'bcryptjs'
import db from '../config/db.js'

function enrichStudent(s) {
  if (!s) return null
  const user = db.find('users', u => u.id === s.user_id)
  return {
    ...s, name: user?.name, phone: user?.phone, avatar: user?.avatar || '',
    email: user?.email || '', address: user?.address || '', gender: user?.gender || '',
    age: user?.age || '', weight: user?.weight || '', height: user?.height || '', goal: user?.goal || '',
  }
}

export function listStudents(req, res) {
  const students = db.findAll('students', s => s.pt_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(enrichStudent)
  res.json({ students })
}

export function addStudent(req, res) {
  const { name, phone, password, nickname, notes, gender, age } = req.body

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Vui lòng điền đủ tên, số điện thoại và mật khẩu' })
  }

  if (!/^\d{9,11}$/.test(phone)) {
    return res.status(400).json({ error: 'Số điện thoại phải từ 9 đến 11 chữ số' })
  }

  const existing = db.find('users', u => u.phone === phone)
  if (existing) {
    return res.status(409).json({ error: 'Số điện thoại đã được đăng ký' })
  }

  const hashed = bcrypt.hashSync(password, 10)

  const userResult = db.insert('users', {
    name, phone, password: hashed, plain_password: password, role: 'student', avatar: '',
    gender: gender || '', age: age || '',
  })

  const studentResult = db.insert('students', {
    user_id: userResult.lastInsertRowid,
    pt_id: req.user.id,
    nickname: nickname || '',
    notes: notes || '',
    total_points: 0,
    streak: 0,
    last_checkin: null,
  })

  const student = enrichStudent(db.find('students', s => s.id === studentResult.lastInsertRowid))
  res.json({ student })
}

export function getStudentDetail(req, res) {
  const studentId = parseInt(req.params.id)

  const student = enrichStudent(db.find('students', s => s.id === studentId && s.pt_id === req.user.id))
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học viên' })
  }

  const workouts = db.findAll('workouts', w => w.student_id === studentId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(w => ({ ...w, tasks: w.tasks }))

  const badges = db.findAll('badges', b => b.student_id === studentId)
    .sort((a, b) => new Date(b.earned_at) - new Date(a.earned_at))

  const checkins = db.findAll('checkins', c => c.student_id === studentId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(c => {
      const w = db.find('workouts', wo => wo.id === c.workout_id)
      return { ...c, workout_title: w?.title, workout_date: w?.date }
    })

  res.json({ student, workouts, badges, checkins })
}

export function getMyProfile(req, res) {
  const student = enrichStudent(db.find('students', s => s.user_id === req.user.id))
  if (!student) {
    return res.status(404).json({ error: 'Bạn chưa được PT thêm vào danh sách' })
  }

  const pt = db.find('users', u => u.id === student.pt_id)
  res.json({
    student,
    pt: pt ? { id: pt.id, name: pt.name, phone: pt.phone, avatar: pt.avatar || '' } : null,
  })
}

export function updateStudent(req, res) {
  const studentId = parseInt(req.params.id)
  const { nickname, notes } = req.body

  const student = db.find('students', s => s.id === studentId && s.pt_id === req.user.id)
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học viên' })
  }

  db.update('students', s => s.id === studentId, {
    nickname: nickname ?? student.nickname,
    notes: notes ?? student.notes,
  })

  res.json({ success: true })
}

export function removeStudent(req, res) {
  const studentId = parseInt(req.params.id)

  const student = db.find('students', s => s.id === studentId && s.pt_id === req.user.id)
  if (!student) {
    return res.status(404).json({ error: 'Không tìm thấy học viên' })
  }

  const students = db.raw().students
  const sIdx = students.findIndex(s => s.id === studentId)
  if (sIdx >= 0) students.splice(sIdx, 1)

  const users = db.raw().users
  const uIdx = users.findIndex(u => u.id === student.user_id)
  if (uIdx >= 0) users.splice(uIdx, 1)

  const workouts = db.raw().workouts
  for (let i = workouts.length - 1; i >= 0; i--) {
    if (workouts[i].student_id === studentId) workouts.splice(i, 1)
  }

  const checkins = db.raw().checkins
  for (let i = checkins.length - 1; i >= 0; i--) {
    if (checkins[i].student_id === studentId) checkins.splice(i, 1)
  }

  const badges = db.raw().badges
  for (let i = badges.length - 1; i >= 0; i--) {
    if (badges[i].student_id === studentId) badges.splice(i, 1)
  }

  db.save()
  res.json({ success: true })
}
