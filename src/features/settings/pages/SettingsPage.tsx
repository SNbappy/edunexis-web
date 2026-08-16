import { NavLink, Navigate, Routes, Route } from "react-router-dom"
import { Shield, Globe, Bell } from "lucide-react"
import { lazy, Suspense } from "react"
import type { LucideIcon } from "lucide-react"
import BrandLoader from "@/components/ui/BrandLoader"
import { Page, PageHero } from "@/components/ui/Page"
import { ICON, ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

const SecurityPage = lazy(() => import("./SecurityPage"))
const VisibilitySettingsPage = lazy(() => import("./VisibilitySettingsPage"))
const NotificationSettingsPage = lazy(() => import("./NotificationSettingsPage"))

interface SettingsLink {
  to:    string
  label: string
  /** Short line under the label — settings sections are easier to pick when
   *  the nav says what is inside rather than making you open each one. */
  hint:  string
  icon:  LucideIcon
}

const LINKS: SettingsLink[] = [
  { to: "/settings/security",   label: "Security",       hint: "Password and sessions", icon: Shield },
  { to: "/settings/notifications", label: "Notifications", hint: "What reaches you",    icon: Bell   },
  { to: "/settings/visibility", label: "Public profile", hint: "What others can see",   icon: Globe  },
]

export default function SettingsPage() {
  return (
    <Page>
      <PageHero
        eyebrow="Your account"
        title="Settings"
        description="Your password, active sessions, which notifications reach you, and what other people can see on your profile."
      />

      <div className="h-6" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[236px_1fr]">
        {/* Sub-nav. Mirrors the main sidebar's active treatment — a rail plus a
            weight change — so "where am I" reads the same at both levels. */}
        <aside>
          <nav className="flex flex-row gap-1 lg:flex-col">
            {LINKS.map(link => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex flex-1 items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-120 lg:flex-none",
                      FOCUS,
                      isActive
                        ? "bg-primary/10 text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-primary"
                          aria-hidden
                        />
                      )}
                      <Icon
                        className={cn(ICON.sm, "mt-0.5 shrink-0", isActive && "text-primary")}
                        strokeWidth={ICON_STROKE}
                      />
                      <span className="min-w-0">
                        <span className={cn("block text-[13.5px]", isActive ? "font-semibold" : "font-medium")}>
                          {link.label}
                        </span>
                        <span className="mt-0.5 hidden text-[11.5px] text-muted-foreground lg:block">
                          {link.hint}
                        </span>
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <Suspense fallback={<BrandLoader variant="inline" />}>
            <Routes>
              <Route index element={<Navigate to="security" replace />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="notifications" element={<NotificationSettingsPage />} />
              <Route path="visibility" element={<VisibilitySettingsPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Page>
  )
}
