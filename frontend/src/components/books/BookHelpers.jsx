import { StatusBadge } from '../common/StatusBadge.jsx'

export function availableCopyCount(book) {
  return (book.copies || []).filter((copy) => copy.status === 'AVAILABLE').length
}

export function authorNames(book) {
  const names = (book.authors || []).map((author) => author.authorName)
  return names.length ? names.join(', ') : '—'
}

/** Shared catalogue table columns (backend BookResponse fields only). */
export const bookColumns = [
  { key: 'title', header: 'Title', render: (row) => <span className="font-medium">{row.title}</span> },
  { key: 'authors', header: 'Authors', render: (row) => authorNames(row) },
  { key: 'categoryName', header: 'Category', render: (row) => row.categoryName || '—' },
  { key: 'isbn', header: 'ISBN', render: (row) => row.isbn || '—' },
  { key: 'year', header: 'Year', render: (row) => row.publicationYear || '—' },
  {
    key: 'availability',
    header: 'Available',
    render: (row) => (
      <span className={availableCopyCount(row) > 0 ? 'text-success' : 'text-text-secondary'}>
        {availableCopyCount(row)} / {(row.copies || []).length}
      </span>
    ),
  },
]

/** Card view used by the member catalogue. */
export function BookCard({ book, onOpen }) {
  const available = availableCopyCount(book)
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-surface p-base shadow-sm">
      <h3 className="text-card font-semibold">{book.title}</h3>
      <p className="mt-xs text-label text-text-secondary">{authorNames(book)}</p>
      <dl className="mt-base flex flex-col gap-xs text-support text-text-secondary">
        <div className="flex justify-between gap-sm"><dt>Category</dt><dd className="text-right text-text-primary">{book.categoryName || '—'}</dd></div>
        <div className="flex justify-between gap-sm"><dt>ISBN</dt><dd className="text-right text-text-primary">{book.isbn || '—'}</dd></div>
        <div className="flex justify-between gap-sm"><dt>Published</dt><dd className="text-right text-text-primary">{book.publicationYear || '—'}</dd></div>
      </dl>
      <div className="mt-base flex items-center justify-between gap-sm border-t border-border pt-base">
        <StatusBadge status={available > 0 ? 'AVAILABLE' : 'BORROWED'} tone={available > 0 ? 'success' : 'neutral'}>
          {available > 0 ? `${available} available` : 'No copies available'}
        </StatusBadge>
        {onOpen && (
          <button type="button" onClick={() => onOpen(book)} className="text-label font-medium text-navy-hover hover:underline">
            View details
          </button>
        )}
      </div>
    </article>
  )
}
