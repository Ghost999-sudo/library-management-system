import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { SidebarNav } from './Sidebar.jsx'

/** Off-canvas drawer: Escape closes, focus stays inside, backdrop closes. */
export function MobileNavigation({ open, onClose }) {
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined

    const previouslyFocused = document.activeElement
    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) || [],
      )

    focusable()[0]?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
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

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col bg-navy shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="touch-target absolute right-sm top-sm flex items-center justify-center rounded-md text-accent-blue hover:bg-white/10 hover:text-white"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
        <SidebarNav onNavigate={onClose} />
      </div>
    </div>
  )
}
