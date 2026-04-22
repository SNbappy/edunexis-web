import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Mail, Lock, Eye, EyeOff, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react"

import { useLogin } from "../hooks/useLogin"
import { ROUTES } from "@/config/constants"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import BrandLoader from "@/components/ui/BrandLoader"

const schema = z.object({
  email:    z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading, showOverlay } = useLogin()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

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

        <div className="relative space-y-10">
          <div className="space-y-5 max-w-md">
            <h1 className="font-display text-5xl xl:text-6xl font-bold leading-[1.02] tracking-tight">
              Your department,<br />unified.
            </h1>
            <p className="text-[15px] leading-relaxed text-white/80 max-w-sm">
              Attendance, assignments, grades, materials, and announcements — all in one calm, fast place built for your university.
            </p>
          </div>

          <div className="relative max-w-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-400/20 text-amber-300">
                <BookOpen className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">CSE 4101</p>
                <p className="text-sm font-bold text-white">Data Structures</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/15 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Attendance</span>
                <span className="font-semibold text-white">87%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Assignments due</span>
                <span className="font-semibold text-amber-300">3</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Last announcement</span>
                <span className="font-semibold text-white">2 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-white/60">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Jashore University of Science and Technology · CSE Department</span>
        </div>
      </aside>

      {/* RIGHT — Sign-in form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-stone-50">
        <div className="w-full max-w-[380px] space-y-7">
          <div className="lg:hidden flex items-center gap-2.5">
            <BrandMark className="h-9 w-9 text-teal-600" />
            <span className="font-display font-bold text-lg tracking-tight text-stone-900">EduNexis</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="font-display text-[28px] font-bold tracking-tight text-stone-900 leading-tight">
              Welcome back
            </h2>
            <p className="text-sm text-stone-600">
              Sign in to continue to your courses.
            </p>
          </div>

          <form onSubmit={handleSubmit(d => login(d))} className="space-y-4" noValidate>
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

            <div className="space-y-1.5">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                aria-label="Password"
                placeholder="Your password"
                leftIcon={<Lock />}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}
                    className="hover:text-stone-900 transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.password?.message}
                sizeVariant="lg"
              />
              <div className="flex justify-end">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-xs font-medium text-stone-500 hover:text-teal-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              fullWidth
              rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}
            >
              Sign in
            </Button>
          </form>

          <div className="space-y-3 pt-2">
            <p className="text-center text-sm text-stone-600">
              New to EduNexis?{" "}
              <Link to={ROUTES.REGISTER} className="font-semibold text-teal-700 hover:text-teal-800 transition-colors">
                Create an account
              </Link>
            </p>
            <p className="text-center text-[11px] text-stone-400">
              Access restricted to{" "}
              <span className="font-mono text-stone-500">@just.edu.bd</span>{" "}and{" "}
              <span className="font-mono text-stone-500">@student.just.edu.bd</span>
            </p>
          </div>
        </div>
      </div>

      {/* Slow-auth brand overlay */}
      {showOverlay && <BrandLoader variant="screen" label="Signing you in…" />}
    </div>
  )
}
