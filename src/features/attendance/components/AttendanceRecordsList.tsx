import { Trash2, Pencil, ClipboardCheck } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"
import { ICON, ICON_STROKE, FOCUS, SURFACE } from "@/components/ui/appTokens"
import { ATTENDANCE_MIN_PERCENT } from "@/config/constants"
import { formatDate, getDayName } from "@/utils/dateUtils"
import RowMenu from "@/components/ui/RowMenu"
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
    <div className={SURFACE.card}>
      <ul className="divide-y divide-border">
        {sessions.map((session, i) => {
          const { total, present, absent, unmarked, pct } = getStats(session)
          const sessionNumber = sessions.length - i
          const low = pct < ATTENDANCE_MIN_PERCENT

          return (
            <li
              key={session.id}
              // The whole row opens the register. Reaching for a 32px pencil
              // that only appeared on hover was the slowest possible way to do
              // the most common thing on this screen — and impossible on touch.
              role={onEdit ? "button" : undefined}
              tabIndex={onEdit ? 0 : undefined}
              onClick={onEdit ? () => onEdit(session.id) : undefined}
              onKeyDown={
                onEdit
                  ? e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onEdit(session.id)
                      }
                    }
                  : undefined
              }
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 transition-colors duration-120 hover:bg-muted/50 sm:gap-4 sm:px-4",
                i === 0 && "rounded-t-2xl",
                i === sessions.length - 1 && "rounded-b-2xl",
                onEdit && "cursor-pointer",
                onEdit && FOCUS,
              )}
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
                  pct >= 75
                    ? "text-emerald-700 dark:text-emerald-400"
                    : pct >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {pct}%
              </span>

              {/* One always-visible menu rather than two icons that appeared on
                  hover. stopPropagation so opening it does not also open the
                  register underneath. */}
              {(onEdit || onDelete) && (
                <div className="relative z-10" onClick={e => e.stopPropagation()}>
                  <RowMenu
                    label={`Actions for the session on ${formatDate(session.date, "dd MMM")}`}
                    items={[
                      ...(onEdit
                        ? [{
                            label: "Edit attendance",
                            icon: <Pencil className={ICON.xs} strokeWidth={ICON_STROKE} />,
                            onSelect: () => onEdit(session.id),
                          }]
                        : []),
                      ...(onDelete
                        ? [{
                            label: "Delete session",
                            icon: <Trash2 className={ICON.xs} strokeWidth={ICON_STROKE} />,
                            onSelect: () => onDelete(session.id),
                            danger: true,
                          }]
                        : []),
                    ]}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
