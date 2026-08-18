import { useState, useEffect, useMemo } from "react"
import { Check, X, Search, Users } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import EmptyState from "@/components/ui/EmptyState"
import { Field, FIELD_BASE, FIELD_HEIGHT, fieldState } from "@/components/ui/field"
import { ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
import { todayISO } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"
import type { AttendanceStatus } from "@/types/attendance.types"

interface Member {
  userId: string
  fullName: string
  /** `string | null` matches CourseMemberDto — the API sends null. */
  studentId?: string | null
  profilePhotoUrl?: string | null
}

interface TakeAttendanceSheetProps {
  isOpen: boolean
  onClose: () => void
  members: Member[]
  courseId: string
  onSubmit: (data: {
    courseId: string
    date: string
    topic?: string
    records: { studentId: string; status: AttendanceStatus }[]
  }) => void
  isLoading?: boolean
  initialDate?: string
  initialTopic?: string
  initialStatuses?: Record<string, AttendanceStatus>
}

type StatusMap = Record<string, AttendanceStatus>

/**
 * Take-attendance sheet.
 *
 * Built for one job: getting through a roster fast, standing up, in front of a
 * class. Three changes carry most of that:
 *
 *  · Rows are a divided list, not 18 stacked bordered cards. Card-per-row put
 *    two borders and 16px of gutter between every student and cut how many fit
 *    on screen roughly in half.
 *  · Present/Absent is one segmented control per row rather than two loose
 *    buttons, so the pair reads as a single either/or and the hit targets touch.
 *  · Unmarked students are tinted and counted. The old sheet let you save a
 *    half-finished register with nothing drawing your eye to the gaps.
 *
 * The per-row entrance stagger is gone: it delayed the last student by 300ms
 * and re-ran on every search keystroke.
 */
export default function TakeAttendanceSheet({
  isOpen, onClose, members, courseId, onSubmit, isLoading,
  initialDate, initialTopic, initialStatuses,
}: TakeAttendanceSheetProps) {
  const [date, setDate] = useState(initialDate ?? todayISO())
  const [topic, setTopic] = useState(initialTopic ?? "")
  const [statuses, setStatuses] = useState<StatusMap>({})
  const [search, setSearch] = useState("")
  /** Narrows the roster to one status. "All" is the default. */
  const [filter, setFilter] = useState<"All" | AttendanceStatus>("All")

  useEffect(() => {
    if (!isOpen || !members.length) return
    if (initialStatuses && Object.keys(initialStatuses).length > 0) {
      setStatuses(initialStatuses)
    } else {
      const init: StatusMap = {}
      members.forEach(m => { init[m.userId] = "Unmarked" })
      setStatuses(init)
    }
    setDate(initialDate ?? todayISO())
    setTopic(initialTopic ?? "")
    setSearch("")
    setFilter("All")
  }, [isOpen, members, initialDate, initialTopic, initialStatuses])

  const filtered = useMemo(() => {
    const sorted = [...members].sort((a, b) =>
      (a.studentId ?? "").localeCompare(b.studentId ?? "", undefined, { numeric: true }) ||
      a.fullName.localeCompare(b.fullName)
    )
    const byStatus = filter === "All"
      ? sorted
      : sorted.filter(m => (statuses[m.userId] ?? "Unmarked") === filter)
    if (!search.trim()) return byStatus
    const q = search.toLowerCase()
    return byStatus.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      m.studentId?.toLowerCase().includes(q)
    )
  }, [members, search, filter, statuses])

  const setStatus = (userId: string, status: AttendanceStatus) =>
    setStatuses(prev => ({ ...prev, [userId]: status }))

  const setAll = (status: AttendanceStatus) => {
    const next: StatusMap = {}
    members.forEach(m => { next[m.userId] = status })
    setStatuses(next)
  }

  const counts = useMemo(() => ({
    present: Object.values(statuses).filter(s => s === "Present").length,
    absent: Object.values(statuses).filter(s => s === "Absent").length,
    unmarked: Object.values(statuses).filter(s => s === "Unmarked").length,
  }), [statuses])

  const handleSubmit = () => {
    const records = members.map(m => ({
      studentId: m.userId,
      status: statuses[m.userId] ?? "Unmarked",
    }))
    onSubmit({ courseId, date, topic: topic.trim() || undefined, records })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialStatuses ? "Edit attendance" : "Take attendance"}
      size="xl"
      footer={
        <>
          {counts.unmarked > 0 && (
            <p className="mr-auto text-[12px] font-medium text-warning">
              {counts.unmarked} still unmarked
            </p>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={members.length === 0 || isLoading}
            loading={isLoading}
          >
            {initialStatuses ? "Update attendance" : "Save attendance"}
          </Button>
        </>
      }
    >
      <div className="space-y-2.5">
        {/* Session details and search share one row.
            This block used to stack four things — a two-column date/topic grid
            with a hint line, a tally bar, then a full-width search — which cost
            roughly 190px above the roster and pushed the students, the only
            part anyone is here to touch, below the fold on a laptop. */}
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[minmax(0,150px)_minmax(0,1fr)_minmax(0,1fr)]">
          <input
            id="attendance-date"
            type="date"
            aria-label="Session date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={cn(FIELD_BASE, fieldState(false), FIELD_HEIGHT, "px-3")}
          />
          <Input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Topic (optional)"
            aria-label="Topic"
          />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or ID…"
            aria-label="Search students"
            leftIcon={<Search strokeWidth={ICON_STROKE} />}
          />
        </div>

        {/* Tally + bulk actions. The tally is live, so you can see the register
            fill up without counting rows yourself. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-muted/40 px-3 py-1.5">
          {/* The tallies double as filters — "4 unmarked" is only useful if you
              can then see which four without scrolling the whole roster. */}
          <div className="flex items-center gap-1">
            <Tally
              value={members.length} label="all"
              active={filter === "All"} onClick={() => setFilter("All")}
            />
            <Tally
              value={counts.present} label="present" className="text-success"
              active={filter === "Present"} onClick={() => setFilter("Present")}
            />
            <Tally
              value={counts.absent} label="absent" className="text-destructive"
              active={filter === "Absent"} onClick={() => setFilter("Absent")}
            />
            <Tally
              value={counts.unmarked} label="unmarked"
              className={counts.unmarked ? "text-warning" : "text-muted-foreground"}
              active={filter === "Unmarked"} onClick={() => setFilter("Unmarked")}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setAll("Present")}>
              All present
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setAll("Absent")}>
              All absent
            </Button>
          </div>
        </div>

        {/* Roster */}
        {members.length === 0 ? (
          <EmptyState
            variant="panel"
            icon={<Users strokeWidth={ICON_STROKE} />}
            title="No students enrolled"
            description="Approve join requests in the Members tab first."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            variant="panel"
            icon={<Search strokeWidth={ICON_STROKE} />}
            title="No matches"
            description={
              search.trim()
                ? `No student matches “${search}”${filter === "All" ? "" : ` in ${filter.toLowerCase()}`}.`
                : `No student is currently ${filter.toLowerCase()}.`
            }
          />
        ) : (
          <div className="max-h-[46vh] overflow-y-auto rounded-xl border border-border">
            <ul className="divide-y divide-border">
              {filtered.map(member => {
                const current = statuses[member.userId] ?? "Unmarked"
                const unmarked = current === "Unmarked"
                return (
                  <li
                    key={member.userId}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 transition-colors duration-120",
                      unmarked ? "bg-warning-soft/40" : "bg-card",
                    )}
                  >
                    <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" className="h-8 w-8" />

                    <div className="min-w-0 flex-1">
                      {member.studentId ? (
                        <>
                          <p className="font-mono text-[12.5px] font-bold leading-tight text-foreground">
                            {member.studentId}
                          </p>
                          <p className="truncate text-[11.5px] text-muted-foreground">
                            {member.fullName}
                          </p>
                        </>
                      ) : (
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {member.fullName}
                        </p>
                      )}
                    </div>

                    <StatusToggle
                      value={current}
                      onChange={s => setStatus(member.userId, s)}
                      name={member.fullName}
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Tally({
  value, label, className, active, onClick,
}: {
  value: number
  label: string
  className?: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-lg px-2 py-1 transition-colors",
        active ? "bg-card ring-1 ring-border-strong" : "hover:bg-card/60",
        FOCUS,
      )}
    >
      <span className={cn("font-display text-[15px] font-extrabold tabular-nums", className)}>
        {value}
      </span>
      <span className="text-[11.5px] text-muted-foreground">{label}</span>
    </button>
  )
}

/**
 * Segmented present/absent control. One track, two halves — a tap on the active
 * half is a no-op rather than a toggle-off, because "unmark this student" is
 * never what you mean once you have marked them.
 */
function StatusToggle({
  value, onChange, name,
}: {
  value: AttendanceStatus
  onChange: (s: AttendanceStatus) => void
  name: string
}) {
  const OPTIONS = [
    { v: "Present" as const, icon: Check, label: "Present", on: "bg-success text-white" },
    { v: "Absent"  as const, icon: X,     label: "Absent",  on: "bg-destructive text-white" },
  ]

  return (
    <div
      role="group"
      aria-label={`Attendance for ${name}`}
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5"
    >
      {OPTIONS.map(opt => {
        const active = value === opt.v
        const Icon = opt.icon
        return (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            aria-pressed={active}
            aria-label={opt.label}
            className={cn(
              "inline-flex h-7 items-center gap-1 rounded-[7px] px-2 text-[11.5px] font-bold transition-colors duration-120",
              FOCUS,
              active ? opt.on : "text-muted-foreground hover:bg-card hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
