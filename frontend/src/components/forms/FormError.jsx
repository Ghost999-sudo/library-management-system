import { CircleAlert } from 'lucide-react'

/** Inline field-level error message. Always paired with aria-describedby on the input. */
export function FormError({ id, message }) {
  if (!message) return null

  return (
    <p id={id} role="alert" className="mt-xs flex items-center gap-xs text-support text-danger">
      <CircleAlert aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  )
}
