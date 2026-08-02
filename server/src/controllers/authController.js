import bcrypt from 'bcryptjs'
import db from '../config/db.js'
import { generateToken } from '../middleware/auth.js'

function safeUser(u) {
  if (!u) return null
  return {
    id: u.id, name: u.name, phone: u.phone, role: u.role, avatar: u.avatar || '',
    email: u.email || '', address: u.address || '', gender: u.gender || '',
    age: u.age || '', weight: u.weight || '', height: u.height || '', goal: u.goal || '',
  }
}

export function register(req, res) {
  const { name, phone, password } = req.body

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

  const pt = db.find('users', u => u.role === 'pt')
  if (!pt) {
    return res.status(500).json({ error: 'Chưa có PT trong hệ thống' })
  }

  const hashed = bcrypt.hashSync(password, 10)

  const userResult = db.insert('users', {
    name, phone, password: hashed, plain_password: password, role: 'student', avatar: '',
  })

  db.insert('students', {
    user_id: userResult.lastInsertRowid,
    pt_id: pt.id,
    nickname: '',
    notes: '',
    total_points: 0,
    streak: 0,
    last_checkin: null,
  })

  const user = safeUser(db.find('users', u => u.id === userResult.lastInsertRowid))
  const token = generateToken(user)

  res.json({ user, token })
}

export function login(req, res) {
  const { phone, password } = req.body

  if (!phone || !password) {
    return res.status(400).json({ error: 'Vui lòng điền số điện thoại và mật khẩu' })
  }

  if (!/^\d{9,11}$/.test(phone)) {
    return res.status(400).json({ error: 'Số điện thoại phải từ 9 đến 11 chữ số' })
  }

  const user = db.find('users', u => u.phone === phone)
  if (!user) {
    return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' })
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' })
  }

  const token = generateToken(safeUser(user))
  res.json({ user: safeUser(user), token })
}

export function getMe(req, res) {
  const user = db.find('users', u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' })
  }
  res.json({ user: safeUser(user) })
}

export function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng điền mật khẩu cũ và mật khẩu mới' })
  }

  const user = db.find('users', u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' })
  }

  if (!bcrypt.compareSync(oldPassword, user.password)) {
    return res.status(401).json({ error: 'Mật khẩu cũ không đúng' })
  }

  const hashed = bcrypt.hashSync(newPassword, 10)
  db.update('users', u => u.id === req.user.id, { password: hashed, plain_password: newPassword })

  res.json({ success: true })
}

export function updateProfile(req, res) {
  const { name, avatar, email, address, gender, age, weight, height, goal } = req.body

  const user = db.find('users', u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy người dùng' })
  }

  db.update('users', u => u.id === req.user.id, {
    name: name ?? user.name,
    avatar: avatar ?? user.avatar ?? '',
    email: email ?? user.email ?? '',
    address: address ?? user.address ?? '',
    gender: gender ?? user.gender ?? '',
    age: age ?? user.age ?? '',
    weight: weight ?? user.weight ?? '',
    height: height ?? user.height ?? '',
    goal: goal ?? user.goal ?? '',
  })

  const updated = db.find('users', u => u.id === req.user.id)
  res.json({ user: safeUser(updated) })
}
