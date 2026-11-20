import { useState } from 'react'
import { loanService } from '../services/loanService.js'
import { notify } from '../components/feedback/ToastNotification.jsx'
import { formatMoney } from '../utils/format.js'

/** Shared return workflow so every staff loan view behaves identically. */
export function useReturnLoan(onChanged) {
  const [pendingLoan, setPendingLoan] = useState(null)

  const confirmReturn = async () => {
    if (!pendingLoan) return
    try {
      const result = await loanService.returnBook(pendingLoan.loanId)
      const fine = result?.fine
      notify.success(
        fine
          ? `Book returned. Fine assessed: ${formatMoney(fine.fineAmount)} (${fine.status}).`
          : 'Book returned.',
      )
      setPendingLoan(null)
      onChanged?.()
    } catch (error) {
      notify.error(error.message || 'Could not record the return.')
      setPendingLoan(null)
    }
  }

  return {
    pendingLoan,
    requestReturn: setPendingLoan,
    confirmReturn,
    cancelReturn: () => setPendingLoan(null),
  }
}
