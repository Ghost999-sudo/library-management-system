import { STATUS_TONE } from '../../utils/constants.js'

const TONES = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning-ink',
  danger: 'border-danger/30 bg-danger/10 text-danger',
  info: 'border-info/30 bg-info/10 text-info',
  neutral: 'border-border bg-background text-text-secondary',
}

/** Always renders readable text; colour is only a secondary cue. */
export function StatusBadge({ status, tone, children, className = '' }) {
  const resolved = tone || STATUS_TONE[status] || 'neutral'
  const label = children || status

  return (
    <span
      className={`inline-flex items-center gap-xs rounded-full border px-sm py-xs text-support font-medium ${TONES[resolved]} ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}
