import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { motion } from "framer-motion"
import { BookOpen, Users, Clock, AlertCircle, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { isTeacher } from "@/utils/roleGuard"
import { useAuthStore } from "@/store/authStore"
import type { DashboardStatsDto } from "../services/dashboardService"

interface Props { stats: DashboardStatsDto }

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { innerText: 0 },
      {
        innerText: value,
        duration: 1.8,
        ease: "power3.out",
        snap: { innerText: 1 },
        onUpdate() {
          if (ref.current)
            ref.current.innerText =
              Math.round(Number(ref.current.innerText)).toString() + suffix
        },
      }
    )
  }, [value, suffix])
  return <span ref={ref}>0{suffix}</span>
}

interface CardDef {
  label: string; sub: string; value: number; suffix?: string
  icon: React.ElementType
  bg: string; iconBg: string; iconColor: string
  numColor: string; labelColor: string; subColor: string
  border: string; shadow: string; arrowColor: string
}

export default function QuickStatsRow({ stats }: Props) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const urgentCard = (value: number, gradOn: string, gradOff: string, shadowOn: string, shadowOff: string) => ({
    bg:         value > 0 ? gradOn  : gradOff,
    iconColor:  value > 0 ? "#ffffff" : "#7c3aed",
    numColor:   value > 0 ? "#ffffff" : "#7c3aed",
    labelColor: value > 0 ? "rgba(255,255,255,0.95)" : "#6d28d9",
    subColor:   value > 0 ? "rgba(255,255,255,0.62)" : "#8b7ec8",
    border:     value > 0 ? "transparent" : "#c4b5fd",
    shadow:     value > 0 ? shadowOn : shadowOff,
    arrowColor: value > 0 ? "rgba(255,255,255,0.5)" : "rgba(124,58,237,0.35)",
    iconBg:     "rgba(255,255,255,0.2)",
  })

  const stdCard = (grad: string, shadow: string) => ({
    bg:         grad,
    iconBg:     "rgba(255,255,255,0.2)",
    iconColor:  "#ffffff",
    numColor:   "#ffffff",
    labelColor: "rgba(255,255,255,0.95)",
    subColor:   "rgba(255,255,255,0.62)",
    border:     "transparent",
    shadow,
    arrowColor: "rgba(255,255,255,0.42)",
  })

  const pending    = stats.pendingJoinRequests ?? 0
  const assignments = stats.pendingAssignments ?? 0
  const attendance  = stats.averageAttendance  ?? 0

  const URGENT_ON_GRAD  = "linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)"
  const URGENT_OFF_GRAD = "linear-gradient(135deg,#ede9fe 0%,#e0f2fe 100%)"

  const cards: CardDef[] = teacher ? [
    { label: "Active Courses",    sub: "courses you manage",    value: stats.totalCourses,    icon: BookOpen,    ...stdCard("linear-gradient(135deg,#7c3aed,#9333ea)", "0 8px 32px rgba(124,58,237,0.42)") },
    { label: "Total Students",    sub: "enrolled across courses", value: stats.totalStudents ?? 0, icon: Users, ...stdCard("linear-gradient(135deg,#0ea5e9,#06b6d4)", "0 8px 32px rgba(6,182,212,0.42)")  },
    {
      label: pending > 0 ? "Pending Requests" : "Join Requests",
      sub: "awaiting approval", value: pending, icon: AlertCircle,
      ...urgentCard(pending, URGENT_ON_GRAD, URGENT_OFF_GRAD, "0 8px 32px rgba(245,158,11,0.38)", "0 4px 16px rgba(124,58,237,0.1)"),
    },
    { label: "Upcoming Events",   sub: "scheduled this week",   value: stats.upcomingEvents, icon: Calendar,    ...stdCard("linear-gradient(135deg,#ec4899,#8b5cf6)", "0 8px 32px rgba(236,72,153,0.38)") },
  ] : [
    { label: "My Courses",      sub: "currently enrolled",      value: stats.totalCourses,    icon: BookOpen,   ...stdCard("linear-gradient(135deg,#7c3aed,#9333ea)", "0 8px 32px rgba(124,58,237,0.42)") },
    {
      label: "Pending Tasks",
      sub: "assignments due", value: assignments, icon: Clock,
      ...urgentCard(assignments, URGENT_ON_GRAD, URGENT_OFF_GRAD, "0 8px 32px rgba(245,158,11,0.38)", "0 4px 16px rgba(124,58,237,0.1)"),
    },
    {
      label: "Avg. Attendance", sub: "across all courses", value: attendance, suffix: "%", icon: TrendingUp,
      ...(attendance >= 75
        ? stdCard("linear-gradient(135deg,#10b981,#059669)", "0 8px 32px rgba(16,185,129,0.42)")
        : stdCard(URGENT_ON_GRAD, "0 8px 32px rgba(245,158,11,0.38)")
      ),
    },
    { label: "Upcoming",        sub: "events & deadlines",      value: stats.upcomingEvents, icon: Calendar,   ...stdCard("linear-gradient(135deg,#ec4899,#8b5cf6)", "0 8px 32px rgba(236,72,153,0.38)") },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.44, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -5, scale: 1.035, transition: { duration: 0.18 } }}
          whileTap={{ scale: 0.975 }}
          className="relative rounded-2xl p-5 overflow-hidden cursor-default"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            boxShadow: card.shadow,
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute -top-5 -right-5 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.09)" }}
          />
          <div
            className="absolute -bottom-8 -left-3 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: "rgba(255,255,255,0.055)" }}
          />
          {/* Inner top shimmer */}
          <div
            className="absolute top-0 left-4 right-4 h-px pointer-events-none"
            style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)" }}
          />

          {/* Icon row */}
          <div className="relative z-10 flex items-start justify-between mb-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: card.iconBg }}
            >
              <card.icon
                className="w-5 h-5"
                style={{ color: card.iconColor }}
                strokeWidth={2.5}
              />
            </div>
            <ArrowUpRight
              className="w-4 h-4 mt-0.5"
              style={{ color: card.arrowColor }}
              strokeWidth={2}
            />
          </div>

          {/* Numbers */}
          <div className="relative z-10">
            <p
              className="text-[38px] font-extrabold leading-none tracking-tight"
              style={{ color: card.numColor, letterSpacing: "-0.04em" }}
            >
              <AnimatedCounter value={card.value} suffix={card.suffix} />
            </p>
            <p
              className="text-[13px] font-bold mt-2.5"
              style={{ color: card.labelColor }}
            >
              {card.label}
            </p>
            <p
              className="text-[11.5px] mt-0.5 font-medium"
              style={{ color: card.subColor }}
            >
              {card.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
