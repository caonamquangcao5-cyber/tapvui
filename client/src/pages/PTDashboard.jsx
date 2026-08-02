import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import Avatar, { getGenderStyle } from '../components/Avatar.jsx'

export default function PTDashboard() {
  const { user, logout } = useAuth()
  const [students, setStudents] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: '', phone: '', password: '', nickname: '', notes: '', gender: '', age: '' })
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(true)

  function validatePhone(phone) {
    const cleaned = phone.replace(/\s/g, '')
    if (!/^\d+$/.test(cleaned)) {
      setPhoneError('Số điện thoại chỉ được nhập số')
      return false
    }
    if (cleaned.length < 9 || cleaned.length > 11) {
      setPhoneError('Số điện thoại phải từ 9 đến 11 số')
      return false
    }
    setPhoneError('')
    return true
  }

  const loadStudents = useCallback(async () => {
    try {
      const data = await api.listStudents()
      setStudents(data.students)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadStudents() }, [loadStudents])

  async function handleAddStudent(e) {
    e.preventDefault()
    setError('')
    if (!validatePhone(newStudent.phone)) return
    try {
      const data = await api.addStudent(newStudent)
      setStudents([data.student, ...students])
      setNewStudent({ name: '', phone: '', password: '', nickname: '', notes: '', gender: '', age: '' })
      setShowAdd(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleRemoveStudent(id, name) {
    if (!confirm(`Xóa học viên "${name}" khỏi danh sách? Toàn bộ dữ liệu (bài tập, check-in, badge) sẽ bị xóa.`)) return
    try {
      await api.removeStudent(id)
      setStudents(students.filter(s => s.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  function timeSince(dateStr) {
    if (!dateStr) return ''
    const start = new Date(dateStr)
    const now = new Date()
    const days = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Hôm nay'
    if (days < 30) return `${days} ngày`
    const months = Math.floor(days / 30)
    const remainDays = days % 30
    if (months < 12) return remainDays > 0 ? `${months} tháng ${remainDays} ngày` : `${months} tháng`
    const years = Math.floor(months / 12)
    const remainMonths = months % 12
    return remainMonths > 0 ? `${years} năm ${remainMonths} tháng` : `${years} năm`
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
  }

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} avatar={user?.avatar} gender={user?.gender} size="lg" />
          <div>
            <h1 className="text-xl font-extrabold gradient-text">PT Dashboard</h1>
            <p className="text-gray-500 text-sm">Chào {user?.name}! Sẵn sàng cháy cùng học viên? 🔥</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to="/settings" className="text-gray-400 hover:text-primary font-medium text-sm">⚙️ Cài đặt</Link>
          <button onClick={logout} className="text-gray-400 hover:text-red-500 font-medium text-sm">Đăng xuất</button>
        </div>
      </header>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-700 flex items-center gap-2">🏋️ Đội hình học viên</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm py-2 px-4">
          {showAdd ? 'Đóng' : '+ Thêm học viên 🎉'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddStudent} className="card mb-4 space-y-3 animate-pop">
          <input type="text" placeholder="Tên học viên" value={newStudent.name}
            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} className="input-field" required />
          <input type="tel" placeholder="Số điện thoại học viên" value={newStudent.phone}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '')
              setNewStudent({ ...newStudent, phone: val })
              if (val.length > 0) validatePhone(val)
              else setPhoneError('')
            }}
            className={`input-field ${phoneError ? 'border-red-400' : ''}`}
            maxLength={11} required />
          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
          <input type="password" placeholder="Mật khẩu cho học viên" value={newStudent.password}
            onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} className="input-field" required />
          <div className="flex gap-2">
            <select
              value={newStudent.gender}
              onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })}
              className="input-field flex-1"
            >
              <option value="">Giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
            <input type="number" placeholder="Tuổi" value={newStudent.age}
              onChange={e => setNewStudent({ ...newStudent, age: e.target.value })}
              className="input-field w-24" min="1" max="120" />
          </div>
          <input type="text" placeholder="Biệt danh (tùy chọn)" value={newStudent.nickname}
            onChange={e => setNewStudent({ ...newStudent, nickname: e.target.value })} className="input-field" />
          <textarea placeholder="Ghi chú (tùy chọn)" value={newStudent.notes}
            onChange={e => setNewStudent({ ...newStudent, notes: e.target.value })} className="input-field" rows={2} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="btn-secondary w-full">Thêm học viên 🎉</button>
        </form>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-8">Đang tải...</p>
      ) : students.length === 0 ? (
        <div className="card text-center py-12 bg-gradient-to-br from-soft to-lavender">
          <div className="text-6xl mb-3 animate-float">🏋️</div>
          <p className="text-gray-600 font-medium">Chưa có học viên nào!</p>
          <p className="text-gray-400 text-sm mt-1">Thêm học viên đầu tiên và bắt đầu hành trình cháy cùng họ! 🔥</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {students.map(s => {
            const style = getGenderStyle(s.gender)
            return (
              <div key={s.id} className={`card hover:shadow-xl transition-all relative ${style.border}`}>
                <Link to={`/pt/student/${s.id}`} className="block cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} avatar={s.avatar} gender={s.gender} size="md" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-700">{s.name}</p>
                        <span className="text-sm">{style.icon}</span>
                        {style.label && <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${style.badge}`}>{style.label}</span>}
                      </div>
                      {s.nickname && <p className="text-sm text-accent">"{s.nickname}"</p>}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs">
                        <span className="bg-soft px-2 py-0.5 rounded-full text-primary font-semibold">🔥 {s.total_points} điểm</span>
                        <span className="bg-mint px-2 py-0.5 rounded-full text-secondary font-semibold">⚡ {s.streak || 0} ngày</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t text-xs text-gray-400 flex flex-wrap items-center gap-2">
                    {s.age && <span className="text-gray-500 font-medium">🎂 {s.age} tuổi</span>}
                    {s.age && <span>•</span>}
                    <span>📅 {formatDate(s.created_at)}</span>
                    <span>•</span>
                    <span className="text-primary font-medium">⏱️ {timeSince(s.created_at)}</span>
                  </div>
                </Link>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemoveStudent(s.id, s.name) }}
                  className="absolute top-2 right-2 text-red-400 hover:text-red-600 hover:bg-red-50 text-xs font-medium px-2 py-1 rounded-lg transition-all"
                  title="Xóa học viên khỏi danh sách"
                >🗑️ Xóa</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
