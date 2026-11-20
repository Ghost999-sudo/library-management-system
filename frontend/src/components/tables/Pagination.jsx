import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../common/Button.jsx'

export function Pagination({ page = 0, size = 10, totalElements = 0, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const first = totalElements === 0 ? 0 : page * size + 1
  const last = Math.min((page + 1) * size, totalElements)

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-sm py-md"
    >
      <p className="text-support text-text-secondary">
        Showing {first}–{last} of {totalElements}
      </p>
      <div className="flex items-center gap-sm">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </Button>
        <span aria-live="polite" className="text-support text-text-secondary">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  )
}
