import { Route, Routes } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { NAVIGATION, ROLE_DASHBOARD, ROLES } from '../utils/constants.js'
import LoginPage from '../pages/auth/LoginPage.jsx'
import AdminDashboard from '../pages/dashboards/AdminDashboard.jsx'
import LibrarianDashboard from '../pages/dashboards/LibrarianDashboard.jsx'
import MemberDashboard from '../pages/dashboards/MemberDashboard.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleBasedRoute from './RoleBasedRoute.jsx'

const dashboards = {
  [ROLES.ADMIN]: AdminDashboard,
  [ROLES.LIBRARIAN]: LibrarianDashboard,
  [ROLES.MEMBER]: MemberDashboard,
}

const placeholderRoutes = Object.fromEntries(
  Object.entries(NAVIGATION).map(([role, sections]) => [
    role,
    sections
      .flatMap((section) => section.items)
      .filter((item) => item.to && item.to !== ROLE_DASHBOARD[role])
      .map((item) => ({ to: item.to, label: item.label })),
  ]),
)

/** Placeholder for sections implemented in later phases. */
function Placeholder({ title }) {
  return (
    <div>
      <PageHeader title={title} breadcrumbs={[{ label: title }]} />
      <p className="text-body text-text-secondary">
        This screen is planned for a later phase. The backend endpoint already exists.
      </p>
    </div>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleBasedRoute />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {Object.values(ROLES).map((role) => {
            const Dashboard = dashboards[role]
            return (
              <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
                <Route path={ROLE_DASHBOARD[role]} element={<Dashboard />} />
                {placeholderRoutes[role].map(({ to, label }) => (
                  <Route key={to} path={to} element={<Placeholder title={label} />} />
                ))}
              </Route>
            )
          })}
        </Route>
      </Route>

      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  )
}
