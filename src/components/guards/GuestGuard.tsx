import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'

export default function GuestGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore()
    if (isAuthenticated && user) {
        return <Navigate to={ROUTES.DASHBOARD} replace />
    }
    return <>{children}</>
}
