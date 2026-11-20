import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { FormInput } from '../../components/forms/FormInput.jsx'
import { FormSelect } from '../../components/forms/FormSelect.jsx'
import { FormTextarea } from '../../components/forms/FormTextarea.jsx'
import { Button } from '../../components/common/Button.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { getFieldError } from '../../utils/errors.js'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(255, 'Title is too long.'),
  categoryId: z.string().min(1, 'Category is required.'),
  isbn: z.string().max(20, 'ISBN must be 20 characters or fewer.'),
  publisher: z.string().max(150, 'Publisher must be 150 characters or fewer.'),
  publicationYear: z.string().refine(
    (value) => value === '' || /^\d{4}$/.test(value),
    'Enter a four-digit year.',
  ),
  description: z.string().max(2000, 'Description must be 2000 characters or fewer.'),
  authorIds: z.array(z.string()),
  copies: z.array(
    z.object({
      accessionNumber: z.string().trim().min(1, 'Accession number is required.').max(50),
      acquiredDate: z.string(),
    }),
  ),
})

const defaults = {
  title: '',
  categoryId: '',
  isbn: '',
  publisher: '',
  publicationYear: '',
  description: '',
  authorIds: [],
  copies: [],
}

export default function BookFormPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEditing = Boolean(bookId)
  const listPath = location.pathname.replace(/\/(new|\d+\/edit|\d+)$/, '') || '/admin/books'

  const { data: options } = useAsync(
    () => Promise.all([
      catalogService.getCategories({ size: 200 }),
      catalogService.getAuthors({ size: 200 }),
      isEditing ? catalogService.getBook(bookId) : Promise.resolve(null),
    ]),
    [bookId],
  )

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults })

  const { fields, append, remove } = useFieldArray({ control, name: 'copies' })

  useEffect(() => {
    if (!options) return
    const [categories, authors, book] = options
    if (!book) return

    reset({
      title: book.title || '',
      categoryId: String(book.categoryId || ''),
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear ? String(book.publicationYear) : '',
      description: book.description || '',
      authorIds: (book.authors || []).map((author) => String(author.authorId)),
      copies: [],
    })
    // Categories/authors are loaded for the dropdown options above.
    void categories
    void authors
  }, [options, reset])

  const onSubmit = async (values) => {
    const payload = {
      categoryId: Number(values.categoryId),
      title: values.title.trim(),
      isbn: values.isbn.trim() || undefined,
      publisher: values.publisher.trim() || undefined,
      publicationYear: values.publicationYear ? Number(values.publicationYear) : undefined,
      description: values.description.trim() || undefined,
      authorIds: values.authorIds.map(Number),
    }
    if (!isEditing) {
      payload.copies = values.copies
        .filter((copy) => copy.accessionNumber.trim())
        .map((copy) => ({
          accessionNumber: copy.accessionNumber.trim(),
          acquiredDate: copy.acquiredDate || undefined,
        }))
    }

    try {
      if (isEditing) await catalogService.updateBook(bookId, payload)
      else await catalogService.createBook(payload)
      notify.success(isEditing ? 'Book updated.' : 'Book added.')
      navigate(listPath)
    } catch (error) {
      const fieldError = getFieldError(error, 'title') || getFieldError(error, 'isbn')
      if (fieldError) setError(fieldError.includes('ISBN') ? 'isbn' : 'title', { message: fieldError })
      setError('root', { message: error.message || 'Could not save the book.' })
    }
  }

  const [categories, authors] = options || []

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={isEditing ? 'Edit book' : 'Add book'}
        description="Group catalogue information, authors and physical copies."
        breadcrumbs={[{ label: 'Books', to: listPath }, { label: isEditing ? 'Edit' : 'Add' }]}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-lg">
        {errors.root && <AlertMessage variant="error" title="Unable to save">{errors.root.message}</AlertMessage>}

        <section className="rounded-card border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Basic information</h2>
          <div className="grid grid-cols-1 gap-base md:grid-cols-2">
            <FormInput label="Title" name="title" required error={errors.title?.message} {...register('title')} />
            <FormSelect
              label="Category"
              name="categoryId"
              required
              error={errors.categoryId?.message}
              options={(categories?.content || []).map((category) => ({ value: String(category.categoryId), label: category.categoryName }))}
              {...register('categoryId')}
            />
            <FormInput label="ISBN" name="isbn" error={errors.isbn?.message} {...register('isbn')} />
            <FormInput label="Publisher" name="publisher" error={errors.publisher?.message} {...register('publisher')} />
            <FormInput label="Publication year" name="publicationYear" type="number" error={errors.publicationYear?.message} {...register('publicationYear')} />
          </div>
          <FormTextarea label="Description" name="description" error={errors.description?.message} className="mt-base" {...register('description')} />
        </section>

        <section className="rounded-card border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Authors</h2>
          <fieldset className="flex flex-wrap gap-md">
            <legend className="sr-only">Select one or more authors</legend>
            {(authors?.content || []).length === 0 ? (
              <p className="text-support text-text-secondary">No authors available. Add authors from the Authors page first.</p>
            ) : (
              authors.content.map((author) => (
                <label key={author.authorId} className="flex min-h-11 items-center gap-sm text-label">
                  <input type="checkbox" value={String(author.authorId)} {...register('authorIds')} className="h-4 w-4 accent-teal" />
                  {author.authorName}
                </label>
              ))
            )}
          </fieldset>
        </section>

        {!isEditing && (
          <section className="rounded-card border border-border bg-surface p-base">
            <div className="mb-base flex items-center justify-between gap-sm">
              <h2 className="text-card font-semibold">Physical copies</h2>
              <Button variant="secondary" size="sm" onClick={() => append({ accessionNumber: '', acquiredDate: '' })}>
                <Plus aria-hidden="true" className="h-4 w-4" /> Add copy
              </Button>
            </div>
            <div className="flex flex-col gap-md">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-wrap items-start gap-md rounded-md border border-border p-base">
                  <FormInput
                    label={`Accession number ${index + 1}`}
                    name={`copies.${index}.accessionNumber`}
                    required
                    error={errors.copies?.[index]?.accessionNumber?.message}
                    {...register(`copies.${index}.accessionNumber`)}
                    className="min-w-[200px] flex-1"
                  />
                  <FormInput
                    label={`Acquired date ${index + 1}`}
                    name={`copies.${index}.acquiredDate`}
                    type="date"
                    {...register(`copies.${index}.acquiredDate`)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove copy ${index + 1}`}
                    onClick={() => remove(index)}
                    className="mt-lg text-danger"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={isSubmitting}>{isEditing ? 'Save changes' : 'Add book'}</Button>
          <Button variant="secondary" onClick={() => navigate(listPath)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
