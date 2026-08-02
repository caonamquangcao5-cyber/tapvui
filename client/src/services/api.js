const BASE = import.meta.env.VITE_API_BASE || '/api'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Có lỗi xảy ra')
  }
  return data
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  getConstants: () => request('/constants'),

  listStudents: () => request('/students'),
  addStudent: (body) => request('/students', { method: 'POST', body: JSON.stringify(body) }),
  getStudentDetail: (id) => request(`/students/${id}`),
  getMyProfile: () => request('/students/me'),
  updateStudent: (id, body) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  removeStudent: (id) => request(`/students/${id}`, { method: 'DELETE' }),

  createWorkout: (body) => request('/workouts', { method: 'POST', body: JSON.stringify(body) }),
  getWorkouts: (studentId) => request(`/workouts/${studentId}`),
  getTodayWorkout: (studentId) => request(`/workouts/${studentId}/today`),

  checkin: (body) => request('/checkins', { method: 'POST', body: JSON.stringify(body) }),
  getCheckins: (studentId) => request(`/checkins/${studentId}`),
  ptReaction: (body) => request('/checkins/reaction', { method: 'POST', body: JSON.stringify(body) }),

  changePassword: (body) => request('/auth/password', { method: 'PUT', body: JSON.stringify(body) }),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  adminListUsers: () => request('/admin/users'),
  adminDeleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  adminResetPassword: (id, body) => request(`/admin/users/${id}/password`, { method: 'PUT', body: JSON.stringify(body) }),
  adminExport: async () => {
    const res = await fetch(`${BASE}/admin/export`, { headers: { Authorization: `Bearer ${getToken()}` } })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Export thất bại')
    }
    return res.blob()
  },
  adminImport: (body) => request('/admin/import', { method: 'POST', body: JSON.stringify(body) }),
}
