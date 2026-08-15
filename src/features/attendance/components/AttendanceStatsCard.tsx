import { ClipboardList } from "lucide-react"
import { SURFACE } from "@/components/ui/appTokens"
import { ATTENDANCE_MIN_PERCENT } from "@/config/constants"
import { cn } from "@/utils/cn"

interface AttendanceStatsCardProps {
  totalSessions: number
  averageAttendance: number
  totalStudents?: number
  lastSessionDate?: string
}

/**
 * Attendance summary.
 *
 * This was a 90%-high hero card with an animated count-up and a progress bar,
 * followed by three more tiles that restated the same three numbers in
 * different colours — the average appeared twice and the session count twice,
 * in ~330px, above the session list people actually came for.
 *
 * It is one row now. The average is the only figure worth emphasis, and it is
 * coloured only against the 75% requirement — the old card had four colour
 * bands and a mood caption ("Excellent class engagement") for a number whose
 * one real threshold is whether students can sit the exam.
 */
export default function AttendanceStatsCard({
  totalSessions, averageAttendance, totalStudents,
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
  const pct   = Math.min(Math.max(averageAttendance, 0), 100)

  return (
    <div className={cn(SURFACE.card, "flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5")}>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display text-[26px] font-extrabold leading-none tabular-nums",
            below ? "text-warning" : "text-success",
          )}
        >
          {averageAttendance.toFixed(1)}%
        </span>
        <span className="text-[12.5px] text-muted-foreground">average attendance</span>
      </div>

      {/* The bar is the only place the 75% requirement is visible, so it is
          marked on the track rather than left implicit in the colour. */}
      <div className="relative h-1.5 min-w-[140px] flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", below ? "bg-warning" : "bg-success")}
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute inset-y-0 w-px bg-border-strong"
          style={{ left: `${ATTENDANCE_MIN_PERCENT}%` }}
          title={`${ATTENDANCE_MIN_PERCENT}% required`}
          aria-hidden
        />
      </div>

      <div className="flex items-center gap-4 text-[12.5px] text-muted-foreground">
        <span>
          <span className="font-display font-bold tabular-nums text-foreground">{totalSessions}</span>{" "}
          {totalSessions === 1 ? "session" : "sessions"}
        </span>
        {totalStudents !== undefined && (
          <span>
            <span className="font-display font-bold tabular-nums text-foreground">{totalStudents}</span>{" "}
            {totalStudents === 1 ? "student" : "students"}
          </span>
        )}
      </div>
    </div>
  )
}
