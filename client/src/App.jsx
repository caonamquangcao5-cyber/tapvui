import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import PTDashboard from './pages/PTDashboard.jsx'
import StudentView from './pages/StudentView.jsx'
import StudentDetail from './pages/StudentDetail.jsx'
import Settings from './pages/Settings.jsx'
import Admin from './pages/Admin.jsx'

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Đang tải... ⏳</div>
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'owner' ? '/owner' : user.role === 'pt' ? '/pt' : '/student'} replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-screen text-xl">Đang tải... ⏳</div>

  const homePath = user ? (user.role === 'owner' ? '/owner' : user.role === 'pt' ? '/pt' : '/student') : '/login'

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={homePath} replace /> : <Login />} />
      <Route path="/pt" element={<ProtectedRoute role="pt"><PTDashboard /></ProtectedRoute>} />
      <Route path="/pt/student/:id" element={<ProtectedRoute role="pt"><StudentDetail /></ProtectedRoute>} />
      <Route path="/student" element={<ProtectedRoute role="student"><StudentView /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/owner" element={<ProtectedRoute role="owner"><Admin /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
