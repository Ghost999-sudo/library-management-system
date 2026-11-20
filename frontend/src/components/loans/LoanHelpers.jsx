import { Button } from '../common/Button.jsx'
import { DataTable } from '../tables/DataTable.jsx'
import { StatusBadge } from '../common/StatusBadge.jsx'
import { ConfirmationDialog } from '../feedback/ConfirmationDialog.jsx'
import { daysUntil, formatDate } from '../../utils/format.js'

/** Derived convenience only; the authoritative overdue list comes from the backend. */
export function isOverdue(loan) {
  if (loan?.status !== 'BORROWED' || !loan.dueDate) return false
  const days = daysUntil(loan.dueDate)
  return days !== null && days < 0
}

export function loanColumns({ onReturn, showMember = true } = {}) {
  const columns = []

  if (showMember) {
    columns.push({ key: 'memberName', header: 'Member', render: (row) => row.memberName || '—' })
  }

  columns.push(
    { key: 'bookTitle', header: 'Book', render: (row) => <span className="font-medium">{row.bookTitle || '—'}</span> },
    { key: 'accessionNumber', header: 'Copy', render: (row) => row.accessionNumber || '—' },
    { key: 'issueDate', header: 'Issued', render: (row) => formatDate(row.issueDate) },
    {
      key: 'dueDate',
      header: 'Due',
      render: (row) => (
        <span className={isOverdue(row) ? 'font-medium text-danger' : undefined}>
          {formatDate(row.dueDate)}
          {isOverdue(row) && ' (overdue)'}
        </span>
      ),
    },
    { key: 'returnDate', header: 'Returned', render: (row) => formatDate(row.returnDate) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusBadge status={row.status} tone={isOverdue(row) ? 'danger' : undefined}>
          {isOverdue(row) ? `${row.status} · OVERDUE` : row.status}
        </StatusBadge>
      ),
    },
  )

  if (onReturn) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (row) => row.status === 'BORROWED' ? (
        <Button variant="secondary" size="sm" onClick={() => onReturn(row)}>Return</Button>
      ) : (
        <span className="text-support text-text-secondary">Returned</span>
      ),
    })
  }

  return columns
}

export function LoanTable({
  loans,
  loading,
  caption,
  onReturn,
  showMember = true,
  emptyMessage,
  emptyDescription,
}) {
  return (
    <DataTable
      columns={loanColumns({ onReturn, showMember })}
      data={loans}
      loading={loading}
      caption={caption}
      emptyMessage={emptyMessage || 'No loans found.'}
      emptyDescription={emptyDescription}
      rowKey={(row) => row.loanId}
    />
  )
}

/** Confirmation copy stays honest: the backend decides whether a fine applies. */
export function ReturnDialog({ loan, onConfirm, onCancel }) {
  return (
    <ConfirmationDialog
      open={Boolean(loan)}
      title="Record this return?"
      description={`Return ${loan?.bookTitle || 'this book'} (${loan?.accessionNumber || 'copy'}) for ${loan?.memberName || 'the member'}? An overdue fine is assessed automatically by the backend when applicable.`}
      confirmLabel="Confirm return"
      tone="primary"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
