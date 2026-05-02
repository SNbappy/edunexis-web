import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import toast from "react-hot-toast"
import type { LoginRequest } from "@/types/auth.types"
import axios from "axios"

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

    const overlayTimer = window.setTimeout(() => setShowOverlay(true), SLOW_THRESHOLD_MS)

    try {
      const response = await authService.login(data)
      if (!response.success) {
        setError(response.message)
        toast.error(response.message)
        return
      }

      const payload = response.data

      // Email not verified — redirect to verify page (server already sent fresh OTP)
      if (payload.verificationRequired) {
        toast("Verify your email to continue. We sent a new code.")
        const email = payload.pendingEmail ?? data.email
        navigate(ROUTES.VERIFY_EMAIL + "?email=" + encodeURIComponent(email))
        return
      }

      if (payload.user) {
        setAuth(payload.user, payload.accessToken, payload.refreshToken)
        toast.success("Welcome back, " + (payload.user.profile?.fullName ?? "there") + "!")

        if (!payload.user.isProfileComplete) {
          navigate(ROUTES.COMPLETE_PROFILE)
        } else {
          navigate(ROUTES.DASHBOARD)
        }
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