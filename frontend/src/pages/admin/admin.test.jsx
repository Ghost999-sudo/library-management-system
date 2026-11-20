import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UserListPage from './UserListPage.jsx'
import UserFormPage from './UserFormPage.jsx'
import SettingsPage from './SettingsPage.jsx'

const {
  mockGetUsers, mockGetById, mockCreateUser, mockUpdateUser, mockChangeStatus,
  mockGetSettings, mockUpdateSettings,
} = vi.hoisted(() => ({
  mockGetUsers: vi.fn(),
  mockGetById: vi.fn(),
  mockCreateUser: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockChangeStatus: vi.fn(),
  mockGetSettings: vi.fn(),
  mockUpdateSettings: vi.fn(),
}))

vi.mock('../../services/userService.js', () => ({
  userService: {
    getUsers: mockGetUsers,
    getById: mockGetById,
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    changeStatus: mockChangeStatus,
  },
}))

vi.mock('../../services/settingsService.js', () => ({
  settingsService: { getSettings: mockGetSettings, updateSettings: mockUpdateSettings },
}))

const user = (userId, overrides = {}) => ({
  userId,
  username: userId === 1 ? 'admin1' : 'alice1',
  email: userId === 1 ? 'admin@example.com' : 'alice@example.com',
  role: userId === 1 ? 'ADMIN' : 'MEMBER',
  status: 'ACTIVE',
  ...overrides,
})

const paged = (users) => ({
  content: users,
  page: 0,
  size: 200,
  totalElements: users.length,
  totalPages: 1,
})

const settings = {
  settingId: 1,
  borrowingLimit: 5,
  borrowingPeriodDays: 14,
  finePerDay: 2,
  fineGracePeriodDays: 3,
  maxOutstandingFine: 50,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUsers.mockResolvedValue(paged([user(1), user(2)]))
  mockGetById.mockResolvedValue(user(2))
  mockCreateUser.mockResolvedValue(user(3))
  mockUpdateUser.mockResolvedValue(user(2))
  mockChangeStatus.mockResolvedValue(user(1, { status: 'INACTIVE' }))
  mockGetSettings.mockResolvedValue(settings)
  mockUpdateSettings.mockResolvedValue(settings)
})

describe('UserListPage', () => {
  it('deactivates an account after confirmation', async () => {
    const ui = userEvent.setup()
    render(<MemoryRouter><UserListPage /></MemoryRouter>)

    expect(await screen.findByText('admin1')).toBeInTheDocument()
    await ui.click(screen.getAllByRole('button', { name: 'Deactivate' })[0])

    const dialog = await screen.findByRole('dialog')
    await ui.click(within(dialog).getByRole('button', { name: 'Deactivate' }))

    await waitFor(() => expect(mockChangeStatus).toHaveBeenCalledWith(1, 'INACTIVE'))
  })
})

describe('UserFormPage', () => {
  it('creates an account with username, email, password and role only', async () => {
    const ui = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/users/new']}>
        <Routes><Route path="/admin/users/new" element={<UserFormPage />} /></Routes>
      </MemoryRouter>,
    )

    await ui.type(screen.getByLabelText(/^username\b/i), 'newadmin')
    await ui.type(screen.getByLabelText(/^email\b/i), 'new@example.com')
    await ui.selectOptions(screen.getByLabelText(/^role\b/i), 'LIBRARIAN')
    await ui.type(screen.getByLabelText(/temporary password/i), 'strongpass1')
    await ui.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        username: 'newadmin',
        email: 'new@example.com',
        role: 'LIBRARIAN',
        password: 'strongpass1',
      })
    })
  })

  it('omits the immutable username and a blank password when editing', async () => {
    const ui = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/users/2/edit']}>
        <Routes><Route path="/admin/users/:userId/edit" element={<UserFormPage />} /></Routes>
      </MemoryRouter>,
    )

    await waitFor(() => expect(screen.getByLabelText(/^email\b/i)).toHaveValue('alice@example.com'))
    expect(screen.getByLabelText(/^username\b/i)).toBeDisabled()

    await ui.clear(screen.getByLabelText(/^email\b/i))
    await ui.type(screen.getByLabelText(/^email\b/i), 'newalice@example.com')
    await ui.selectOptions(screen.getByLabelText(/^role\b/i), 'ADMIN')
    await ui.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('2', {
        email: 'newalice@example.com',
        role: 'ADMIN',
      })
    })
  })
})

describe('SettingsPage', () => {
  it('submits all five policy numbers without the response-only settingId', async () => {
    const ui = userEvent.setup()
    render(<SettingsPage />)

    await waitFor(() => expect(screen.getByLabelText(/borrowing limit/i)).toHaveValue(5))
    await ui.clear(screen.getByLabelText(/borrowing limit/i))
    await ui.type(screen.getByLabelText(/borrowing limit/i), '8')
    await ui.click(screen.getByRole('button', { name: /save settings/i }))

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({
        borrowingLimit: 8,
        borrowingPeriodDays: 14,
        finePerDay: 2,
        fineGracePeriodDays: 3,
        maxOutstandingFine: 50,
      })
    })
  })

  it('blocks a negative fine rate before reaching the API', async () => {
    const ui = userEvent.setup()
    render(<SettingsPage />)

    await waitFor(() => expect(screen.getByLabelText(/fine per day/i)).toHaveValue(2))
    await ui.clear(screen.getByLabelText(/fine per day/i))
    await ui.type(screen.getByLabelText(/fine per day/i), '-1')
    await ui.click(screen.getByRole('button', { name: /save settings/i }))

    expect(await screen.findByText(/fine per day cannot be negative/i)).toBeInTheDocument()
    expect(mockUpdateSettings).not.toHaveBeenCalled()
  })
})
