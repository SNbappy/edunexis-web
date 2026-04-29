import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Avatar from "@/components/ui/Avatar"
import ProgressBar from "@/components/ui/ProgressBar"
import { useCTMarks } from "../hooks/useCTEvents"
import type { CTEventDto, CTMarkEntry } from "@/types/ct.types"

interface Member {
  userId: string
  fullName: string
  studentId?: string
  profilePhotoUrl?: string
}

interface CTMarkEntryModalProps {
  isOpen: boolean
  onClose: () => void
  ct: CTEventDto | null
  members: Member[]
}

interface EntryRow {
  marks: string
  absent: boolean
  remarks: string
}

interface StatProps {
  label: string
  value: number
  tone: "emerald" | "red" | "muted"
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function Stat({ label, value, tone, icon: Icon }: StatProps) {
  const colorClass =
    tone === "emerald" ? "text-emerald-700 dark:text-emerald-300"
      : tone === "red" ? "text-red-700 dark:text-red-300"
        : "text-muted-foreground"

  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className={"h-3.5 w-3.5 " + colorClass} strokeWidth={2} />}
      <div>
        <p className={"font-display text-base font-extrabold leading-none tabular-nums " + colorClass}>
          {value}
        </p>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}

export default function CTMarkEntryModal({
  isOpen, onClose, ct, members,
}: CTMarkEntryModalProps) {
  const ctId = ct?.id ?? ""
  const { marksData, isLoading, gradeStudents, isSaving } = useCTMarks(ctId)
  const [entries, setEntries] = useState<Record<string, EntryRow>>({})

  useEffect(() => {
    if (!isOpen || !ct) return
    const existingMarks = marksData?.marks ?? []
    const init: Record<string, EntryRow> = {}
    members.forEach(m => {
      const ex = existingMarks.find(r => r.studentId === m.userId)
      init[m.userId] = {
        marks: ex?.obtainedMarks?.toString() ?? "",
        absent: ex?.isAbsent ?? false,
        remarks: ex?.remarks ?? "",
      }
    })
    setEntries(init)
  }, [isOpen, members, marksData, ct])

  const maxMarks = ct?.maxMarks ?? 0

  const setField = (uid: string, field: keyof EntryRow, val: string | boolean) =>
    setEntries(prev => ({
      ...prev,
      [uid]: { ...prev[uid], [field]: val },
    }))

  const setAllAbsent = (absent: boolean) =>
    setEntries(prev => {
      const next = { ...prev }
      members.forEach(m => {
        next[m.userId] = {
          ...next[m.userId],
          absent,
          marks: absent ? "" : next[m.userId]?.marks ?? "",
        }
      })
      return next
    })

  const handleSave = () => {
    const data: CTMarkEntry[] = members.map(m => {
      const e = entries[m.userId] ?? { marks: "", absent: false, remarks: "" }
      return {
        studentId: m.userId,
        obtainedMarks: e.absent || e.marks === "" ? null : parseFloat(e.marks),
        isAbsent: e.absent,
        remarks: e.remarks || undefined,
      }
    })
    gradeStudents({ marks: data }, { onSuccess: onClose })
  }

  const gradedCount = Object.values(entries).filter(e => !e.absent && e.marks !== "").length
  const absentCount = Object.values(entries).filter(e => e.absent).length
  const pending = members.length - gradedCount - absentCount

  if (!ct) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Enter marks — CT " + ct.ctNumber}
      description={ct.title + " · Total: " + ct.maxMarks + " marks"}
      size="xl"
    >
      <div className="space-y-5">
        {/* Khata warning */}
        {!ct.khataUploaded && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2} />
            <p className="text-[12px] leading-relaxed text-amber-900 dark:text-amber-200">
              All 3 answer scripts must be uploaded before saving marks.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <Stat label="Graded" value={gradedCount} tone="emerald" icon={CheckCircle2} />
          <div className="h-8 w-px shrink-0 bg-border" />
          <Stat label="Absent" value={absentCount} tone="red" icon={XCircle} />
          <div className="h-8 w-px shrink-0 bg-border" />
          <Stat label="Pending" value={pending} tone="muted" />
          <div className="ml-auto flex gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setAllAbsent(false)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-[11.5px] font-bold text-foreground transition-colors hover:bg-muted"
            >
              Clear absent
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setAllAbsent(true)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[11.5px] font-bold text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
            >
              Mark all absent
            </motion.button>
          </div>
        </div>

        {/* Student list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl border border-border bg-muted/40"
              />
            ))}
          </div>
        ) : (
          <div className="no-scrollbar max-h-96 space-y-2 overflow-y-auto pr-1">
            {members.map((member, i) => {
              const e = entries[member.userId] ?? { marks: "", absent: false, remarks: "" }
              const marksN = parseFloat(e.marks)
              const pct = !isNaN(marksN) && maxMarks > 0 ? (marksN / maxMarks) * 100 : 0
              const hasMarks = !e.absent && e.marks !== "" && !isNaN(marksN)

              return (
                <motion.div
                  key={member.userId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className={
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors " +
                    (e.absent
                      ? "border-red-200 bg-red-50/60 dark:border-red-800 dark:bg-red-950/30"
                      : hasMarks
                        ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20"
                        : "border-border bg-card")
                  }
                >
                  <Avatar
                    src={member.profilePhotoUrl}
                    name={member.fullName}
                    size="sm"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-foreground">
                      {member.fullName}
                    </p>
                    {member.studentId && (
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {member.studentId}
                      </p>
                    )}
                    {hasMarks && (
                      <ProgressBar
                        value={pct}
                        size="sm"
                        color={pct >= 80 ? "success" : pct >= 60 ? "primary" : pct >= 40 ? "warning" : "danger"}
                        className="mt-1 w-24"
                        animated={false}
                      />
                    )}
                  </div>

                  {/* Absent toggle */}
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setField(member.userId, "absent", !e.absent)}
                    aria-pressed={e.absent}
                    className={
                      "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold transition-colors " +
                      (e.absent
                        ? "border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-950/60 dark:text-red-300"
                        : "border-border bg-card text-muted-foreground hover:border-red-200 hover:text-red-700 dark:hover:border-red-800")
                    }
                  >
                    <XCircle className="h-3 w-3" />
                    Absent
                  </motion.button>

                  {/* Marks input */}
                  {!e.absent ? (
                    <input
                      type="number"
                      value={e.marks}
                      onChange={ev => setField(member.userId, "marks", ev.target.value)}
                      min={0}
                      max={maxMarks}
                      step={0.5}
                      placeholder="—"
                      aria-label={"Marks for " + member.fullName}
                      className="h-9 w-16 rounded-xl border border-border bg-card text-center text-[13px] font-semibold tabular-nums text-foreground outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                    />
                  ) : (
                    <div className="flex h-9 w-16 items-center justify-center rounded-xl bg-red-100 text-[12px] font-extrabold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                      ABS
                    </div>
                  )}
                </motion.div>
              )
            })}

            {members.length === 0 && (
              <div className="py-10 text-center text-[13px] text-muted-foreground">
                No students enrolled yet.
              </div>
            )}
          </div>
        )}

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
            onClick={handleSave}
            disabled={members.length === 0 || isSaving}
            loading={isSaving}
          >
            <Save className="h-3.5 w-3.5" />
            Save marks
          </Button>
        </div>
      </div>
    </Modal>
  )
}