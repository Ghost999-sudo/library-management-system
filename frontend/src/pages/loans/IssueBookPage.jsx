import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { catalogService } from '../../services/catalogService.js'
import { loanService } from '../../services/loanService.js'
import { memberService } from '../../services/memberService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { FormSelect } from '../../components/forms/FormSelect.jsx'
import { Button } from '../../components/common/Button.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { getFieldError } from '../../utils/errors.js'
import { memberFullName } from '../../components/members/MemberHelpers.jsx'
import { formatDate } from '../../utils/format.js'

export default function IssueBookPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const listPath = location.pathname.replace(/\/issue$/, '') || '/admin/loans'

  const { data: options, error: optionsError } = useAsync(
    () => Promise.all([
      memberService.getMembers({ size: 200, sort: 'memberId,asc' }),
      catalogService.getBooks({ size: 200, sort: 'title,asc' }),
    ]),
    [],
  )

  const [memberId, setMemberId] = useState('')
  const [bookId, setBookId] = useState('')
  const [copyId, setCopyId] = useState('')
  const [formError, setFormError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const {
    data: availableCopies,
    loading: copiesLoading,
    error: copiesError,
  } = useAsync(
    () => (bookId ? catalogService.getAvailableCopies(bookId) : Promise.resolve([])),
    [bookId],
  )

  const [members, books] = options || []

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!memberId || !copyId) {
      setFormError('Select both an active member and an available copy.')
      return
    }
    setSubmitting(true)
    setFormError(null)
    setFieldErrors({})
    try {
      const loan = await loanService.issueBook({ memberId: Number(memberId), copyId: Number(copyId) })
      notify.success(`Book issued. Due ${formatDate(loan.dueDate)}.`)
      navigate(listPath)
    } catch (error) {
      setFormError(error.message || 'Could not issue this book.')
      const memberError = getFieldError(error, 'memberId')
      const copyError = getFieldError(error, 'copyId')
      if (memberError || copyError) setFieldErrors({ memberId: memberError, copyId: copyError })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Issue book"
        description="Choose an active member and an available physical copy. The backend sets the issue and due dates."
        breadcrumbs={[{ label: 'Loans', to: listPath }, { label: 'Issue' }]}
      />

      {optionsError && <ErrorState message={optionsError.message} />}

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-lg">
        {formError && <AlertMessage variant="error" title="Unable to issue book">{formError}</AlertMessage>}

        <section className="rounded-lg border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">1. Member</h2>
          <FormSelect
            label="Active member"
            name="memberId"
            required
            value={memberId}
            error={fieldErrors.memberId}
            onChange={(event) => { setMemberId(event.target.value); setFormError(null) }}
            options={(members?.content || [])
              .filter((member) => member.status === 'ACTIVE')
              .map((member) => ({
                value: String(member.memberId),
                label: `${memberFullName(member)} · ${member.membershipNumber}`,
              }))}
            placeholder="Choose a member…"
            className="max-w-xl"
          />
        </section>

        <section className="rounded-lg border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">2. Book copy</h2>
          <div className="flex flex-col gap-base">
            <FormSelect
              label="Book"
              name="bookId"
              required
              value={bookId}
              onChange={(event) => { setBookId(event.target.value); setCopyId(''); setFormError(null) }}
              options={(books?.content || []).map((book) => ({
                value: String(book.bookId),
                label: book.title,
              }))}
              placeholder="Choose a book…"
              className="max-w-xl"
            />

            <FormSelect
              label="Available copy"
              name="copyId"
              required
              value={copyId}
              error={fieldErrors.copyId}
              disabled={!bookId || copiesLoading}
              onChange={(event) => { setCopyId(event.target.value); setFormError(null) }}
              options={(availableCopies || []).map((copy) => ({
                value: String(copy.copyId),
                label: copy.accessionNumber,
              }))}
              placeholder={bookId ? 'Choose a copy…' : 'Choose a book first'}
              className="max-w-xl"
            />

            {copiesError && <AlertMessage variant="error">{copiesError.message}</AlertMessage>}

            {bookId && !copiesLoading && (availableCopies || []).length === 0 && (
              <AlertMessage variant="warning">
                This book has no available copies right now. Add one from Book Copies first.
              </AlertMessage>
            )}
          </div>
        </section>

        <div className="flex flex-wrap gap-sm">
          <Button type="submit" loading={submitting} disabled={!memberId || !copyId}>Issue book</Button>
          <Button variant="secondary" onClick={() => navigate(listPath)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
