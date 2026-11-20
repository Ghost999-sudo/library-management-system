import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoanListPage from './LoanListPage.jsx'
import IssueBookPage from './IssueBookPage.jsx'
import MyLoansPage from './MyLoansPage.jsx'
import BorrowRequestsPage from './BorrowRequestsPage.jsx'
import MyBorrowRequestsPage from './MyBorrowRequestsPage.jsx'
import OverdueLoansPage from './OverdueLoansPage.jsx'

const {
  mockGetLoans, mockGetOverdue, mockGetMyLoans, mockIssueBook, mockReturnBook,
  mockGetMembers, mockGetBooks, mockGetAvailableCopies,
  mockGetRequests, mockGetMyRequests, mockApprove, mockReject,
} = vi.hoisted(() => ({
  mockGetLoans: vi.fn(), mockGetOverdue: vi.fn(), mockGetMyLoans: vi.fn(),
  mockIssueBook: vi.fn(), mockReturnBook: vi.fn(), mockGetMembers: vi.fn(),
  mockGetBooks: vi.fn(), mockGetAvailableCopies: vi.fn(),
  mockGetRequests: vi.fn(), mockGetMyRequests: vi.fn(),
  mockApprove: vi.fn(), mockReject: vi.fn(),
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

vi.mock('../../services/borrowRequestService.js', () => ({
  borrowRequestService: {
    getRequests: mockGetRequests,
    getMyRequests: mockGetMyRequests,
    approve: mockApprove,
    reject: mockReject,
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

const borrowRequest = (overrides = {}) => ({
  requestId: 7,
  bookId: 5,
  bookTitle: 'Clean Code',
  memberId: 1,
  memberName: 'Alice Carter',
  status: 'PENDING',
  requestDate: '2026-01-01',
  decidedBy: null,
  decidedDate: null,
  note: null,
  ...overrides,
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
  mockGetRequests.mockResolvedValue(paged([borrowRequest()]))
  mockGetMyRequests.mockResolvedValue(paged([borrowRequest()]))
  mockApprove.mockResolvedValue({ ...loan(4), dueDate: '2026-02-14' })
  mockReject.mockResolvedValue(borrowRequest({ status: 'REJECTED', note: 'No copies available' }))
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

describe('BorrowRequestsPage', () => {
  it('approves a pending request with a chosen copy and return date', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><BorrowRequestsPage /></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'Approve' }))
    await user.type(await screen.findByLabelText(/return date/i), '2099-01-01')
    await user.selectOptions(screen.getByLabelText(/available copy/i), '11')
    await user.click(screen.getByRole('button', { name: /approve and issue/i }))

    await waitFor(() => expect(mockApprove).toHaveBeenCalledWith(7, 11, '2099-01-01'))
  })

  it('rejects a pending request with an optional reason', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><BorrowRequestsPage /></MemoryRouter>)

    await user.click(await screen.findByRole('button', { name: 'Reject' }))
    await user.type(await screen.findByLabelText(/reason \(optional\)/i), 'No copies available')
    await user.click(screen.getByRole('button', { name: /reject request/i }))

    await waitFor(() => expect(mockReject).toHaveBeenCalledWith(7, 'No copies available'))
  })
})

describe('MyBorrowRequestsPage', () => {
  it('uses the member-scoped request endpoint and offers no decision actions', async () => {
    render(<MemoryRouter><MyBorrowRequestsPage /></MemoryRouter>)

    expect(await screen.findByText('Clean Code')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(mockGetMyRequests).toHaveBeenCalled()
    expect(mockGetRequests).not.toHaveBeenCalled()
  })
})

describe('OverdueLoansPage', () => {
  it('loads the backend overdue collection', async () => {
    render(<MemoryRouter><OverdueLoansPage /></MemoryRouter>)

    expect(await screen.findByText('Clean Code')).toBeInTheDocument()
    expect(mockGetOverdue).toHaveBeenCalled()
  })
})
