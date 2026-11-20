import { useAuth } from '../../context/AuthContext.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { memberService } from '../../services/memberService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { MemberDetails } from '../../components/members/MemberHelpers.jsx'
import { ROLES } from '../../utils/constants.js'

/** Staff see their login details; members additionally see their own member record. */
export default function ProfilePage() {
  const { user } = useAuth()
  const isMember = user?.role === ROLES.MEMBER
  const {
    data: member,
    loading,
    error,
    run,
  } = useAsync(() => (isMember ? memberService.getMe() : Promise.resolve(null)), [isMember])

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="My profile"
        description="Your library account details."
        breadcrumbs={[{ label: 'Account' }, { label: 'Profile' }]}
      />

      <section className="rounded-lg border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Account</h2>
        <dl className="grid grid-cols-1 gap-base sm:grid-cols-2">
          <div><dt className="text-support text-text-secondary">Username</dt><dd className="text-body">{user?.username || '—'}</dd></div>
          <div><dt className="text-support text-text-secondary">Email</dt><dd className="text-body">{user?.email || '—'}</dd></div>
          <div><dt className="text-support text-text-secondary">Role</dt><dd className="text-body">{user?.role || '—'}</dd></div>
          <div><dt className="text-support text-text-secondary">Status</dt><dd className="text-body"><StatusBadge status={user?.status} /></dd></div>
        </dl>
      </section>

      {isMember && (
        <section className="rounded-lg border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Membership</h2>
          {error && <ErrorState message={error.message} onRetry={run} />}
          {loading && <p className="text-body text-text-secondary">Loading your membership details…</p>}
          {member && <MemberDetails member={member} />}
        </section>
      )}

      <p className="text-support text-text-secondary">
        Password changes and account administration are handled by library staff.
      </p>
    </div>
  )
}
