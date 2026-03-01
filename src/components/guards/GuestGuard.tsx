import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'

export default function GuestGuard() {
    const { isAuthenticated, user } = useAuthStore()

    if (isAuthenticated && user) {
        return <Navigate to={ROUTES.DASHBOARD} replace />
    }

    return <Outlet />
}
