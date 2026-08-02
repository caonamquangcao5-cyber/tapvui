import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import Avatar, { getAvatarPresets, getGenderStyle } from '../components/Avatar.jsx'

export default function Settings() {
  const { user, setUser, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    email: user?.email || '',
    address: user?.address || '',
    gender: user?.gender || '',
    age: user?.age || '',
    weight: user?.weight || '',
    height: user?.height || '',
    goal: user?.goal || '',
  })
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setSavingProfile(true)
    try {
      const data = await api.updateProfile(profile)
      setUser(data.user)
      setProfileSuccess('Cập nhật thành công!')
    } catch (err) {
      setProfileError(err.message)
    }
    setSavingProfile(false)
  }

  function handlePhotoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setProfileError('Ảnh quá lớn, vui lòng chọn ảnh dưới 10MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 200
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        // Crop to square from center
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
        setProfile(prev => ({ ...prev, avatar: dataUrl }))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  async function handlePwSubmit(e) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (!pwForm.oldPassword || !pwForm.newPassword) {
      setPwError('Vui lòng điền đủ thông tin')
      return
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Mật khẩu mới không khớp')
      return
    }

    setSavingPw(true)
    try {
      await api.changePassword({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword })
      setPwSuccess('Đổi mật khẩu thành công!')
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPwError(err.message)
    }
    setSavingPw(false)
  }

  const homePath = user?.role === 'owner' ? '/owner' : user?.role === 'pt' ? '/pt' : '/student'

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto pb-20">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-primary">⚙️ Cài đặt</h1>
        <button onClick={() => navigate(homePath)}
          className="text-gray-400 hover:text-primary font-medium">← Quay lại</button>
      </header>

      <div className="card mb-4 flex items-center gap-4">
        <Avatar name={user?.name} avatar={user?.avatar} gender={user?.gender} size="lg" />
        <div>
          <p className="text-gray-500 text-sm">Tài khoản</p>
          <p className="font-bold text-lg text-gray-700">{user?.name}</p>
          <p className="text-gray-400">{user?.phone}</p>
          <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'pt' ? 'bg-soft text-primary' : user?.role === 'owner' ? 'bg-red-100 text-red-600' : 'bg-mint text-secondary'}`}>
            {user?.role === 'pt' ? '👨‍🏫 PT' : user?.role === 'owner' ? '🔐 Owner' : '🏋️ Học viên'}
          </span>
        </div>
      </div>

      <form onSubmit={handleProfileSubmit} className="card mb-4 space-y-3">
        <h2 className="font-bold text-gray-700">Thông tin cá nhân</h2>

        <div className="flex items-center gap-4">
          <Avatar name={profile.name} avatar={profile.avatar} gender={profile.gender} size="lg" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-2">Ảnh đại diện</p>
            <div className="flex gap-2 mb-2">
              <label className="btn-secondary text-sm cursor-pointer py-1.5 px-3">
                📷 Tải ảnh lên
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
              {profile.avatar && profile.avatar.startsWith('data:image') && (
                <button
                  type="button"
                  onClick={() => setProfile({ ...profile, avatar: '' })}
                  className="text-red-400 hover:text-red-600 text-sm py-1.5 px-3"
                >Gỡ ảnh</button>
              )}
            </div>
            <p className="text-xs text-gray-400 mb-1">Hoặc chọn emoji:</p>
            <div className="flex flex-wrap gap-1.5">
              {getAvatarPresets(profile.gender).map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setProfile({ ...profile, avatar: emoji })}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${profile.avatar === emoji ? 'bg-primary text-white scale-110 shadow-md' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <input
          type="text"
          placeholder="Họ và tên"
          value={profile.name}
          onChange={e => setProfile({ ...profile, name: e.target.value })}
          className="input-field"
        />
        <input
          type="email"
          placeholder="Email"
          value={profile.email}
          onChange={e => setProfile({ ...profile, email: e.target.value })}
          className="input-field"
        />
        <input
          type="text"
          placeholder="Địa chỉ"
          value={profile.address}
          onChange={e => setProfile({ ...profile, address: e.target.value })}
          className="input-field"
        />
        <div className="flex gap-2">
          <select
            value={profile.gender}
            onChange={e => setProfile({ ...profile, gender: e.target.value })}
            className="input-field flex-1"
          >
            <option value="">Giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
          <input
            type="number"
            placeholder="Tuổi"
            value={profile.age}
            onChange={e => setProfile({ ...profile, age: e.target.value })}
            className="input-field w-24"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Cân nặng (kg)"
            value={profile.weight}
            onChange={e => setProfile({ ...profile, weight: e.target.value })}
            className="input-field flex-1"
          />
          <input
            type="number"
            placeholder="Chiều cao (cm)"
            value={profile.height}
            onChange={e => setProfile({ ...profile, height: e.target.value })}
            className="input-field flex-1"
          />
        </div>
        <input
          type="text"
          placeholder="Mục tiêu tập luyện"
          value={profile.goal}
          onChange={e => setProfile({ ...profile, goal: e.target.value })}
          className="input-field"
        />
        {profileError && <p className="text-red-500 text-sm">{profileError}</p>}
        {profileSuccess && <p className="text-green-500 text-sm">{profileSuccess}</p>}
        <button type="submit" disabled={savingProfile} className="btn-primary w-full">
          {savingProfile ? 'Đang lưu...' : 'Lưu thông tin ✅'}
        </button>
      </form>

      <form onSubmit={handlePwSubmit} className="card space-y-3">
        <h2 className="font-bold text-gray-700">Đổi mật khẩu</h2>
        <input
          type="password"
          placeholder="Mật khẩu hiện tại"
          value={pwForm.oldPassword}
          onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          value={pwForm.newPassword}
          onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
          className="input-field"
          required
        />
        <input
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={pwForm.confirmPassword}
          onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
          className="input-field"
          required
        />
        {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
        {pwSuccess && <p className="text-green-500 text-sm">{pwSuccess}</p>}
        <button type="submit" disabled={savingPw} className="btn-secondary w-full">
          {savingPw ? 'Đang xử lý...' : 'Đổi mật khẩu 🔒'}
        </button>
      </form>

      <button onClick={() => { logout(); navigate('/login') }}
        className="mt-4 w-full text-red-400 hover:text-red-600 font-medium py-2">
        Đăng xuất
      </button>
    </div>
  )
}
