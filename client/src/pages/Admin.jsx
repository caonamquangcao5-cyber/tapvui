import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../services/api.js'
import Avatar from '../components/Avatar.jsx'

export default function Admin() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [resetId, setResetId] = useState(null)
  const [newPass, setNewPass] = useState('')
  const [importMsg, setImportMsg] = useState('')

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.adminListUsers()
      setUsers(data.users)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleDelete(id) {
    if (!confirm('Xóa tài khoản này?')) return
    try {
      await api.adminDeleteUser(id)
      setUsers(users.filter(u => u.id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleReset(id) {
    if (!newPass) {
      setError('Vui lòng nhập mật khẩu mới')
      return
    }
    try {
      await api.adminResetPassword(id, { newPassword: newPass })
      setResetId(null)
      setNewPass('')
      alert('Đặt lại mật khẩu thành công')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleExport() {
    try {
      const blob = await api.adminExport()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tapvui_backup_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setImportMsg('')
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!confirm('Khôi phục dữ liệu sẽ ghi đè toàn bộ dữ liệu hiện tại. Bạn chắc chắn?')) return
        const result = await api.adminImport(data)
        setImportMsg('✅ ' + (result.message || 'Khôi phục thành công'))
        loadUsers()
      } catch (err) {
        setImportMsg('❌ File không hợp lệ: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Đang tải... ⏳</div>

  return (
    <div className="min-h-screen p-4 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-gray-700">🔐 Quản trị hệ thống</h1>
        <button onClick={() => { logout(); navigate('/login') }}
          className="text-gray-400 hover:text-red-500 font-medium">Đăng xuất</button>
      </header>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="card mb-4 p-4">
        <h2 className="font-bold text-gray-700 mb-2">💾 Sao lưu & Khôi phục dữ liệu</h2>
        <p className="text-gray-400 text-sm mb-3">Tải backup trước khi update web. Upload lại sau khi update xong.</p>
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={handleExport}
            className="btn-primary text-sm">📥 Tải backup</button>
          <label className="btn-secondary text-sm cursor-pointer">
            📤 Khôi phục từ file
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
          {importMsg && <span className="text-sm">{importMsg}</span>}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-2 px-2">Avatar</th>
              <th className="py-2 px-2">Tên</th>
              <th className="py-2 px-2">SĐT</th>
              <th className="py-2 px-2">Mật khẩu</th>
              <th className="py-2 px-2">Vai trò</th>
              <th className="py-2 px-2">Giới tính</th>
              <th className="py-2 px-2">Tuổi</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Cân nặng</th>
              <th className="py-2 px-2">Chiều cao</th>
              <th className="py-2 px-2">Mục tiêu</th>
              <th className="py-2 px-2">Điểm</th>
              <th className="py-2 px-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-2 px-2"><Avatar name={u.name} avatar={u.avatar} gender={u.gender} size="sm" /></td>
                <td className="py-2 px-2 font-medium text-gray-700">{u.name}</td>
                <td className="py-2 px-2 text-gray-500">{u.phone}</td>
                <td className="py-2 px-2 text-gray-500 font-mono">{u.plain_password || '(đã đặt)'}</td>
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === 'pt' ? 'bg-soft text-primary' : u.role === 'owner' ? 'bg-red-100 text-red-600' : 'bg-mint text-secondary'}`}>
                    {u.role === 'pt' ? 'PT' : u.role === 'owner' ? 'Owner' : 'Học viên'}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-500">{u.gender === 'male' ? 'Nam' : u.gender === 'female' ? 'Nữ' : u.gender === 'other' ? 'Khác' : '-'}</td>
                <td className="py-2 px-2 text-gray-500">{u.age || '-'}</td>
                <td className="py-2 px-2 text-gray-500">{u.email || '-'}</td>
                <td className="py-2 px-2 text-gray-500">{u.weight ? `${u.weight}kg` : '-'}</td>
                <td className="py-2 px-2 text-gray-500">{u.height ? `${u.height}cm` : '-'}</td>
                <td className="py-2 px-2 text-gray-500 max-w-[120px] truncate">{u.goal || '-'}</td>
                <td className="py-2 px-2">{u.total_points || 0}</td>
                <td className="py-2 px-2">
                  {u.role !== 'pt' && u.role !== 'owner' && (
                    <button onClick={() => handleDelete(u.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium mr-2">Xóa</button>
                  )}
                  <button onClick={() => { setResetId(resetId === u.id ? null : u.id); setNewPass('') }}
                    className="text-primary hover:text-primary/80 text-xs font-medium">Đặt lại MK</button>
                  {resetId === u.id && (
                    <div className="mt-2 flex gap-1 items-center">
                      <input
                        type="text"
                        placeholder="Mật khẩu mới"
                        value={newPass}
                        onChange={e => setNewPass(e.target.value)}
                        className="border-2 border-gray-200 rounded-lg px-2 py-1 text-sm focus:border-primary focus:outline-none w-32"
                      />
                      <button onClick={() => handleReset(u.id)}
                        className="btn-primary text-xs py-1 px-3 whitespace-nowrap">Lưu</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
