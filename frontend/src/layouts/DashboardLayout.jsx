import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { MobileNavigation } from '../components/layout/MobileNavigation.jsx'
import { Sidebar } from '../components/layout/Sidebar.jsx'
import { Topbar } from '../components/layout/Topbar.jsx'

/** Shell for every authenticated screen: sidebar + topbar + scrollable content. */
export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenMenu={() => setMenuOpen(true)} />
        <main className="flex-1 p-base lg:p-lg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
