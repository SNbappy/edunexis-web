import { Suspense, useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"
import MobileSidebar from "./MobileSidebar"
import BrandLoader from "@/components/ui/BrandLoader"

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  // Auto-close the mobile sidebar on route change. Without this, the open
  // state (and overlay) persist across navigation, blocking all touch
  // interaction with the new page until a hard refresh.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar />
      </div>
      {/* Mobile sidebar */}
      <MobileSidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<BrandLoader variant="page" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}