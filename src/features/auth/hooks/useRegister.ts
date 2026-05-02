import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "../services/authService"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import toast from "react-hot-toast"
import type { RegisterRequest } from "@/types/auth.types"
import axios from "axios"

const SLOW_THRESHOLD_MS = 400

export function useRegister() {
  const [loading,     setLoading]     = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const { setAuth } = useAuthStore()
  const navigate    = useNavigate()

  const register = async (data: RegisterRequest) => {
    setLoading(true)
    setShowOverlay(false)
    setError(null)

    const overlayTimer = window.setTimeout(() => setShowOverlay(true), SLOW_THRESHOLD_MS)

    try {
      const response = await authService.register(data)
      if (!response.success) {
        setError(response.message)
        toast.error(response.message)
        return
      }

      const payload = response.data

      // OTP verification required — redirect to verify page
      if (payload.verificationRequired) {
        toast.success("Account created. Check your email for a verification code.")
        const email = payload.pendingEmail ?? data.email
        navigate(ROUTES.VERIFY_EMAIL + "?email=" + encodeURIComponent(email))
        return
      }

      // No verification (legacy path or feature flag disabled)
      if (payload.user) {
        setAuth(payload.user, payload.accessToken, payload.refreshToken)
        toast.success("Account created. Let's complete your profile.")
        navigate(ROUTES.COMPLETE_PROFILE)
      }
    } catch (err: unknown) {
      let msg = "Registration failed. Please try again."
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

  return { register, loading, showOverlay, error }
}