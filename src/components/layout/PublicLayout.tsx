import { Suspense, useEffect } from "react"
import { Outlet } from "react-router-dom"
import PublicNavbar from "./PublicNavbar"
import PublicFooter from "./PublicFooter"
import BrandLoader from "@/components/ui/BrandLoader"

/**
 * Force light theme across all public routes (homepage, about, faculty).
 * Dashboard routes use a different layout and keep dark-mode toggle.
 */
function useForceLight() {
  useEffect(() => {
    const html = document.documentElement
    const had = html.classList.contains("dark")
    html.classList.remove("dark")
    return () => { if (had) html.classList.add("dark") }
  }, [])
}

export default function PublicLayout() {
  useForceLight()
  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      <PublicNavbar />
      <main className="flex-1">
        <Suspense fallback={<BrandLoader variant="page" />}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}