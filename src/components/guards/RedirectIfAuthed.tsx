import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"

/**
 * Wraps public-facing routes (homepage, about, faculty directory).
 * If the user is already logged in, sends them to the dashboard so they
 * don't see a marketing page they don't need. Logged-out users see Outlet.
 */
export default function RedirectIfAuthed() {
  const { user } = useAuthStore()
  if (user) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <Outlet />
}