import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import PublicNavbar from "./PublicNavbar"
import PublicFooter from "./PublicFooter"
import PublicLoader from "./PublicLoader"

// Theme handling is centralized in ThemeProvider, which forces light on
// public routes regardless of saved preference. No DOM mutation here.
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      <PublicLoader />
      <PublicNavbar />
      <main className="flex-1">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  )
}