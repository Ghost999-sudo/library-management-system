import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CircleDollarSign, Clock, Library, TriangleAlert } from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { loanService } from '../../services/loanService.js'
import { fineService } from '../../services/fineService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SummaryCard } from '../../components/common/SummaryCard.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { daysUntil, formatDate, formatMoney } from '../../utils/format.js'
import { DashboardSection } from './shared.jsx'

const DUE_SOON_DAYS = 7

const ownLoanColumns = [
  { key: 'bookTitle', header: 'Book', render: (row) => row.bookTitle || '—' },
  { key: 'accessionNumber', header: 'Accession No.', render: (row) => row.accessionNumber || '—' },
  { key: 'issueDate', header: 'Issued', render: (row) => formatDate(row.issueDate) },
  { key: 'dueDate', header: 'Due', render: (row) => formatDate(row.dueDate) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

const fineColumns = [
  { key: 'fineId', header: 'Fine ID', render: (row) => `#${row.fineId}` },
  { key: 'loanId', header: 'Loan ID', render: (row) => `#${row.loanId}` },
  { key: 'fineAmount', header: 'Assessed', render: (row) => formatMoney(row.fineAmount) },
  { key: 'amountPaid', header: 'Paid', render: (row) => formatMoney(row.amountPaid) },
  { key: 'outstandingAmount', header: 'Outstanding', render: (row) => formatMoney(row.outstandingAmount) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

export default function MemberDashboard() {
  const { user } = useAuth()
  const { data, loading, error, run } = useAsync(
    () =>
      Promise.all([
        loanService.getMyLoans({ size: 1000 }),
        fineService.getMyFines({ size: 1000 }),
      ]),
    [],
  )

  const derived = useMemo(() => {
    const loans = data?.[0]?.content || []
    const fines = data?.[1]?.content || []
    const active = loans.filter((loan) => loan.status === 'BORROWED')
    const dueSoon = active.filter((loan) => {
      const days = daysUntil(loan.dueDate)
      return days !== null && days >= 0 && days <= DUE_SOON_DAYS
    })
    const overdue = active.filter((loan) => {
      const days = daysUntil(loan.dueDate)
      return days !== null && days < 0
    })
    const outstanding = fines
      .filter((fine) => fine.status !== 'PAID' && fine.status !== 'WAIVED')
      .reduce((sum, fine) => sum + Number(fine.outstandingAmount || 0), 0)
    const recent = [...loans].sort((a, b) => String(b.issueDate).localeCompare(String(a.issueDate))).slice(0, 5)
    const activeSorted = [...active].sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))

    return { activeSorted, dueSoon, overdue, outstanding, recent, fines }
  }, [data])

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={`Welcome back, ${user?.username || 'reader'}`}
        description="Your borrowing and fine information at a glance."
        breadcrumbs={[{ label: 'Member' }, { label: 'Dashboard' }]}
      />

      {error && <ErrorState message={error.message} onRetry={run} />}

      <section aria-label="Your library at a glance" className="grid grid-cols-1 gap-base sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Currently Borrowed" value={derived.activeSorted.length} icon={BookOpen} loading={loading} tone="info" />
        <SummaryCard title="Due Soon" value={derived.dueSoon.length} icon={Clock} loading={loading} tone="warning" hint={`Within ${DUE_SOON_DAYS} days`} />
        <SummaryCard title="Overdue" value={derived.overdue.length} icon={TriangleAlert} loading={loading} tone="danger" />
        <SummaryCard title="Outstanding Fines" value={formatMoney(derived.outstanding)} icon={CircleDollarSign} loading={loading} tone="danger" />
      </section>

      <DashboardSection
        title="Currently borrowed books"
        description="Items on loan to you, ordered by earliest due date."
        action={
          <Link to="/member/catalogue" className="inline-flex items-center gap-xs text-label font-medium text-navy-hover hover:underline">
            Browse catalogue <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        }
      >
        <DataTable
          columns={ownLoanColumns}
          data={derived.activeSorted}
          loading={loading}
          caption="Your current loans"
          emptyMessage="You have no books on loan."
          emptyDescription="Explore the catalogue to find your next read."
          rowKey={(row) => row.loanId}
        />
      </DashboardSection>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-2">
        <DashboardSection title="Recent borrowing history">
          <DataTable
            columns={ownLoanColumns}
            data={derived.recent}
            loading={loading}
            caption="Your recent loans"
            emptyMessage="No borrowing history yet."
            rowKey={(row) => row.loanId}
          />
        </DashboardSection>

        <DashboardSection title="Personal fine summary">
          <DataTable
            columns={fineColumns}
            data={derived.fines}
            loading={loading}
            caption="Your fines"
            emptyMessage="You have no fines."
            emptyDescription="Keep returning books on time to stay fine-free."
            rowKey={(row) => row.fineId}
          />
        </DashboardSection>
      </div>

      <p className="flex items-center gap-sm text-support text-text-secondary">
        <Library aria-hidden="true" className="h-4 w-4" />
        Need another book? <Link to="/member/catalogue" className="font-medium text-navy-hover hover:underline">Browse the catalogue</Link>.
      </p>
    </div>
  )
}
