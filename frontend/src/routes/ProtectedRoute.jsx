import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_DASHBOARD } from '../utils/constants.js'

/** Guards a route group. Backend authorization remains the real authority. */
export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <main role="status" aria-live="polite" className="p-lg text-text-secondary">
        Loading…
      </main>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DASHBOARD[user.role] || '/login'} replace />
  }

  return <Outlet />
}
