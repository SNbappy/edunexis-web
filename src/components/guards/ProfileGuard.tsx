import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import { isTeacher } from "@/utils/roleGuard"

function isProfileActuallyComplete(user: any): boolean {
  if (!user) return false
  // Backend says not complete
  if (!user.isProfileComplete) return false
  // Must have basic profile
  if (!user.profile) return false
  const p = user.profile
  // Everyone needs fullName + department
  if (!p.fullName?.trim() || !p.department?.trim()) return false
  // Teachers need designation
  if (isTeacher(user.role) && !p.designation?.trim()) return false
  // Students need studentId
  if (!isTeacher(user.role) && !p.studentId?.trim()) return false
  return true
}

export default function ProfileGuard() {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isProfileActuallyComplete(user)) {
    return <Navigate to={ROUTES.PROFILE_COMPLETE} replace />
  }

  return <Outlet />
}
