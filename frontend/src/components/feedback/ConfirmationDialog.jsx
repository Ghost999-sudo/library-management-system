import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '../common/Button.jsx'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Accessible modal: labelled, Escape to cancel, focus trapped, focus restored. */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
  children,
}) {
  const dialogRef = useRef(null)
  const cancelRef = useRef(onCancel)
  cancelRef.current = onCancel
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])
    focusables()[0]?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cancelRef.current?.()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-base"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) cancelRef.current?.()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="w-full max-w-md rounded-lg bg-surface p-lg shadow-xl"
      >
        <h2 id={titleId} className="text-card font-semibold">
          {title}
        </h2>
        {description && (
          <p id={descriptionId} className="mt-sm text-body text-text-secondary">
            {description}
          </p>
        )}
        {children}
        <div className="mt-lg flex flex-wrap justify-end gap-sm">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
