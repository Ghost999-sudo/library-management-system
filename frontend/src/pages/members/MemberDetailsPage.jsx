import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { memberService } from '../../services/memberService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { FormSelect } from '../../components/forms/FormSelect.jsx'
import { Button } from '../../components/common/Button.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { MemberDetails, memberFullName } from '../../components/members/MemberHelpers.jsx'
import { MEMBER_STATUS } from '../../utils/constants.js'

export default function MemberDetailsPage() {
  const { memberId } = useParams()
  const location = useLocation()
  const listPath = location.pathname.replace(/\/\d+$/, '') || '/admin/members'
  const { data: member, loading, error, run } = useAsync(() => memberService.getById(memberId), [memberId])
  const [pendingStatus, setPendingStatus] = useState(null)
  const [actionError, setActionError] = useState(null)

  const applyStatus = async () => {
    setActionError(null)
    try {
      await memberService.changeStatus(memberId, pendingStatus)
      notify.success(`Member marked ${pendingStatus.toLowerCase()}.`)
      setPendingStatus(null)
      run()
    } catch (error) {
      setActionError(error.message || 'Could not change the member status.')
      setPendingStatus(null)
    }
  }

  if (error) {
    return <ErrorState title="Member unavailable" message={error.message} onRetry={run} />
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={member ? memberFullName(member) : 'Member details'}
        description={member ? `${member.membershipNumber} · ${member.email}` : 'Loading member…'}
        breadcrumbs={[{ label: 'Members', to: listPath }, { label: 'Details' }]}
        actions={
          member && (
            <Link
              to={`${listPath}/${member.memberId}/edit`}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-base text-label font-medium hover:bg-background"
            >
              Edit member
            </Link>
          )
        }
      />

      {actionError && <AlertMessage variant="error">{actionError}</AlertMessage>}
      {loading && <p className="text-body text-text-secondary">Loading member details…</p>}

      {member && (
        <>
          <section className="rounded-lg border border-border bg-surface p-base">
            <h2 className="mb-base text-card font-semibold">Membership information</h2>
            <MemberDetails member={member} />
          </section>

          <section className="rounded-lg border border-border bg-surface p-base">
            <h2 className="mb-base text-card font-semibold">Membership status</h2>
            <FormSelect
              label="Status"
              name="memberStatus"
              value={member.status}
              options={MEMBER_STATUS}
              onChange={(event) => setPendingStatus(event.target.value)}
              className="max-w-xs"
            />
            <p className="mt-sm text-support text-text-secondary">
              Inactive members can still be viewed, but backend rules control borrowing.
            </p>
          </section>
        </>
      )}

      <ConfirmationDialog
        open={Boolean(pendingStatus)}
        title="Change member status?"
        description={`Set this member to ${pendingStatus || ''}?`}
        confirmLabel="Change status"
        tone="primary"
        onConfirm={applyStatus}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  )
}
