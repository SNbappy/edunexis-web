import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { TrendingUp, TrendingDown, Users, Calendar, Activity, ClipboardList } from "lucide-react"

interface AttendanceStatsCardProps {
  totalSessions: number
  averageAttendance: number
  totalStudents?: number
  lastSessionDate?: string
}

interface StatTone {
  text: string
  bg: string
  border: string
}

function getAccent(avg: number): { bar: string; text: string; bg: string; ring: string; status: string } {
  if (avg >= 90) return {
    bar: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    ring: "border-emerald-200 dark:border-emerald-800",
    status: "Excellent class engagement",
  }
  if (avg >= 75) return {
    bar: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    ring: "border-teal-200 dark:border-teal-800",
    status: "Healthy attendance",
  }
  if (avg >= 60) return {
    bar: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    ring: "border-amber-200 dark:border-amber-800",
    status: "Below 75% target",
  }
  return {
    bar: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/40",
    ring: "border-red-200 dark:border-red-800",
    status: "Significantly below target",
  }
}

export default function AttendanceStatsCard({
  totalSessions, averageAttendance, totalStudents,
}: AttendanceStatsCardProps) {
  const accent = getAccent(averageAttendance)

  /* Animated count-up using Framer Motion (no GSAP). */
  const animatedValue = useMotionValue(0)
  const spring = useSpring(animatedValue, { duration: 1100, bounce: 0 })
  const display = useTransform(spring, v => v.toFixed(1) + "%")
  const [shownText, setShownText] = useState("0.0%")

  useEffect(() => {
    animatedValue.set(averageAttendance)
    const unsub = display.on("change", v => setShownText(v))
    return () => unsub()
  }, [averageAttendance, animatedValue, display])

  /* Animated bar width */
  const barWidth = useMotionValue(0)
  const barSpring = useSpring(barWidth, { duration: 1100, bounce: 0 })
  const barWidthPct = useTransform(barSpring, v => v + "%")

  useEffect(() => {
    barWidth.set(Math.min(averageAttendance, 100))
  }, [averageAttendance, barWidth])

  /* Empty state — no sessions taken yet */
  if (totalSessions === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dashed border-border bg-card p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
            <ClipboardList className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[14px] font-bold text-foreground">
              No attendance taken yet
            </p>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              Take your first session to start tracking class attendance
              {totalStudents !== undefined && totalStudents > 0
                ? `. ${totalStudents} student${totalStudents === 1 ? "" : "s"} enrolled.`
                : "."}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main rate card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={"relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm " + accent.ring}
      >
        <div className={"absolute inset-x-0 top-0 h-[2px] " + accent.bar} aria-hidden />

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + accent.bg + " " + accent.text}>
              <Activity className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <p className="font-display text-[14px] font-bold text-foreground">
                Overall attendance rate
              </p>
              <p className="text-[12px] text-muted-foreground">
                {accent.status}
              </p>
            </div>
          </div>

          <span className={"font-display text-[26px] font-extrabold tabular-nums " + accent.text}>
            {shownText}
          </span>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={"h-full rounded-full " + accent.bar}
            style={{ width: barWidthPct }}
          />
        </div>
      </motion.div>

      {/* Sub-stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          index={0}
          icon={Calendar}
          label="Total sessions"
          value={String(totalSessions)}
          tone={{
            text: "text-teal-700 dark:text-teal-300",
            bg: "bg-teal-50 dark:bg-teal-950/40",
            border: "border-teal-200 dark:border-teal-800",
          }}
        />

        <StatTile
          index={1}
          icon={averageAttendance >= 75 ? TrendingUp : TrendingDown}
          label="Avg. attendance"
          value={averageAttendance.toFixed(1) + "%"}
          tone={{
            text: accent.text,
            bg: accent.bg,
            border: accent.ring,
          }}
        />

        {totalStudents !== undefined && (
          <StatTile
            index={2}
            icon={Users}
            label="Total students"
            value={String(totalStudents)}
            tone={{
              text: "text-violet-700 dark:text-violet-300",
              bg: "bg-violet-50 dark:bg-violet-950/40",
              border: "border-violet-200 dark:border-violet-800",
            }}
          />
        )}
      </div>
    </div>
  )
}

interface StatTileProps {
  index: number
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
  tone: StatTone
}

function StatTile({ index, icon: Icon, label, value, tone }: StatTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={"rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md " + tone.border}
    >
      <div className={"mb-3 flex h-8 w-8 items-center justify-center rounded-lg " + tone.bg + " " + tone.text}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <p className={"font-display text-[22px] font-extrabold leading-none tabular-nums " + tone.text}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
        {label}
      </p>
    </motion.div>
  )
}