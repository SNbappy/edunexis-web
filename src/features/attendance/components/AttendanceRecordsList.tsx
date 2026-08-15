import { Trash2, Pencil, ClipboardCheck } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"
import { ICON, ICON_STROKE, FOCUS, SURFACE } from "@/components/ui/appTokens"
import { ATTENDANCE_MIN_PERCENT } from "@/config/constants"
import { formatDate, getDayName } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"
import type { AttendanceSessionDto } from "@/types/attendance.types"

interface AttendanceRecordsListProps {
  sessions: AttendanceSessionDto[]
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onView?: (id: string) => void
  /** Shown in the empty state so a teacher knows the roll is ready. */
  totalStudents?: number
}

function getStats(s: AttendanceSessionDto) {
  const total = s.records.length
  const present = s.records.filter(r => r.status === "Present").length
  const absent = s.records.filter(r => r.status === "Absent").length
  const unmarked = s.records.filter(r => r.status === "Unmarked").length
  const pct = total > 0 ? Math.round((present / total) * 100) : 0
  return { total, present, absent, unmarked, pct }
}

/**
 * Session list.
 *
 * One divided table, not a stack of shadowed cards. Each session was a separate
 * elevated card with a coloured date tile, a left accent stripe, a bottom
 * progress bar and a hover lift — around 120px per row, so five sessions filled
 * the screen. A term has thirty. Rows are ~56px now and scan vertically, which
 * is what you want when the question is "did I take attendance on the 12th?".
 *
 * Colour is reserved for the one thing it can mean here: a session below the
 * 75% requirement. The old four-band scale coloured every row, so nothing stood
 * out and a 74% looked much like an 89%.
 */
export default function AttendanceRecordsList({
  sessions, onDelete, onEdit, totalStudents,
}: AttendanceRecordsListProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        variant="panel"
        icon={<ClipboardCheck strokeWidth={ICON_STROKE} />}
        title="No attendance records yet"
        description={
          totalStudents && totalStudents > 0
            ? `Take attendance for today's class to get started. ${totalStudents} student${totalStudents === 1 ? "" : "s"} enrolled.`
            : "Take attendance for today's class to get started."
        }
      />
    )
  }

  return (
    <div className={cn(SURFACE.card, "overflow-hidden")}>
      <ul className="divide-y divide-border">
        {sessions.map((session, i) => {
          const { total, present, absent, unmarked, pct } = getStats(session)
          const sessionNumber = sessions.length - i
          const low = pct < ATTENDANCE_MIN_PERCENT

          return (
            <li
              key={session.id}
              className="group flex items-center gap-3 px-3 py-2.5 transition-colors duration-120 hover:bg-muted/50 sm:gap-4 sm:px-4"
            >
              {/* Date — one line, tabular, so the column aligns down the list. */}
              <div className="w-[74px] shrink-0">
                <p className="font-display text-[13.5px] font-bold leading-tight tabular-nums text-foreground">
                  {formatDate(session.date, "dd MMM")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {getDayName(session.date).slice(0, 3)}
                </p>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {session.topic || `Session ${sessionNumber}`}
                </p>
                <p className="mt-0.5 truncate text-[11.5px] text-muted-foreground">
                  {present} present · {absent} absent
                  {unmarked > 0 && ` · ${unmarked} unmarked`}
                  {` · ${total} total`}
                </p>
              </div>

              <span
                className={cn(
                  "shrink-0 font-display text-[14px] font-bold tabular-nums",
                  low ? "text-warning" : "text-foreground",
                )}
                title={low ? `Below the ${ATTENDANCE_MIN_PERCENT}% requirement` : undefined}
              >
                {pct}%
              </span>

              {/* Actions stay in the layout at all times and only fade in, so
                  rows never reflow under the pointer. */}
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-120 focus-within:opacity-100 group-hover:opacity-100">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(session.id)}
                    aria-label={`Edit session on ${formatDate(session.date, "dd MMM")}`}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-120 hover:bg-muted hover:text-foreground",
                      FOCUS,
                    )}
                  >
                    <Pencil className={ICON.xs} strokeWidth={ICON_STROKE} />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(session.id)}
                    aria-label={`Delete session on ${formatDate(session.date, "dd MMM")}`}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-120 hover:bg-destructive-soft hover:text-destructive",
                      FOCUS,
                    )}
                  >
                    <Trash2 className={ICON.xs} strokeWidth={ICON_STROKE} />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
