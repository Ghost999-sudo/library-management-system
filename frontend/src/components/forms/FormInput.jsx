import { forwardRef } from 'react'
import { FormField } from './FormField.jsx'

export const BASE_INPUT =
  'w-full min-h-11 rounded-md border border-border bg-surface px-md py-sm text-body text-text-primary placeholder:text-text-secondary focus:border-teal focus:outline-none disabled:cursor-not-allowed disabled:bg-background aria-[invalid=true]:border-danger'

/** Text-style input that works standalone or with a label via FormField. */
export const FormInput = forwardRef(function FormInput(
  {
    label,
    name,
    error,
    hint,
    required,
    type = 'text',
    className = '',
    containerClassName = '',
    id,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const renderInput = (inputId, describedBy) => (
    <input
      ref={ref}
      id={inputId || name}
      name={name}
      type={type}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy || ariaDescribedBy}
      className={`${BASE_INPUT} ${className}`}
      {...props}
    />
  )

  if (!label) {
    return <div className={containerClassName}>{renderInput(id)}</div>
  }

  return (
    <FormField
      label={label}
      name={name}
      error={error}
      hint={hint}
      required={required}
      className={containerClassName}
    >
      {({ id: fieldId, describedBy }) => renderInput(fieldId, describedBy)}
    </FormField>
  )
})
