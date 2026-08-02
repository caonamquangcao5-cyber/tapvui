import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'

export default function Login() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [loading, setLoading] = useState(false)

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

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!validatePhone(form.phone)) return
    setLoading(true)
    try {
      const data = mode === 'login'
        ? await api.login({ phone: form.phone, password: form.password })
        : await api.register({ name: form.name, phone: form.phone, password: form.password })
      localStorage.setItem('token', data.token)
      setUser(data.user)
      const home = data.user.role === 'owner' ? '/owner' : data.user.role === 'pt' ? '/pt' : '/student'
      navigate(home)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-confetti">
      <div className="card max-w-md w-full animate-pop">
        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-2">
            <span className="text-5xl animate-bounce-slow">💪</span>
            <span className="text-5xl animate-float">🎉</span>
            <span className="text-5xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🔥</span>
          </div>
          <h1 className="text-4xl font-extrabold gradient-text text-shadow-fun">Tập Vui</h1>
          <p className="text-gray-500 mt-2 text-sm">Biến mỗi buổi tập thành một cuộc phiêu lưu! 🎮</p>
        </div>

        <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-2xl">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${mode === 'login' ? 'bg-white shadow text-primary' : 'text-gray-400'}`}
          >Đăng nhập</button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${mode === 'register' ? 'bg-white shadow text-primary' : 'text-gray-400'}`}
          >Đăng ký</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Tên của bạn"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
              required
            />
          )}
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={e => {
              const val = e.target.value.replace(/\D/g, '')
              setForm({ ...form, phone: val })
              if (val.length > 0) validatePhone(val)
              else setPhoneError('')
            }}
            className={`input-field ${phoneError ? 'border-red-400' : ''}`}
            maxLength={11}
            required
          />
          {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="input-field"
            required
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full text-lg">
            {loading ? 'Đang xử lý... ⏳' : mode === 'login' ? 'Vào tập thôi! 🚀' : 'Tham gia thôi! 🎉'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Không cần tải app. Mở link là tập! 💪
        </p>
      </div>
    </div>
  )
}
