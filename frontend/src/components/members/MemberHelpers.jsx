import { Link } from 'react-router-dom'
import { Eye, Pencil } from 'lucide-react'
import { StatusBadge } from '../common/StatusBadge.jsx'
import { formatDate } from '../../utils/format.js'

export function memberFullName(member) {
  return `${member.firstName || ''} ${member.lastName || ''}`.trim()
}

/** Shared table columns built only from MemberResponse fields. */
export function memberColumns(basePath, { onStatusChange } = {}) {
  return [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium">{memberFullName(row)}</span>,
    },
    { key: 'membershipNumber', header: 'Membership No.' },
    { key: 'admissionNumber', header: 'Admission No.' },
    { key: 'email', header: 'Email', render: (row) => row.email || '—' },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '—' },
    {
      key: 'registrationDate',
      header: 'Registered',
      render: (row) => formatDate(row.registrationDate),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-xs">
          <Link
            to={`${basePath}/${row.memberId}`}
            aria-label={`View ${memberFullName(row)}`}
            className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm hover:bg-background"
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            to={`${basePath}/${row.memberId}/edit`}
            aria-label={`Edit ${memberFullName(row)}`}
            className="touch-target inline-flex items-center justify-center rounded-md border border-border px-sm hover:bg-background"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </Link>
          {onStatusChange && (
            <label className="flex flex-col gap-xs">
              <span className="sr-only">Change status for {memberFullName(row)}</span>
              <select
                value={row.status}
                onChange={(event) => onStatusChange(row, event.target.value)}
                aria-label={`Status for ${memberFullName(row)}`}
                className="min-h-11 rounded-md border border-border bg-surface px-sm text-support"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </label>
          )}
        </div>
      ),
    },
  ]
}

/** Definition list shared by the details and profile screens (MemberResponse fields). */
export function MemberDetails({ member }) {
  const fields = [
    ['Membership number', member.membershipNumber],
    ['Admission number', member.admissionNumber],
    ['Username', member.username],
    ['Email', member.email],
    ['Phone', member.phone || '—'],
    ['Department', member.department || '—'],
    ['Registration date', formatDate(member.registrationDate)],
    ['Status', <StatusBadge key="status" status={member.status} />],
  ]

  return (
    <dl className="grid grid-cols-1 gap-base sm:grid-cols-2">
      {fields.map(([label, value]) => (
        <div key={label}>
          <dt className="text-support text-text-secondary">{label}</dt>
          <dd className="mt-xs text-body">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
