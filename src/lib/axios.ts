import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auto-refresh on 401
let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
    failedQueue = []
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true
            const { refreshToken, setAuth, clearAuth } = useAuthStore.getState()

            if (!refreshToken) {
                clearAuth()
                window.location.href = '/login'
                return Promise.reject(error)
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`
                    return api(original)
                })
            }

            isRefreshing = true
            try {
                const { data } = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
                    { refreshToken }
                )
                const { accessToken, refreshToken: newRefresh, user } = data.data
                setAuth(user, accessToken, newRefresh)
                processQueue(null, accessToken)
                original.headers.Authorization = `Bearer ${accessToken}`
                return api(original)
            } catch (err) {
                processQueue(err, null)
                clearAuth()
                window.location.href = '/login'
                return Promise.reject(err)
            } finally {
                isRefreshing = false
            }
        }
        return Promise.reject(error)
    }
)

export default api
