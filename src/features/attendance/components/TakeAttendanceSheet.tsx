import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2, XCircle, HelpCircle, Calendar,
  BookOpen, Search, Users,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { todayISO } from "@/utils/dateUtils"
import type { AttendanceStatus } from "@/types/attendance.types"

interface Member {
  userId: string
  fullName: string
  studentId?: string
  profilePhotoUrl?: string
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

interface StatusOption {
  value: AttendanceStatus
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  text: string
  bg: string
  border: string
  activeBg: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "Present",
    label: "Present",
    icon: CheckCircle2,
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-200 dark:border-emerald-800",
    activeBg: "bg-emerald-600 text-white border-emerald-600",
  },
  {
    value: "Absent",
    label: "Absent",
    icon: XCircle,
    text: "text-red-700 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-200 dark:border-red-800",
    activeBg: "bg-red-600 text-white border-red-600",
  },
]

export default function TakeAttendanceSheet({
  isOpen, onClose, members, courseId, onSubmit, isLoading,
  initialDate, initialTopic, initialStatuses,
}: TakeAttendanceSheetProps) {
  const [date, setDate] = useState(initialDate ?? todayISO())
  const [topic, setTopic] = useState(initialTopic ?? "")
  const [statuses, setStatuses] = useState<StatusMap>({})
  const [search, setSearch] = useState("")

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
  }, [isOpen, members, initialDate, initialTopic, initialStatuses])

  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(m =>
      m.fullName.toLowerCase().includes(q) ||
      m.studentId?.toLowerCase().includes(q)
    )
  }, [members, search])

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
      description={initialStatuses
        ? "Update student attendance for this session."
        : "Mark each student present, absent, or unmarked."}
      size="xl"
      scrollable
    >
      <div className="space-y-4">
        {/* Date + topic */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              <Calendar className="mr-1 inline h-3.5 w-3.5" />
              Session date
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-[13px] text-foreground outline-none focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              <BookOpen className="mr-1 inline h-3.5 w-3.5" />
              Topic <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={"e.g. Linked lists \u2014 chapter 3"}
              className="h-10 w-full rounded-xl border border-border bg-muted/40 px-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
        </div>

        {/* Stats + bulk actions */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <Stat label="Present" value={counts.present} tone="emerald" icon={CheckCircle2} />
            <Stat label="Absent" value={counts.absent} tone="red" icon={XCircle} />
            <Stat label="Unmarked" value={counts.unmarked} tone="amber" icon={HelpCircle} />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setAll("Present")}
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11.5px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
            >
              All present
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setAll("Absent")}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11.5px] font-bold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              All absent
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={"Search students by name or ID\u2026"}
            className="h-10 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3 text-[13px] text-foreground outline-none placeholder:text-muted-foreground focus:border-teal-500 focus:bg-card focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Student rows */}
        {members.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-center">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <p className="mt-2 text-[13px] font-bold text-foreground">No students enrolled</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Approve join requests in the Members tab first.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              No students match "{search}"
            </p>
          </div>
        ) : (
          <div className="no-scrollbar max-h-96 space-y-2 overflow-y-auto pr-1">
            {filtered.map((member, i) => {
              const current = statuses[member.userId] ?? "Unmarked"
              return (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <Avatar
                    src={member.profilePhotoUrl}
                    name={member.fullName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {member.fullName}
                    </p>
                    {member.studentId && (
                      <p className="truncate font-mono text-[11px] text-muted-foreground">
                        {member.studentId}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {STATUS_OPTIONS.map(opt => {
                      const active = current === opt.value
                      const Icon = opt.icon
                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          whileTap={{ scale: 0.92 }}
                          onClick={() => setStatus(member.userId, opt.value)}
                          aria-label={opt.label}
                          aria-pressed={active}
                          className={
                            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors " +
                            (active
                              ? opt.activeBg
                              : opt.bg + " " + opt.border + " " + opt.text + " hover:opacity-90")
                          }
                        >
                          <Icon className="h-3 w-3" strokeWidth={2.5} />
                          <span className="hidden sm:inline">{opt.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 border-t border-border pt-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSubmit}
            disabled={members.length === 0 || isLoading}
            loading={isLoading}
          >
            {initialStatuses ? "Update attendance" : "Save attendance"}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

interface StatProps {
  label: string
  value: number
  tone: "emerald" | "red" | "amber"
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function Stat({ label, value, tone, icon: Icon }: StatProps) {
  const colorClass =
    tone === "emerald" ? "text-emerald-700 dark:text-emerald-300"
      : tone === "red" ? "text-red-700 dark:text-red-300"
        : "text-amber-700 dark:text-amber-300"

  return (
    <div className="inline-flex items-center gap-1.5">
      <Icon className={"h-3.5 w-3.5 " + colorClass} strokeWidth={2} />
      <span className={"font-display text-[13px] font-extrabold tabular-nums " + colorClass}>
        {value}
      </span>
      <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}