import { Button } from '../common/Button.jsx'

export function FilterBar({ children, onClear, label = 'Filters', className = '' }) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex flex-wrap items-end gap-md rounded-card border border-border bg-surface p-base ${className}`}
    >
      {children}
      {onClear && (
        <Button variant="ghost" size="sm" onClick={onClear} className="ml-auto">
          Clear filters
        </Button>
      )}
    </div>
  )
}
