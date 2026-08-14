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
import { CTA_PRIMARY } from "@/components/ui/ctaStyles"
import { authService } from "../services/authService"
import { ROUTES } from "@/config/constants"
import AuthShell from "@/components/layout/AuthShell"


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
    <AuthShell
      title={sent ? "Check your email" : "Reset your password"}
      subtitle={
        sent ? (
          <>
            If an account exists for{" "}
            <span className="font-semibold text-stone-900">{sentEmail}</span>, we{"’"}ve
            sent a password reset link.
          </>
        ) : (
          <>Enter your email below. We{"’"}ll send you a link to set a new password.</>
        )
      }
      back={{ to: ROUTES.LOGIN, label: "Back to sign in" }}
      panelLines={["We’ll get you", "back in."]}
      panelBody="Enter your university email and we’ll send a secure link to reset your password. The link expires in an hour."
      footer={
        sent ? undefined : (
          <p className="text-center text-[14px] text-stone-600">
            Remember your password?{" "}
            <Link to={ROUTES.LOGIN} className="font-bold text-teal-700 transition-colors hover:text-teal-800">
              Sign in
            </Link>
          </p>
        )
      }
    >
          {sent ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-300">
                <CheckCircle2 className="h-6 w-6" strokeWidth={2.25} />
              </div>
              <div className="space-y-2 rounded-xl border border-stone-200 bg-stone-50/70 p-4">
                <p className="text-[12.5px] font-semibold text-stone-900">What{"’"}s next?</p>
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
                    <span>Check spam if you don{"’"}t see it within a minute</span>
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
                  className={CTA_PRIMARY}
                  rightIcon={!submitting ? <ArrowRight className="h-4 w-4" /> : undefined}
                >
                  Send reset link
                </Button>
            </form>
          )}
    </AuthShell>
  )
}