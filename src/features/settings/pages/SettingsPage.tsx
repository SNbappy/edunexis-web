import { NavLink, Navigate, Routes, Route } from "react-router-dom"
import { Shield, Globe } from "lucide-react"
import { lazy, Suspense } from "react"
import BrandLoader from "@/components/ui/BrandLoader"

const SecurityPage = lazy(() => import("./SecurityPage"))
const VisibilitySettingsPage = lazy(() => import("./VisibilitySettingsPage"))

interface SettingsLink {
  to:    string
  label: string
  icon:  React.ComponentType<{ className?: string }>
}

const LINKS: SettingsLink[] = [
  { to: "security", label: "Security", icon: Shield },
  { to: "visibility", label: "Public profile", icon: Globe },
]

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 lg:px-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Settings
        </h1>
        <p className="mt-1.5 text-[14px] text-muted-foreground">
          Manage your account, security, and preferences.
        </p>
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        {/* Sub-nav */}
        <aside>
          <nav className="flex flex-row gap-1 lg:flex-col">
            {LINKS.map(link => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors " +
                    (isActive
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          <Suspense fallback={<BrandLoader variant="inline" />}>
            <Routes>
              <Route index element={<Navigate to="security" replace />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="visibility" element={<VisibilitySettingsPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  )
}