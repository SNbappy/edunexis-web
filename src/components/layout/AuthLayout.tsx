import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { gsap } from "gsap"
import { GraduationCap, Shield, Zap, Sparkles, BookOpen, Users, TrendingUp, Star, CheckCircle } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import ThreeLoginBackground from "@/components/three/ThreeLoginBackground"
import { APP_NAME, APP_UNIVERSITY, ROUTES } from "@/config/constants"

interface AuthLayoutProps { children: React.ReactNode; title: string; subtitle: string }

const LOGIN_FEATURES = [
  { icon: Zap,         text: "Smart attendance tracking",       color: "#a78bfa" },
  { icon: BookOpen,    text: "Interactive course materials",     color: "#67e8f9" },
  { icon: TrendingUp,  text: "Real-time grade analytics",        color: "#6ee7b7" },
  { icon: Star,        text: "Live class announcements",         color: "#fcd34d" },
]

const REGISTER_FEATURES = [
  { icon: CheckCircle, text: "Free forever for university use",  color: "#6ee7b7" },
  { icon: Shield,      text: "Secured university email only",    color: "#a78bfa" },
  { icon: Users,       text: "Connect with your entire batch",   color: "#67e8f9" },
  { icon: Sparkles,    text: "AI-powered plagiarism detection",  color: "#fcd34d" },
]

const STATS = [
  { icon: BookOpen,    value: "500+", label: "Courses",    color: "#a78bfa", bg: "rgba(167,139,250,0.15)" },
  { icon: Users,       value: "12K+", label: "Students",   color: "#67e8f9", bg: "rgba(103,232,249,0.15)" },
  { icon: TrendingUp,  value: "94%",  label: "Completion", color: "#6ee7b7", bg: "rgba(110,231,183,0.15)" },
]

const TESTIMONIALS = [
  { name: "Sarah K.",   role: "CSE Student",  text: "EduNexis completely transformed how I manage my studies!", avatar: "SK", color: "#a78bfa" },
  { name: "Dr. Ahmed",  role: "Professor",    text: "The easiest course management tool I've ever used.",        avatar: "DA", color: "#67e8f9" },
  { name: "Raihan M.",  role: "EEE Student",  text: "Attendance tracking is so seamless now. Love it!",         avatar: "RM", color: "#6ee7b7" },
]

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const location   = useLocation()
  const isLogin    = location.pathname.includes("login")
  const headingRef = useRef<HTMLHeadingElement>(null)
  const statsRef   = useRef<HTMLDivElement>(null)
  const featRef    = useRef<HTMLDivElement>(null)
  const features   = isLogin ? LOGIN_FEATURES : REGISTER_FEATURES

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })
    if (headingRef.current) {
      tl.fromTo(headingRef.current,
        { opacity: 0, y: 40, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.85, ease: "power3.out" }
      )
    }
    if (statsRef.current) {
      tl.fromTo(Array.from(statsRef.current.children),
        { opacity: 0, y: 18, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.4)" },
        "-=0.4"
      )
    }
    if (featRef.current) {
      tl.fromTo(Array.from(featRef.current.children),
        { opacity: 0, x: -18 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: "power2.out" },
        "-=0.3"
      )
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#f8f7ff" }}>

      {/* ══ LEFT PANEL ══════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between"
        style={{ background: "linear-gradient(135deg,#2e1065 0%,#4c1d95 25%,#1e3a8a 60%,#0c4a6e 85%,#134e4a 100%)" }}
      >
        {/* Three.js background */}
        <ThreeLoginBackground />

        {/* Depth overlays */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,58,237,0.18) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(46,16,101,0.85), transparent)" }}
        />
        <div className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), rgba(103,232,249,0.4), transparent)" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full justify-between p-12">

          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: -5 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", backdropFilter: "blur(12px)" }}
            >
              <GraduationCap className="w-6 h-6 text-white" strokeWidth={2.5} />
            </motion.div>
            <div>
              <p className="text-[21px] font-extrabold text-white tracking-tight">{APP_NAME}</p>
              <p className="text-[10px] text-white/40 font-bold tracking-[0.18em] uppercase -mt-0.5">Learning Platform</p>
            </div>
          </motion.div>

          {/* Main copy */}
          <div className="space-y-7">
            {/* Label pill */}
            <AnimatePresence mode="wait">
              <motion.div key={location.pathname}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full w-fit"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span className="text-[12px] font-bold text-white/80">
                  {isLogin ? "Welcome back 👋" : "Join thousands of students 🎓"}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Headline */}
            <AnimatePresence mode="wait">
              <h1 key={location.pathname} ref={headingRef}
                className="text-[42px] font-extrabold text-white leading-tight tracking-tight opacity-0"
              >
                {isLogin ? (
                  <>Where Learning<br />
                    <span style={{ background: "linear-gradient(90deg,#c4b5fd,#67e8f9,#6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Meets Innovation.
                    </span>
                  </>
                ) : (
                  <>Start Your<br />
                    <span style={{ background: "linear-gradient(90deg,#fcd34d,#f9a8d4,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Academic Journey.
                    </span>
                  </>
                )}
              </h1>
            </AnimatePresence>

            <p className="text-[14px] text-white/55 max-w-sm leading-relaxed font-medium">
              {isLogin
                ? "The all-in-one platform empowering universities with smart course management and real-time analytics."
                : "Create your free account with your university email and unlock a smarter way to learn and teach."
              }
            </p>

            {/* Features list */}
            <AnimatePresence mode="wait">
              <div key={location.pathname} ref={featRef} className="space-y-2.5">
                {features.map(f => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <f.icon className="w-3.5 h-3.5" style={{ color: f.color }} strokeWidth={2.5} />
                    </div>
                    <span className="text-[13px] text-white/70 font-medium">{f.text}</span>
                  </div>
                ))}
              </div>
            </AnimatePresence>

            {/* Stats */}
            <div ref={statsRef} className="flex gap-3">
              {STATS.map(s => (
                <div key={s.label} className="flex-1 rounded-2xl p-3.5 text-center"
                  style={{ background: s.bg, border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
                >
                  <s.icon className="w-4 h-4 mx-auto mb-2" style={{ color: s.color }} strokeWidth={2.5} />
                  <p className="text-[17px] font-extrabold text-white leading-none">{s.value}</p>
                  <p className="text-[10px] text-white/50 font-bold mt-1 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.slice(0, isLogin ? 2 : 3).map((t, i) => i === (Date.now() >> 12) % (isLogin ? 2 : 3) && (
                <motion.div key={t.name}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
                >
                  <p className="text-[13px] text-white/75 italic font-medium leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-2.5 mt-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${t.color}, #06b6d4)` }}
                    >{t.avatar}</div>
                    <div>
                      <p className="text-[12px] font-bold text-white/90">{t.name}</p>
                      <p className="text-[10px] text-white/45 font-medium">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-yellow-300 text-yellow-300" />)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <p className="text-[11px] text-white/25 font-medium">© 2026 {APP_NAME} · {APP_UNIVERSITY}</p>
          </div>
        </div>
      </div>

      {/* ══ RIGHT PANEL ═════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-14 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-[420px]"
          >
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" }}
              >
                <GraduationCap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-[18px] font-extrabold"
                style={{ background: "linear-gradient(135deg,#7c3aed,#0891b2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >{APP_NAME}</span>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{ background: "#ede9fe", border: "1px solid #c4b5fd" }}
              >
                <Sparkles className="w-3 h-3" style={{ color: "#7c3aed" }} />
                <span className="text-[11px] font-bold" style={{ color: "#7c3aed" }}>{subtitle}</span>
              </div>
              <h2 className="text-[28px] font-extrabold tracking-tight" style={{ color: "#120c32" }}>{title}</h2>
              <p className="text-[13px] mt-2 font-medium" style={{ color: "#6e6496" }}>
                {isLogin ? (
                  <>New here?{" "}
                    <Link to={ROUTES.REGISTER} className="font-bold hover:opacity-75 transition-opacity" style={{ color: "#7c3aed" }}>
                      Create a free account →
                    </Link>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <Link to={ROUTES.LOGIN} className="font-bold hover:opacity-75 transition-opacity" style={{ color: "#7c3aed" }}>
                      Sign in →
                    </Link>
                  </>
                )}
              </p>
            </div>

            {/* Form content */}
            <div className="rounded-2xl p-6 space-y-1"
              style={{ background: "#ffffff", border: "1px solid #ede9fe", boxShadow: "0 8px 40px rgba(124,58,237,0.08)" }}
            >
              {children}
            </div>

            {/* Trust badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 mt-5"
            >
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: "#94a3b8" }}>
                <Shield className="w-3.5 h-3.5" style={{ color: "#10b981" }} /> SSL Secured
              </span>
              <div className="w-1 h-1 rounded-full" style={{ background: "#e2e8f0" }} />
              <span className="flex items-center gap-1.5 text-[11.5px] font-semibold" style={{ color: "#94a3b8" }}>
                <Zap className="w-3.5 h-3.5" style={{ color: "#a78bfa" }} /> JUST University Only
              </span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
