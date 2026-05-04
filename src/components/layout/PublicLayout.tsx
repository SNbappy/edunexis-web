import { Suspense, useEffect } from "react"
import { Outlet } from "react-router-dom"
import PublicNavbar from "./PublicNavbar"
import PublicFooter from "./PublicFooter"
import PublicLoader from "./PublicLoader"

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
      {/* Brand intro loader — shows on every refresh, fades out after ~2.4s.
          Covers the entire public surface, including any in-flight Suspense
          chunk loads, so users only see one loader at a time. */}
      <PublicLoader />

      <PublicNavbar />
      <main className="flex-1">
        {/* Suspense fallback is null because PublicLoader already covers the
            screen during initial route resolution. If the route is still
            loading after PublicLoader fades (rare), the page will simply
            appear when ready instead of flashing a second loader. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}