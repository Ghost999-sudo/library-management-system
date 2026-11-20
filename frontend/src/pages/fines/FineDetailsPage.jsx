import { useLocation, useParams } from 'react-router-dom'
import { useAsync } from '../../hooks/useAsync.js'
import { useRecordPayment } from '../../hooks/useRecordPayment.js'
import { fineService } from '../../services/fineService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Button } from '../../components/common/Button.jsx'
import { StatusBadge } from '../../components/common/StatusBadge.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { PaymentHistoryTable, PaymentDialog } from '../../components/fines/FineHelpers.jsx'
import { formatMoney } from '../../utils/format.js'

const OPEN_STATUSES = ['UNPAID', 'PARTIALLY_PAID']

/** Staff-only: detail and payment endpoints are not available to MEMBER users. */
export default function FineDetailsPage() {
  const { fineId } = useParams()
  const location = useLocation()
  const listPath = location.pathname.replace(/\/\d+$/, '') || '/admin/fines'

  const { data, loading, error, run } = useAsync(
    () => Promise.all([fineService.getById(fineId), fineService.getPayments(fineId)]),
    [fineId],
  )
  const [fine, payments] = data || []
  const paymentFlow = useRecordPayment(run)

  if (error) {
    return <ErrorState title="Fine unavailable" message={error.message} onRetry={run} />
  }

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={fine ? `Fine #${fine.fineId}` : 'Fine details'}
        description={fine ? `${fine.memberName} · Loan #${fine.loanId}` : 'Loading fine…'}
        breadcrumbs={[{ label: 'Fines', to: listPath }, { label: 'Details' }]}
        actions={
          fine && OPEN_STATUSES.includes(fine.status) && (
            <Button onClick={() => paymentFlow.requestPayment(fine)}>Record payment</Button>
          )
        }
      />

      <AlertMessage variant="info">
        Balances come from the backend. Payment receipts are stored per fine because there is
        no global payments endpoint.
      </AlertMessage>

      {loading && <p className="text-body text-text-secondary">Loading fine details…</p>}

      {fine && (
        <section className="rounded-card border border-border bg-surface p-base">
          <h2 className="mb-base text-card font-semibold">Fine summary</h2>
          <dl className="grid gap-base sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-support text-text-secondary">Fine amount</dt>
              <dd className="text-body font-medium">{formatMoney(fine.fineAmount)}</dd>
            </div>
            <div>
              <dt className="text-support text-text-secondary">Amount paid</dt>
              <dd className="text-body font-medium">{formatMoney(fine.amountPaid)}</dd>
            </div>
            <div>
              <dt className="text-support text-text-secondary">Outstanding</dt>
              <dd className="text-body font-semibold">{formatMoney(fine.outstandingAmount)}</dd>
            </div>
            <div>
              <dt className="text-support text-text-secondary">Status</dt>
              <dd><StatusBadge status={fine.status} /></dd>
            </div>
            <div>
              <dt className="text-support text-text-secondary">Member ID</dt>
              <dd className="text-body">{fine.memberId}</dd>
            </div>
            <div>
              <dt className="text-support text-text-secondary">Loan ID</dt>
              <dd className="text-body">{fine.loanId}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-card border border-border bg-surface p-base">
        <h2 className="mb-base text-card font-semibold">Payment history</h2>
        <PaymentHistoryTable payments={payments || []} loading={loading} />
      </section>

      {paymentFlow.pendingFine && (
        <PaymentDialog
          key={paymentFlow.pendingFine.fineId}
          fine={paymentFlow.pendingFine}
          onSave={paymentFlow.savePayment}
          onCancel={paymentFlow.cancelPayment}
          saving={paymentFlow.saving}
          error={paymentFlow.error}
        />
      )}
    </div>
  )
}
