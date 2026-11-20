import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { useReturnLoan } from '../../hooks/useReturnLoan.js'
import { loanService } from '../../services/loanService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { LoanTable, ReturnDialog } from '../../components/loans/LoanHelpers.jsx'

export default function OverdueLoansPage() {
  const { page, size, query, setPage } = usePagination(10)
  const { data, loading, error, run } = useAsync(() => loanService.getOverdue(query), [page, size])
  const returnFlow = useReturnLoan(run)

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="Overdue books"
        description="Borrowed loans past their due date, as determined by the backend."
      />

      <AlertMessage variant="warning">
        Fines are assessed when an overdue book is returned, using the configured grace period and daily rate.
      </AlertMessage>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <LoanTable
        loans={data?.content || []}
        loading={loading}
        caption="Overdue loans"
        onReturn={returnFlow.requestReturn}
        emptyMessage="No overdue books."
      />

      <Pagination
        page={data?.page ?? page}
        size={data?.size ?? size}
        totalElements={data?.totalElements ?? 0}
        onPageChange={setPage}
      />

      <ReturnDialog
        loan={returnFlow.pendingLoan}
        onConfirm={returnFlow.confirmReturn}
        onCancel={returnFlow.cancelReturn}
      />
    </div>
  )
}
