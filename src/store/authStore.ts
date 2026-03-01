import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserDto } from '@/types/auth.types'

interface AuthState {
    user: UserDto | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    setAuth: (user: UserDto, accessToken: string, refreshToken: string) => void
    setUser: (user: UserDto) => void
    clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
            setAuth: (user, accessToken, refreshToken) =>
                set({ user, accessToken, refreshToken, isAuthenticated: true }),
            setUser: (user) => set({ user }),
            clearAuth: () => set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
        }),
        {
            name: 'edunexis-auth',
            partialize: (state) => ({
                user: state.user, accessToken: state.accessToken,
                refreshToken: state.refreshToken, isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
