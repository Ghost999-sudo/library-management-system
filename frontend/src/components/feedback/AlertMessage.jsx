import { CheckCircle2, CircleAlert, Info, TriangleAlert } from 'lucide-react'

const VARIANTS = {
  success: { icon: CheckCircle2, style: 'border-success/30 bg-success/10 text-success' },
  info: { icon: Info, style: 'border-info/30 bg-info/10 text-info' },
  warning: { icon: TriangleAlert, style: 'border-warning/30 bg-warning/10 text-warning' },
  error: { icon: CircleAlert, style: 'border-danger/30 bg-danger/10 text-danger' },
}

export function AlertMessage({ variant = 'info', title, children, className = '' }) {
  const { icon: Icon, style } = VARIANTS[variant] || VARIANTS.info
  const role = variant === 'error' || variant === 'warning' ? 'alert' : 'status'

  return (
    <div role={role} className={`flex gap-sm rounded-md border p-base ${style} ${className}`}>
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-body">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-xs' : ''}>{children}</div>}
      </div>
    </div>
  )
}
