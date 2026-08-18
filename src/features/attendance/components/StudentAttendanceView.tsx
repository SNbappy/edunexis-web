import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react"
import { useMyAttendance } from "../hooks/useAttendanceStats"

interface StudentAttendanceViewProps { courseId: string }

interface ToneClasses {
  ring: string
  text: string
  bar: string
  bg: string
  border: string
}

/**
 * Colour band for an attendance percentage.
 *
 * Green at 75 and above, amber from 50 to 74, red below 50 — the same ramp the
 * gradebook and the PDF export use, so one figure never changes meaning between
 * two screens.
 *
 * Deliberately returns no wording. This used to carry "Good standing", "At risk"
 * and "Critical", plus a line telling a student how many sessions they still had
 * to attend. That is the platform editorialising on someone's record: the number
 * and its colour say everything the reader needs, and what to do about it is not
 * the software's call.
 */
function getTone(pct: number): ToneClasses {
  if (pct >= 75) return {
    ring: "stroke-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bar: "bg-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  }
  if (pct >= 50) return {
    ring: "stroke-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
  }
  return {
    ring: "stroke-red-500",
    text: "text-red-700 dark:text-red-300",
    bar: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
  }
}

export default function StudentAttendanceView({ courseId }: StudentAttendanceViewProps) {
  const { data: summary, isLoading } = useMyAttendance(courseId)
  const pct = summary?.attendancePercent ?? 0
  const tone = getTone(pct)

  /* Animated count + bar (Framer Motion, no GSAP) */
  const animatedNum = useMotionValue(0)
  const numSpring = useSpring(animatedNum, { duration: 1200, bounce: 0 })
  const numText = useTransform(numSpring, v => Math.round(v) + "%")
  const [shownNum, setShownNum] = useState("0%")

  const barWidth = useMotionValue(0)
  const barSpring = useSpring(barWidth, { duration: 1200, bounce: 0 })
  const barWidthPct = useTransform(barSpring, v => v + "%")

  const ringOffset = useMotionValue(2 * Math.PI * 44)
  const ringSpring = useSpring(ringOffset, { duration: 1200, bounce: 0 })

  useEffect(() => {
    if (!summary) return
    animatedNum.set(pct)
    barWidth.set(Math.min(pct, 100))
    const circ = 2 * Math.PI * 44
    ringOffset.set(circ - (pct / 100) * circ)
    const unsub = numText.on("change", v => setShownNum(v))
    return () => unsub()
  }, [summary, pct, animatedNum, barWidth, ringOffset, numText])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-border bg-muted/40"
          />
        ))}
      </div>
    )
  }

  if (!summary) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300 bg-teal-100 dark:border-teal-700 dark:bg-teal-900/60">
          <Clock className="h-7 w-7 text-teal-700 dark:text-teal-200" strokeWidth={1.75} />
        </div>
        <p className="mt-5 font-display text-[14px] font-bold text-foreground">
          No attendance records yet
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Your attendance will appear here once the teacher takes a session.
        </p>
      </motion.div>
    )
  }

  const STATS = [
    { label: "Present", value: summary.presentCount, icon: CheckCircle2, tone: "emerald" as const },
    { label: "Absent", value: summary.absentCount, icon: XCircle, tone: "red" as const },
    { label: "Unmarked", value: summary.unmarkedCount, icon: Clock, tone: "amber" as const },
    { label: "Total", value: summary.totalSessions, icon: TrendingUp, tone: "teal" as const },
  ]

  const circumference = 2 * Math.PI * 44

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Hero rate card */}
      <div className={"relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm " + tone.border}>
        <div className={"absolute inset-x-0 top-0 h-[2px] " + tone.bar} aria-hidden />

        <div className="flex items-center gap-6">
          {/* SVG ring */}
          <div className="relative shrink-0">
            <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
              <circle
                cx="55" cy="55" r="44"
                fill="none"
                className="stroke-muted"
                strokeWidth="8"
              />
              <motion.circle
                cx="55" cy="55" r="44"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                style={{ strokeDashoffset: ringSpring }}
                className={tone.ring}
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className={"font-display text-2xl font-extrabold tabular-nums " + tone.text}>
                {shownNum}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Rate
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="mb-3 font-display text-lg font-extrabold text-foreground">
              Attendance rate
            </p>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <motion.div
                className={"h-full rounded-full " + tone.bar}
                style={{ width: barWidthPct }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {summary.presentCount} of {summary.totalSessions} sessions attended
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map((s, i) => {
          const tileTone =
            s.tone === "emerald" ? { text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800" }
              : s.tone === "red" ? { text: "text-red-700 dark:text-red-300", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-800" }
                : s.tone === "amber" ? { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800" }
                  : { text: "text-teal-700 dark:text-teal-300", bg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-200 dark:border-teal-800" }
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.06 + 0.1 }}
              whileHover={{ y: -2 }}
              className={"rounded-2xl border bg-card p-4 shadow-sm " + tileTone.border}
            >
              <div className={"mb-3 flex h-8 w-8 items-center justify-center rounded-lg " + tileTone.bg + " " + tileTone.text}>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <p className={"font-display text-2xl font-extrabold leading-none tabular-nums " + tileTone.text}>
                {s.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
                {s.label}
              </p>
            </motion.div>
          )
        })}
      </div>

    </motion.div>
  )
}