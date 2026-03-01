import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/config/constants'
import toast from 'react-hot-toast'
import type { RegisterRequest } from '@/types/auth.types'

export function useRegister() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const register = async (data: RegisterRequest) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authService.register(data)
            if (!response.success) {
                setError(response.message)
                toast.error(response.message)
                return
            }
            const { accessToken, refreshToken, user } = response.data
            setAuth(user, accessToken, refreshToken)
            toast.success('Account created successfully! Complete your profile to get started.')
            navigate(ROUTES.COMPLETE_PROFILE)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.'
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

    return { register, loading, error }
}
