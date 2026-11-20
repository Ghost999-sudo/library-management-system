import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLE_DASHBOARD } from '../utils/constants.js'

/** Sends each role to its own dashboard after login or on a direct `/` visit. */
export default function RoleBasedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main role="status" aria-live="polite" className="p-lg text-text-secondary">
        Loading…
      </main>
    )
  }

  return <Navigate to={user ? ROLE_DASHBOARD[user.role] || '/login' : '/login'} replace />
}
