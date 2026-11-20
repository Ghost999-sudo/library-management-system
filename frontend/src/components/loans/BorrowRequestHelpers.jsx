import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Button } from '../common/Button.jsx'
import { DataTable } from '../tables/DataTable.jsx'
import { StatusBadge } from '../common/StatusBadge.jsx'
import { Modal } from '../feedback/Modal.jsx'
import { AlertMessage } from '../feedback/AlertMessage.jsx'
import { FormInput } from '../forms/FormInput.jsx'
import { FormSelect } from '../forms/FormSelect.jsx'
import { BASE_INPUT } from '../forms/FormInput.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { formatDate } from '../../utils/format.js'

export function borrowRequestColumns({ showMember = true, onApprove, onReject } = {}) {
  const columns = []

  if (showMember) {
    columns.push({ key: 'memberName', header: 'Member', render: (row) => row.memberName || '—' })
  }

  columns.push(
    { key: 'bookTitle', header: 'Book', render: (row) => <span className="font-medium">{row.bookTitle || '—'}</span> },
    { key: 'requestDate', header: 'Requested', render: (row) => formatDate(row.requestDate) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'decidedDate', header: 'Decided', render: (row) => formatDate(row.decidedDate) },
    { key: 'note', header: 'Note', render: (row) => row.note || '—' },
  )

  if (onApprove && onReject) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (row) => row.status === 'PENDING' ? (
        <div className="flex flex-wrap gap-xs">
          <Button size="sm" onClick={() => onApprove(row)}>Approve</Button>
          <Button size="sm" variant="secondary" onClick={() => onReject(row)}>Reject</Button>
        </div>
      ) : (
        <span className="text-support text-text-secondary">Decided</span>
      ),
    })
  }

  return columns
}

export function BorrowRequestTable({
  requests,
  loading,
  caption,
  showMember = true,
  onApprove,
  onReject,
  emptyMessage,
  emptyDescription,
}) {
  return (
    <DataTable
      columns={borrowRequestColumns({ showMember, onApprove, onReject })}
      data={requests}
      loading={loading}
      caption={caption}
      emptyMessage={emptyMessage || 'No borrow requests found.'}
      emptyDescription={emptyDescription}
      rowKey={(row) => row.requestId}
    />
  )
}

/** The librarian chooses an available copy of the requested title before issuing. */
export function ApproveRequestDialog({ request, onConfirm, onCancel, submitting }) {
  const [copyId, setCopyId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: copies, loading, error } = useAsync(
    () => (request ? catalogService.getAvailableCopies(request.bookId) : Promise.resolve([])),
    [request?.bookId],
  )

  useEffect(() => {
    setCopyId('')
    setDueDate('')
  }, [request?.requestId])

  const submit = (event) => {
    event.preventDefault()
    if (copyId && dueDate) onConfirm(Number(copyId), dueDate)
  }

  return (
    <Modal
      open={Boolean(request)}
      title={`Approve: ${request?.bookTitle || 'book request'}`}
      onClose={onCancel}
    >
      <form onSubmit={submit} className="flex flex-col gap-base">
        <p className="text-body text-text-secondary">
          {request?.memberName || 'The member'} asked for this title. Choose an available copy
          and a return date; the backend sets the issue date and applies all borrowing rules.
        </p>
        {error && <AlertMessage variant="error">{error.message}</AlertMessage>}
        <FormInput
          label="Return date"
          name="dueDate"
          type="date"
          required
          min={today}
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          hint="Late returns after the configured grace period are fined automatically."
        />
        <FormSelect
          label="Available copy"
          name="copyId"
          required
          value={copyId}
          disabled={loading}
          onChange={(event) => setCopyId(event.target.value)}
          options={(copies || []).map((copy) => ({
            value: String(copy.copyId),
            label: copy.accessionNumber,
          }))}
          placeholder={loading ? 'Loading copies…' : 'Choose a copy…'}
        />
        {!loading && (copies || []).length === 0 && (
          <AlertMessage variant="warning">
            No available copies of this title. Add one from Book Copies, then approve again.
          </AlertMessage>
        )}
        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={submitting} disabled={!copyId || !dueDate || !copies?.length}>
            Approve and issue
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}

export function RejectRequestDialog({ request, onConfirm, onCancel, submitting }) {
  const [note, setNote] = useState('')

  useEffect(() => {
    setNote('')
  }, [request?.requestId])

  const submit = (event) => {
    event.preventDefault()
    onConfirm(note.trim())
  }

  return (
    <Modal
      open={Boolean(request)}
      title={`Reject: ${request?.bookTitle || 'book request'}`}
      onClose={onCancel}
    >
      <form onSubmit={submit} className="flex flex-col gap-base">
        <p className="text-body text-text-secondary">
          The member will see this request as rejected. A reason is optional.
        </p>
        <label className="flex flex-col gap-xs text-label" htmlFor="reject-note">
          Reason (optional)
          <textarea
            id="reject-note"
            name="note"
            rows={4}
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={BASE_INPUT}
          />
        </label>
        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={submitting}>Reject request</Button>
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
