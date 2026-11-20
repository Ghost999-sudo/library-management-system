import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { memberService } from '../../services/memberService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { Button } from '../../components/common/Button.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { memberColumns, memberFullName } from '../../components/members/MemberHelpers.jsx'
import { MEMBER_STATUS } from '../../utils/constants.js'

const PAGE_SIZE = 10
const FETCH_SIZE = 200

export default function MemberListPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const basePath = location.pathname

  const { data, loading, error, run } = useAsync(
    () => memberService.getMembers({ size: FETCH_SIZE, sort: 'memberId,asc' }),
    [],
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pendingStatus, setPendingStatus] = useState(null)

  const term = search.trim().toLowerCase()
  const members = (data?.content || []).filter((member) => {
    const matchesTerm =
      !term ||
      [memberFullName(member), member.membershipNumber, member.admissionNumber, member.email, member.username]
        .some((value) => (value || '').toLowerCase().includes(term))
    return matchesTerm && (!statusFilter || member.status === statusFilter)
  })

  useEffect(() => setPage(0), [term, statusFilter])

  const visibleMembers = members.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const applyStatus = async () => {
    if (!pendingStatus) return
    try {
      await memberService.changeStatus(pendingStatus.member.memberId, pendingStatus.status)
      notify.success(`Member marked ${pendingStatus.status.toLowerCase()}.`)
      setPendingStatus(null)
      run()
    } catch (error) {
      notify.error(error.message || 'Could not change the member status.')
      setPendingStatus(null)
    }
  }

  const columns = memberColumns(basePath, {
    onStatusChange: (member, status) => {
      if (status !== member.status) setPendingStatus({ member, status })
    },
  })

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Members"
        description="Register members, maintain their details and manage membership status."
        actions={
          <Button onClick={() => navigate(`${basePath}/new`)}>
            <Plus aria-hidden="true" className="h-4 w-4" /> Register member
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-md rounded-lg border border-border bg-surface p-base">
        <SearchInput
          label="Search members"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch('')}
          placeholder="Name, membership no., admission no., email…"
          className="min-w-[240px] flex-1"
        />
        <label className="flex flex-col gap-xs text-label">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-md text-label"
          >
            <option value="">All statuses</option>
            {MEMBER_STATUS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <p className="text-support text-text-secondary">
        Search and filters apply to the first {FETCH_SIZE} members returned by the backend.
      </p>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <DataTable
        columns={columns}
        data={visibleMembers}
        loading={loading}
        caption="Members"
        emptyMessage="No members found."
        emptyDescription="Register a member or adjust your filters."
        rowKey={(row) => row.memberId}
      />

      <Pagination
        page={page}
        size={PAGE_SIZE}
        totalElements={members.length}
        onPageChange={setPage}
      />

      <ConfirmationDialog
        open={Boolean(pendingStatus)}
        title="Change member status?"
        description={`Set ${pendingStatus ? memberFullName(pendingStatus.member) : ''} to ${pendingStatus?.status || ''}?`}
        confirmLabel="Change status"
        tone="primary"
        onConfirm={applyStatus}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  )
}
