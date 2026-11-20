import { useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useAsync } from '../../hooks/useAsync.js'
import { reportService } from '../../services/reportService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SummaryCard } from '../../components/common/SummaryCard.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ReportControls, defaultReportRange } from '../../components/reports/ReportControls.jsx'
import { LoanTable } from '../../components/loans/LoanHelpers.jsx'
import { formatNumber } from '../../utils/format.js'

/** Grouping is presentation only; totals and rows come straight from the backend. */
function loansByIssueDate(loans) {
  const counts = new Map()
  loans.forEach((loan) => {
    if (loan.issueDate) counts.set(loan.issueDate, (counts.get(loan.issueDate) || 0) + 1)
  })
  return Array.from(counts, ([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export default function LoanReportsPage() {
  const [range, setRange] = useState(defaultReportRange)
  const { data, loading, error, run } = useAsync(
    () => reportService.getLoanReport(range),
    [range],
  )

  const loans = data?.loans || []
  const chartData = loansByIssueDate(loans)
  const borrowed = loans.filter((loan) => loan.status === 'BORROWED').length
  const returned = loans.filter((loan) => loan.status === 'RETURNED').length

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Loan reports"
        description="Loans issued in a date range, with totals grouped by issue date."
        breadcrumbs={[{ label: 'Reports' }, { label: 'Loan Reports' }]}
      />

      <ReportControls range={range} onApply={setRange} loading={loading} />

      <p className="text-support text-text-secondary">
        Loans are selected by issue date. The backend validates that the end date is not
        before the start date.
      </p>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <div className="grid grid-cols-1 gap-base sm:grid-cols-3">
        <SummaryCard
          title="Total loans"
          value={formatNumber(data?.totalLoans ?? 0)}
          tone="info"
          loading={loading}
          hint={`${range.startDate} to ${range.endDate}`}
        />
        <SummaryCard title="Still borrowed" value={formatNumber(borrowed)} tone="warning" loading={loading} />
        <SummaryCard title="Returned" value={formatNumber(returned)} tone="success" loading={loading} />
      </div>

      <section className="rounded-section border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Loans issued by date</h2>
        {chartData.length > 0 ? (
          <>
            <p className="sr-only">
              Bar chart of loans issued per day between {range.startDate} and {range.endDate}.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    name="Loans issued"
                    fill="var(--color-teal)"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <EmptyState
            title="No chart data for this range"
            description="Issue a book within the selected dates to see a trend."
          />
        )}
      </section>

      <section className="rounded-card border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Loan records</h2>
        <LoanTable
          loans={loans}
          loading={loading}
          caption="Loan report rows"
          emptyMessage="No loans in this range."
        />
      </section>
    </div>
  )
}
