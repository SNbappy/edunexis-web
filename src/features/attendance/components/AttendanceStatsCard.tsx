import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Users, Calendar, Activity } from "lucide-react"
import gsap from "gsap"
import { useThemeStore } from "@/store/themeStore"

interface Props {
  totalSessions:     number
  averageAttendance: number
  totalStudents?:    number
  lastSessionDate?:  string
}

export default function AttendanceStatsCard({ totalSessions, averageAttendance, totalStudents }: Props) {
  const { dark } = useThemeStore()
  const barRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  const barColor = averageAttendance >= 90 ? "#059669"
    : averageAttendance >= 75 ? "#6366f1"
    : averageAttendance >= 60 ? "#d97706"
    : "#ef4444"

  const statusText = averageAttendance >= 90 ? "Excellent - keep it up!"
    : averageAttendance >= 75 ? "Good standing"
    : averageAttendance >= 60 ? "At risk - below 75%"
    : "Critical - below 60%"

  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current, { width: "0%" },
        { width: `${Math.min(averageAttendance, 100)}%`, duration: 1.4, ease: "power3.out", delay: 0.3 })
    }
    if (numRef.current) {
      gsap.fromTo({ val: 0 }, { val: averageAttendance }, {
        duration: 1.2, ease: "power3.out", delay: 0.3,
        onUpdate: function() { if (numRef.current) numRef.current.textContent = this.targets()[0].val.toFixed(1) + "%" }
      })
    }
  }, [averageAttendance])

  const cardBg  = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur    = "blur(20px)"
  const border  = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain= dark ? "#e2e8f8" : "#111827"
  const textSub = dark ? "#8896c8" : "#6b7280"
  const barBg   = dark ? "rgba(255,255,255,0.07)" : "#f3f4f6"

  const STATS = [
    { label: "Total Sessions", value: totalSessions,              icon: Calendar, color: "#6366f1", lightBg: "#eef2ff", darkBg: "rgba(99,102,241,0.12)", border: "#c7d2fe", darkBorder: "rgba(99,102,241,0.25)" },
    { label: "Avg. Attendance", value: `${averageAttendance.toFixed(1)}%`, icon: averageAttendance >= 75 ? TrendingUp : TrendingDown, color: barColor, lightBg: `${barColor}10`, darkBg: `${barColor}18`, border: `${barColor}30`, darkBorder: `${barColor}35` },
    ...(totalStudents !== undefined ? [{ label: "Total Students", value: totalStudents, icon: Users, color: "#0891b2", lightBg: "#ecfeff", darkBg: "rgba(8,145,178,0.12)", border: "#a5f3fc", darkBorder: "rgba(6,182,212,0.25)" }] : []),
  ]

  return (
    <div className="space-y-4 mb-2">
      {/* Main rate bar */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${dark ? `${barColor}30` : `${barColor}25`}` }}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl"
          style={{ background: `linear-gradient(90deg, transparent, ${barColor}, transparent)` }} />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: dark ? `${barColor}18` : `${barColor}10`, border: `1px solid ${barColor}28` }}>
              <Activity style={{ width: 18, height: 18, color: barColor }} strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: textMain }}>Overall Attendance Rate</p>
              <p className="text-[12px]" style={{ color: textSub }}>{statusText}</p>
            </div>
          </div>
          <span ref={numRef} className="text-[28px] font-extrabold" style={{ color: barColor }}>0%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: barBg }}>
          <div ref={barRef} className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, boxShadow: `0 0 8px ${barColor}60`, width: 0 }} />
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STATS.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.07 + 0.1 }}
            whileHover={{ y: -3, boxShadow: `0 8px 24px ${c.color}22` }}
            className="rounded-2xl p-4"
            style={{ background: dark ? c.darkBg : c.lightBg, border: `1px solid ${dark ? c.darkBorder : c.border}` }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: dark ? `${c.color}18` : `${c.color}15` }}>
              <c.icon style={{ width: 16, height: 16, color: c.color }} strokeWidth={2} />
            </div>
            <p className="text-[22px] font-extrabold leading-none" style={{ color: textMain }}>{c.value}</p>
            <p className="text-[11px] font-semibold mt-1" style={{ color: textSub }}>{c.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
