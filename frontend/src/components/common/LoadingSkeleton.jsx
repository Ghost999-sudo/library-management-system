export function LoadingSkeleton({ className = 'h-4 w-full' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-border ${className}`} />
}

export function TableSkeleton({ rows = 4, columns = 4 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td key={columnIndex} className="px-base py-md">
              <LoadingSkeleton />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
