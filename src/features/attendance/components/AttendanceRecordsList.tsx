import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Users, CheckCircle2, XCircle, HelpCircle,
  Trash2, Pencil, ClipboardCheck,
} from "lucide-react"
import { formatDate, getDayName } from "@/utils/dateUtils"
import type { AttendanceSessionDto } from "@/types/attendance.types"

interface AttendanceRecordsListProps {
  sessions: AttendanceSessionDto[]
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onView?: (id: string) => void
}

interface SessionStats {
  total: number
  present: number
  absent: number
  unmarked: number
  pct: number
}

function getStats(s: AttendanceSessionDto): SessionStats {
  const total = s.records.length
  const present = s.records.filter(r => r.status === "Present").length
  const absent = s.records.filter(r => r.status === "Absent").length
  const unmarked = s.records.filter(r => r.status === "Unmarked").length
  const pct = total > 0 ? Math.round((present / total) * 100) : 0
  return { total, present, absent, unmarked, pct }
}

interface ToneClasses {
  bar: string
  text: string
  bg: string
  border: string
}

function getTone(pct: number): ToneClasses {
  if (pct >= 90) return {
    bar: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
  }
  if (pct >= 75) return {
    bar: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-200 dark:border-teal-800",
  }
  if (pct >= 60) return {
    bar: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-200 dark:border-amber-800",
  }
  return {
    bar: "bg-red-500",
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
  }
}

export default function AttendanceRecordsList({
  sessions, onDelete, onEdit,
}: AttendanceRecordsListProps) {
  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/60">
          <ClipboardCheck className="h-7 w-7 text-emerald-700 dark:text-emerald-200" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 font-display text-[16px] font-bold text-foreground">
          No attendance records yet
        </h3>
        <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
          Take attendance for today's class to get started.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {sessions.map((session, i) => {
          const { total, present, absent, unmarked, pct } = getStats(session)
          const sessionNumber = sessions.length - i
          const tone = getTone(pct)

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
              whileHover={{ y: -2 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-teal-200 dark:hover:border-teal-800"
            >
              {/* Left accent stripe */}
              <div className={"absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full " + tone.bar} aria-hidden />

              {/* Bottom progress bar */}
              <motion.div
                className={"absolute bottom-0 left-0 h-[2px] " + tone.bar + " opacity-50"}
                initial={{ width: 0 }}
                whileInView={{ width: pct + "%" }}
                transition={{ duration: 1, ease: "circOut", delay: i * 0.04 }}
                viewport={{ once: true }}
              />

              <div className="flex items-center gap-4 px-5 py-4">
                {/* Date block */}
                <div className={"w-[62px] shrink-0 rounded-xl border p-2 text-center " + tone.bg + " " + tone.border}>
                  <p className={"text-[10px] font-bold uppercase " + tone.text}>
                    {getDayName(session.date).slice(0, 3)}
                  </p>
                  <p className="font-display text-[20px] font-extrabold leading-tight text-foreground">
                    {formatDate(session.date, "dd")}
                  </p>
                  <p className="text-[10px] font-semibold text-muted-foreground">
                    {formatDate(session.date, "MMM")}
                  </p>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-bold text-foreground">
                      Session {sessionNumber}
                      {session.topic ? " — " + session.topic : ""}
                    </p>
                    <span className={"inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold tabular-nums " + tone.bg + " " + tone.border + " " + tone.text}>
                      {pct}%
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11.5px]">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      {present} Present
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-red-700 dark:text-red-300">
                      <XCircle className="h-3 w-3" />
                      {absent} Absent
                    </span>
                    {unmarked > 0 && (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                        <HelpCircle className="h-3 w-3" />
                        {unmarked} Unmarked
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {total} Total
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {onEdit && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(session.id)}
                      aria-label="Edit session"
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-teal-700 transition-colors hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-950/40"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                  {onDelete && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(session.id)}
                      aria-label="Delete session"
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}