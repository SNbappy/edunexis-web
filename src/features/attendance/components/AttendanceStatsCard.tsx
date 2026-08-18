import { ClipboardList } from "lucide-react"
import { StatRing, TrendBars, type TrendPoint } from "@/components/ui/charts"
import { SURFACE, TEXT } from "@/components/ui/appTokens"
import { ATTENDANCE_MIN_PERCENT } from "@/config/constants"
import { formatDate } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"

interface AttendanceStatsCardProps {
  totalSessions: number
  averageAttendance: number
  totalStudents?: number
  lastSessionDate?: string
  /** Raw sessions, so the card can draw the term's shape. */
  sessions?: any[]
}

/**
 * Attendance summary.
 *
 * The number alone never answered the question a teacher actually has,
 * which is not "what is the average" but "is this class drifting". Ten
 * sessions listed as ten identical text rows hid that completely. The
 * trend puts the term's shape next to the headline figure, with the 75%
 * requirement drawn on it, so a run of bad weeks is visible at a glance.
 */
export default function AttendanceStatsCard({
  totalSessions, averageAttendance, totalStudents, sessions = [],
}: AttendanceStatsCardProps) {
  if (totalSessions === 0) {
    return (
      <div className="flex items-center gap-3.5 rounded-2xl border border-dashed border-border bg-card/40 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-strong text-muted-foreground">
          <ClipboardList className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-[14px] font-bold text-foreground">
            No attendance taken yet
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">
            Take your first session to start tracking
            {totalStudents !== undefined && totalStudents > 0
              ? `. ${totalStudents} student${totalStudents === 1 ? "" : "s"} enrolled.`
              : "."}
          </p>
        </div>
      </div>
    )
  }

  const below = averageAttendance < ATTENDANCE_MIN_PERCENT

  /* Oldest first, so the trend reads left-to-right like a timeline. The
     session list above is newest-first, which is right for "what did I
     just do" but backwards for showing a term. */
  const points: TrendPoint[] = [...sessions]
    .filter(s => Array.isArray(s.records) && s.records.length > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(s => {
      const present = s.records.filter((r: any) => r.status === "Present").length
      const pct = Math.round((present / s.records.length) * 100)
      return {
        label: formatDate(s.date, "dd MMM"),
        value: pct,
        detail: `${pct}% (${present} of ${s.records.length})`,
      }
    })

  return (
    <div className={cn(SURFACE.card, "flex flex-wrap items-center gap-x-8 gap-y-5 p-4 sm:flex-nowrap")}>
      {/* Headline: the ring gives the number presence a bare figure lacked. */}
      <div className="flex shrink-0 items-center gap-3.5">
        <StatRing value={averageAttendance} tone={below ? "warning" : "success"} />
        <div>
          <p className="text-[12.5px] font-semibold text-foreground">Average attendance</p>
          <p className={cn(TEXT.muted, "mt-1.5")}>
            <span className="font-semibold text-foreground">{totalSessions}</span>{" "}
            {totalSessions === 1 ? "session" : "sessions"}
            {totalStudents !== undefined && (
              <>
                {" · "}
                <span className="font-semibold text-foreground">{totalStudents}</span>{" "}
                {totalStudents === 1 ? "student" : "students"}
              </>
            )}
          </p>
        </div>
      </div>

      {/* Capped rather than stretched: across a full-width card ten bars
          become 110px slabs that read as a wall instead of a trend. */}
      {points.length > 1 && (
        <div className="min-w-[260px] max-w-[560px] flex-1">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <p className={TEXT.eyebrow}>Across the term</p>
            {/* Says what the two bar colours mean. Without it the amber bars
                read as "highlighted" rather than "below the requirement". */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary/55" aria-hidden />
                {ATTENDANCE_MIN_PERCENT}% or above
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-warning" aria-hidden />
                Below {ATTENDANCE_MIN_PERCENT}%
              </span>
            </div>
          </div>
          <TrendBars
            points={points}
            threshold={ATTENDANCE_MIN_PERCENT}
            height={56}
            showLabels
          />
        </div>
      )}
    </div>
  )
}
