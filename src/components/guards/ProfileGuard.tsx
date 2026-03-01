import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'

export default function ProfileGuard() {
    const { user, isAuthenticated } = useAuthStore()

    if (!isAuthenticated || !user) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    if (!user.isProfileComplete) {
        return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />
    }

    return <Outlet />
}
