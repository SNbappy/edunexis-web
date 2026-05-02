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

const SLOW_THRESHOLD_MS = 400
const RESEND_COOLDOWN = 60

function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M8 12L16 8L24 12L16 16L8 12Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <path d="M11 14V18C11 19.5 13.2 21 16 21C18.8 21 21 19.5 21 18V14" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="12" r="1.2" fill="white" />
    </svg>
  )
}

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

  const verify = async (codeOverride?: string) => {
    const code = codeOverride ?? otp
    if (code.length !== 6 || !/^\d{6}$/.test(code)) return

    setVerifying(true)
    setShowOverlay(false)
    const overlayTimer = window.setTimeout(() => setShowOverlay(true), SLOW_THRESHOLD_MS)

    try {
      const res = await authService.verifyEmail({ email, otp: code })

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
    }
  }

  // Auto-submit when all 6 digits filled
  useEffect(() => {
    if (isComplete && !verifying) {
      verify(otp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete])

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
    <div className="min-h-screen w-full flex bg-white text-stone-900">
      {/* LEFT — Brand panel */}
      <aside className="hidden lg:flex relative flex-col justify-between w-1/2 xl:w-[55%] p-12 xl:p-16 overflow-hidden bg-teal-700 text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute -top-1/4 -left-1/4 h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
            style={{ background: "#2dd4bf" }}
          />
          <div
            className="absolute -bottom-1/4 -right-1/4 h-[420px] w-[420px] rounded-full blur-3xl opacity-30"
            style={{ background: "#f59e0b" }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <BrandMark className="h-9 w-9 text-teal-500" />
          <span className="font-display font-bold text-xl tracking-tight">EduNexis</span>
        </div>

        <div className="relative space-y-8 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
            <Mail className="h-3 w-3 text-amber-300" />
            <span className="text-[11px] font-semibold text-white/90">One last step</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            Check your email,<br />then you{"\u2019"}re in.
          </h1>
          <p className="text-[15px] leading-relaxed text-white/80">
            We sent a 6-digit verification code to your university email. Enter it on the right to activate your account.
          </p>

          <ul className="space-y-3 pt-4 border-t border-white/15">
            {[
              "Codes expire in 10 minutes",
              "Check your spam folder if you don't see it",
              "You can request a new code if needed",
            ].map(item => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/85">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" strokeWidth={2.25} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[11px] text-white/60">
          Jashore University of Science and Technology
        </div>
      </aside>

      {/* RIGHT — OTP form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-stone-50">
        <div className="w-full max-w-[400px] space-y-7">
          <div className="lg:hidden flex items-center gap-2.5">
            <BrandMark className="h-9 w-9 text-teal-600" />
            <span className="font-display font-bold text-lg tracking-tight text-stone-900">EduNexis</span>
          </div>

          <div className="space-y-2">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-stone-500 transition-colors hover:text-teal-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-1.5 pt-1"
            >
              <h2 className="font-display text-[28px] font-bold tracking-tight text-stone-900 leading-tight">
                Verify your email
              </h2>
              <p className="text-sm text-stone-600">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-stone-900">{email}</span>
              </p>
            </motion.div>
          </div>

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
                      : "border-stone-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20")
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
          <div className="rounded-xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold text-stone-900">
                  Didn{"\u2019"}t get the code?
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
        </div>
      </div>

      {showOverlay && <BrandLoader variant="screen" label="Verifying your email\u2026" />}
    </div>
  )
}