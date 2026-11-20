import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoanReportsPage from './LoanReportsPage.jsx'
import FineReportsPage from './FineReportsPage.jsx'

vi.mock('recharts', () => {
  const Dummy = () => null
  return {
    Bar: Dummy,
    BarChart: Dummy,
    CartesianGrid: Dummy,
    Cell: Dummy,
    Legend: Dummy,
    Pie: Dummy,
    PieChart: Dummy,
    ResponsiveContainer: Dummy,
    Tooltip: Dummy,
    XAxis: Dummy,
    YAxis: Dummy,
  }
})

const { mockGetLoanReport, mockGetFineReport } = vi.hoisted(() => ({
  mockGetLoanReport: vi.fn(),
  mockGetFineReport: vi.fn(),
}))

vi.mock('../../services/reportService.js', () => ({
  reportService: {
    getLoanReport: mockGetLoanReport,
    getFineReport: mockGetFineReport,
  },
}))

const loanReport = {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  totalLoans: 2,
  loans: [
    {
      loanId: 1, memberName: 'Alice Carter', bookTitle: 'Clean Code', accessionNumber: 'ACC-1',
      issuedBy: 101, issueDate: '2026-01-05', dueDate: '2026-02-05', returnDate: null,
      status: 'BORROWED',
    },
    {
      loanId: 2, memberName: 'Bob Lee', bookTitle: 'Refactoring', accessionNumber: 'ACC-2',
      issuedBy: 101, issueDate: '2026-01-10', dueDate: '2026-02-10', returnDate: '2026-01-20',
      status: 'RETURNED',
    },
  ],
}

const fineReport = {
  startDate: '2026-01-01',
  endDate: '2026-01-31',
  totalFines: 2,
  totalAssessed: 37.5,
  totalCollected: 12.5,
  fines: [
    { fineId: 1, loanId: 1, memberName: 'Alice Carter', fineAmount: 25, amountPaid: 12.5, status: 'PARTIALLY_PAID' },
    { fineId: 2, loanId: 2, memberName: 'Bob Lee', fineAmount: 12.5, amountPaid: 0, status: 'UNPAID' },
  ],
  payments: [
    { paymentId: 9, fineId: 1, amount: 12.5, paymentMethod: 'CASH', receivedBy: 101 },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetLoanReport.mockResolvedValue(loanReport)
  mockGetFineReport.mockResolvedValue(fineReport)
})

describe('LoanReportsPage', () => {
  it('requests a bounded ISO date range and renders backend loan data', async () => {
    render(<MemoryRouter><LoanReportsPage /></MemoryRouter>)

    await waitFor(() => expect(mockGetLoanReport).toHaveBeenCalledTimes(1))
    const params = mockGetLoanReport.mock.calls[0][0]
    expect(params.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(params.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(params.startDate <= params.endDate).toBe(true)

    expect(await screen.findByText('Clean Code')).toBeInTheDocument()
    expect(screen.getByText('Refactoring')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Loans issued by date' })).toBeInTheDocument()
  })

  it('re-requests with the exact applied range', async () => {
    const ui = userEvent.setup()
    render(<MemoryRouter><LoanReportsPage /></MemoryRouter>)

    await waitFor(() => expect(mockGetLoanReport).toHaveBeenCalledTimes(1))
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-01-01' } })
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-01-31' } })
    await ui.click(screen.getByRole('button', { name: /apply range/i }))

    await waitFor(() => {
      expect(mockGetLoanReport).toHaveBeenLastCalledWith({
        startDate: '2026-01-01',
        endDate: '2026-01-31',
      })
    })
  })

  it('rejects an inverted range before calling the API again', async () => {
    const ui = userEvent.setup()
    render(<MemoryRouter><LoanReportsPage /></MemoryRouter>)

    await waitFor(() => expect(mockGetLoanReport).toHaveBeenCalledTimes(1))
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-02-01' } })
    fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: '2026-01-01' } })
    await ui.click(screen.getByRole('button', { name: /apply range/i }))

    expect(await screen.findByText(/end date must be on or after the start date/i))
      .toBeInTheDocument()
    expect(mockGetLoanReport).toHaveBeenCalledTimes(1)
  })
})

describe('FineReportsPage', () => {
  it('renders backend fine totals, fines and payments', async () => {
    render(<MemoryRouter><FineReportsPage /></MemoryRouter>)

    await waitFor(() => expect(mockGetFineReport).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('37.50')).toBeInTheDocument()
    expect(screen.getAllByText('12.50').length).toBeGreaterThan(0)
    expect(screen.getByText('Alice Carter')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Assessed vs collected' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Collections by payment method' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Payments collected' })).toBeInTheDocument()
  })
})
