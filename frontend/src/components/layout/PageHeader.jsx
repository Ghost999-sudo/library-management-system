import { Breadcrumbs } from './Breadcrumbs.jsx'

export function PageHeader({ title, description, breadcrumbs, actions }) {
  return (
    <header className="mb-lg flex flex-wrap items-start justify-between gap-md">
      <div>
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="mt-sm">{title}</h1>
        {description && <p className="mt-xs text-body text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-sm">{actions}</div>}
    </header>
  )
}
