import { useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useAsync } from '../../hooks/useAsync.js'
import { reportService } from '../../services/reportService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { SummaryCard } from '../../components/common/SummaryCard.jsx'
import { EmptyState } from '../../components/common/EmptyState.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { ReportControls, defaultReportRange } from '../../components/reports/ReportControls.jsx'
import { FineTable, PaymentHistoryTable } from '../../components/fines/FineHelpers.jsx'
import { formatMoney, formatNumber } from '../../utils/format.js'

const METHOD_COLOURS = ['var(--color-teal)', 'var(--color-navy)', 'var(--color-info)']

function paymentsByMethod(payments) {
  const totals = new Map()
  payments.forEach((payment) => {
    const method = payment.paymentMethod || 'UNKNOWN'
    totals.set(method, (totals.get(method) || 0) + Number(payment.amount || 0))
  })
  return Array.from(totals, ([method, amount]) => ({ method, amount }))
}

export default function FineReportsPage() {
  const [range, setRange] = useState(defaultReportRange)
  const { data, loading, error, run } = useAsync(
    () => reportService.getFineReport(range),
    [range],
  )

  const fines = data?.fines || []
  const payments = data?.payments || []
  const methodData = paymentsByMethod(payments)
  const totals = [{
    name: 'Amounts',
    assessed: Number(data?.totalAssessed ?? 0),
    collected: Number(data?.totalCollected ?? 0),
  }]

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Fine reports"
        description="Fines assessed and payments collected in a date range."
        breadcrumbs={[{ label: 'Reports' }, { label: 'Fine Reports' }]}
      />

      <ReportControls range={range} onApply={setRange} loading={loading} />

      <p className="text-support text-text-secondary">
        The backend groups fines by assessment date and payments by payment date. Those dates
        are not exposed in the response, so no daily breakdown is inferred here.
      </p>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <div className="grid grid-cols-1 gap-base sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total fines" value={formatNumber(data?.totalFines ?? 0)} tone="info" loading={loading} />
        <SummaryCard title="Total assessed" value={formatMoney(data?.totalAssessed)} tone="warning" loading={loading} />
        <SummaryCard title="Total collected" value={formatMoney(data?.totalCollected)} tone="success" loading={loading} />
        <SummaryCard title="Payments recorded" value={formatNumber(payments.length)} tone="neutral" loading={loading} />
      </div>

      <section className="rounded-section border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Assessed vs collected</h2>
        <p className="sr-only">
          Bar chart comparing {formatMoney(data?.totalAssessed)} assessed with{' '}
          {formatMoney(data?.totalCollected)} collected between {range.startDate} and{' '}
          {range.endDate}.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={totals} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatMoney(value)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="assessed" name="Assessed" fill="var(--color-warning)" isAnimationActive={false} />
              <Bar dataKey="collected" name="Collected" fill="var(--color-teal)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-section border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Collections by payment method</h2>
        {methodData.length > 0 ? (
          <>
            <p className="sr-only">
              Pie chart of collected amounts by payment method:{' '}
              {methodData.map((item) => `${item.method} ${formatMoney(item.amount)}`).join(', ')}.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodData}
                    dataKey="amount"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    isAnimationActive={false}
                  >
                    {methodData.map((item, index) => (
                      <Cell key={item.method} fill={METHOD_COLOURS[index % METHOD_COLOURS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <EmptyState title="No payments in this range" description="Record a fine payment to see the breakdown." />
        )}
      </section>

      <section className="rounded-card border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Fines assessed</h2>
        <FineTable
          fines={fines}
          loading={loading}
          caption="Fine report rows"
          emptyMessage="No fines in this range."
        />
      </section>

      <section className="rounded-card border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Payments collected</h2>
        <PaymentHistoryTable payments={payments} loading={loading} />
      </section>
    </div>
  )
}
