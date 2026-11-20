import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

/** Accessible breadcrumb trail. The final item is rendered as plain text. */
export function Breadcrumbs({ items = [] }) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-xs text-support text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-xs">
              {index > 0 && <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />}
              {isLast || !item.to ? (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link to={item.to} className="hover:text-navy-hover hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
