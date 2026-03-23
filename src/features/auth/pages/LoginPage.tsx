import { useState, useRef, useCallback, forwardRef } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye, EyeOff, Mail, Lock, GraduationCap,
  ArrowRight, BookOpen, Users, TrendingUp, CheckCircle2,
} from "lucide-react"
import { useLogin } from "../hooks/useLogin"
import { useFirebaseAuth } from "../hooks/useFirebaseAuth"
import { ROUTES } from "@/config/constants"
import ThreeFullBackground, { ThreeFullBackgroundRef } from "@/components/three/ThreeFullBackground"

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})
type FormData = z.infer<typeof schema>

// ── Input ────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:      string
  icon:       React.ElementType
  error?:     string
  rightIcon?: React.ReactNode
}

const FormInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon: Icon, error, rightIcon, ...props }, ref) => (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold tracking-[0.1em] uppercase text-white/40">
        {label}
      </label>
      <div className="relative group">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 group-focus-within:text-violet-400 transition-colors duration-200"
          strokeWidth={2}
        />
        <input
          ref={ref}
          {...props}
          className="w-full h-12 pl-11 pr-11 rounded-2xl text-[13.5px] font-medium text-white outline-none transition-all duration-200 placeholder:text-white/18"
          style={{
            background: "rgba(255,255,255,0.05)",
            border:     "1px solid rgba(255,255,255,0.08)",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = "rgba(139,92,246,0.6)"
            e.currentTarget.style.background  = "rgba(255,255,255,0.07)"
            e.currentTarget.style.boxShadow   = "0 0 0 4px rgba(124,58,237,0.12)"
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"
            e.currentTarget.style.background  = "rgba(255,255,255,0.05)"
            e.currentTarget.style.boxShadow   = "none"
          }}
        />
        {rightIcon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightIcon}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400"
          >
            <span className="w-3.5 h-3.5 rounded-full bg-red-400/15 flex items-center justify-center text-[9px] font-bold shrink-0">!</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
)
FormInput.displayName = "FormInput"

// ── Feature list ─────────────────────────────────────────────
const FEATURES = [
  { icon: BookOpen,     label: "500+ expert-led courses"           },
  { icon: Users,        label: "12,000+ active students"           },
  { icon: TrendingUp,   label: "94% course completion rate"        },
  { icon: CheckCircle2, label: "University-verified certificates"  },
]

// ── Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, loading }              = useLogin()
  const { signInWithGoogle, loading: gLoading } = useFirebaseAuth()
  const threeRef = useRef<ThreeFullBackgroundRef | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleReady = useCallback((ref: ThreeFullBackgroundRef) => { threeRef.current = ref }, [])
  const onFormEnter = () => threeRef.current?.onHoverForm(true)
  const onFormLeave = () => threeRef.current?.onHoverForm(false)

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative">

      <ThreeFullBackground variant="login" onReady={handleReady} />

      {/* ════════════════════════════════
          LEFT — Branding Panel
      ════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="hidden lg:flex flex-col justify-between w-[46%] relative z-10 p-14 xl:p-16"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}
          >
            <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-bold text-[17px] tracking-tight leading-none">EduNexis</p>
            <p className="text-white/25 text-[9px] font-semibold tracking-[0.22em] uppercase mt-0.5">Learning Platform</p>
          </div>
        </motion.div>

        {/* Hero copy */}
        <div className="space-y-10">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="text-[52px] xl:text-[60px] font-extrabold text-white leading-[1.05] tracking-tight">
                Learn without<br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #a78bfa 0%, #38bdf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  limits.
                </span>
              </h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-white/40 text-[15px] leading-[1.7] max-w-[300px]"
            >
              JUST's official learning hub. Access expert courses, track your growth, and earn verified certificates.
            </motion.p>
          </div>

          {/* Feature list */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="space-y-3"
          >
            {FEATURES.map((f, i) => (
              <motion.li
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3.5"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    border:     "1px solid rgba(139,92,246,0.18)",
                  }}
                >
                  <f.icon className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} strokeWidth={2} />
                </div>
                <span className="text-white/50 text-[13.5px] font-medium">{f.label}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="space-y-4"
        >
          <div className="w-8 h-[2px] rounded-full" style={{ background: "rgba(139,92,246,0.35)" }} />
          <p className="text-white/30 text-[13px] leading-[1.65] italic max-w-[280px]">
            "EduNexis transformed how I study. Clean, fast, and the courses are genuinely world-class."
          </p>
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
            >R</div>
            <div>
              <p className="text-white/45 text-[12px] font-semibold">Rafiq Ahmed</p>
              <p className="text-white/22 text-[10px]">CSE, JUST · Batch 2023</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ════════════════════════════════
          RIGHT — Form Panel
      ════════════════════════════════ */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6 lg:p-10">

        {/* Blurred dark overlay for right panel only */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:          "rgba(3,0,14,0.78)",
            backdropFilter:      "blur(48px) saturate(1.2)",
            WebkitBackdropFilter:"blur(48px) saturate(1.2)",
            borderLeft:          "1px solid rgba(255,255,255,0.05)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onFormEnter}
          onMouseLeave={onFormLeave}
          className="relative z-10 w-full max-w-[390px] space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
            >
              <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-white font-bold">EduNexis</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h2 className="text-[28px] font-extrabold text-white tracking-tight">Welcome back</h2>
            <p className="text-white/35 text-[13.5px]">
              No account?{" "}
              <Link
                to={ROUTES.REGISTER}
                className="font-semibold transition-colors"
                style={{ color: "#a78bfa" }}
                onMouseOver={e => (e.currentTarget.style.color = "#c4b5fd")}
                onMouseOut={e  => (e.currentTarget.style.color = "#a78bfa")}
              >
                Create one free →
              </Link>
            </p>
          </div>

          {/* Google SSO */}
          <motion.button
            type="button"
            onClick={() => signInWithGoogle()}
            disabled={gLoading}
            whileHover={{ scale: 1.01, borderColor: "rgba(255,255,255,0.18)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-2xl flex items-center justify-center gap-3 text-[13.5px] font-semibold text-white/75 transition-all duration-200 disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.05)",
              border:     "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {gLoading
              ? <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
              : <>
                  <svg width="17" height="17" viewBox="0 0 24 24" className="shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
            }
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
            <span className="text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.22)" }}>or continue with email</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit(d => login(d))} className="space-y-4" noValidate>
            <FormInput
              {...register("email")}
              label="University Email"
              icon={Mail}
              type="email"
              placeholder="you@just.edu.bd"
              autoComplete="email"
              error={errors.email?.message}
            />

            <div className="space-y-1">
              <FormInput
                {...register("password")}
                label="Password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(p => !p)}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />
                    }
                  </button>
                }
              />
              <div className="flex justify-end pt-0.5">
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-[11.5px] font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseOver={e => (e.currentTarget.style.color = "#a78bfa")}
                  onMouseOut={e  => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.015, boxShadow: "0 8px 40px rgba(124,58,237,0.65)" }}
              whileTap={{ scale: 0.97 }}
              className="relative w-full h-12 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2 overflow-hidden disabled:opacity-50 mt-1"
              style={{
                background:  "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
                boxShadow:   "0 4px 28px rgba(124,58,237,0.45), 0 1px 0 rgba(255,255,255,0.12) inset",
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)", backgroundSize: "200% 100%" }}
                animate={{ backgroundPosition: ["−100% 0%", "200% 0%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              />
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in to EduNexis</span><ArrowRight className="w-4 h-4" /></>
              }
            </motion.button>
          </form>

          {/* Domain note */}
          <p className="text-center text-[11px]" style={{ color: "rgba(255,255,255,0.18)" }}>
            Restricted to{" "}
            <span className="font-mono" style={{ color: "rgba(255,255,255,0.32)" }}>@just.edu.bd</span>
            {" "}and{" "}
            <span className="font-mono" style={{ color: "rgba(255,255,255,0.32)" }}>@student.just.edu.bd</span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
