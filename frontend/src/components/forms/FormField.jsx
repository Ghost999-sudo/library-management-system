import { useId } from 'react'
import { FormError } from './FormError.jsx'

/** Labelled form control wrapper with accessible error/hint wiring. */
export function FormField({
  label,
  name,
  error,
  hint,
  required = false,
  children,
  className = '',
  labelId,
}) {
  const generatedId = useId()
  const id = name || generatedId
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} id={labelId} className="mb-xs text-label font-medium text-text-primary">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-xs text-danger">
            *
          </span>
        )}
      </label>
      {typeof children === 'function'
        ? children({ id, errorId, hintId, describedBy: [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined })
        : children}
      {hint && (
        <p id={hintId} className="mt-xs text-support text-text-secondary">
          {hint}
        </p>
      )}
      <FormError id={errorId} message={error} />
    </div>
  )
}
