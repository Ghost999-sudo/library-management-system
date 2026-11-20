import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { Button } from '../../components/common/Button.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { authorNames } from '../../components/books/BookHelpers.jsx'
import { formatDate } from '../../utils/format.js'

const copyColumns = [
  { key: 'accessionNumber', header: 'Accession No.' },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'acquiredDate', header: 'Acquired', render: (row) => formatDate(row.acquiredDate) },
]

export default function BookDetailsPage() {
  const { bookId } = useParams()
  const location = useLocation()
  const listPath = location.pathname.replace(/\/\d+$/, '') || '/admin/books'
  const { data, loading, error, run } = useAsync(() => catalogService.getBook(bookId), [bookId])
  const [accessionNumber, setAccessionNumber] = useState('')
  const [acquiredDate, setAcquiredDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

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
      setAccessionNumber('')
      setAcquiredDate('')
      run()
    } catch (error) {
      setFormError(error.message || 'Could not add the copy.')
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return <ErrorState title="Book unavailable" message={error.message} onRetry={run} />
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={data?.title || 'Book details'}
        description={data ? `${authorNames(data)} · ${data.categoryName || 'No category'}` : 'Loading book…'}
        breadcrumbs={[{ label: 'Books', to: listPath }, { label: 'Details' }]}
        actions={
          data && (
            <Link to={`${listPath}/${data.bookId}/edit`} className="inline-flex min-h-11 items-center rounded-md border border-border px-base text-label font-medium hover:bg-background">
              Edit book
            </Link>
          )
        }
      />

      {loading && <p className="text-body text-text-secondary">Loading book details…</p>}

      {data && (
        <>
          <section className="rounded-lg border border-border bg-surface p-base">
            <h2 className="mb-base text-card font-semibold">Catalogue information</h2>
            <dl className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-3">
              <div><dt className="text-support text-text-secondary">ISBN</dt><dd className="text-body">{data.isbn || '—'}</dd></div>
              <div><dt className="text-support text-text-secondary">Publisher</dt><dd className="text-body">{data.publisher || '—'}</dd></div>
              <div><dt className="text-support text-text-secondary">Publication year</dt><dd className="text-body">{data.publicationYear || '—'}</dd></div>
              <div className="sm:col-span-2 lg:col-span-3"><dt className="text-support text-text-secondary">Description</dt><dd className="whitespace-pre-wrap text-body">{data.description || '—'}</dd></div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-surface p-base">
            <div className="mb-base flex flex-wrap items-center justify-between gap-sm">
              <h2 className="text-card font-semibold">Physical copies ({(data.copies || []).length})</h2>
              <Link to={listPath.replace(/\/books$/, '/book-copies')} className="text-label font-medium text-navy-hover hover:underline">
                Manage copies
              </Link>
            </div>
            <DataTable
              columns={copyColumns}
              data={data.copies || []}
              caption="Physical copies"
              emptyMessage="No copies added yet."
              rowKey={(row) => row.copyId}
            />

            <form onSubmit={addCopy} className="mt-lg flex flex-wrap items-end gap-md border-t border-border pt-base">
              <h3 className="w-full text-card font-semibold">Add a copy</h3>
              {formError && <div className="w-full"><AlertMessage variant="error">{formError}</AlertMessage></div>}
              <FormInput
                label="Accession number"
                name="accessionNumber"
                required
                value={accessionNumber}
                onChange={(event) => setAccessionNumber(event.target.value)}
                className="min-w-[200px] flex-1"
              />
              <FormInput label="Acquired date" name="acquiredDate" type="date" value={acquiredDate} onChange={(event) => setAcquiredDate(event.target.value)} />
              <Button type="submit" loading={saving}>Add copy</Button>
            </form>
          </section>
        </>
      )}
    </div>
  )
}
