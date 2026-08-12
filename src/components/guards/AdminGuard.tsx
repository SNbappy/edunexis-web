import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isAdmin } from '@/utils/roleGuard'

export default function AdminGuard() {
    const { user } = useAuthStore()

    if (!user || !isAdmin(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}