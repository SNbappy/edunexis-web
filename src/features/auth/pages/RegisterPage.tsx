import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  CheckCircle2, XCircle, BookOpen, GraduationCap, Sparkles,
} from "lucide-react"

import { useRegister } from "../hooks/useRegister"
import { ROUTES, TEACHER_EMAIL_DOMAIN, STUDENT_EMAIL_DOMAIN } from "@/config/constants"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import BrandLoader from "@/components/ui/BrandLoader"
import { cn } from "@/utils/cn"

const schema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Enter a valid email").refine(
    e => e.endsWith(TEACHER_EMAIL_DOMAIN) || e.endsWith(STUDENT_EMAIL_DOMAIN),
    `Only ${TEACHER_EMAIL_DOMAIN} or ${STUDENT_EMAIL_DOMAIN} emails are allowed`,
  ),
  password: z.string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

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

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = [
    { label: "8+ characters",     pass: password.length >= 8          },
    { label: "Uppercase letter",  pass: /[A-Z]/.test(password)         },
    { label: "Number",            pass: /[0-9]/.test(password)         },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password)  },
  ]
  const score = checks.filter(c => c.pass).length
  const labels = ["", "Weak", "Fair", "Good", "Strong"]
  const barColor = score < 2 ? "bg-destructive" : score < 4 ? "bg-warning" : "bg-success"
  const textColor = score < 2 ? "text-destructive" : score < 4 ? "text-warning" : "text-success"

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="pt-2.5 space-y-2 overflow-hidden"
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              i < score ? barColor : "bg-stone-200 dark:bg-stone-800",
            )}
          />
        ))}
        <span className={cn("ml-2 text-[10px] font-bold w-10 text-right", textColor)}>
          {labels[score]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map(c => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass
              ? <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
              : <XCircle      className="h-3 w-3 shrink-0 text-stone-300" />
            }
            <span className={cn("text-[10.5px] font-medium", c.pass ? "text-success" : "text-stone-400")}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function RoleBadge({ email }: { email: string }) {
  const isStudent = email.endsWith(STUDENT_EMAIL_DOMAIN)
  const isTeacher = email.endsWith(TEACHER_EMAIL_DOMAIN) && !isStudent
  if (!isStudent && !isTeacher) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        exit={{    opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border",
          isStudent
            ? "bg-teal-50 border-teal-200"
            : "bg-amber-50 border-amber-200",
        )}
      >
        <div className={cn(
          "h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0",
          isStudent ? "bg-teal-600 text-white" : "bg-amber-500 text-white",
        )}>
          {isStudent
            ? <BookOpen      className="h-4 w-4" strokeWidth={2.25} />
            : <GraduationCap className="h-4 w-4" strokeWidth={2.25} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[12.5px] font-semibold leading-tight",
            isStudent ? "text-teal-800" : "text-amber-800",
          )}>
            {isStudent ? "Student account" : "Teacher account"}
          </p>
          <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
            Detected from your email domain
          </p>
        </div>
        <CheckCircle2 className={cn(
          "h-4 w-4 shrink-0",
          isStudent ? "text-teal-600" : "text-amber-600",
        )} />
      </motion.div>
    </AnimatePresence>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const { register: registerUser, loading, showOverlay } = useRegister()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const passwordValue = watch("password", "")
  const emailValue    = watch("email",    "")

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

        <div className="relative space-y-10">
          <div className="space-y-5 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full bg-white/10 border border-white/15">
              <Sparkles className="h-3 w-3 text-amber-300" />
              <span className="text-[11px] font-semibold text-white/90">JUST Department of CSE</span>
            </div>
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-[1.02] tracking-tight">
              Start your<br />semester right.
            </h1>
            <p className="text-[15px] leading-relaxed text-white/80 max-w-sm">
              One account unlocks every course, assignment, attendance record, and grade — no more scattered tools or spreadsheets.
            </p>
          </div>

          <ul className="space-y-3 max-w-sm">
            {[
              "Real-time attendance tracking",
              "Dynamic grade computation with CT best-of-three",
              "Assignment submission with plagiarism checks",
            ].map(feat => (
              <li key={feat} className="flex items-start gap-3 text-sm text-white/85">
                <div className="h-5 w-5 rounded-md bg-white/15 inline-flex items-center justify-center shrink-0 mt-px">
                  <CheckCircle2 className="h-3 w-3 text-amber-300" strokeWidth={2.5} />
                </div>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative text-[11px] text-white/60">
          Jashore University of Science and Technology
        </div>
      </aside>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-muted overflow-y-auto">
        <div className="w-full max-w-[400px] space-y-6 py-6">
          <div className="lg:hidden flex items-center gap-2.5">
            <BrandMark className="h-9 w-9 text-teal-600" />
            <span className="font-display font-bold text-lg tracking-tight text-stone-900">EduNexis</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-[28px] font-bold tracking-tight text-stone-900 leading-tight">
              Create your account
            </h2>
            <p className="text-sm text-stone-600">
              Use your university email to get started.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(({ fullName, email, password }) =>
              registerUser({ fullName, email, password }),
            )}
            className="space-y-4"
            noValidate
          >
            <Input
              {...register("fullName")}
              label="Full name"
              placeholder="Md. Sabbir Hossain Bappy"
              autoComplete="name"
              leftIcon={<User />}
              error={errors.fullName?.message}
              sizeVariant="lg"
            />

            <div className="space-y-2">
              <Input
                {...register("email")}
                label="University email"
                type="email"
                placeholder="you@just.edu.bd"
                autoComplete="email"
                leftIcon={<Mail />}
                error={errors.email?.message}
                sizeVariant="lg"
              />
              <RoleBadge email={emailValue} />
            </div>

            <div>
              <Input
                {...register("password")}
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                leftIcon={<Lock />}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}
                    className="p-1 hover:text-stone-900 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                sizeVariant="lg"
              />
              <PasswordStrength password={passwordValue} />
            </div>

            <Input
              {...register("confirmPassword")}
              label="Confirm password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              leftIcon={<Lock />}
              rightIcon={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirm(p => !p)}
                  className="p-1 hover:text-stone-900 transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.confirmPassword?.message}
              sizeVariant="lg"
            />

            <Button
              type="submit"
              loading={loading}
              size="lg"
              fullWidth
              rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Slow-auth brand overlay */}
      {showOverlay && <BrandLoader variant="screen" label="Creating your account…" />}
    </div>
  )
}
