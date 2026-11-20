import { useState } from 'react'
import { Button } from '../common/Button.jsx'
import { DataTable } from '../tables/DataTable.jsx'
import { FormInput } from '../forms/FormInput.jsx'
import { FormSelect } from '../forms/FormSelect.jsx'
import { StatusBadge } from '../common/StatusBadge.jsx'
import { AlertMessage } from '../feedback/AlertMessage.jsx'
import { Modal } from '../feedback/Modal.jsx'
import { PAYMENT_METHODS } from '../../utils/constants.js'
import { formatMoney } from '../../utils/format.js'

const OPEN_STATUSES = ['UNPAID', 'PARTIALLY_PAID']

export function fineColumns({ onPay, showMember = true } = {}) {
  const columns = []

  if (showMember) {
    columns.push({ key: 'memberName', header: 'Member', render: (row) => row.memberName || '—' })
  }

  columns.push(
    { key: 'loanId', header: 'Loan', render: (row) => row.loanId ?? '—' },
    { key: 'fineAmount', header: 'Fine', render: (row) => formatMoney(row.fineAmount) },
    { key: 'amountPaid', header: 'Paid', render: (row) => formatMoney(row.amountPaid) },
    {
      key: 'outstandingAmount',
      header: 'Outstanding',
      render: (row) => <span className="font-medium">{formatMoney(row.outstandingAmount)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  )

  if (onPay) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      render: (row) => OPEN_STATUSES.includes(row.status) ? (
        <Button variant="secondary" size="sm" onClick={() => onPay(row)}>Record payment</Button>
      ) : (
        <span className="text-support text-text-secondary">Settled</span>
      ),
    })
  }

  return columns
}

export function FineTable({
  fines,
  loading,
  caption,
  onPay,
  showMember = true,
  emptyMessage,
  emptyDescription,
}) {
  return (
    <DataTable
      columns={fineColumns({ onPay, showMember })}
      data={fines}
      loading={loading}
      caption={caption}
      emptyMessage={emptyMessage || 'No fines found.'}
      emptyDescription={emptyDescription}
      rowKey={(row) => row.fineId}
    />
  )
}

/** Receipt columns use only fields actually returned by FinePaymentResponse. */
export function PaymentHistoryTable({ payments, loading }) {
  return (
    <DataTable
      columns={[
        { key: 'paymentId', header: 'Receipt', render: (row) => `#${row.paymentId}` },
        { key: 'amount', header: 'Amount', render: (row) => formatMoney(row.amount) },
        { key: 'paymentMethod', header: 'Method', render: (row) => row.paymentMethod },
        { key: 'referenceNumber', header: 'Reference', render: (row) => row.referenceNumber || '—' },
        { key: 'receivedBy', header: 'Received by (user ID)', render: (row) => row.receivedBy ?? '—' },
      ]}
      data={payments}
      loading={loading}
      caption="Payment history"
      emptyMessage="No payments recorded for this fine."
      rowKey={(row) => row.paymentId}
    />
  )
}

/** Manual payment form; the backend validates the balance and sets the fine status. */
export function PaymentDialog({ fine, onSave, onCancel, saving = false, error }) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [localError, setLocalError] = useState(null)

  if (!fine) return null

  const submit = (event) => {
    event.preventDefault()
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setLocalError('Enter a positive payment amount.')
      return
    }
    if (numericAmount > Number(fine.outstandingAmount)) {
      setLocalError('Amount cannot exceed the outstanding balance.')
      return
    }
    setLocalError(null)
    onSave(fine.fineId, {
      amount: numericAmount,
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
    })
  }

  return (
    <Modal open title={`Record payment · ${fine.memberName || `Fine ${fine.fineId}`}`} onClose={onCancel}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-base">
        {(localError || error) && (
          <AlertMessage variant="error">{localError || error}</AlertMessage>
        )}

        <p className="text-support text-text-secondary">
          Outstanding balance: <span className="font-semibold text-text-primary">{formatMoney(fine.outstandingAmount)}</span>
        </p>

        <FormInput
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          max={fine.outstandingAmount}
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
        <FormSelect
          label="Payment method"
          name="paymentMethod"
          options={PAYMENT_METHODS}
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
        />
        <FormInput
          label="Reference number (optional)"
          name="referenceNumber"
          maxLength={100}
          value={referenceNumber}
          onChange={(event) => setReferenceNumber(event.target.value)}
        />

        <div className="flex gap-sm">
          <Button type="submit" loading={saving}>Record payment</Button>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </Modal>
  )
}
