import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'
import toast from 'react-hot-toast'
import type { LoginRequest } from '@/types/auth.types'

export function useLogin() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const login = async (data: LoginRequest) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authService.login(data)
            if (!response.success) {
                setError(response.message)
                return
            }
            const { accessToken, refreshToken, user } = response.data
            setAuth(user, accessToken, refreshToken)
            toast.success(`Welcome back, ${user.profile?.fullName ?? 'User'}!`)
            if (!user.isProfileComplete) {
                navigate(ROUTES.COMPLETE_PROFILE)
            } else {
                navigate(ROUTES.DASHBOARD)
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed. Please try again.'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return { login, loading, error }
}
