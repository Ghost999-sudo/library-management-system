import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MemberListPage from './MemberListPage.jsx'
import MemberFormPage from './MemberFormPage.jsx'
import ProfilePage from './ProfilePage.jsx'

const {
  mockGetMembers, mockGetById, mockGetMe, mockCreateMember, mockUpdateMember, mockChangeStatus,
  mockUseAuth,
} = vi.hoisted(() => ({
  mockGetMembers: vi.fn(),
  mockGetById: vi.fn(),
  mockGetMe: vi.fn(),
  mockCreateMember: vi.fn(),
  mockUpdateMember: vi.fn(),
  mockChangeStatus: vi.fn(),
  mockUseAuth: vi.fn(),
}))

vi.mock('../../services/memberService.js', () => ({
  memberService: {
    getMembers: mockGetMembers,
    getById: mockGetById,
    getMe: mockGetMe,
    createMember: mockCreateMember,
    updateMember: mockUpdateMember,
    changeStatus: mockChangeStatus,
  },
}))

vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: mockUseAuth }))

const member = (id, first, last, status = 'ACTIVE') => ({
  memberId: id,
  userId: id + 100,
  username: `${first.toLowerCase()}${id}`,
  email: `${first.toLowerCase()}${id}@example.com`,
  membershipNumber: `MEM-${id}`,
  firstName: first,
  lastName: last,
  admissionNumber: `ADM-${id}`,
  phone: '555-0100',
  department: 'Computing',
  registrationDate: '2025-01-15',
  status,
})

const paged = (members) => ({
  content: members,
  page: 0,
  size: 200,
  totalElements: members.length,
  totalPages: 1,
})

beforeEach(() => {
  vi.clearAllMocks()
  mockGetMembers.mockResolvedValue(paged([member(1, 'Alice', 'Carter'), member(2, 'Bob', 'Builder', 'INACTIVE')]))
  mockGetById.mockResolvedValue(member(1, 'Alice', 'Carter'))
  mockGetMe.mockResolvedValue(member(1, 'Alice', 'Carter'))
  mockCreateMember.mockResolvedValue(member(3, 'Carol', 'Chandler'))
  mockUpdateMember.mockResolvedValue(member(1, 'Alicia', 'Carter'))
  mockChangeStatus.mockResolvedValue(member(2, 'Bob', 'Builder'))
  mockUseAuth.mockReturnValue({
    user: { userId: 101, username: 'alice1', email: 'alice1@example.com', role: 'MEMBER', status: 'ACTIVE' },
  })
})

describe('MemberListPage', () => {
  it('renders real MemberResponse data and searches client-side', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><MemberListPage /></MemoryRouter>)

    expect(await screen.findByText('Alice Carter')).toBeInTheDocument()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
    expect(screen.getByText('MEM-1')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Search members'), 'bob')
    expect(screen.queryByText('Alice Carter')).not.toBeInTheDocument()
    expect(screen.getByText('Bob Builder')).toBeInTheDocument()
  })

  it('confirms a status change before calling the backend', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><MemberListPage /></MemoryRouter>)

    const statusSelect = await screen.findByLabelText('Status for Bob Builder')
    await user.selectOptions(statusSelect, 'ACTIVE')

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Set Bob Builder to ACTIVE?')
    await user.click(screen.getByRole('button', { name: 'Change status' }))

    await waitFor(() => {
      expect(mockChangeStatus).toHaveBeenCalledWith(2, 'ACTIVE')
    })
  })
})

describe('MemberFormPage', () => {
  it('submits the exact create DTO with account fields', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/members/new']}>
        <Routes><Route path="/admin/members/new" element={<MemberFormPage />} /></Routes>
      </MemoryRouter>,
    )

    await user.type(await screen.findByLabelText(/username/i), 'carol3')
    await user.type(screen.getByLabelText(/^email/i), 'carol@example.com')
    await user.type(screen.getByLabelText(/temporary password/i), 'temporary123')
    await user.type(screen.getByLabelText(/membership number/i), 'MEM-3')
    await user.type(screen.getByLabelText(/admission number/i), 'ADM-3')
    await user.type(screen.getByLabelText(/first name/i), 'Carol')
    await user.type(screen.getByLabelText(/last name/i), 'Chandler')
    await user.click(screen.getByRole('button', { name: /register member/i }))

    await waitFor(() => {
      expect(mockCreateMember).toHaveBeenCalledWith(expect.objectContaining({
        username: 'carol3',
        email: 'carol@example.com',
        password: 'temporary123',
        membershipNumber: 'MEM-3',
        firstName: 'Carol',
        lastName: 'Chandler',
        registrationDate: expect.any(String),
      }))
    })
  })

  it('does not send account fields on update', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/members/1/edit']}>
        <Routes><Route path="/admin/members/:memberId/edit" element={<MemberFormPage />} /></Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/membership number/i)).toHaveValue('MEM-1')
    })
    const firstName = screen.getByLabelText(/first name/i)
    await user.clear(firstName)
    await user.type(firstName, 'Alicia')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(mockUpdateMember).toHaveBeenCalledWith('1', expect.objectContaining({ firstName: 'Alicia' }))
    })
    const payload = mockUpdateMember.mock.calls[0][1]
    expect(payload).not.toHaveProperty('username')
    expect(payload).not.toHaveProperty('email')
    expect(payload).not.toHaveProperty('password')
  })
})

describe('ProfilePage', () => {
  it('loads the member-owned profile only for MEMBER users', async () => {
    render(<MemoryRouter><ProfilePage /></MemoryRouter>)

    expect(await screen.findByText('alice1')).toBeInTheDocument()
    expect(await screen.findByText('MEM-1')).toBeInTheDocument()
    expect(mockGetMe).toHaveBeenCalledOnce()
  })

  it('does not call the member endpoint for staff', async () => {
    mockUseAuth.mockReturnValue({
      user: { userId: 1, username: 'admin1', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE' },
    })
    render(<MemoryRouter><ProfilePage /></MemoryRouter>)

    expect(await screen.findByText('admin1')).toBeInTheDocument()
    expect(screen.queryByText('MEM-1')).not.toBeInTheDocument()
    expect(mockGetMe).not.toHaveBeenCalled()
  })
})
