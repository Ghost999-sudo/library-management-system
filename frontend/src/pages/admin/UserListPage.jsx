import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { userService } from '../../services/userService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SearchInput } from '../../components/tables/SearchInput.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { Button } from '../../components/common/Button.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ConfirmationDialog } from '../../components/feedback/ConfirmationDialog.jsx'
import { notify } from '../../components/feedback/ToastNotification.jsx'
import { ROLES, USER_STATUS } from '../../utils/constants.js'

const PAGE_SIZE = 10
const FETCH_SIZE = 200

export default function UserListPage() {
  const location = useLocation()
  const basePath = location.pathname
  const { data, loading, error, run } = useAsync(
    () => userService.getUsers({ size: FETCH_SIZE, sort: 'userId,asc' }),
    [],
  )
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [pendingStatus, setPendingStatus] = useState(null)

  const term = search.trim().toLowerCase()
  const users = (data?.content || []).filter((user) => {
    const matchesTerm =
      !term ||
      [user.username, user.email, user.role, user.status, String(user.userId)]
        .some((value) => (value || '').toLowerCase().includes(term))
    return (
      matchesTerm &&
      (!roleFilter || user.role === roleFilter) &&
      (!statusFilter || user.status === statusFilter)
    )
  })

  useEffect(() => setPage(0), [term, roleFilter, statusFilter])

  const visibleUsers = users.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const applyStatus = async () => {
    if (!pendingStatus) return
    try {
      await userService.changeStatus(pendingStatus.user.userId, pendingStatus.status)
      notify.success(`Account marked ${pendingStatus.status.toLowerCase()}.`)
      setPendingStatus(null)
      run()
    } catch (errorChange) {
      notify.error(errorChange.message || 'Could not change the account status.')
      setPendingStatus(null)
    }
  }

  const columns = [
    { key: 'username', header: 'Username', render: (row) => <span className="font-medium">{row.username}</span> },
    { key: 'email', header: 'Email', render: (row) => row.email },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <span className="rounded-full border border-border bg-background px-sm py-xs text-support">
          {row.role}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => {
        const nextStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        return (
          <div className="flex flex-wrap gap-sm">
            <Link
              to={`${basePath}/${row.userId}/edit`}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-md text-support font-medium hover:bg-background"
            >
              Edit
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPendingStatus({ user: row, status: nextStatus })}
            >
              {nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'}
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="User management"
        description="Create staff and member accounts, assign roles and control account access."
        actions={
          <Link
            to={`${basePath}/new`}
            className="inline-flex min-h-11 items-center gap-sm rounded-md bg-navy px-base py-sm text-label font-medium text-white hover:bg-navy-hover"
          >
            <Plus aria-hidden="true" className="h-4 w-4" /> Create user
          </Link>
        }
      />

      <div className="flex flex-wrap items-end gap-md rounded-lg border border-border bg-surface p-base">
        <SearchInput
          label="Search users"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch('')}
          placeholder="Username, email, role…"
          className="min-w-[240px] flex-1"
        />
        <label className="flex flex-col gap-xs text-label">
          Role
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-md text-label"
          >
            <option value="">All roles</option>
            {Object.values(ROLES).map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-xs text-label">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="min-h-11 rounded-md border border-border bg-surface px-md text-label"
          >
            <option value="">All statuses</option>
            {USER_STATUS.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <p className="text-support text-text-secondary">
        Search and filters apply to the first {FETCH_SIZE} accounts returned by the backend.
        Accounts are deactivated rather than deleted so borrowing history stays intact.
      </p>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <DataTable
        columns={columns}
        data={visibleUsers}
        loading={loading}
        caption="System accounts"
        emptyMessage="No users found."
        emptyDescription="Create an account or adjust your filters."
        rowKey={(row) => row.userId}
      />

      <Pagination page={page} size={PAGE_SIZE} totalElements={users.length} onPageChange={setPage} />

      <ConfirmationDialog
        open={Boolean(pendingStatus)}
        title={pendingStatus?.status === 'ACTIVE' ? 'Activate account?' : 'Deactivate account?'}
        description={
          pendingStatus
            ? `${pendingStatus.user.username} will be marked ${pendingStatus.status}. Their records are kept.`
            : ''
        }
        confirmLabel={pendingStatus?.status === 'ACTIVE' ? 'Activate' : 'Deactivate'}
        tone={pendingStatus?.status === 'ACTIVE' ? 'primary' : 'danger'}
        onConfirm={applyStatus}
        onCancel={() => setPendingStatus(null)}
      />
    </div>
  )
}
