import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

type FailedRequest = { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
let isRefreshing = false
let failedQueue: FailedRequest[] = []

function processQueue(error: AxiosError | null, token: string | null = null) {
    failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token))
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
        if (error.response?.status !== 401 || original._retry) return Promise.reject(error)

        if (isRefreshing) {
            return new Promise((resolve, reject) => { failedQueue.push({ resolve, reject }) })
                .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
        }

        original._retry = true
        isRefreshing = true
        const { refreshToken, user, setAuth, clearAuth } = useAuthStore.getState()

        try {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })
            const { accessToken: newAccess, refreshToken: newRefresh } = data.data
            setAuth(user!, newAccess, newRefresh)
            processQueue(null, newAccess)
            original.headers.Authorization = `Bearer ${newAccess}`
            return api(original)
        } catch (refreshError) {
            processQueue(refreshError as AxiosError, null)
            clearAuth()
            window.location.href = '/login'
            return Promise.reject(refreshError)
        } finally {
            isRefreshing = false
        }
    }
)

export default api
