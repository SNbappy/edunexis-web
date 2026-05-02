import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldQuestion } from "lucide-react"
import toast from "react-hot-toast"
import axios from "axios"
import { motion } from "framer-motion"

import Input from "@/components/ui/Input"
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
  email: z.string().trim().email("Enter a valid email address"),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const submit = async ({ email }: FormData) => {
    setSubmitting(true)
    try {
      const res = await authService.forgotPassword({ email })
      if (res.success) {
        setSentEmail(email)
        setSent(true)
      } else {
        toast.error(res.message || "Could not send reset email.")
      }
    } catch (err: unknown) {
      let msg = "Could not send reset email. Please try again."
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
            <ShieldQuestion className="h-3 w-3 text-amber-300" />
            <span className="text-[11px] font-semibold text-white/90">Forgot your password?</span>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            We{"\u2019"}ll get you<br />back in.
          </h1>
          <p className="text-[15px] leading-relaxed text-white/80">
            Enter your university email and we{"\u2019"}ll send a secure link to reset your password.
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

          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-300">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-display text-[26px] font-bold tracking-tight text-stone-900 leading-tight">
                  Check your email
                </h2>
                <p className="text-sm text-stone-600">
                  If an account exists for{" "}
                  <span className="font-semibold text-stone-900">{sentEmail}</span>, we{"\u2019"}ve sent a password reset link.
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-card space-y-2 dark:border-stone-800 dark:bg-card">
                <p className="text-[12.5px] font-semibold text-stone-900">What{"\u2019"}s next?</p>
                <ul className="space-y-1.5 text-[12px] text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                    <span>Open the email and click the reset link</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                    <span>The link expires in 1 hour</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                    <span>Check spam if you don{"\u2019"}t see it within a minute</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => { setSent(false) }}
                className="text-[12.5px] font-semibold text-teal-700 hover:text-teal-800"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <>
              <div className="space-y-1.5">
                <h2 className="font-display text-[28px] font-bold tracking-tight text-stone-900 leading-tight">
                  Reset your password
                </h2>
                <p className="text-sm text-stone-600">
                  Enter your email below. We{"\u2019"}ll send you a link to set a new password.
                </p>
              </div>

              <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
                <Input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  aria-label="University email"
                  placeholder="you@just.edu.bd"
                  leftIcon={<Mail />}
                  error={errors.email?.message}
                  sizeVariant="lg"
                />

                <Button
                  type="submit"
                  loading={submitting}
                  size="lg"
                  fullWidth
                  rightIcon={!submitting ? <ArrowRight className="h-4 w-4" /> : undefined}
                >
                  Send reset link
                </Button>
              </form>

              <p className="text-center text-sm text-stone-600 pt-2">
                Remember your password?{" "}
                <Link to={ROUTES.LOGIN} className="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}