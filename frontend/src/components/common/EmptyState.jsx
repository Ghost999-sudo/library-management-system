import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description, action, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center gap-sm py-xl text-center">
      <Icon aria-hidden="true" className="h-8 w-8 text-text-secondary" />
      <p className="text-card font-semibold">{title}</p>
      {description && <p className="max-w-md text-support text-text-secondary">{description}</p>}
      {action}
    </div>
  )
}
