import { forwardRef } from 'react'
import { FormField } from './FormField.jsx'
import { BASE_INPUT } from './FormInput.jsx'

/** Select control. Options are `{ value, label }` objects or plain strings. */
export const FormSelect = forwardRef(function FormSelect(
  {
    label,
    name,
    error,
    hint,
    required,
    options = [],
    placeholder = 'Select an option',
    className = '',
    containerClassName = '',
    id,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const renderSelect = (selectId, describedBy) => (
    <select
      ref={ref}
      id={selectId || name}
      name={name}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={describedBy || ariaDescribedBy}
      className={`${BASE_INPUT} ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value
        const text = typeof option === 'string' ? option : option.label
        return (
          <option key={value} value={value}>
            {text}
          </option>
        )
      })}
    </select>
  )

  if (!label) {
    return <div className={containerClassName}>{renderSelect(id)}</div>
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
      {({ id: fieldId, describedBy }) => renderSelect(fieldId, describedBy)}
    </FormField>
  )
})
