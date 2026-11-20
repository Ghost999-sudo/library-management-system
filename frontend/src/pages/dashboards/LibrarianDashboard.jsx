import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Plus,
  Receipt,
  RotateCcw,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { dashboardService } from '../../services/dashboardService.js'
import { loanService } from '../../services/loanService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SummaryCard } from '../../components/common/SummaryCard.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { formatMoney, formatNumber } from '../../utils/format.js'
import { DashboardSection, loanColumns } from './shared.jsx'

const quickActions = [
  { label: 'Issue Book', to: '/librarian/loans', icon: BookOpen },
  { label: 'Process Return', to: '/librarian/returns', icon: RotateCcw },
  { label: 'Register Member', to: '/librarian/members', icon: UserPlus },
  { label: 'Add Book', to: '/librarian/books', icon: Plus },
  { label: 'Record Fine Payment', to: '/librarian/payments', icon: Receipt },
]

export default function LibrarianDashboard() {
  const { data, loading, error, run } = useAsync(
    () =>
      Promise.all([
        dashboardService.getSummary(),
        loanService.getLoans({ size: 5, sort: 'issueDate,desc' }),
        loanService.getOverdue({ size: 5 }),
      ]),
    [],
  )

  const [summary, recentLoans, overdue] = data || []

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Library operations"
        description="Today's lending activity and the tasks that need attention."
        breadcrumbs={[{ label: 'Librarian' }, { label: 'Dashboard' }]}
      />

      {error && <ErrorState message={error.message} onRetry={run} />}

      <section aria-label="Key statistics" className="grid grid-cols-1 gap-base sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <SummaryCard title="Available Copies" value={formatNumber(summary?.availableCopies)} icon={CheckCircle2} loading={loading} tone="success" />
        <SummaryCard title="Active Loans" value={formatNumber(summary?.activeLoans)} icon={Clock} loading={loading} tone="info" />
        <SummaryCard title="Overdue Loans" value={formatNumber(summary?.overdueLoans)} icon={TriangleAlert} loading={loading} tone="danger" />
        <SummaryCard title="Registered Members" value={formatNumber(summary?.totalMembers)} icon={Users} loading={loading} tone="info" />
        <SummaryCard title="Outstanding Fines" value={formatMoney(summary?.unpaidFines)} icon={CircleDollarSign} loading={loading} tone="warning" />
      </section>

      <DashboardSection title="Quick actions" description="Jump straight into a common task.">
        <div className="flex flex-wrap gap-sm">
          {quickActions.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="inline-flex min-h-11 items-center gap-sm rounded-md border border-border bg-surface px-base py-sm text-label font-medium text-text-primary hover:border-teal hover:text-teal"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-text-secondary" />
            </Link>
          ))}
        </div>
      </DashboardSection>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-2">
        <DashboardSection title="Recent borrowing activity">
          <DataTable
            columns={loanColumns}
            data={recentLoans?.content || []}
            loading={loading}
            caption="Recent loans"
            emptyMessage="No loans have been issued yet."
            rowKey={(row) => row.loanId}
          />
        </DashboardSection>

        <DashboardSection title="Overdue records" description="Follow up with members who have overdue items.">
          <DataTable
            columns={loanColumns}
            data={overdue?.content || []}
            loading={loading}
            caption="Overdue loans"
            emptyMessage="No overdue loans right now."
            rowKey={(row) => row.loanId}
          />
        </DashboardSection>
      </div>
    </div>
  )
}
