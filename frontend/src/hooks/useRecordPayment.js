import { useState } from 'react'
import { fineService } from '../services/fineService.js'
import { notify } from '../components/feedback/ToastNotification.jsx'
import { formatMoney } from '../utils/format.js'

/** Shared payment workflow; the backend remains authoritative for totals and status. */
export function useRecordPayment(onChanged) {
  const [pendingFine, setPendingFine] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const savePayment = async (fineId, payload) => {
    setSaving(true)
    setError(null)
    try {
      const receipt = await fineService.recordPayment(fineId, payload)
      notify.success(`Payment of ${formatMoney(receipt.amount)} recorded.`)
      setPendingFine(null)
      onChanged?.()
    } catch (error) {
      setError(error.message || 'Could not record this payment.')
    } finally {
      setSaving(false)
    }
  }

  return {
    pendingFine,
    requestPayment: setPendingFine,
    savePayment,
    saving,
    error,
    cancelPayment: () => { setError(null); setPendingFine(null) },
  }
}
