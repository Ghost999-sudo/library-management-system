import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export function Topbar({ onOpenMenu }) {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-md border-b border-border bg-surface px-base lg:px-lg">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation menu"
          className="touch-target flex items-center justify-center rounded-md text-text-primary hover:bg-background lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>
        <p className="text-card font-semibold text-navy lg:hidden">Library Portal</p>
      </div>

      {user && (
        <div className="flex items-center gap-md">
          <div className="text-right">
            <p className="text-label font-medium">{user.username}</p>
            <p className="text-support text-text-secondary">{user.role}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            aria-label="Log out"
            className="touch-target flex items-center justify-center rounded-md border border-border text-text-secondary hover:bg-background hover:text-danger"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      )}
    </header>
  )
}
