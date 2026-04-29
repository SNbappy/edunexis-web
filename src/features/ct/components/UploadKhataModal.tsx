import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  FileText, X, Upload, CheckCircle2,
  Trophy, TrendingDown, BarChart3,
} from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useCTMarks } from "../hooks/useCTEvents"
import type { CTEventDto } from "@/types/ct.types"

interface Member { userId: string; fullName: string; studentId?: string }

interface UploadKhataModalProps {
  isOpen: boolean
  onClose: () => void
  ct: CTEventDto | null
  members: Member[]
}

interface KhataSlot {
  key: "best" | "worst" | "avg"
  label: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  fileKey: "bestCopy" | "worstCopy" | "avgCopy"
  studentKey: "bestStudentId" | "worstStudentId" | "avgStudentId"
  tone: "emerald" | "red" | "violet"
}

const SLOTS: KhataSlot[] = [
  { key: "best", label: "Best script", description: "Highest scorer", icon: Trophy, fileKey: "bestCopy", studentKey: "bestStudentId", tone: "emerald" },
  { key: "worst", label: "Worst script", description: "Lowest scorer", icon: TrendingDown, fileKey: "worstCopy", studentKey: "worstStudentId", tone: "red" },
  { key: "avg", label: "Average script", description: "Mid-range scorer", icon: BarChart3, fileKey: "avgCopy", studentKey: "avgStudentId", tone: "violet" },
]

interface ToneClasses {
  border: string
  bg: string
  iconBg: string
  iconText: string
  textBold: string
  buttonBg: string
  buttonBorder: string
  buttonText: string
}

function getToneClasses(tone: KhataSlot["tone"]): ToneClasses {
  switch (tone) {
    case "emerald": return {
      border: "border-emerald-200 dark:border-emerald-800",
      bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
      iconText: "text-emerald-700 dark:text-emerald-300",
      textBold: "text-emerald-700 dark:text-emerald-300",
      buttonBg: "bg-emerald-50 dark:bg-emerald-950/40",
      buttonBorder: "border-emerald-300 dark:border-emerald-700",
      buttonText: "text-emerald-700 dark:text-emerald-300",
    }
    case "red": return {
      border: "border-red-200 dark:border-red-800",
      bg: "bg-red-50/60 dark:bg-red-950/30",
      iconBg: "bg-red-100 dark:bg-red-900/60",
      iconText: "text-red-700 dark:text-red-300",
      textBold: "text-red-700 dark:text-red-300",
      buttonBg: "bg-red-50 dark:bg-red-950/40",
      buttonBorder: "border-red-300 dark:border-red-700",
      buttonText: "text-red-700 dark:text-red-300",
    }
    case "violet": return {
      border: "border-violet-200 dark:border-violet-800",
      bg: "bg-violet-50/60 dark:bg-violet-950/30",
      iconBg: "bg-violet-100 dark:bg-violet-900/60",
      iconText: "text-violet-700 dark:text-violet-300",
      textBold: "text-violet-700 dark:text-violet-300",
      buttonBg: "bg-violet-50 dark:bg-violet-950/40",
      buttonBorder: "border-violet-300 dark:border-violet-700",
      buttonText: "text-violet-700 dark:text-violet-300",
    }
  }
}

export default function UploadKhataModal({ isOpen, onClose, ct, members = [] }: UploadKhataModalProps) {
  const ctId = ct?.id ?? ""
  const { uploadKhata, isUploading } = useCTMarks(ctId)

  const [files, setFiles] = useState<Partial<Record<KhataSlot["fileKey"], File>>>({})
  const [students, setStudents] = useState<Partial<Record<KhataSlot["studentKey"], string>>>({})

  const refs = {
    bestCopy: useRef<HTMLInputElement>(null),
    worstCopy: useRef<HTMLInputElement>(null),
    avgCopy: useRef<HTMLInputElement>(null),
  }

  const handleClose = () => { setFiles({}); setStudents({}); onClose() }

  const setFile = (key: KhataSlot["fileKey"], file: File | undefined) =>
    setFiles(prev => {
      const n = { ...prev }
      if (file) n[key] = file
      else delete n[key]
      return n
    })

  const handleSubmit = () => {
    if (!files.bestCopy || !files.worstCopy || !files.avgCopy) return
    const fd = new FormData()
    fd.append("bestCopy", files.bestCopy)
    fd.append("worstCopy", files.worstCopy)
    fd.append("avgCopy", files.avgCopy)
    if (students.bestStudentId) fd.append("bestStudentId", students.bestStudentId)
    if (students.worstStudentId) fd.append("worstStudentId", students.worstStudentId)
    if (students.avgStudentId) fd.append("avgStudentId", students.avgStudentId)
    uploadKhata(fd, { onSuccess: handleClose })
  }

  const fileCount = Object.keys(files).length
  const allSelected = fileCount === 3

  if (!ct) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={"Upload scripts â€” CT " + ct.ctNumber}
      description="Upload all 3 answer-script copies (best, worst, average) before entering marks."
      size="lg"
    >
      <div className="space-y-3">
        {/* Progress indicator */}
        <div className="flex items-center justify-between gap-1 rounded-xl border border-teal-200 bg-teal-50 p-3 dark:border-teal-800 dark:bg-teal-950/40">
          {SLOTS.map((slot, i) => {
            const done = !!files[slot.fileKey]
            return (
              <div key={slot.key} className="flex flex-1 items-center gap-1.5">
                {i > 0 && (
                  <div className={
                    "h-[2px] flex-1 rounded-full transition-colors " +
                    (done || files[SLOTS[i - 1].fileKey]
                      ? "bg-teal-500"
                      : "bg-teal-200 dark:bg-teal-800")
                  } />
                )}
                <div className={
                  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10.5px] font-bold transition-colors " +
                  (done
                    ? "bg-teal-600 text-white"
                    : "border border-teal-300 bg-card text-teal-700 dark:border-teal-700 dark:text-teal-300")
                }>
                  {done ? <CheckCircle2 className="h-3 w-3" /> : <span>{i + 1}</span>}
                  {slot.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Slot cards */}
        {SLOTS.map(slot => {
          const file = files[slot.fileKey]
          const tone = getToneClasses(slot.tone)
          const SlotIcon = slot.icon

          return (
            <div
              key={slot.key}
              className={
                "space-y-3 rounded-xl border p-4 transition-all " +
                (file
                  ? tone.border + " " + tone.bg
                  : "border-border bg-muted/30")
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl " + tone.iconBg + " " + tone.iconText}>
                    <SlotIcon className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-display text-[13px] font-bold text-foreground">
                      {slot.label}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground">
                      {slot.description}
                    </p>
                  </div>
                </div>

                {file ? (
                  <div className="flex items-center gap-2">
                    <FileText className={"h-4 w-4 shrink-0 " + tone.textBold} />
                    <span className={"max-w-[140px] truncate text-[12px] font-bold " + tone.textBold}>
                      {file.name}
                    </span>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setFile(slot.fileKey, undefined)
                        const r = refs[slot.fileKey]
                        if (r.current) r.current.value = ""
                      }}
                      aria-label={"Remove " + slot.label}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-950/50 dark:hover:bg-red-950/80"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => refs[slot.fileKey].current?.click()}
                    className={
                      "inline-flex items-center gap-1.5 rounded-lg border-2 border-dashed px-3 py-1.5 text-[12px] font-bold transition-colors " +
                      tone.buttonBorder + " " + tone.buttonBg + " " + tone.buttonText + " hover:opacity-90"
                    }
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Choose file
                  </motion.button>
                )}

                <input
                  ref={refs[slot.fileKey]}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={e => setFile(slot.fileKey, e.target.files?.[0])}
                />
              </div>

              {members.length > 0 && (
                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <p className="shrink-0 text-[11.5px] font-semibold text-muted-foreground">
                    Student (optional):
                  </p>
                  <select
                    value={students[slot.studentKey] ?? ""}
                    onChange={e => setStudents(prev => ({
                      ...prev,
                      [slot.studentKey]: e.target.value || undefined,
                    }))}
                    className="h-8 flex-1 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select studentâ€¦</option>
                    {members.map(m => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName}{m.studentId ? " (" + m.studentId + ")" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )
        })}

        {/* Hint */}
        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[11.5px] text-muted-foreground">
          Accepted: PDF, JPG, PNG, DOC, DOCX Â· All 3 files required before entering marks.
        </p>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleSubmit}
            disabled={!allSelected || isUploading}
            loading={isUploading}
          >
            <Upload className="h-3.5 w-3.5" />
            {allSelected
              ? "Upload all 3 scripts"
              : "Select " + (3 - fileCount) + " more file" + (3 - fileCount === 1 ? "" : "s")
            }
          </Button>
        </div>
      </div>
    </Modal>
  )
}
