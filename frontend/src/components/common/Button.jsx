import { forwardRef } from 'react'
import { LoadingSpinner } from '../feedback/LoadingSpinner.jsx'

const VARIANTS = {
  primary: 'bg-navy text-white hover:bg-navy-hover',
  secondary: 'border border-border bg-surface text-text-primary hover:bg-background',
  danger: 'bg-danger text-white hover:brightness-90',
  ghost: 'text-text-primary hover:bg-background',
}

const SIZES = {
  sm: 'px-md py-xs text-support',
  md: 'px-base py-sm text-label',
  lg: 'px-lg py-md text-body',
}

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    type = 'button',
    children,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex min-h-11 items-center justify-center gap-sm rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  )
})
