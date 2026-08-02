import bcrypt from 'bcryptjs'
import db from '../config/db.js'

function safeUser(u) {
  if (!u) return null
  return {
    id: u.id, name: u.name, phone: u.phone, role: u.role, avatar: u.avatar || '',
    created_at: u.created_at, email: u.email || '', address: u.address || '',
    gender: u.gender || '', age: u.age || '', weight: u.weight || '',
    height: u.height || '', goal: u.goal || '', plain_password: u.plain_password || '',
  }
}

export function listUsers(req, res) {
  const users = db.findAll('users')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map(u => {
      const student = db.find('students', s => s.user_id === u.id)
      return {
        ...safeUser(u),
        email: u.email || '',
        address: u.address || '',
        gender: u.gender || '',
        age: u.age || '',
        weight: u.weight || '',
        height: u.height || '',
        goal: u.goal || '',
        total_points: student?.total_points || 0,
        streak: student?.streak || 0,
      }
    })
  res.json({ users })
}

export function deleteUser(req, res) {
  const userId = parseInt(req.params.id)
  const user = db.find('users', u => u.id === userId)

  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
  }

  if (user.role === 'pt' || user.role === 'owner') {
    return res.status(400).json({ error: 'Không thể xóa tài khoản này' })
  }

  db.update('students', s => s.user_id === userId, { _deleted: true })
  const students = db.raw().students
  const idx = students.findIndex(s => s.user_id === userId)
  if (idx >= 0) students.splice(idx, 1)

  const users = db.raw().users
  const uIdx = users.findIndex(u => u.id === userId)
  if (uIdx >= 0) users.splice(uIdx, 1)

  db.save()
  res.json({ success: true })
}

export function resetPassword(req, res) {
  const userId = parseInt(req.params.id)
  const { newPassword } = req.body

  if (!newPassword) {
    return res.status(400).json({ error: 'Vui lòng nhập mật khẩu mới' })
  }

  const user = db.find('users', u => u.id === userId)
  if (!user) {
    return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
  }

  const hashed = bcrypt.hashSync(newPassword, 10)
  db.update('users', u => u.id === userId, { password: hashed, plain_password: newPassword })

  res.json({ success: true })
}

export function exportData(req, res) {
  const allData = db.exportData()
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Content-Disposition', `attachment; filename="tapvui_backup_${new Date().toISOString().slice(0, 10)}.json"`)
  res.json(allData)
}

export function importData(req, res) {
  const newData = req.body

  if (!newData || typeof newData !== 'object') {
    return res.status(400).json({ error: 'File dữ liệu không hợp lệ' })
  }

  if (!Array.isArray(newData.users) || !Array.isArray(newData.students)) {
    return res.status(400).json({ error: 'Cấu trúc dữ liệu không hợp lệ' })
  }

  const result = db.importData(newData)
  if (!result.success) {
    return res.status(400).json({ error: result.error })
  }

  res.json({ success: true, message: 'Khôi phục dữ liệu thành công' })
}
