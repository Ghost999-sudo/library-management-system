import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { useReturnLoan } from '../../hooks/useReturnLoan.js'
import { loanService } from '../../services/loanService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { LoanTable, ReturnDialog } from '../../components/loans/LoanHelpers.jsx'
import { LOAN_STATUS } from '../../utils/constants.js'

const PAGE_SIZE = 10
const FETCH_SIZE = 200

/** mode='active' backs the Returns screen; mode='all' backs the Loans screen. */
export default function LoanListPage({ mode = 'all' }) {
  const location = useLocation()
  const basePath = location.pathname
  const listPath = mode === 'active' ? basePath : basePath

  const { data, loading, error, run } = useAsync(
    () => loanService.getLoans({ size: FETCH_SIZE, sort: 'loanId,desc' }),
    [],
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(mode === 'active' ? 'BORROWED' : '')
  const [page, setPage] = useState(0)
  const returnFlow = useReturnLoan(run)

  const term = search.trim().toLowerCase()
  const loans = (data?.content || []).filter((loan) => {
    const matchesTerm =
      !term ||
      [loan.memberName, loan.bookTitle, loan.accessionNumber, String(loan.loanId)]
        .some((value) => (value || '').toLowerCase().includes(term))
    return matchesTerm && (!statusFilter || loan.status === statusFilter)
  })

  useEffect(() => setPage(0), [term, statusFilter])

  const visibleLoans = loans.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const title = mode === 'active' ? 'Returns' : 'Loans'
  const description = mode === 'active'
    ? 'Currently borrowed books. Record a return when a copy comes back.'
    : 'Issue books and review borrowing history.'

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={title}
        description={description}
        actions={
          mode === 'all' && (
            <Link to={`${listPath}/issue`} className="inline-flex min-h-11 items-center gap-sm rounded-md bg-navy px-base py-sm text-label font-medium text-white hover:bg-navy-hover">
              <Plus aria-hidden="true" className="h-4 w-4" /> Issue book
            </Link>
          )
        }
      />

      <div className="flex flex-wrap items-end gap-md rounded-card border border-border bg-surface p-base">
        <SearchInput
          label="Search loans"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch('')}
          placeholder="Member, book, copy or loan ID…"
          className="min-w-[240px] flex-1"
        />
        <label className="flex flex-col gap-xs text-label">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 rounded-input border border-border bg-surface px-md text-label"
            disabled={mode === 'active'}
          >
            <option value="">All statuses</option>
            {LOAN_STATUS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <p className="text-support text-text-secondary">
        Search and filters apply to the first {FETCH_SIZE} loans returned by the backend.
      </p>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <LoanTable
        loans={visibleLoans}
        loading={loading}
        caption={title}
        onReturn={returnFlow.requestReturn}
        emptyMessage={mode === 'active' ? 'No borrowed books.' : 'No loans found.'}
      />

      <Pagination page={page} size={PAGE_SIZE} totalElements={loans.length} onPageChange={setPage} />

      <ReturnDialog
        loan={returnFlow.pendingLoan}
        onConfirm={returnFlow.confirmReturn}
        onCancel={returnFlow.cancelReturn}
      />
    </div>
  )
}
