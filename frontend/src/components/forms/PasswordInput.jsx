import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FormField } from './FormField.jsx'
import { BASE_INPUT } from './FormInput.jsx'

/** Password field with an accessible show/hide toggle. */
export const PasswordInput = forwardRef(function PasswordInput(
  {
    label = 'Password',
    name = 'password',
    error,
    hint,
    required,
    className = '',
    containerClassName = '',
    id,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false)

  const renderInput = (fieldId, describedBy) => (
    <div className="relative">
      <input
        ref={ref}
        id={fieldId || name}
        name={name}
        type={visible ? 'text' : 'password'}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy || ariaDescribedBy}
        className={`${BASE_INPUT} pr-xl ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="touch-target absolute right-0 top-0 flex items-center justify-center rounded-md px-md text-text-secondary hover:text-text-primary"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Eye aria-hidden="true" className="h-4 w-4" />
        )}
      </button>
    </div>
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
