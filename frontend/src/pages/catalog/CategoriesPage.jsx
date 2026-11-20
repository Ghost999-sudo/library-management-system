import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { Button } from '../../components/common/Button.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { FormTextarea } from '../../components/forms/FormTextarea.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { Modal } from '../../components/feedback/Modal.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'

const emptyForm = { categoryName: '', description: '' }

export default function CategoriesPage() {
  const { data, loading, error, run } = useAsync(() => catalogService.getCategories({ size: 200 }), [])
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const categories = (data?.content || []).filter((category) =>
    category.categoryName.toLowerCase().includes(search.toLowerCase().trim()),
  )

  const openCreate = () => { setEditing('new'); setForm(emptyForm); setFormError(null) }
  const openEdit = (category) => {
    setEditing(category)
    setForm({ categoryName: category.categoryName, description: category.description || '' })
    setFormError(null)
  }

  const save = async (event) => {
    event.preventDefault()
    if (!form.categoryName.trim()) {
      setFormError('Category name is required.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const payload = {
        categoryName: form.categoryName.trim(),
        description: form.description.trim() || undefined,
      }
      if (editing === 'new') await catalogService.createCategory(payload)
      else await catalogService.updateCategory(editing.categoryId, payload)
      notify.success(editing === 'new' ? 'Category added.' : 'Category updated.')
      setEditing(null)
      run()
    } catch (error) {
      setFormError(error.message || 'Could not save the category.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    try {
      await catalogService.deleteCategory(deleting.categoryId)
      notify.success('Category deleted.')
      setDeleting(null)
      run()
    } catch (error) {
      notify.error(error.message || 'This category may still be used by books.')
      setDeleting(null)
    }
  }

  const columns = [
    { key: 'categoryName', header: 'Category Name', render: (row) => <span className="font-medium">{row.categoryName}</span> },
    { key: 'description', header: 'Description', render: (row) => row.description || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-xs">
          <button type="button" onClick={() => openEdit(row)} aria-label={`Edit ${row.categoryName}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm hover:bg-background">
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setDeleting(row)} aria-label={`Delete ${row.categoryName}`} className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm text-danger hover:bg-danger/10">
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Categories"
        description="Organise books into categories."
        actions={<Button onClick={openCreate}><Plus aria-hidden="true" className="h-4 w-4" /> Add category</Button>}
      />

      <SearchInput label="Search categories" value={search} onChange={(event) => setSearch(event.target.value)} onClear={() => setSearch('')} placeholder="Search by name…" className="max-w-md" />

      {error && <ErrorState message={error.message} onRetry={run} />}

      <DataTable
        columns={columns}
        data={categories}
        loading={loading}
        caption="Categories"
        emptyMessage="No categories found."
        rowKey={(row) => row.categoryId}
      />

      <Modal open={Boolean(editing)} title={editing === 'new' ? 'Add category' : 'Edit category'} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="flex flex-col gap-base" noValidate>
          {formError && <AlertMessage variant="error">{formError}</AlertMessage>}
          <FormInput label="Category name" name="categoryName" required value={form.categoryName} onChange={(event) => setForm({ ...form, categoryName: event.target.value })} />
          <FormTextarea label="Description" name="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="flex gap-sm">
            <Button type="submit" loading={saving}>{editing === 'new' ? 'Add category' : 'Save changes'}</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleting)}
        title={`Delete ${deleting?.categoryName || 'category'}?`}
        description="Categories still referenced by books cannot be deleted."
        confirmLabel="Delete category"
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
