import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { formatDate } from '../../utils/format.js'

/** Shared table columns for loan records (real backend fields only). */
export const loanColumns = [
  { key: 'memberName', header: 'Member', render: (row) => row.memberName || '—' },
  { key: 'bookTitle', header: 'Book', render: (row) => row.bookTitle || '—' },
  { key: 'accessionNumber', header: 'Accession No.', render: (row) => row.accessionNumber || '—' },
  { key: 'issueDate', header: 'Issued', render: (row) => formatDate(row.issueDate) },
  { key: 'dueDate', header: 'Due', render: (row) => formatDate(row.dueDate) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

/** Consistent section framing across dashboards. */
export function DashboardSection({ title, description, action, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-base">
      <div className="mb-base flex flex-wrap items-start justify-between gap-sm">
        <div>
          <h2 className="text-card font-semibold">{title}</h2>
          {description && <p className="mt-xs text-support text-text-secondary">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
