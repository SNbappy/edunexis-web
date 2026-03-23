import { useState, useEffect } from "react"
import { Sun, Moon, Coffee, Sparkles, GraduationCap } from "lucide-react"
import { motion } from "framer-motion"
import Avatar from "@/components/ui/Avatar"
import type { UserDto } from "@/types/auth.types"

interface Props { user: UserDto }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return { text: "Good morning",   icon: Coffee, emoji: "☀️", accent: "rgba(251,191,36,0.9)"  }
  if (h < 17) return { text: "Good afternoon", icon: Sun,    emoji: "⚡", accent: "rgba(252,211,77,0.9)"  }
  return       { text: "Good evening",          icon: Moon,   emoji: "🌙", accent: "rgba(196,181,253,0.9)" }
}

export default function WelcomeBanner({ user }: Props) {
  const { text, icon: Icon, emoji, accent } = getGreeting()
  const firstName = user.profile?.fullName?.split(" ")[0] ?? "there"
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const isTeacherRole = user.role === "Teacher"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl overflow-hidden"
      style={{ minHeight: 116 }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 animate-gradient"
        style={{
          background: isTeacherRole
            ? "linear-gradient(135deg, #7c3aed 0%, #6d28d9 20%, #2563eb 50%, #0891b2 80%, #0d9488 100%)"
            : "linear-gradient(135deg, #7c3aed 0%, #9333ea 25%, #ec4899 60%, #f59e0b 100%)",
          backgroundSize: "300% 300%",
        }}
      />

      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.08] pointer-events-none" />

      {/* Decorative orbs */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.07, 0.12, 0.07] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.15)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.05, 0.09, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute -bottom-10 right-36 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.12)" }}
      />
      <div
        className="absolute top-3 right-52 w-10 h-10 rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.1)" }}
      />

      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-6 px-7 py-5 flex-wrap">

        {/* Left — avatar + greeting */}
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.06, rotate: 2 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
            className="relative shrink-0"
          >
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden"
              style={{
                boxShadow: "0 0 0 3px rgba(255,255,255,0.32), 0 8px 24px rgba(0,0,0,0.22)",
              }}
            >
              <Avatar
                src={user.profile?.profilePhotoUrl}
                name={user.profile?.fullName}
                size="lg"
                className="w-full h-full"
              />
            </div>
            {/* Online dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
              style={{
                background: "#10b981",
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 0 6px rgba(16,185,129,0.6)",
              }}
            />
          </motion.div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-3.5 h-3.5" style={{ color: accent }} strokeWidth={2} />
              <span
                className="text-[10.5px] font-bold tracking-widest uppercase"
                style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}
              >
                {text}
              </span>
            </div>
            <h1
              className="text-[22px] font-extrabold text-white tracking-tight leading-tight"
              style={{
                textShadow: "0 2px 16px rgba(0,0,0,0.18)",
                letterSpacing: "-0.025em",
              }}
            >
              {emoji} Hello, {firstName}!
            </h1>
            <p
              className="text-[12.5px] mt-0.5 font-medium leading-relaxed"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              {isTeacherRole
                ? "Manage your courses and inspire your students."
                : "Track your progress and stay ahead of deadlines."}
            </p>
          </div>
        </div>

        {/* Right — clock + role badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.22, type: "spring", stiffness: 200, damping: 20 }}
          className="text-right flex flex-col items-end gap-2"
        >
          <div
            className="font-extrabold text-white tabular-nums leading-none"
            style={{
              fontSize: 36,
              textShadow: "0 2px 20px rgba(0,0,0,0.18)",
              letterSpacing: "-0.04em",
            }}
          >
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <p
            className="text-[12px] font-semibold"
            style={{ color: "rgba(255,255,255,0.58)" }}
          >
            {time.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
          </p>
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.28)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            {isTeacherRole
              ? <GraduationCap className="w-3 h-3" style={{ color: accent }} strokeWidth={2.5} />
              : <Sparkles      className="w-3 h-3" style={{ color: accent }} strokeWidth={2.5} />
            }
            <span className="text-[11px] font-bold text-white">{user.role}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
