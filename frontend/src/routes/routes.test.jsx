import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROLE_DASHBOARD, ROLES } from '../utils/constants.js'
import ProtectedRoute from './ProtectedRoute.jsx'
import RoleBasedRoute from './RoleBasedRoute.jsx'

const auth = vi.hoisted(() => ({ user: null, loading: false }))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => auth,
}))

const routeStubs = [
  <Route key="login" path="/login" element={<p>Login screen</p>} />,
  ...Object.values(ROLES).map((role) => (
    <Route key={role} path={ROLE_DASHBOARD[role]} element={<p>{role.charAt(0) + role.slice(1).toLowerCase()} home</p>} />
  )),
]

function renderGuardedRoute(path = '/admin/users', allowedRoles = [ROLES.ADMIN]) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        {routeStubs}
        <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
          <Route path="/admin/users" element={<p>Admin users</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

function renderRootRoute() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        {routeStubs}
        <Route path="/" element={<RoleBasedRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  auth.user = null
  auth.loading = false
})

describe('ProtectedRoute', () => {
  it('redirects an unauthenticated visit to the login screen', async () => {
    renderGuardedRoute()

    expect(await screen.findByText('Login screen')).toBeInTheDocument()
    expect(screen.queryByText('Admin users')).not.toBeInTheDocument()
  })

  it('shows a loading status instead of redirecting while auth is restoring', () => {
    auth.loading = true
    renderGuardedRoute()

    expect(screen.getByRole('status')).toHaveTextContent('Loading…')
  })

  it('sends a signed-in user with the wrong role to their own dashboard', async () => {
    auth.user = { userId: 2, role: ROLES.LIBRARIAN }
    renderGuardedRoute()

    expect(await screen.findByText('Librarian home')).toBeInTheDocument()
    expect(screen.queryByText('Admin users')).not.toBeInTheDocument()
  })

  it('renders the route for a user with an allowed role', async () => {
    auth.user = { userId: 1, role: ROLES.ADMIN }
    renderGuardedRoute()

    expect(await screen.findByText('Admin users')).toBeInTheDocument()
  })
})

describe('RoleBasedRoute', () => {
  it('sends an unauthenticated root visit to login', async () => {
    renderRootRoute()

    expect(await screen.findByText('Login screen')).toBeInTheDocument()
  })

  it.each([
    [ROLES.ADMIN, 'Admin home'],
    [ROLES.LIBRARIAN, 'Librarian home'],
    [ROLES.MEMBER, 'Member home'],
  ])('sends %s from / to their dashboard', async (role, label) => {
    auth.user = { userId: 1, role }
    renderRootRoute()

    expect(await screen.findByText(label)).toBeInTheDocument()
  })
})
