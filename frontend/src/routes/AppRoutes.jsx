import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleBasedRoute from './RoleBasedRoute.jsx'

/** Phase 1/2 placeholder. Real screens are added in Phases 3-10. */
function Placeholder({ title }) {
  return (
    <div>
      <PageHeader title={title} />
      <p className="text-body text-text-secondary">
        Foundation scaffold — this screen is implemented in a later phase.
      </p>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleBasedRoute />} />
      <Route path="/login" element={<Placeholder title="Sign in" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<Placeholder title="Admin dashboard" />} />
          <Route path="/librarian/dashboard" element={<Placeholder title="Librarian dashboard" />} />
          <Route path="/member/dashboard" element={<Placeholder title="My library" />} />
        </Route>
      </Route>

      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  )
}
