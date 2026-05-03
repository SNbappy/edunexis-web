import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import PublicNavbar from "./PublicNavbar"
import PublicFooter from "./PublicFooter"
import BrandLoader from "@/components/ui/BrandLoader"

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
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