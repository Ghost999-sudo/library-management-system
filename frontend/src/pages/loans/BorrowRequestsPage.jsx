import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { borrowRequestService } from '../../services/borrowRequestService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import {
  ApproveRequestDialog,
  BorrowRequestTable,
  RejectRequestDialog,
} from '../../components/loans/BorrowRequestHelpers.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { formatDate } from '../../utils/format.js'

const FILTERS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: '', label: 'All' },
]

/** STAFF-only: approve picks an available copy; reject records an optional reason. */
export default function BorrowRequestsPage() {
  const location = useLocation()
  const listPath = location.pathname
  const { page, size, query, setPage } = usePagination(10)
  const [status, setStatus] = useState('PENDING')
  const [decision, setDecision] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const { data, loading, error, run } = useAsync(
    () => borrowRequestService.getRequests({ ...query, status: status || undefined }),
    [status, page, size],
  )

  const closeDecision = () => {
    setDecision(null)
    setFormError(null)
  }

  const onApprove = async (copyId, dueDate) => {
    setSubmitting(true)
    setFormError(null)
    try {
      const loan = await borrowRequestService.approve(decision.request.requestId, copyId, dueDate)
      notify.success(`Book issued. Due ${formatDate(loan.dueDate)}.`)
      closeDecision()
      run()
    } catch (err) {
      setFormError(err.message || 'Could not approve this request.')
    } finally {
      setSubmitting(false)
    }
  }

  const onReject = async (note) => {
    setSubmitting(true)
    setFormError(null)
    try {
      await borrowRequestService.reject(decision.request.requestId, note)
      notify.success('Request rejected.')
      closeDecision()
      run()
    } catch (err) {
      setFormError(err.message || 'Could not reject this request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Borrowing requests"
        description="Review member requests. Approving issues a copy using the backend's borrowing rules."
        breadcrumbs={[{ label: 'Loans', to: listPath.replace(/\/requests$/, '') }, { label: 'Requests' }]}
      />

      <form className="flex flex-wrap items-end gap-md rounded-card border border-border bg-surface p-base" onSubmit={(e) => e.preventDefault()}>
        <label className="flex flex-col gap-xs text-label" htmlFor="request-status">
          Decision status
          <select
            id="request-status"
            name="status"
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(0) }}
            className="min-h-11 rounded-input border border-border bg-surface px-md text-label"
          >
            {FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>{filter.label}</option>
            ))}
          </select>
        </label>
        <p className="text-support text-text-secondary">
          Pending requests do not reserve a copy or start a due date.
        </p>
      </form>

      {formError && <AlertMessage variant="error" title="Request not updated">{formError}</AlertMessage>}
      {error && <ErrorState message={error.message} onRetry={run} />}

      <BorrowRequestTable
        requests={data?.content || []}
        loading={loading}
        caption="Borrowing requests"
        onApprove={(request) => { setFormError(null); setDecision({ type: 'approve', request }) }}
        onReject={(request) => { setFormError(null); setDecision({ type: 'reject', request }) }}
        emptyMessage={`No ${status ? status.toLowerCase() : ''} requests found.`.replace('  ', ' ')}
      />

      <Pagination
        page={data?.page ?? page}
        size={data?.size ?? size}
        totalElements={data?.totalElements ?? 0}
        onPageChange={setPage}
      />

      <ApproveRequestDialog
        request={decision?.type === 'approve' ? decision.request : null}
        onConfirm={onApprove}
        onCancel={closeDecision}
        submitting={submitting}
      />
      <RejectRequestDialog
        request={decision?.type === 'reject' ? decision.request : null}
        onConfirm={onReject}
        onCancel={closeDecision}
        submitting={submitting}
      />
    </div>
  )
}
