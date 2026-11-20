import { LoadingSkeleton } from './LoadingSkeleton.jsx'

const TONES = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
  neutral: 'bg-background text-text-secondary',
}

export function SummaryCard({ title, value, icon: Icon, tone = 'info', loading = false, hint }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-base shadow-sm">
      <div className="flex items-center justify-between gap-sm">
        <p className="text-label font-medium text-text-secondary">{title}</p>
        {Icon && (
          <span className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${TONES[tone]}`}>
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        )}
      </div>
      {loading ? (
        <LoadingSkeleton className="mt-md h-8 w-24" />
      ) : (
        <p className="mt-md text-page font-semibold text-text-primary">{value}</p>
      )}
      {hint && <p className="mt-xs text-support text-text-secondary">{hint}</p>}
    </article>
  )
}
