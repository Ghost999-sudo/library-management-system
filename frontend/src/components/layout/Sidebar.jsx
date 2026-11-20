import { NavLink } from 'react-router-dom'
import { BookOpen, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { NAVIGATION } from '../../utils/constants.js'

/** Shared navigation list used by both the desktop sidebar and mobile drawer. */
export function SidebarNav({ onNavigate }) {
  const { user, logout } = useAuth()
  if (!user) return null

  const sections = NAVIGATION[user.role] || []

  return (
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-lg overflow-y-auto p-base">
      <div className="flex items-center gap-sm px-sm py-md text-white">
        <BookOpen aria-hidden="true" className="h-6 w-6 text-accent-blue" />
        <div>
          <p className="text-card font-semibold">Library Portal</p>
          <p className="text-support text-accent-blue/80">Management System</p>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-xs px-sm text-support font-semibold uppercase tracking-wide text-accent-blue/70">
            {section.label}
          </p>
          <ul className="flex flex-col gap-xs">
            {section.items.map((item) => {
              if (item.action === 'logout') {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={async () => {
                        onNavigate?.()
                        await logout()
                      }}
                      className="flex min-h-11 w-full items-center gap-sm rounded-md px-md py-sm text-left text-body text-accent-blue/90 hover:bg-white/10 hover:text-white"
                    >
                      <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  </li>
                )
              }

              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-sm rounded-md px-md py-sm text-body transition-colors ${
                        isActive
                          ? 'bg-teal font-medium text-white'
                          : 'text-accent-blue/90 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

/** Fixed desktop sidebar (~250px per the UI/UX documentation). */
export function Sidebar() {
  return (
    <aside className="hidden shrink-0 bg-navy lg:flex lg:w-[250px] lg:flex-col">
      <SidebarNav />
    </aside>
  )
}
