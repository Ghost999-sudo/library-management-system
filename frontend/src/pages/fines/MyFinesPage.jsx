import { useAsync } from '../../hooks/useAsync.js'
import { usePagination } from '../../hooks/usePagination.js'
import { fineService } from '../../services/fineService.js'
import { PageHeader } from '../../components/layout/PageHeader.jsx'
import { Pagination } from '../../components/tables/Pagination.jsx'
import { AlertMessage } from '../../components/feedback/AlertMessage.jsx'
import { ErrorState } from '../../components/feedback/ErrorState.jsx'
import { FineTable } from '../../components/fines/FineHelpers.jsx'

/** MEMBER-only: the backend derives the member from the token, never from the URL. */
export default function MyFinesPage() {
  const { page, size, query, setPage } = usePagination(10)
  const { data, loading, error, run } = useAsync(() => fineService.getMyFines(query), [page, size])

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title="My fines"
        description="Overdue fines assessed on your returned books and their remaining balances."
        breadcrumbs={[{ label: 'My Library' }, { label: 'My Fines' }]}
      />

      <AlertMessage variant="info">
        Balances are maintained by the library. Payments are recorded by staff; the API does
        not expose fine details or receipts to members.
      </AlertMessage>

      {error && <ErrorState message={error.message} onRetry={run} />}

      <FineTable
        fines={data?.content || []}
        loading={loading}
        caption="My fines"
        showMember={false}
        emptyMessage="You have no fines."
        emptyDescription="Keep books returned on time to avoid fines."
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
