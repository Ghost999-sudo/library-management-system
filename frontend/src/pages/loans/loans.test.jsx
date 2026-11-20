import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoanListPage from './LoanListPage.jsx'
import IssueBookPage from './IssueBookPage.jsx'
import MyLoansPage from './MyLoansPage.jsx'
import OverdueLoansPage from './OverdueLoansPage.jsx'

const {
  mockGetLoans, mockGetOverdue, mockGetMyLoans, mockIssueBook, mockReturnBook,
  mockGetMembers, mockGetBooks, mockGetAvailableCopies,
} = vi.hoisted(() => ({
  mockGetLoans: vi.fn(), mockGetOverdue: vi.fn(), mockGetMyLoans: vi.fn(),
  mockIssueBook: vi.fn(), mockReturnBook: vi.fn(), mockGetMembers: vi.fn(),
  mockGetBooks: vi.fn(), mockGetAvailableCopies: vi.fn(),
}))

vi.mock('../../services/loanService.js', () => ({
  loanService: {
    getLoans: mockGetLoans,
    getOverdue: mockGetOverdue,
    getMyLoans: mockGetMyLoans,
    issueBook: mockIssueBook,
    returnBook: mockReturnBook,
  },
}))

vi.mock('../../services/memberService.js', () => ({
  memberService: { getMembers: mockGetMembers },
}))

vi.mock('../../services/catalogService.js', () => ({
  catalogService: { getBooks: mockGetBooks, getAvailableCopies: mockGetAvailableCopies },
}))

const loan = (id, overrides = {}) => ({
  loanId: id,
  memberId: 1,
  memberName: 'Alice Carter',
  copyId: 10 + id,
  accessionNumber: `ACC-${id}`,
  bookTitle: 'Clean Code',
  issuedBy: 101,
  issueDate: '2026-01-01',
  dueDate: '2026-02-01',
  returnDate: null,
  status: 'BORROWED',
  ...overrides,
})

const paged = (loans) => ({
  content: loans,
  page: 0,
  size: 10,
  totalElements: loans.length,
  totalPages: 1,
})

const memberPage = {
  content: [{
    memberId: 1, userId: 101, username: 'alice1', email: 'alice@example.com',
    membershipNumber: 'MEM-1', firstName: 'Alice', lastName: 'Carter',
    admissionNumber: 'ADM-1', registrationDate: '2025-01-15', status: 'ACTIVE',
  }],
  page: 0, size: 200, totalElements: 1, totalPages: 1,
}

const bookPage = {
  content: [{
    bookId: 5, title: 'Clean Code', categoryId: 1, categoryName: 'Fiction',
    authors: [], copies: [],
  }],
  page: 0, size: 200, totalElements: 1, totalPages: 1,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetLoans.mockResolvedValue(paged([loan(1), loan(2, { status: 'RETURNED', returnDate: '2026-01-20' })]))
  mockGetOverdue.mockResolvedValue(paged([loan(3, { dueDate: '2026-01-01' })]))
  mockGetMyLoans.mockResolvedValue(paged([loan(1)]))
  mockReturnBook.mockResolvedValue({ loanId: 1, returnDate: '2026-02-02', status: 'RETURNED', fine: null })
  mockIssueBook.mockResolvedValue(loan(4))
  mockGetMembers.mockResolvedValue(memberPage)
  mockGetBooks.mockResolvedValue(bookPage)
  mockGetAvailableCopies.mockResolvedValue([
    { copyId: 11, accessionNumber: 'ACC-11', status: 'AVAILABLE', acquiredDate: '2025-01-01' },
  ])
})

describe('LoanListPage', () => {
  it('renders real loan data and records a return after confirmation', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><LoanListPage /></MemoryRouter>)

    expect((await screen.findAllByText('Clean Code')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Alice Carter').length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: 'Return' })[0])
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Record this return?')
    await user.click(screen.getByRole('button', { name: 'Confirm return' }))

    await waitFor(() => expect(mockReturnBook).toHaveBeenCalledWith(1))
  })
})

describe('IssueBookPage', () => {
  it('submits only memberId and copyId', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/admin/loans/issue']}>
        <Routes><Route path="/admin/loans/issue" element={<IssueBookPage />} /></Routes>
      </MemoryRouter>,
    )

    await user.selectOptions(await screen.findByLabelText(/active member/i), '1')
    await user.selectOptions(screen.getByLabelText(/^book\b/i), '5')
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'ACC-11' })).toBeInTheDocument()
    })
    await user.selectOptions(screen.getByLabelText(/available copy/i), '11')
    await user.click(screen.getByRole('button', { name: /issue book/i }))

    await waitFor(() => {
      expect(mockIssueBook).toHaveBeenCalledWith({ memberId: 1, copyId: 11 })
    })
  })
})

describe('MyLoansPage', () => {
  it('uses the member-scoped endpoint and offers no return action', async () => {
    render(<MemoryRouter><MyLoansPage /></MemoryRouter>)

    expect(await screen.findByText('Clean Code')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Return' })).not.toBeInTheDocument()
    expect(mockGetMyLoans).toHaveBeenCalled()
    expect(mockGetLoans).not.toHaveBeenCalled()
  })
})

describe('OverdueLoansPage', () => {
  it('loads the backend overdue collection', async () => {
    render(<MemoryRouter><OverdueLoansPage /></MemoryRouter>)

    expect(await screen.findByText('Clean Code')).toBeInTheDocument()
    expect(mockGetOverdue).toHaveBeenCalled()
  })
})
