import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import toast from "react-hot-toast"
import type { LoginRequest } from "@/types/auth.types"
import axios from "axios"

/**
 * Login flow:
 *   - `loading`     → true while the API call is in-flight (drives button spinner)
 *   - `showOverlay` → true only if loading lasts longer than SLOW_THRESHOLD_MS
 *                     (drives the fullscreen BrandLoader overlay)
 *
 * Fast logins never see the overlay. Slow logins (Render cold start, bad network)
 * get a branded moment that makes the wait feel intentional, not broken.
 */
const SLOW_THRESHOLD_MS = 400

export function useLogin() {
  const [loading,     setLoading]     = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  const login = async (data: LoginRequest) => {
    setLoading(true)
    setShowOverlay(false)
    setError(null)

    // Kick off the slow-loading timer: if we're still loading after the
    // threshold, reveal the brand overlay.
    const overlayTimer = window.setTimeout(() => setShowOverlay(true), SLOW_THRESHOLD_MS)

    try {
      const response = await authService.login(data)
      if (!response.success) {
        setError(response.message)
        toast.error(response.message)
        return
      }
      const { accessToken, refreshToken, user } = response.data
      setAuth(user, accessToken, refreshToken)
      toast.success(`Welcome back, ${user.profile?.fullName ?? "there"}!`)

      if (!user.isProfileComplete) {
        navigate(ROUTES.COMPLETE_PROFILE)
      } else {
        navigate(ROUTES.DASHBOARD)
      }
    } catch (err: unknown) {
      let msg = "Login failed. Please try again."
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? err.response?.data?.title ?? msg
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
      toast.error(msg)
    } finally {
      window.clearTimeout(overlayTimer)
      setLoading(false)
      setShowOverlay(false)
    }
  }

  return { login, loading, showOverlay, error }
}
