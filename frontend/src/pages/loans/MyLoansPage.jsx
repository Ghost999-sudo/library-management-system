import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { loanService } from '../../services/loanService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { LoanTable } from '../../components/loans/LoanHelpers.jsx'

/** MEMBER-only: the backend derives the member from the token, never from the URL. */
export default function MyLoansPage() {
  const { page, size, query, setPage } = usePagination(10)
  const { data, loading, error, run } = useAsync(() => loanService.getMyLoans(query), [page, size])

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="My loans"
        description="Books you have borrowed and their return dates."
        breadcrumbs={[{ label: 'My Library' }, { label: 'My Loans' }]}
      />

      <AlertMessage variant="info">
        The “overdue” label here is an estimate from the due date. The backend decides
        overdue status and any fine when a book is returned.
      </AlertMessage>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <LoanTable
        loans={data?.content || []}
        loading={loading}
        caption="My loans"
        showMember={false}
        emptyMessage="You have no loans yet."
        emptyDescription="Browse the catalogue to find your next book."
      />

      <Pagination
        page={data?.page ?? page}
        size={data?.size ?? size}
        totalElements={data?.totalElements ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}
