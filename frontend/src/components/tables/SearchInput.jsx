import { forwardRef, useId } from 'react'
import { Search, X } from 'lucide-react'

export const SearchInput = forwardRef(function SearchInput(
  { label = 'Search', id, value = '', onChange, onClear, placeholder = 'Search…', className = '', ...props },
  ref,
) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={className}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
        />
        <input
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-input border border-border bg-surface py-sm pl-xl pr-xl text-table placeholder:text-text-secondary focus:border-teal"
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="touch-target absolute right-xs top-1/2 flex -translate-y-1/2 items-center justify-center rounded text-text-secondary hover:bg-background"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
})
