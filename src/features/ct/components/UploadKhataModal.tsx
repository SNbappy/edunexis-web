import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  FileText, X, Upload, CheckCircle2,
  Trophy, TrendingDown, BarChart3,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useCTMarks } from "../hooks/useCTEvents"
import type { CTEventDto } from "@/types/ct.types"

interface Member { userId: string; fullName: string; studentId?: string | null }

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB, matches Cloudinary raw-upload cap

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
  icon: LucideIcon
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
      border: "border-success/25",
      bg: "bg-success-soft/60",
      iconBg: "bg-success-soft",
      iconText: "text-success",
      textBold: "text-success",
      buttonBg: "bg-success-soft",
      buttonBorder: "border-success/25",
      buttonText: "text-success",
    }
    case "red": return {
      border: "border-destructive/25",
      bg: "bg-destructive-soft/60",
      iconBg: "bg-destructive-soft",
      iconText: "text-destructive",
      textBold: "text-destructive",
      buttonBg: "bg-destructive-soft",
      buttonBorder: "border-destructive/25",
      buttonText: "text-destructive",
    }
    case "violet": return {
      border: "border-info/25",
      bg: "bg-info-soft/60",
      iconBg: "bg-info-soft",
      iconText: "text-info",
      textBold: "text-info",
      buttonBg: "bg-info-soft",
      buttonBorder: "border-info/25",
      buttonText: "text-info",
    }
  }
}

export default function UploadKhataModal({ isOpen, onClose, ct, members = [] }: UploadKhataModalProps) {
  const ctId = ct?.id ?? ""
  const { uploadKhata, isUploading } = useCTMarks(ctId)

  const [files, setFiles] = useState<Partial<Record<KhataSlot["fileKey"], File>>>({})
  const [students, setStudents] = useState<Partial<Record<KhataSlot["studentKey"], string>>>({})
  const [sizeError, setSizeError] = useState<string | null>(null)

  const refs = {
    bestCopy: useRef<HTMLInputElement>(null),
    worstCopy: useRef<HTMLInputElement>(null),
    avgCopy: useRef<HTMLInputElement>(null),
  }

  const handleClose = () => { setFiles({}); setStudents({}); setSizeError(null); onClose() }

  const setFile = (key: KhataSlot["fileKey"], file: File | undefined) => {
    if (file && file.size > MAX_SIZE_BYTES) {
      setSizeError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 10MB limit.`)
      window.setTimeout(() => setSizeError(null), 5000)
      return
    }
    setSizeError(null)
    setFiles(prev => {
      const n = { ...prev }
      if (file) n[key] = file
      else delete n[key]
      return n
    })
  }

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
      title={"Upload scripts - CT " + ct.ctNumber}
      description="Upload all 3 answer-script copies (best, worst, average) before entering marks."
      size="lg"
      scrollable
    >
      <div className="space-y-3">
        {sizeError && (
          <div className="sticky top-0 z-10 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive-soft px-3 py-2.5 text-[11.5px] font-semibold text-destructive shadow-md transition-opacity duration-300">
            <span className="flex-1">{sizeError}</span>
            <button
              type="button"
              onClick={() => setSizeError(null)}
              aria-label="Dismiss"
              className="shrink-0 rounded-full p-0.5 text-destructive transition-colors hover:bg-red-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        {/* Progress indicator */}
        <div className="flex items-center justify-between gap-1 rounded-xl border border-primary/25 bg-primary-soft p-3">
          {SLOTS.map((slot, i) => {
            const done = !!files[slot.fileKey]
            return (
              <div key={slot.key} className="flex flex-1 items-center gap-1.5">
                {i > 0 && (
                  <div className={
                    "h-[2px] flex-1 rounded-full transition-colors " +
                    (done || files[SLOTS[i - 1].fileKey]
                      ? "bg-primary-soft0"
                      : "bg-teal-200")
                  } />
                )}
                <div className={
                  "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10.5px] font-bold transition-colors " +
                  (done
                    ? "bg-primary text-white"
                    : "border border-primary/25 bg-card text-primary")
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
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive-soft text-destructive transition-colors hover:bg-red-200/80"
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
                    className="h-8 flex-1 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="">Select student...</option>
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
          Accepted: PDF, JPG, PNG, DOC, DOCX. Max 10MB each. All 3 files required before entering marks.
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
