import { Outlet } from "react-router-dom"

// Theme handling is centralized in ThemeProvider, which forces light on
// auth routes regardless of saved preference. No DOM mutation here.
export default function AuthLayout() {
  return <Outlet />
}