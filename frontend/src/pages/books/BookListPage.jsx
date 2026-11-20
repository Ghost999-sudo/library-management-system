import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { Button } from '../../components/common/Button.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { bookColumns } from '../../components/books/BookHelpers.jsx'

export default function BookListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname
  const { page, size, query, setPage } = usePagination(10)
  const [keyword, setKeyword] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [bookToDelete, setBookToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { data, loading, error, run } = useAsync(
    () => (submitted ? catalogService.searchBooks(submitted, query) : catalogService.getBooks(query)),
    [submitted, page, size],
  )

  const columns = [
    ...bookColumns,
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-xs">
          <Link to={`${basePath}/${row.bookId}`} aria-label={`View ${row.title}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm hover:bg-background">
            <Eye aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link to={`${basePath}/${row.bookId}/edit`} aria-label={`Edit ${row.title}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm hover:bg-background">
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => setBookToDelete(row)} aria-label={`Delete ${row.title}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm text-danger hover:bg-danger/10">
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await catalogService.deleteBook(bookToDelete.bookId)
      notify.success('Book deleted.')
      setBookToDelete(null)
      run()
    } catch (deleteError) {
      notify.error(deleteError.message || 'Could not delete this book.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Books"
        description="Manage titles, authors and catalogue information."
        actions={
          <Button onClick={() => navigate(`${basePath}/new`)}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Add book
          </Button>
        }
      />

      <form
        onSubmit={(event) => { event.preventDefault(); setSubmitted(keyword.trim()); setPage(0) }}
        className="flex flex-wrap items-end gap-md rounded-lg border border-border bg-surface p-base"
      >
        <SearchInput
          label="Search books"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onClear={() => { setKeyword(''); setSubmitted('') }}
          placeholder="Title, ISBN, author, publisher…"
          className="min-w-[240px] flex-1"
        />
        <Button type="submit" loading={loading}>Search</Button>
      </form>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <DataTable
        columns={columns}
        data={data?.content || []}
        loading={loading}
        caption="Books"
        emptyMessage="No books found."
        emptyDescription="Add your first title or adjust the search."
        rowKey={(row) => row.bookId}
      />

      <Pagination page={data?.page ?? page} size={data?.size ?? size} totalElements={data?.totalElements ?? 0} onPageChange={setPage} />

      <ConfirmationDialog
        open={Boolean(bookToDelete)}
        title={`Delete ${bookToDelete?.title || 'book'}?`}
        description="This removes the title and its copies. This action cannot be undone."
        confirmLabel="Delete book"
        onConfirm={confirmDelete}
        onCancel={() => setBookToDelete(null)}
      />
    </div>
  )
}
