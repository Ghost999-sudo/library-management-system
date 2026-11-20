import { EmptyState } from '../common/EmptyState.jsx'
import { LoadingSkeleton } from '../common/LoadingSkeleton.jsx'

/** Responsive, accessible table with built-in loading and empty states. */
export function DataTable({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  emptyDescription,
  caption = 'Records',
  rowKey = (row, index) => row.id ?? index,
  onRowClick,
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[640px] text-left text-table" aria-busy={loading}>
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-background text-text-secondary">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-base py-md font-medium ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 4 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} className="px-base py-md">
                    <LoadingSkeleton />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-base py-xl">
                <EmptyState title={emptyMessage} description={emptyDescription} />
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-background' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} className={`px-base py-md ${column.className || ''}`}>
                    {column.render ? column.render(row) : (row[column.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
