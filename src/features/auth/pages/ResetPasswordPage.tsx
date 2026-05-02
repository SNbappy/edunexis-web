import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"

import Button from "@/components/ui/Button"
import { authService } from "../services/authService"
import { ROUTES } from "@/config/constants"

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

const schema = z.object({
  newPassword: z.string()
    .min(8, "Must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Confirm your new password"),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

interface Strength {
  level: number
  label: string
  colorClass: string
  textClass: string
}

function computeStrength(password: string): Strength {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (password.length >= 12) score = Math.min(score + 1, 4)

  if (score <= 1) return { level: 1, label: "Weak", colorClass: "bg-red-500", textClass: "text-red-600 dark:text-red-400" }
  if (score === 2) return { level: 2, label: "Fair", colorClass: "bg-amber-500", textClass: "text-amber-600 dark:text-amber-400" }
  if (score === 3) return { level: 3, label: "Good", colorClass: "bg-blue-500", textClass: "text-blue-600 dark:text-blue-400" }
  return { level: 4, label: "Strong", colorClass: "bg-emerald-500", textClass: "text-emerald-600 dark:text-emerald-400" }
}

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""

  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  })

  const newPasswordValue = watch("newPassword") ?? ""
  const strength = computeStrength(newPasswordValue)

  // No token in URL — redirect
  useEffect(() => {
    if (!token) {
      toast.error("Reset link is invalid. Please request a new one.")
      navigate(ROUTES.FORGOT_PASSWORD, { replace: true })
    }
  }, [token, navigate])

  const submit = async ({ newPassword }: FormData) => {
    if (!token) return
    setSubmitting(true)
    try {
      const res = await authService.resetPassword({ token, newPassword })
      if (res.success) {
        setDone(true)
      } else {
        toast.error(res.message || "Failed to reset password.")
      }
    } catch (err: unknown) {
      let msg = "Failed to reset password. The link may have expired."
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? msg
      }
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white text-stone-900">
      <aside className="hidden lg:flex relative flex-col justify-between w-1/2 xl:w-[55%] p-12 xl:p-16 overflow-hidden bg-teal-700 text-white">
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-1/4 -left-1/4 h-[520px] w-[520px] rounded-full blur-3xl opacity-40" style={{ background: "#2dd4bf" }} />
          <div className="absolute -bottom-1/4 -right-1/4 h-[420px] w-[420px] rounded-full blur-3xl opacity-30" style={{ background: "#f59e0b" }} />
        </div>

        <div className="relative flex items-center gap-3">
          <BrandMark className="h-9 w-9 text-teal-500" />
          <span className="font-display font-bold text-xl tracking-tight">EduNexis</span>
        </div>

        <div className="relative space-y-8 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
            <ShieldCheck className="h-3 w-3 text-amber-300" />
            <span className="text-[11px] font-semibold text-white/90">Almost there</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            Set a new<br />password.
          </h1>
          <p className="text-[15px] leading-relaxed text-white/80">
            Pick something strong you don{"\u2019"}t use anywhere else. After resetting, you{"\u2019"}ll be signed out everywhere and need to sign in again.
          </p>
        </div>

        <div className="relative text-[11px] text-white/60">
          Jashore University of Science and Technology
        </div>
      </aside>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-muted">
        <div className="w-full max-w-[400px] space-y-6">
          <div className="lg:hidden flex items-center gap-2.5">
            <BrandMark className="h-9 w-9 text-teal-600" />
            <span className="font-display font-bold text-lg tracking-tight text-stone-900">EduNexis</span>
          </div>

          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-stone-500 transition-colors hover:text-teal-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>

          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display text-[26px] font-bold tracking-tight text-stone-900 leading-tight">
                  Password reset
                </h2>
                <p className="text-sm text-stone-600">
                  Your password has been changed. You can now sign in with your new password.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => navigate(ROUTES.LOGIN, { replace: true })}
                size="lg"
                fullWidth
              >
                Continue to sign in
              </Button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-1.5">
                <h2 className="font-display text-[28px] font-bold tracking-tight text-stone-900 leading-tight">
                  Choose a new password
                </h2>
                <p className="text-sm text-stone-600">
                  Use 8+ characters with an uppercase letter, a number, and a special character.
                </p>
              </div>

              <form onSubmit={handleSubmit(submit)} className="space-y-4" autoComplete="off">
                <PasswordField
                  label="New password"
                  placeholder="At least 8 characters"
                  visible={showNew}
                  onToggle={() => setShowNew(v => !v)}
                  error={errors.newPassword?.message}
                  registerProps={register("newPassword")}
                  autoComplete="new-password"
                />

                {newPasswordValue.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex h-1.5 gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={
                            "h-full flex-1 rounded-full transition-colors " +
                            (i < strength.level ? strength.colorClass : "bg-stone-200 dark:bg-stone-800")
                          }
                        />
                      ))}
                    </div>
                    <p className={"text-[11.5px] font-semibold " + strength.textClass}>
                      {strength.label}
                    </p>
                  </div>
                ) : null}

                <PasswordField
                  label="Confirm new password"
                  placeholder="Re-enter your new password"
                  visible={showConfirm}
                  onToggle={() => setShowConfirm(v => !v)}
                  error={errors.confirmPassword?.message}
                  registerProps={register("confirmPassword")}
                  autoComplete="new-password"
                />

                <Button
                  type="submit"
                  loading={submitting}
                  disabled={!isValid}
                  size="lg"
                  fullWidth
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Reset password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

interface PasswordFieldProps {
  label: string
  placeholder: string
  visible: boolean
  onToggle: () => void
  error?: string
  autoComplete?: string
  registerProps: ReturnType<ReturnType<typeof useForm>["register"]>
}

function PasswordField({
  label, placeholder, visible, onToggle, error, autoComplete, registerProps,
}: PasswordFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-stone-900">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...registerProps}
          className={
            "h-11 w-full rounded-xl border bg-white pl-10 pr-11 text-[14px] text-stone-900 placeholder:text-stone-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-600/30 " +
            (error ? "border-red-300 focus:border-red-500" : "border-stone-200 focus:border-teal-600 dark:border-stone-800")
          }
        />
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-700"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="mt-1.5 text-[11.5px] font-semibold text-red-600"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}