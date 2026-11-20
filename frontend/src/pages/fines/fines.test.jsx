import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FineListPage from './FineListPage.jsx'
import FineDetailsPage from './FineDetailsPage.jsx'
import MyFinesPage from './MyFinesPage.jsx'

const {
  mockGetFines, mockGetMyFines, mockGetById, mockGetPayments, mockRecordPayment,
} = vi.hoisted(() => ({
  mockGetFines: vi.fn(),
  mockGetMyFines: vi.fn(),
  mockGetById: vi.fn(),
  mockGetPayments: vi.fn(),
  mockRecordPayment: vi.fn(),
}))

vi.mock('../../services/fineService.js', () => ({
  fineService: {
    getFines: mockGetFines,
    getMyFines: mockGetMyFines,
    getById: mockGetById,
    getPayments: mockGetPayments,
    recordPayment: mockRecordPayment,
  },
}))

const fine = (id, overrides = {}) => ({
  fineId: id,
  loanId: 10 + id,
  memberId: 1,
  memberName: 'Alice Carter',
  fineAmount: 25,
  amountPaid: 0,
  outstandingAmount: 25,
  status: 'UNPAID',
  ...overrides,
})

const paged = (fines) => ({
  content: fines,
  page: 0,
  size: 10,
  totalElements: fines.length,
  totalPages: 1,
})

const receipt = {
  paymentId: 99,
  fineId: 1,
  amount: 5,
  paymentMethod: 'CASH',
  referenceNumber: 'RCPT-99',
  receivedBy: 101,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetFines.mockResolvedValue(paged([
    fine(1),
    fine(2, { status: 'PAID', amountPaid: 25, outstandingAmount: 0 }),
  ]))
  mockGetMyFines.mockResolvedValue(paged([fine(1)]))
  mockGetById.mockResolvedValue(fine(1))
  mockGetPayments.mockResolvedValue([receipt])
  mockRecordPayment.mockResolvedValue({ ...receipt, amount: 10, referenceNumber: 'RCPT-1' })
})

describe('FineListPage', () => {
  it('records a payment with exactly the backend request fields', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><FineListPage /></MemoryRouter>)

    expect((await screen.findAllByText('Alice Carter')).length).toBeGreaterThan(0)
    await user.click(screen.getAllByRole('button', { name: 'Record payment' })[0])

    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent('Outstanding balance')
    await user.type(within(dialog).getByLabelText(/^amount\b/i), '10')
    await user.selectOptions(within(dialog).getByLabelText(/payment method/i), 'CASH')
    await user.type(within(dialog).getByLabelText(/reference number/i), 'RCPT-1')
    await user.click(within(dialog).getByRole('button', { name: 'Record payment' }))

    await waitFor(() => {
      expect(mockRecordPayment).toHaveBeenCalledWith(1, {
        amount: 10,
        paymentMethod: 'CASH',
        referenceNumber: 'RCPT-1',
      })
    })
  })

  it('blocks an amount above the outstanding balance before calling the API', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><FineListPage /></MemoryRouter>)

    await user.click((await screen.findAllByRole('button', { name: 'Record payment' }))[0])
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/^amount\b/i), '26')
    await user.click(within(dialog).getByRole('button', { name: 'Record payment' }))

    expect(await within(dialog).findByText(/cannot exceed the outstanding balance/i))
      .toBeInTheDocument()
    expect(mockRecordPayment).not.toHaveBeenCalled()
  })

  it('payments mode defaults to collectible fines only', async () => {
    render(<MemoryRouter><FineListPage mode="payments" /></MemoryRouter>)

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(screen.queryAllByRole('button', { name: 'Record payment' })).toHaveLength(1)
    expect(screen.queryByText('Settled')).not.toBeInTheDocument()
  })
})

describe('FineDetailsPage', () => {
  it('loads fine details and per-fine receipts from the staff endpoints', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/fines/1']}>
        <Routes><Route path="/admin/fines/:fineId" element={<FineDetailsPage />} /></Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Fine #1' })).toBeInTheDocument()
    expect(screen.getByText('RCPT-99')).toBeInTheDocument()
    expect(mockGetById).toHaveBeenCalledWith('1')
    expect(mockGetPayments).toHaveBeenCalledWith('1')
  })
})

describe('MyFinesPage', () => {
  it('uses only the member-scoped endpoint with no payment action', async () => {
    render(<MemoryRouter><MyFinesPage /></MemoryRouter>)

    expect(await screen.findByRole('table')).toBeInTheDocument()
    expect(mockGetMyFines).toHaveBeenCalled()
    expect(mockGetFines).not.toHaveBeenCalled()
    expect(mockGetById).not.toHaveBeenCalled()
    expect(mockGetPayments).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Record payment' })).not.toBeInTheDocument()
  })
})
