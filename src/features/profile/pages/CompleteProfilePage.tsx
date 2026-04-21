import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { GraduationCap, CheckCircle2, Sparkles, User, LogOut, ArrowRight } from "lucide-react"
import ProfileForm from "../components/ProfileForm"
import { useProfile } from "../hooks/useProfile"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { ROUTES } from "@/config/constants"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { isTeacher } from "@/utils/roleGuard"

const STEPS = [
  { label: "Account Created",  done: true,  active: false },
  { label: "Complete Profile", done: false, active: true  },
  { label: "Start Learning",   done: false, active: false },
]

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, clearAuth, setUser } = useAuthStore()
  const { dark }  = useThemeStore()
  const { updateProfile, isUpdating } = useProfile()
  const teacher = isTeacher(user?.role ?? "Student")

  useEffect(() => {
    if (user?.isProfileComplete && user?.profile?.fullName) {
      const ok = teacher ? !!user.profile.designation?.trim() : !!user.profile.studentId?.trim()
      if (ok) navigate(ROUTES.DASHBOARD, { replace: true })
    }
  }, [user])

  const defaultValues = {
    fullName:   user?.profile?.fullName ?? "",
    department: user?.profile?.department ?? "",
  }

  const handleSubmit = (data: Parameters<typeof updateProfile>[0]) => {
    updateProfile(data, {
      onSuccess: (res) => {
        if (res.success && user) {
          setUser({ ...user, isProfileComplete: true, profile: { ...user.profile, ...res.data, ...data } as any })
          navigate(ROUTES.DASHBOARD, { replace: true })
        }
      },
    })
  }

  // Theme tokens
  const bg        = dark ? "rgb(11,17,32)"           : "rgb(248,249,255)"
  const card      = dark ? "rgba(16,24,44,0.88)"     : "rgba(255,255,255,0.92)"
  const border    = dark ? "rgba(99,102,241,0.2)"    : "#e5e7eb"
  const topbar    = dark ? "rgba(11,17,32,0.8)"      : "rgba(255,255,255,0.8)"
  const header    = dark
    ? "linear-gradient(135deg,rgba(99,102,241,0.2) 0%,rgba(6,182,212,0.12) 100%)"
    : "linear-gradient(135deg,rgba(99,102,241,0.07) 0%,rgba(6,182,212,0.04) 100%)"
  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#7b93c8" : "#6b7280"
  const textMuted = dark ? "#4a6090" : "#9ca3af"
  const infoMsg   = dark ? "#a5b4fc" : "#4338ca"
  const infoBg    = dark ? "rgba(99,102,241,0.1)" : "#eef2ff"
  const infoBorder= dark ? "rgba(99,102,241,0.22)" : "#c7d2fe"

  // Form CSS override — adapts to theme
  const formCss = dark ? `
    .profile-form-themed input,
    .profile-form-themed select,
    .profile-form-themed textarea {
      background: rgba(255,255,255,0.06) !important;
      border: 1px solid rgba(99,102,241,0.25) !important;
      color: #e2e8f8 !important;
      color-scheme: dark;
    }
    .profile-form-themed input::placeholder,
    .profile-form-themed textarea::placeholder { color: #4a6090 !important; }
    .profile-form-themed input:focus,
    .profile-form-themed select:focus,
    .profile-form-themed textarea:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
    }
    .profile-form-themed option { background: #0d1f3c !important; color: #e2e8f8 !important; }
    .profile-form-themed label  { color: #8896c8 !important; }
  ` : `
    .profile-form-themed input,
    .profile-form-themed select,
    .profile-form-themed textarea {
      background: #f9fafb !important;
      border: 1px solid #e5e7eb !important;
      color: #111827 !important;
      color-scheme: light;
    }
    .profile-form-themed input::placeholder,
    .profile-form-themed textarea::placeholder { color: #9ca3af !important; }
    .profile-form-themed input:focus,
    .profile-form-themed select:focus,
    .profile-form-themed textarea:focus {
      border-color: #6366f1 !important;
      box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important;
    }
    .profile-form-themed option { background: white !important; color: #111827 !important; }
    .profile-form-themed label  { color: #374151 !important; }
  `

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: bg }}>

      {/* Three.js */}
      

      {/* Overlay */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1,
        background: dark
          ? "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(11,17,32,0.65) 100%)"
          : "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 30%, rgba(248,249,255,0.7) 100%)" }} />

      {/* Dot grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1,
        backgroundImage: `radial-gradient(circle, ${dark ? "rgba(99,102,241,0.18)" : "rgba(99,102,241,0.1)"} 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        opacity: 0.45 }} />

      {/* -- Top bar -- */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative flex items-center justify-between px-6 py-4"
        style={{ zIndex: 10, borderBottom: `1px solid ${border}`, background: topbar, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>

        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <motion.div animate={{ rotate: [0,5,-5,0] }} transition={{ duration: 4, repeat: Infinity }}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", boxShadow: "0 2px 12px rgba(99,102,241,0.5)" }}>
            <GraduationCap style={{ width: 16, height: 16 }} className="text-white" strokeWidth={2.5} />
          </motion.div>
          <div>
            <p className="text-[14px] font-bold leading-none" style={{ color: textMain }}>EduNexis</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: textMuted }}>One-time Profile Setup</p>
          </div>
        </div>

        {/* Right: Logout + Theme toggle */}
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { clearAuth(); navigate(ROUTES.LOGIN, { replace: true }) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
            <LogOut style={{ width: 13, height: 13 }} /> Log out
          </motion.button>
          <ThemeToggle />
        </div>
      </motion.div>

      <div className="relative flex flex-col items-center px-4 py-10" style={{ zIndex: 10 }}>

        {/* -- Steps -- */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }} className="flex items-center mb-10">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 300 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold"
                  style={{
                    background: step.done ? "linear-gradient(135deg,#6366f1,#06b6d4)" : step.active ? (dark ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.9)") : (dark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)"),
                    border: step.active && !step.done ? "2px solid #6366f1" : step.done ? "2px solid transparent" : `2px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"}`,
                    color: step.done ? "white" : step.active ? "#6366f1" : textMuted,
                    boxShadow: step.active ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
                    backdropFilter: "blur(8px)",
                  }}>
                  {step.done ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : i + 1}
                </motion.div>
                <span className="text-[11px] font-semibold whitespace-nowrap"
                  style={{ color: step.active ? "#6366f1" : step.done ? (dark ? "#818cf8" : "#4f46e5") : textMuted }}>
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <motion.div className="w-20 h-0.5 mb-5 mx-2"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.5 }}
                  style={{ background: step.done ? "linear-gradient(90deg,#6366f1,#06b6d4)" : (dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)"), transformOrigin: "left" }} />
              )}
            </div>
          ))}
        </motion.div>

        {/* -- Card -- */}
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.2, type: "spring", damping: 22 }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden"
          style={{ background: card, border: `1px solid ${border}`, backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", boxShadow: dark ? "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(99,102,241,0.1)" : "0 16px 56px rgba(99,102,241,0.1), 0 2px 8px rgba(0,0,0,0.06)" }}>

          {/* Card header */}
          <div className="relative px-8 py-6 overflow-hidden" style={{ background: header, borderBottom: `1px solid ${border}` }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none opacity-30"
              style={{ background: "radial-gradient(circle,rgba(99,102,241,0.4),transparent)" }} />
            <div className="relative flex items-center gap-4">
              <motion.div animate={{ y: [0,-5,0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", boxShadow: "0 8px 24px rgba(99,102,241,0.5)" }}>
                <User style={{ width: 26, height: 26 }} className="text-white" strokeWidth={2} />
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: textMain }}>
                    {user?.profile?.fullName
                      ? `Welcome, ${user.profile.fullName.split(" ")[0]}!`
                      : "Complete Your Profile"}
                  </h1>
                  <motion.div animate={{ rotate: [0,15,-15,0], scale: [1,1.2,1.2,1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
                    <Sparkles style={{ width: 18, height: 18, color: "#fbbf24" }} />
                  </motion.div>
                </div>
                <p className="text-[13px]" style={{ color: textSub }}>
                  {teacher
                    ? "Add your designation so students can identify you"
                    : "Add your student ID to enable attendance and marks tracking"}
                </p>
              </div>
            </div>
          </div>

          {/* Info notice */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-8 mt-5 px-4 py-3 rounded-xl flex items-start gap-3"
            style={{ background: infoBg, border: `1px solid ${infoBorder}` }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "#6366f1" }}>
              <span className="text-white text-[10px] font-black">i</span>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: infoMsg }}>
              <strong>One-time setup.</strong> Your full name is pre-filled from registration. Complete this to unlock all features.
            </p>
          </motion.div>

          {/* Form */}
          <div className="px-8 py-6">
            <style>{formCss}</style>
            <div className="profile-form-themed">
              <ProfileForm defaultValues={defaultValues} onSubmit={handleSubmit}
                isLoading={isUpdating} submitLabel="Complete Profile & Start Learning" />
            </div>
          </div>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="mt-5 text-[12px] flex items-center gap-1.5" style={{ color: textMuted }}>
          You can log out and return later to complete this setup.
          <ArrowRight style={{ width: 11, height: 11 }} />
        </motion.p>
      </div>
    </div>
  )
}

