import { useState, useRef, useCallback, forwardRef } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Eye, EyeOff, Mail, Lock, User,
  CheckCircle2, XCircle, ArrowRight,
  GraduationCap, BookOpen, Sparkles, Shield,
} from "lucide-react"
import { useRegister } from "../hooks/useRegister"
import { ROUTES, TEACHER_EMAIL_DOMAIN, STUDENT_EMAIL_DOMAIN } from "@/config/constants"
import ThreeFullBackground, { ThreeFullBackgroundRef } from "@/components/three/ThreeFullBackground"

const schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z
    .string()
    .email("Enter a valid email")
    .refine(
      e => e.endsWith(TEACHER_EMAIL_DOMAIN) || e.endsWith(STUDENT_EMAIL_DOMAIN),
      "Only @just.edu.bd or @student.just.edu.bd emails are allowed"
    ),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Must contain a special character"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

// ── forwardRef GlassInput ────────────────────────────────────
interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:        string
  icon:         React.ElementType
  error?:       string
  rightIcon?:   React.ReactNode
  accentColor?: string
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, icon: Icon, error, rightIcon, accentColor = "#fbbf24", ...props }, ref) => (
    <div className="space-y-1.5">
      <label
        className="block text-[11px] font-bold tracking-widest uppercase"
        style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.09em" }}
      >
        {label}
      </label>
      <div className="relative">
        <div
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: accentColor }}
        >
          <Icon className="w-4 h-4" strokeWidth={2} />
        </div>
        <input
          ref={ref}
          {...props}
          className="w-full h-10 pl-10 pr-10 rounded-xl text-[13px] font-medium text-white outline-none transition-all duration-200 placeholder:text-white/25"
          style={{
            background:  "rgba(255,255,255,0.07)",
            border:      "1px solid rgba(255,255,255,0.1)",
            caretColor:  accentColor,
          }}
          onFocus={e => {
            e.target.style.borderColor = accentColor
            e.target.style.background  = "rgba(255,255,255,0.1)"
            e.target.style.boxShadow   = `0 0 0 3px ${accentColor}22`
          }}
          onBlur={e => {
            e.target.style.borderColor = "rgba(255,255,255,0.1)"
            e.target.style.background  = "rgba(255,255,255,0.07)"
            e.target.style.boxShadow   = "none"
          }}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightIcon}</div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: "#f87171" }}
          >
            <span
              className="inline-flex w-3.5 h-3.5 items-center justify-center rounded-full text-[9px] font-bold shrink-0"
              style={{ background: "rgba(248,113,113,0.18)" }}
            >!</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
)
GlassInput.displayName = "GlassInput"

// ── Password strength ────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters",    pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number",           pass: /[0-9]/.test(password) },
    { label: "Special char",     pass: /[^a-zA-Z0-9]/.test(password) },
  ]
  const score  = checks.filter(c => c.pass).length
  const colors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"]
  const labels = ["", "Weak", "Fair", "Good", "Strong"]
  const glows  = [
    "rgba(239,68,68,0.4)", "rgba(245,158,11,0.4)",
    "rgba(245,158,11,0.4)", "rgba(16,185,129,0.4)", "rgba(16,185,129,0.4)",
  ]
  if (!password) return null
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="pt-2.5 space-y-2.5 overflow-hidden"
    >
      <div className="flex items-center gap-1.5">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 h-1 rounded-full"
            animate={{
              background: i < score ? colors[score] : "rgba(255,255,255,0.1)",
              boxShadow:  i < score ? `0 0 6px ${glows[score]}` : "none",
            }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
          />
        ))}
        <motion.span
          key={score}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-1.5 text-[10.5px] font-bold w-10 text-right"
          style={{ color: colors[score] }}
        >
          {labels[score]}
        </motion.span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map(c => (
          <motion.div
            key={c.label}
            animate={{ opacity: c.pass ? 1 : 0.5 }}
            className="flex items-center gap-1.5"
          >
            {c.pass
              ? <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: "#10b981" }} />
              : <XCircle      className="w-3 h-3 shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
            }
            <span
              className="text-[10px] font-medium"
              style={{ color: c.pass ? "#6ee7b7" : "rgba(255,255,255,0.32)" }}
            >
              {c.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Role badge ───────────────────────────────────────────────
function RoleBadge({ email }: { email: string }) {
  const isStudent = email.endsWith(STUDENT_EMAIL_DOMAIN)
  const isTeacher = email.endsWith(TEACHER_EMAIL_DOMAIN)
  if (!isStudent && !isTeacher) return null
  const cfg = isStudent
    ? { bg: "rgba(103,232,249,0.09)", border: "rgba(103,232,249,0.22)", iconGrad: "linear-gradient(135deg,#0891b2,#06b6d4)", nameColor: "#67e8f9", label: "Student Account", sub: "Registered as a student" }
    : { bg: "rgba(167,139,250,0.09)", border: "rgba(167,139,250,0.22)", iconGrad: "linear-gradient(135deg,#7c3aed,#9333ea)", nameColor: "#c4b5fd", label: "Teacher Account",  sub: "Registered as a teacher" }
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0,   scale: 1    }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="flex items-center gap-3 p-3 rounded-2xl mt-2"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: cfg.iconGrad }}
        >
          {isStudent
            ? <BookOpen      className="w-4 h-4 text-white" strokeWidth={2.5} />
            : <GraduationCap className="w-4 h-4 text-white" strokeWidth={2.5} />
          }
        </div>
        <div className="flex-1">
          <p className="text-[12.5px] font-bold"  style={{ color: cfg.nameColor }}>{cfg.label}</p>
          <p className="text-[10.5px]" style={{ color: "rgba(255,255,255,0.36)" }}>{cfg.sub}</p>
        </div>
        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: cfg.nameColor }} strokeWidth={2.5} />
      </motion.div>
    </AnimatePresence>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const { register: registerUser, loading } = useRegister()
  const threeRef = useRef<ThreeFullBackgroundRef | null>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const handleReady   = useCallback((ref: ThreeFullBackgroundRef) => { threeRef.current = ref }, [])
  const onFormEnter   = () => threeRef.current?.onHoverForm(true)
  const onFormLeave   = () => threeRef.current?.onHoverForm(false)
  const passwordValue = watch("password", "")
  const emailValue    = watch("email",    "")

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center">
      <ThreeFullBackground variant="register" onReady={handleReady} />

      <div className="relative z-10 flex flex-col items-center w-full px-4 py-8">

        {/* ── Logo ── */}
        <motion.div
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3.5 mb-7"
        >
          <div className="relative">
            <motion.div
              animate={{ boxShadow: [
                "0 0 24px rgba(251,191,36,0.4)",
                "0 0 56px rgba(251,191,36,0.75), 0 0 24px rgba(236,72,153,0.3)",
                "0 0 24px rgba(251,191,36,0.4)",
              ]}}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899)", border: "1px solid rgba(255,255,255,0.18)" }}
            >
              <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </motion.div>
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15) 0%,transparent 55%)" }}
            />
          </div>
          <div>
            <h1
              className="text-[22px] font-extrabold text-white tracking-tight leading-none"
              style={{ textShadow: "0 2px 12px rgba(251,191,36,0.35)", letterSpacing: "-0.025em" }}
            >EduNexis</h1>
            <p className="text-[9px] font-bold mt-0.5"
              style={{ color: "rgba(251,191,36,0.62)", letterSpacing: "0.22em" }}
            >LEARNING PLATFORM</p>
          </div>
        </motion.div>

        {/* ── Glass card ── */}
        <motion.div
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ delay: 0.14, duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={onFormEnter}
          onMouseLeave={onFormLeave}
          className="w-full max-w-[432px] rounded-3xl relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.065)",
            backdropFilter: "blur(48px) saturate(1.5)",
            WebkitBackdropFilter: "blur(48px) saturate(1.5)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 40px 90px rgba(0,0,0,0.44)," +
              "0 8px 24px rgba(0,0,0,0.2)," +
              "0 1px 0 rgba(255,255,255,0.18) inset",
          }}
        >
          {/* Ambient glows */}
          <div className="absolute -top-20 -right-20 w-52 h-52 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(251,191,36,0.14) 0%, transparent 70%)" }}
          />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)" }}
          />
          {/* Animated top shimmer */}
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 0%"] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-8 right-8 h-px pointer-events-none"
            style={{
              background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.45),rgba(251,191,36,0.55),transparent)",
              backgroundSize: "200% 100%",
            }}
          />

          <div className="relative z-10 p-7 space-y-4">

            {/* Heading */}
            <div className="text-center mb-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3"
                style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.22)" }}
              >
                <Sparkles className="w-3 h-3" style={{ color: "#fcd34d" }} strokeWidth={2.5} />
                <span className="text-[11px] font-bold" style={{ color: "#fcd34d" }}>
                  Join thousands of students 🎓
                </span>
              </motion.div>
              <h2
                className="text-[21px] font-extrabold text-white tracking-tight"
                style={{ letterSpacing: "-0.022em" }}
              >Create your account</h2>
              <p className="text-[12.5px] mt-1 font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
                Already have an account?{" "}
                <Link
                  to={ROUTES.LOGIN}
                  className="font-bold transition-opacity hover:opacity-70"
                  style={{ color: "#fcd34d" }}
                >Sign in →</Link>
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(({ fullName, email, password }) =>
                registerUser({ fullName, email, password })
              )}
              className="space-y-3.5"
              noValidate
            >
              <GlassInput
                {...register("fullName")}
                label="Full Name"
                icon={User}
                placeholder="Your full name"
                autoComplete="name"
                error={errors.fullName?.message}
                accentColor="#fbbf24"
              />

              <div>
                <GlassInput
                  {...register("email")}
                  label="University Email"
                  icon={Mail}
                  type="email"
                  placeholder="you@just.edu.bd"
                  autoComplete="email"
                  error={errors.email?.message}
                  accentColor="#fbbf24"
                />
                <RoleBadge email={emailValue} />
              </div>

              <div>
                <GlassInput
                  {...register("password")}
                  label="Password"
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  accentColor="#fbbf24"
                  rightIcon={
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPassword(p => !p)}
                      className="transition-opacity hover:opacity-70"
                    >
                      {showPassword
                        ? <EyeOff className="w-4 h-4" style={{ color: "#fbbf24" }} />
                        : <Eye    className="w-4 h-4" style={{ color: "#fbbf24" }} />
                      }
                    </button>
                  }
                />
                <PasswordStrength password={passwordValue} />
              </div>

              <GlassInput
                {...register("confirmPassword")}
                label="Confirm Password"
                icon={Lock}
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                accentColor="#fbbf24"
                rightIcon={
                  <button type="button" tabIndex={-1}
                    onClick={() => setShowConfirm(p => !p)}
                    className="transition-opacity hover:opacity-70"
                  >
                    {showConfirm
                      ? <EyeOff className="w-4 h-4" style={{ color: "#fbbf24" }} />
                      : <Eye    className="w-4 h-4" style={{ color: "#fbbf24" }} />
                    }
                  </button>
                }
              />

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 0 48px rgba(251,191,36,0.62),0 0 80px rgba(236,72,153,0.28)" }}
                whileTap={{ scale: 0.97 }}
                className="relative w-full h-11 rounded-2xl text-[14px] font-bold text-white flex items-center justify-center gap-2 overflow-hidden group disabled:opacity-50 mt-1"
                style={{
                  background: "linear-gradient(135deg,#f59e0b 0%,#ec4899 55%,#a855f7 100%)",
                  boxShadow: "0 4px 28px rgba(251,191,36,0.42),0 1px 0 rgba(255,255,255,0.15) inset",
                }}
              >
                <div
                  className="absolute inset-0 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 pointer-events-none"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)" }}
                />
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Create My Account</span><ArrowRight className="w-4 h-4" /></>
                }
              </motion.button>
            </form>

            {/* Domain hint */}
            <div
              className="rounded-2xl p-3.5 space-y-2.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <p className="text-[10px] font-bold tracking-widest uppercase text-center"
                style={{ color: "rgba(251,191,36,0.5)" }}
              >🎓 Supported Domains</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {[
                  { label: "@just.edu.bd",        bg: "rgba(251,191,36,0.1)",  color: "#fcd34d", border: "rgba(251,191,36,0.22)"  },
                  { label: "@student.just.edu.bd", bg: "rgba(236,72,153,0.1)", color: "#f9a8d4", border: "rgba(236,72,153,0.22)" },
                ].map(d => (
                  <span key={d.label}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono"
                    style={{ background: d.bg, color: d.color, border: `1px solid ${d.border}` }}
                  >{d.label}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
          className="flex items-center gap-4 mt-5"
        >
          {[
            { icon: Shield,   iconColor: "#6ee7b7", label: "SSL Secured"  },
            { icon: Sparkles, iconColor: "#fcd34d", label: "Free Forever" },
          ].map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-1 h-1 rounded-full mr-2.5" style={{ background: "rgba(255,255,255,0.18)" }} />}
              <b.icon className="w-3.5 h-3.5" style={{ color: b.iconColor }} strokeWidth={2} />
              <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>{b.label}</span>
            </span>
          ))}
          <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
          <span className="text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.28)" }}>© 2026 EduNexis</span>
        </motion.div>

      </div>
    </div>
  )
}
