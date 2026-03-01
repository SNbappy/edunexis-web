import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'

const noProfileGateRoutes: string[] = [ROUTES.COMPLETE_PROFILE, ROUTES.LOGIN, ROUTES.REGISTER]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuthStore()
    const location = useLocation()

    if (!isAuthenticated || !user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    }

    const needsProfile =
        !user.isProfileComplete &&
        !noProfileGateRoutes.includes(location.pathname)

    if (needsProfile) {
        return <Navigate to={ROUTES.COMPLETE_PROFILE} replace />
    }

    return <>{children}</>
}
