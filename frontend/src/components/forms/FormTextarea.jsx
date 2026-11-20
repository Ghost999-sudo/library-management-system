import { forwardRef } from 'react'
import { FormField } from './FormField.jsx'
import { BASE_INPUT } from './FormInput.jsx'

export const FormTextarea = forwardRef(function FormTextarea(
  {
    label,
    name,
    error,
    hint,
    required,
    rows = 4,
    className = '',
    containerClassName = '',
    id,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const renderTextarea = (fieldId, describedBy) => (
    <textarea
      ref={ref}
      id={fieldId || name}
      name={name}
      rows={rows}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy || ariaDescribedBy}
      className={`${BASE_INPUT} resize-y ${className}`}
      {...props}
    />
  )

  if (!label) {
    return <div className={containerClassName}>{renderTextarea(id)}</div>
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
      {({ id: fieldId, describedBy }) => renderTextarea(fieldId, describedBy)}
    </FormField>
  )
})
