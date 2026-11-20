import { useEffect, useState } from 'react'
import { useAsync } from '../../hooks/useAsync.js'
import { useRecordPayment } from '../../hooks/useRecordPayment.js'
import { fineService } from '../../services/fineService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { FineTable, PaymentDialog } from '../../components/fines/FineHelpers.jsx'
import { FINE_STATUS } from '../../utils/constants.js'

const PAGE_SIZE = 10
const FETCH_SIZE = 200

/** mode='payments' focuses on collectible balances; mode='all' is the full fine list. */
export default function FineListPage({ mode = 'all' }) {
  const { data, loading, error, run } = useAsync(
    () => fineService.getFines({ size: FETCH_SIZE, sort: 'fineId,desc' }),
    [],
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(
    mode === 'payments' ? 'UNPAID' : '',
  )
  const [page, setPage] = useState(0)
  const paymentFlow = useRecordPayment(run)

  const term = search.trim().toLowerCase()
  const fines = (data?.content || []).filter((fine) => {
    const matchesTerm =
      !term ||
      [fine.memberName, String(fine.loanId), String(fine.fineId)]
        .some((value) => (value || '').toLowerCase().includes(term))
    return matchesTerm && (!statusFilter || fine.status === statusFilter)
  })

  useEffect(() => setPage(0), [term, statusFilter])

  const visibleFines = fines.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const isPayments = mode === 'payments'

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={isPayments ? 'Fine payments' : 'Fines'}
        description={isPayments
          ? 'Collect outstanding balances. Receipts are recorded per fine.'
          : 'Review assessed fines, payments and remaining balances.'}
      />

      {isPayments && (
        <AlertMessage variant="info">
          The API has no global payment list. Payment receipts are shown on each fine’s
          details page; this screen lists fines that still need payment.
        </AlertMessage>
      )}

      <div className="flex flex-wrap items-end gap-md rounded-lg border border-border bg-surface p-base">
        <SearchInput
          label="Search fines"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch('')}
          placeholder="Member, fine ID or loan ID…"
          className="min-w-[240px] flex-1"
        />
        <label className="flex flex-col gap-xs text-label">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-md text-label"
          >
            <option value="">All statuses</option>
            {FINE_STATUS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <p className="text-support text-text-secondary">
        Search and filters apply to the first {FETCH_SIZE} fines returned by the backend.
      </p>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <FineTable
        fines={visibleFines}
        loading={loading}
        caption={isPayments ? 'Fines awaiting payment' : 'Fines'}
        onPay={paymentFlow.requestPayment}
        emptyMessage={isPayments ? 'No fines need payment.' : 'No fines found.'}
      />

      <Pagination page={page} size={PAGE_SIZE} totalElements={fines.length} onPageChange={setPage} />

      {paymentFlow.pendingFine && (
        <PaymentDialog
          key={paymentFlow.pendingFine.fineId}
          fine={paymentFlow.pendingFine}
          onSave={paymentFlow.savePayment}
          onCancel={paymentFlow.cancelPayment}
          saving={paymentFlow.saving}
          error={paymentFlow.error}
        />
      )}
    </div>
  )
}
