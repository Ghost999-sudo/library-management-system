import { useEffect, useState } from 'react'
import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { Button } from '../../components/common/Button.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { Modal } from '../../components/feedback/Modal.jsx'
import { BookCard, authorNames } from '../../components/books/BookHelpers.jsx'
import { formatDate } from '../../utils/format.js'

export default function CataloguePage() {
  const { page, size, setPage, query } = usePagination(12)
  const [keyword, setKeyword] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selected, setSelected] = useState(null)

  const { data: categories } = useAsync(() => catalogService.getCategories({ size: 200 }), [])
  const { data, loading, error, run } = useAsync(
    () =>
      submitted
        ? catalogService.searchBooks(submitted, { ...query, sort: 'title,asc' })
        : catalogService.getBooks({ ...query, sort: 'title,asc' }),
    [submitted, page, size],
  )

  useEffect(() => setPage(0), [submitted, setPage])

  const books = (data?.content || []).filter(
    (book) => !categoryId || String(book.categoryId) === categoryId,
  )

  const submitSearch = (event) => {
    event.preventDefault()
    setSubmitted(keyword.trim())
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Browse books"
        description="Search the library catalogue by title, ISBN, author, publisher or category."
        breadcrumbs={[{ label: 'Member' }, { label: 'Browse Books' }]}
      />

      <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-md rounded-card border border-border bg-surface p-base">
        <SearchInput
          label="Search the catalogue"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onClear={() => { setKeyword(''); setSubmitted('') }}
          placeholder="Title, ISBN, author, publisher…"
          className="min-w-[240px] flex-1"
        />
        <label className="flex flex-col gap-xs text-label">
          Category
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="min-h-11 rounded-input border border-border bg-surface px-md text-label"
          >
            <option value="">All categories</option>
            {(categories?.content || []).map((category) => (
              <option key={category.categoryId} value={String(category.categoryId)}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </label>
        <Button type="submit" loading={loading}>Search</Button>
      </form>

      {error && <ErrorState message={error.message} onRetry={run} />}

      {categoryId && (
        <p className="text-support text-text-secondary">
          Category filtering applies within the current page of results.
        </p>
      )}

      {!loading && books.length === 0 ? (
        <div className="rounded-card border border-border bg-surface">
          <EmptyState title="No books found" description="Try a different search term or clear your filters." />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-base sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.bookId} book={book} onOpen={setSelected} />
          ))}
        </div>
      )}

      <Pagination
        page={data?.page ?? page}
        size={data?.size ?? size}
        totalElements={data?.totalElements ?? 0}
        onPageChange={setPage}
      />

      <Modal open={Boolean(selected)} title={selected?.title || 'Book details'} onClose={() => setSelected(null)} size="lg">
        {selected && (
          <div className="flex flex-col gap-base text-body">
            <p><span className="font-medium">Authors:</span> {authorNames(selected)}</p>
            <p><span className="font-medium">Category:</span> {selected.categoryName || '—'}</p>
            <p><span className="font-medium">ISBN:</span> {selected.isbn || '—'}</p>
            <p><span className="font-medium">Publisher:</span> {selected.publisher || '—'}</p>
            <p><span className="font-medium">Published:</span> {selected.publicationYear || '—'}</p>
            {selected.description && <p className="whitespace-pre-wrap">{selected.description}</p>}
            <div>
              <p className="font-medium">Physical copies</p>
              {(selected.copies || []).length === 0 ? (
                <p className="text-support text-text-secondary">No copies have been added yet.</p>
              ) : (
                <ul className="mt-xs flex flex-col gap-xs text-support">
                  {selected.copies.map((copy) => (
                    <li key={copy.copyId} className="flex justify-between gap-sm border-b border-border py-xs last:border-0">
                      <span>{copy.accessionNumber}</span>
                      <span className="text-text-secondary">{copy.status} · acquired {formatDate(copy.acquiredDate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
