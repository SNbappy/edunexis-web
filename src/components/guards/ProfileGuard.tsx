import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'

export default function ProfileGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore()
    if (!isAuthenticated || !user) return <Navigate to={ROUTES.LOGIN} replace />
    if (!user.isProfileComplete) return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />
    return <>{children}</>
}
