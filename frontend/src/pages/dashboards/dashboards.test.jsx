import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AdminDashboard from './AdminDashboard.jsx'
import MemberDashboard from './MemberDashboard.jsx'

const { mockGetSummary, mockGetLoans, mockGetOverdue, mockGetMyLoans, mockGetMyFines } = vi.hoisted(() => ({
  mockGetSummary: vi.fn(),
  mockGetLoans: vi.fn(),
  mockGetOverdue: vi.fn(),
  mockGetMyLoans: vi.fn(),
  mockGetMyFines: vi.fn(),
}))

vi.mock('../../services/dashboardService.js', () => ({
  dashboardService: { getSummary: mockGetSummary },
}))
vi.mock('../../services/loanService.js', () => ({
  loanService: {
    getLoans: mockGetLoans,
    getOverdue: mockGetOverdue,
    getMyLoans: mockGetMyLoans,
  },
}))
vi.mock('../../services/fineService.js', () => ({
  fineService: { getMyFines: mockGetMyFines },
}))
vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { username: 'reader1', role: 'MEMBER' } }),
}))

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('AdminDashboard', () => {
  it('renders all eight real backend summary values', async () => {
    mockGetSummary.mockResolvedValue({
      totalBooks: 120,
      totalCopies: 300,
      availableCopies: 200,
      borrowedCopies: 100,
      totalMembers: 45,
      activeLoans: 80,
      overdueLoans: 6,
      unpaidFines: 125.5,
    })
    mockGetLoans.mockResolvedValue({ content: [] })
    mockGetOverdue.mockResolvedValue({ content: [] })
    const { memberService } = await import('../../services/memberService.js')
    vi.spyOn(memberService, 'getMembers').mockResolvedValue({ content: [] })

    renderWithRouter(<AdminDashboard />)

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Total Books')).toBeInTheDocument()
    expect(screen.getByText('Registered Members')).toBeInTheDocument()
    expect(screen.getByText('Overdue Loans')).toBeInTheDocument()
    expect(screen.getByText('Outstanding Fines')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()

    const finesCard = screen.getByText('Outstanding Fines').closest('article')
    expect(finesCard).toHaveTextContent('125.50')
  })
})

describe('MemberDashboard', () => {
  it('derives personal counts only from the member-scoped endpoints', async () => {
    mockGetMyLoans.mockResolvedValue({
      content: [
        { loanId: 1, bookTitle: 'Clean Code', dueDate: '2026-11-25', issueDate: '2026-11-10', status: 'BORROWED' },
        { loanId: 2, bookTitle: 'Refactoring', dueDate: '2026-11-10', issueDate: '2026-10-20', status: 'BORROWED' },
        { loanId: 3, bookTitle: 'Old Book', dueDate: '2026-09-01', issueDate: '2026-08-01', status: 'RETURNED' },
      ],
    })
    mockGetMyFines.mockResolvedValue({
      content: [
        { fineId: 9, loanId: 2, fineAmount: 10, amountPaid: 4, outstandingAmount: 6, status: 'PARTIALLY_PAID' },
        { fineId: 10, loanId: 3, fineAmount: 8, amountPaid: 8, outstandingAmount: 0, status: 'PAID' },
      ],
    })

    renderWithRouter(<MemberDashboard />)

    expect(await screen.findByText(/welcome back, reader1/i)).toBeInTheDocument()
    expect(screen.getByText('Currently Borrowed')).toBeInTheDocument()
    expect(screen.getByText('Due Soon')).toBeInTheDocument()
    expect(screen.getByText('Overdue')).toBeInTheDocument()

    const borrowedCard = screen.getByText('Currently Borrowed').closest('article')
    expect(borrowedCard).toHaveTextContent('2')

    const overdueCard = screen.getByText('Overdue').closest('article')
    expect(overdueCard).toHaveTextContent('1')

    const finesCard = screen.getByText('Outstanding Fines').closest('article')
    expect(finesCard).toHaveTextContent('6.00')
  })
})
