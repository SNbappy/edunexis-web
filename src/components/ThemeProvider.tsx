import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useThemeStore } from "@/store/themeStore"

// Dark-mode preference applies only inside the authenticated dashboard.
// Public + auth routes always render light, regardless of saved preference.
const DASHBOARD_PREFIXES = [
  "/dashboard",
  "/courses",
  "/profile",
  "/settings",
  "/users",
  "/notifications",
]

function isDashboardRoute(pathname: string): boolean {
  return DASHBOARD_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { dark } = useThemeStore()
  const { pathname } = useLocation()
  const allowDark = isDashboardRoute(pathname)

  useEffect(() => {
    const root = document.documentElement
    if (dark && allowDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [dark, allowDark])

  return <>{children}</>
}