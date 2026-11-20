import { useState } from 'react'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { Button } from '../../components/common/Button.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { Modal } from '../../components/feedback/Modal.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { BOOK_COPY_STATUS } from '../../utils/constants.js'
import { formatDate } from '../../utils/format.js'

export default function BookCopiesPage() {
  const { data: books, loading: booksLoading } = useAsync(() => catalogService.getBooks({ size: 200, sort: 'title,asc' }), [])
  const [bookId, setBookId] = useState('')
  const selectedBook = (books?.content || []).find((book) => String(book.bookId) === bookId)

  const { data: copies, loading, error, run } = useAsync(
    () => (bookId ? catalogService.getCopies(bookId) : Promise.resolve([])),
    [bookId],
  )
  const [statusFilter, setStatusFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [accessionNumber, setAccessionNumber] = useState('')
  const [acquiredDate, setAcquiredDate] = useState('')
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [statusChange, setStatusChange] = useState(null)

  const visibleCopies = (copies || []).filter((copy) => !statusFilter || copy.status === statusFilter)

  const addCopy = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await catalogService.addCopy(bookId, {
        accessionNumber: accessionNumber.trim(),
        acquiredDate: acquiredDate || undefined,
      })
      notify.success('Copy added.')
      setFormOpen(false)
      setAccessionNumber('')
      setAcquiredDate('')
      run()
    } catch (error) {
      setFormError(error.message || 'Could not add the copy.')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async () => {
    try {
      await catalogService.updateCopyStatus(statusChange.copy.copyId, statusChange.status)
      notify.success('Copy status updated.')
      setStatusChange(null)
      run()
    } catch (error) {
      notify.error(error.message || 'Could not change the copy status.')
      setStatusChange(null)
    }
  }

  const columns = [
    { key: 'accessionNumber', header: 'Accession Number', render: (row) => <span className="font-medium">{row.accessionNumber}</span> },
    { key: 'bookTitle', header: 'Book Title', render: () => selectedBook?.title || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'acquiredDate', header: 'Acquisition Date', render: (row) => formatDate(row.acquiredDate) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <label className="flex flex-col gap-xs text-support">
          <span className="sr-only">Change status for {row.accessionNumber}</span>
          <select
            value={row.status}
            onChange={(event) => setStatusChange({ copy: row, status: event.target.value })}
            className="min-h-11 rounded-input border border-border bg-surface px-sm text-label"
          >
            {BOOK_COPY_STATUS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Book Copies"
        description="Copies are managed per title because the API lists copies within a book."
        actions={
          <Button onClick={() => setFormOpen(true)} disabled={!bookId}>
            Add copy
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-md rounded-card border border-border bg-surface p-base">
        <label className="flex min-w-[240px] flex-1 flex-col gap-xs text-label">
          Book
          <select value={bookId} onChange={(event) => { setBookId(event.target.value); setStatusFilter('') }} className="min-h-11 rounded-input border border-border bg-surface px-md text-label" disabled={booksLoading}>
            <option value="">Choose a book…</option>
            {(books?.content || []).map((book) => (
              <option key={book.bookId} value={String(book.bookId)}>{book.title}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-xs text-label">
          Status filter
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-11 rounded-input border border-border bg-surface px-md text-label" disabled={!bookId}>
            <option value="">All statuses</option>
            {BOOK_COPY_STATUS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      {error && <ErrorState message={error.message} onRetry={run} />}

      {!bookId ? (
        <div className="rounded-card border border-border bg-surface p-xl text-center text-body text-text-secondary">
          Select a book above to view and manage its physical copies.
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={visibleCopies}
          loading={loading}
          caption={`Copies of ${selectedBook?.title || 'selected book'}`}
          emptyMessage={statusFilter ? `No ${statusFilter.toLowerCase()} copies.` : 'No copies added yet.'}
          rowKey={(row) => row.copyId}
        />
      )}

      <Modal open={formOpen} title={`Add copy to ${selectedBook?.title || 'book'}`} onClose={() => setFormOpen(false)}>
        <form onSubmit={addCopy} className="flex flex-col gap-base" noValidate>
          {formError && <AlertMessage variant="error">{formError}</AlertMessage>}
          <FormInput label="Accession number" name="accessionNumber" required value={accessionNumber} onChange={(event) => setAccessionNumber(event.target.value)} />
          <FormInput label="Acquired date" name="acquiredDate" type="date" value={acquiredDate} onChange={(event) => setAcquiredDate(event.target.value)} />
          <div className="flex gap-sm">
            <Button type="submit" loading={saving}>Add copy</Button>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(statusChange)}
        title="Change copy status?"
        description={`Set ${statusChange?.copy?.accessionNumber || 'this copy'} to ${statusChange?.status || ''}. Backend rules may reject incompatible changes.`}
        confirmLabel="Change status"
        tone="primary"
        onConfirm={changeStatus}
        onCancel={() => setStatusChange(null)}
      />
    </div>
  )
}
