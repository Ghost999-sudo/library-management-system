import {
  BookCopy,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Layers,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { useAsync } from '../../hooks/useAsync.js'
import { dashboardService } from '../../services/dashboardService.js'
import { loanService } from '../../services/loanService.js'
import { memberService } from '../../services/memberService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SummaryCard } from '../../components/common/SummaryCard.jsx'
import { DataTable } from '../../components/tables/DataTable.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { formatDate, formatMoney, formatNumber } from '../../utils/format.js'
import { DashboardSection, loanColumns } from './shared.jsx'

const memberColumns = [
  { key: 'firstName', header: 'Name', render: (row) => `${row.firstName} ${row.lastName}` },
  { key: 'membershipNumber', header: 'Membership No.', render: (row) => row.membershipNumber || '—' },
  { key: 'registrationDate', header: 'Registered', render: (row) => formatDate(row.registrationDate) },
  { key: 'status', header: 'Status', render: (row) => (
    <span className={row.status === 'ACTIVE' ? 'text-success' : 'text-text-secondary'}>{row.status}</span>
  ) },
]

export default function AdminDashboard() {
  const { data, loading, error, run } = useAsync(
    () =>
      Promise.all([
        dashboardService.getSummary(),
        loanService.getLoans({ size: 5, sort: 'issueDate,desc' }),
        memberService.getMembers({ size: 5, sort: 'registrationDate,desc' }),
        loanService.getOverdue({ size: 5 }),
      ]),
    [],
  )

  const [summary, recentLoans, recentMembers, overdue] = data || []

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Dashboard"
        description="A snapshot of library operations across books, members and loans."
        breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]}
      />

      {error && <ErrorState message={error.message} onRetry={run} />}

      <section aria-label="Key statistics" className="grid grid-cols-1 gap-base sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Books" value={formatNumber(summary?.totalBooks)} icon={BookOpen} loading={loading} tone="info" />
        <SummaryCard title="Total Book Copies" value={formatNumber(summary?.totalCopies)} icon={Layers} loading={loading} tone="info" />
        <SummaryCard title="Available Copies" value={formatNumber(summary?.availableCopies)} icon={CheckCircle2} loading={loading} tone="success" />
        <SummaryCard title="Borrowed Copies" value={formatNumber(summary?.borrowedCopies)} icon={BookCopy} loading={loading} tone="warning" />
        <SummaryCard title="Registered Members" value={formatNumber(summary?.totalMembers)} icon={Users} loading={loading} tone="info" />
        <SummaryCard title="Active Loans" value={formatNumber(summary?.activeLoans)} icon={Clock} loading={loading} tone="info" />
        <SummaryCard title="Overdue Loans" value={formatNumber(summary?.overdueLoans)} icon={TriangleAlert} loading={loading} tone="danger" />
        <SummaryCard title="Outstanding Fines" value={formatMoney(summary?.unpaidFines)} icon={CircleDollarSign} loading={loading} tone="warning" />
      </section>

      <div className="grid grid-cols-1 gap-lg xl:grid-cols-2">
        <DashboardSection title="Recent borrowing activity" description="Latest loans issued across the library.">
          <DataTable
            columns={loanColumns}
            data={recentLoans?.content || []}
            loading={loading}
            caption="Recent loans"
            emptyMessage="No loans have been issued yet."
            rowKey={(row) => row.loanId}
          />
        </DashboardSection>

        <DashboardSection title="Recently registered members" description="Newest member accounts.">
          <DataTable
            columns={memberColumns}
            data={recentMembers?.content || []}
            loading={loading}
            caption="Recently registered members"
            emptyMessage="No members have registered yet."
            rowKey={(row) => row.memberId}
          />
        </DashboardSection>

        <DashboardSection title="Overdue loan summary" description="Borrowed items past their due date.">
          <DataTable
            columns={loanColumns}
            data={overdue?.content || []}
            loading={loading}
            caption="Overdue loans"
            emptyMessage="No overdue loans. Everything is on track."
            rowKey={(row) => row.loanId}
          />
        </DashboardSection>

        <DashboardSection title="Book availability overview" description="Physical copies from the live summary.">
          {loading ? (
            <p className="text-body text-text-secondary">Loading availability…</p>
          ) : (
            <div className="flex flex-col gap-base">
              <div>
                <div className="mb-xs flex justify-between text-label">
                  <span className="text-success">Available</span>
                  <span className="font-medium">{formatNumber(summary?.availableCopies)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-success"
                    style={{
                      width: `${summary?.totalCopies ? Math.round((summary.availableCopies / summary.totalCopies) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-xs flex justify-between text-label">
                  <span className="text-warning">Borrowed</span>
                  <span className="font-medium">{formatNumber(summary?.borrowedCopies)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-warning"
                    style={{
                      width: `${summary?.totalCopies ? Math.round((summary.borrowedCopies / summary.totalCopies) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
              <p className="text-support text-text-secondary">
                {formatNumber(summary?.totalCopies)} copies in the collection.
              </p>
            </div>
          )}
        </DashboardSection>

        <DashboardSection title="Fine collection summary" description="Amount still outstanding across all fines.">
          <p className="text-page font-semibold text-text-primary">{formatMoney(summary?.unpaidFines)}</p>
          <p className="mt-xs text-support text-text-secondary">
            Detailed payment reports are available in Phase 10 once report data is wired in.
          </p>
        </DashboardSection>
      </div>
    </div>
  )
}
