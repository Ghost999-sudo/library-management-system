import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { Button } from '../../components/common/Button.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { Modal } from '../../components/feedback/Modal.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'

export default function AuthorsPage() {
  const { data, loading, error, run } = useAsync(() => catalogService.getAuthors({ size: 200 }), [])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [authorName, setAuthorName] = useState('')
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const authors = (data?.content || []).filter((author) =>
    author.authorName.toLowerCase().includes(search.toLowerCase().trim()),
  )

  const openCreate = () => { setEditing('new'); setAuthorName(''); setFormError(null) }
  const openEdit = (author) => { setEditing(author); setAuthorName(author.authorName); setFormError(null) }

  const save = async (event) => {
    event.preventDefault()
    if (!authorName.trim()) {
      setFormError('Author name is required.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const payload = { authorName: authorName.trim() }
      if (editing === 'new') await catalogService.createAuthor(payload)
      else await catalogService.updateAuthor(editing.authorId, payload)
      notify.success(editing === 'new' ? 'Author added.' : 'Author updated.')
      setEditing(null)
      run()
    } catch (error) {
      setFormError(error.message || 'Could not save the author.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    try {
      await catalogService.deleteAuthor(deleting.authorId)
      notify.success('Author deleted.')
      setDeleting(null)
      run()
    } catch (error) {
      notify.error(error.message || 'This author may still be linked to books.')
      setDeleting(null)
    }
  }

  const columns = [
    { key: 'authorName', header: 'Author Name', render: (row) => <span className="font-medium">{row.authorName}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-xs">
          <button type="button" onClick={() => openEdit(row)} aria-label={`Edit ${row.authorName}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm hover:bg-background">
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleting(row)} aria-label={`Delete ${row.authorName}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm text-danger hover:bg-danger/10">
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Authors"
        description="Maintain the list of authors linked to books."
        actions={<Button onClick={openCreate}><Plus aria-hidden="true" className="h-4 w-4" /> Add author</Button>}
      />

      <SearchInput label="Search authors" value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search by name…" className="max-w-md" />

      {error && <ErrorState message={error.message} onRetry={run} />}

      <DataTable
        columns={columns}
        data={authors}
        loading={loading}
        caption="Authors"
        emptyMessage="No authors found."
        rowKey={(row) => row.authorId}
      />

      <Modal open={Boolean(editing)} title={editing === 'new' ? 'Add author' : 'Edit author'} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="flex flex-col gap-base" noValidate>
          {formError && <AlertMessage variant="error">{formError}</AlertMessage>}
          <FormInput label="Author name" name="authorName" required value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
          <div className="flex gap-sm">
            <Button type="submit" loading={saving}>{editing === 'new' ? 'Add author' : 'Save changes'}</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.authorName || 'author'}?`}
        description="Authors still linked to books cannot be deleted."
        confirmLabel="Delete author"
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
