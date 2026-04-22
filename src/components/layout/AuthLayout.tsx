import { useEffect } from "react"
import { Outlet } from "react-router-dom"

/**
 * AuthLayout forces light theme on auth pages (Login, Register, etc.)
 * regardless of the user's saved theme preference.
 * Dark mode only applies once the user is authenticated and inside DashboardLayout.
 */
export default function AuthLayout() {
  useEffect(() => {
    const root = document.documentElement
    const hadDark = root.classList.contains("dark")
    if (hadDark) root.classList.remove("dark")

    return () => {
      if (hadDark) root.classList.add("dark")
    }
  }, [])

  return <Outlet />
}
