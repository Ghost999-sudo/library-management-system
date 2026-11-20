import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { borrowRequestService } from '../../services/borrowRequestService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { BorrowRequestTable } from '../../components/loans/BorrowRequestHelpers.jsx'

/** MEMBER-only: requests are derived from the token; a librarian decides each one. */
export default function MyBorrowRequestsPage() {
  const { page, size, query, setPage } = usePagination(10)
  const { data, loading, error, run } = useAsync(
    () => borrowRequestService.getMyRequests(query),
    [page, size],
  )

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="My borrowing requests"
        description="Titles you have asked to borrow and the librarian's decision."
        breadcrumbs={[{ label: 'My Library' }, { label: 'My Requests' }]}
      />

      <AlertMessage variant="info">
        A request does not issue a book. While it is pending, no copy is reserved and no due date
        starts. A librarian reviews it and chooses an available copy when approving.
      </AlertMessage>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <BorrowRequestTable
        requests={data?.content || []}
        loading={loading}
        caption="My borrowing requests"
        showMember={false}
        emptyMessage="You have not requested any books yet."
        emptyDescription="Browse the catalogue and choose Request this book."
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
