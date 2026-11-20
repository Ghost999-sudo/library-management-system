import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage.jsx'

const { mockLogin, mockNavigate } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockNavigate: vi.fn(),
}))

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    dashboardPath: '/admin/dashboard',
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  }
})

describe('LoginPage', () => {
  it('renders the branded sign-in form without public registration', () => {
    render(<LoginPage />)

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/username or email/i)).toHaveAttribute('autocomplete', 'username')
    expect(screen.getByLabelText(/^password/i)).toHaveAttribute('autocomplete', 'current-password')
    expect(screen.queryByRole('link', { name: /register|sign up/i })).not.toBeInTheDocument()
  })

  it('shows validation errors when submitted empty', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/username or email is required/i)).toBeInTheDocument()
    expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('submits credentials and navigates to the role dashboard', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValueOnce({ userId: 1, role: 'ADMIN' })
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/username or email/i), 'admin')
    await user.type(screen.getByLabelText(/^password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin', 'secret123')
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true })
    })
  })

  it('shows an error alert when authentication fails', async () => {
    const user = userEvent.setup()
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'))
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/username or email/i), 'admin')
    await user.type(screen.getByLabelText(/^password/i), 'wrong')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
  })
})
