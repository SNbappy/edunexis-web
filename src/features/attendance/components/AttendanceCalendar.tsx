import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, getDay, addMonths, subMonths, parseISO, isValid,
} from "date-fns"
import { cn } from "@/utils/cn"
import type { AttendanceSessionDto } from "@/types/attendance.types"

interface Props {
  sessions: AttendanceSessionDto[]
  onSelectDate?: (date: string) => void
}

function safeIso(dateStr: string): string {
  const d = dateStr.includes("T") ? parseISO(dateStr) : parseISO(dateStr + "T00:00:00")
  return isValid(d) ? format(d, "yyyy-MM-dd") : dateStr
}

function getSessionPct(s: AttendanceSessionDto) {
  const total = s.records.length
  if (!total) return 0
  return Math.round((s.records.filter(r => r.status === "Present").length / total) * 100)
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type Tier = "high" | "good" | "ok" | "low"

function tierOf(pct: number): Tier {
  if (pct >= 90) return "high"
  if (pct >= 75) return "good"
  if (pct >= 60) return "ok"
  return "low"
}

const TIER_DOT: Record<Tier, string> = {
  high: "bg-emerald-500",
  good: "bg-teal-500",
  ok: "bg-amber-500",
  low: "bg-red-500",
}

const TIER_CELL: Record<Tier, string> = {
  high: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-900/60 text-foreground",
  good: "bg-teal-50 dark:bg-teal-950/30 border-teal-200/70 dark:border-teal-900/60 text-foreground",
  ok: "bg-amber-50 dark:bg-amber-950/30 border-amber-200/70 dark:border-amber-900/60 text-foreground",
  low: "bg-red-50 dark:bg-red-950/30 border-red-200/70 dark:border-red-900/60 text-foreground",
}

const LEGEND: { tier: Tier; label: string }[] = [
  { tier: "high", label: "≥90%" },
  { tier: "good", label: "≥75%" },
  { tier: "ok", label: "≥60%" },
  { tier: "low", label: "<60%" },
]

export default function AttendanceCalendar({ sessions, onSelectDate }: Props) {
  const [current, setCurrent] = useState(new Date())

  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  const sessionMap = new Map<string, AttendanceSessionDto>()
  sessions.forEach(s => sessionMap.set(safeIso(s.date), s))

  const monthKey = format(current, "yyyy-MM")
  const monthSessions = sessions.filter(s => safeIso(s.date).startsWith(monthKey))
  const avgPct = monthSessions.length
    ? Math.round(monthSessions.reduce((acc, s) => acc + getSessionPct(s), 0) / monthSessions.length)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
            <CalendarIcon className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-display text-[15px] font-bold text-foreground leading-tight">
              {format(current, "MMMM yyyy")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {avgPct !== null
                ? `${monthSessions.length} session${monthSessions.length !== 1 ? "s" : ""} · avg ${avgPct}%`
                : "No sessions this month"}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => setCurrent(subMonths(current, 1))}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <button
            onClick={() => setCurrent(new Date())}
            className="h-8 px-3 rounded-lg border border-border bg-card text-[11px] font-semibold text-foreground hover:bg-muted transition-colors focus-ring"
          >
            Today
          </button>
          <button
            onClick={() => setCurrent(addMonths(current, 1))}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-ring"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div
            key={d}
            className="text-center text-[10px] font-semibold uppercase tracking-wider py-1.5 text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((day, idx) => {
          const iso = format(day, "yyyy-MM-dd")
          const session = sessionMap.get(iso)
          const has = !!session
          const pct = has ? getSessionPct(session!) : 0
          const tier = has ? tierOf(pct) : null
          const today = isToday(day)

          return (
            <motion.button
              key={iso}
              whileHover={has ? { scale: 1.05 } : {}}
              whileTap={has ? { scale: 0.96 } : {}}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.006, duration: 0.18 }}
              onClick={() => has && onSelectDate?.(iso)}
              disabled={!has}
              className={cn(
                "relative flex flex-col items-center justify-center h-10 w-full rounded-lg text-[12px] font-semibold border transition-colors",
                today && !has && "border-teal-500/60 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300",
                today && has && "ring-2 ring-teal-500/50 ring-offset-1 ring-offset-card",
                !today && !has && "border-transparent text-muted-foreground/50",
                has && tier && TIER_CELL[tier],
                has ? "cursor-pointer" : "cursor-default",
              )}
              title={has ? `${session!.topic || "Class"} — ${pct}% attendance` : undefined}
            >
              <span>{day.getDate()}</span>
              {has && tier && (
                <span className={cn(
                  "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                  TIER_DOT[tier],
                )} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-4 flex-wrap border-t border-border">
        {LEGEND.map(l => (
          <div key={l.label} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className={cn("w-2 h-2 rounded-full", TIER_DOT[l.tier])} />
            {l.label}
          </div>
        ))}
      </div>
    </motion.div>
  )
}