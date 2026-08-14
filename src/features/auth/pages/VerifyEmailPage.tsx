import { useEffect, useRef, useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"

import Button from "@/components/ui/Button"
import BrandLoader from "@/components/ui/BrandLoader"
import { authService } from "../services/authService"
import { useAuthStore } from "@/store/authStore"
import { ROUTES } from "@/config/constants"
import AuthShell from "@/components/layout/AuthShell"

const SLOW_THRESHOLD_MS = 400
const RESEND_COOLDOWN = 60


export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get("email") ?? ""
  const { setAuth } = useAuthStore()

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""])
  const [verifying, setVerifying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendIn, setResendIn] = useState(RESEND_COOLDOWN)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  // No email in URL — redirect to login
  useEffect(() => {
    if (!email) navigate(ROUTES.LOGIN, { replace: true })
  }, [email, navigate])

  // Resend cooldown timer
  useEffect(() => {
    if (resendIn <= 0) return
    const id = window.setInterval(() => {
      setResendIn(s => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [resendIn])

  // Auto-focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  const otp = digits.join("")
  const isComplete = otp.length === 6 && /^\d{6}$/.test(otp)

  const handleDigitChange = (i: number, val: string) => {
    // Only digits, single char
    const cleaned = val.replace(/\D/g, "").slice(0, 1)
    const next = [...digits]
    next[i] = cleaned
    setDigits(next)

    // Auto-advance focus on entry
    if (cleaned && i < 5) {
      inputsRef.current[i + 1]?.focus()
    }
  }

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
      return
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault()
      inputsRef.current[i - 1]?.focus()
      return
    }
    if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault()
      inputsRef.current[i + 1]?.focus()
      return
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 0) return
    e.preventDefault()
    const next = pasted.split("").concat(["", "", "", "", "", ""]).slice(0, 6)
    setDigits(next)
    const lastFilled = Math.min(pasted.length, 5)
    inputsRef.current[lastFilled]?.focus()
  }

  const verifyingRef = useRef(false)

  const verify = async (codeOverride?: string) => {
    const code = codeOverride ?? otp
    if (code.length !== 6 || !/^\d{6}$/.test(code)) return

    // Guard against double-submit (StrictMode double-fire, manual click after auto-submit, etc.)
    if (verifyingRef.current) return
    verifyingRef.current = true

    setVerifying(true)
    setShowOverlay(false)
    const overlayTimer = window.setTimeout(() => setShowOverlay(true), SLOW_THRESHOLD_MS)

    try {
      const res = await authService.verifyEmail({ email, otp: code })
      console.log("[VERIFY] response:", res)

      if (!res.success) {
        toast.error(res.message || "Invalid code. Please try again.")
        setDigits(["", "", "", "", "", ""])
        inputsRef.current[0]?.focus()
        return
      }

      const payload = res.data
      if (!payload.user) {
        toast.error("Verification succeeded but session is missing. Please log in.")
        navigate(ROUTES.LOGIN)
        return
      }

      setAuth(payload.user, payload.accessToken, payload.refreshToken)
      toast.success("Email verified. Welcome to EduNexis!")

      if (!payload.user.isProfileComplete) {
        navigate(ROUTES.COMPLETE_PROFILE)
      } else {
        navigate(ROUTES.DASHBOARD)
      }
    } catch (err: unknown) {
      console.error("[VERIFY] caught error:", err)
      if (axios.isAxiosError(err)) {
        console.error("[VERIFY] axios response status:", err.response?.status)
        console.error("[VERIFY] axios response data:", err.response?.data)
      }
      let msg = "Verification failed. Please try again."
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? msg
      }
      toast.error(msg)
      setDigits(["", "", "", "", "", ""])
      inputsRef.current[0]?.focus()
    } finally {
      window.clearTimeout(overlayTimer)
      setVerifying(false)
      setShowOverlay(false)
      verifyingRef.current = false
    }
  }

  // Auto-submit removed: user explicitly clicks "Verify and continue".
  // Avoids double-submit and gives user a moment to review the code.

  const resend = async () => {
    if (resendIn > 0 || resending) return
    setResending(true)
    try {
      const res = await authService.resendOtp({ email })
      if (res.success) {
        toast.success("New code sent. Check your inbox.")
        setDigits(["", "", "", "", "", ""])
        inputsRef.current[0]?.focus()
        setResendIn(RESEND_COOLDOWN)
      } else {
        toast.error(res.message || "Could not resend code.")
      }
    } catch (err: unknown) {
      let msg = "Could not resend code."
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? msg
      }
      toast.error(msg)
    } finally {
      setResending(false)
    }
  }

  return (
    <>
      <AuthShell
        title="Verify your email"
        subtitle={
          <>
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-stone-900">{email}</span>
          </>
        }
        back={{ to: ROUTES.LOGIN, label: "Back to sign in" }}
        panelLines={["Check your email,", "then you’re in."]}
        panelBody={"We sent a 6-digit verification code to your university email. Codes expire in 10 minutes — you can request a new one if it does not arrive."}
      >
          {/* OTP inputs */}
          <div className="space-y-4">
            <div className="flex justify-between gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputsRef.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={verifying}
                  className={
                    "h-14 w-12 sm:h-16 sm:w-14 rounded-xl border-2 bg-white text-center font-display text-2xl font-bold text-stone-900 outline-none transition-all " +
                    (d
                      ? "border-teal-600 shadow-sm ring-2 ring-teal-600/15"
                      : "border-stone-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 dark:border-stone-800")
                  }
                />
              ))}
            </div>

            <Button
              type="button"
              loading={verifying}
              disabled={!isComplete || verifying}
              onClick={() => verify()}
              size="lg"
              fullWidth
              rightIcon={!verifying ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Verify and continue
            </Button>
          </div>

          {/* Resend */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-card">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-stone-900">
                  Didn{"’"}t get the code?
                </p>
                <p className="mt-0.5 text-[11px] text-stone-500">
                  Check your spam folder, or request a new code below.
                </p>
              </div>
              <button
                type="button"
                onClick={resend}
                disabled={resendIn > 0 || resending}
                className={
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors " +
                  (resendIn > 0
                    ? "cursor-not-allowed text-stone-400"
                    : "text-teal-700 hover:bg-teal-50 hover:text-teal-800")
                }
              >
                <RefreshCw className={"h-3.5 w-3.5 " + (resending ? "animate-spin" : "")} />
                {resendIn > 0 ? "Resend in " + resendIn + "s" : "Resend code"}
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-stone-400">
            Wrong email?{" "}
            <Link to={ROUTES.REGISTER} className="font-semibold text-stone-500 hover:text-teal-700">
              Start over
            </Link>
          </p>
      </AuthShell>

      {showOverlay && <BrandLoader variant="screen" label="Verifying your email…" />}
    </>
  )
}