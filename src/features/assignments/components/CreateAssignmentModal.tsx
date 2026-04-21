import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ClipboardList, Loader2 } from "lucide-react"
import Modal from "@/components/ui/Modal"
import { useThemeStore } from "@/store/themeStore"
import { addDays } from "date-fns"
import type { CreateAssignmentRequest } from "@/types/assignment.types"

const schema = z.object({
  title:               z.string().min(3, "At least 3 characters"),
  instructions:        z.string().optional(),
  deadline:            z.string().min(1, "Due date is required"),
  maxMarks:            z.coerce.number().min(1).max(1000),
  allowLateSubmission: z.boolean(),
  rubricNotes:         z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  isOpen:     boolean
  onClose:    () => void
  onSubmit:   (d: CreateAssignmentRequest) => void
  isLoading?: boolean
}

function pad(n: number) { return String(n).padStart(2, "0") }
function toLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CreateAssignmentModal({ isOpen, onClose, onSubmit, isLoading }: Props) {
  const { dark } = useThemeStore()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: 100, allowLateSubmission: false, deadline: toLocal(addDays(new Date(), 7)) },
  })
  const allowLate = watch("allowLateSubmission")
  const handleClose = () => { reset(); onClose() }

  // Theme
  const textMain   = dark ? "#e2e8f8" : "#111827"
  const textSub    = dark ? "#8896c8" : "#6b7280"
  const labelColor = dark ? "#9ca3af" : "#374151"
  const inputBg    = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"
  const inputBorder= dark ? "rgba(255,255,255,0.1)"  : "#e5e7eb"
  const focusBorder= "#6366f1"
  const focusShadow= "0 0 0 3px rgba(99,102,241,0.1)"
  const toggleBg   = allowLate ? "#6366f1" : (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb")
  const checkBg    = dark ? "rgba(99,102,241,0.08)" : "#eef2ff"
  const checkBorder= dark ? "rgba(99,102,241,0.2)"  : "#c7d2fe"

  const inputStyle: React.CSSProperties = {
    width: "100%", background: inputBg, border: `1px solid ${inputBorder}`,
    color: textMain, borderRadius: 12, padding: "9px 14px",
    fontSize: 13, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
  }
  const textareaStyle: React.CSSProperties = {
    ...inputStyle, resize: "none",
  }
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 700, color: labelColor, marginBottom: 6,
  }

  const onFocus = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = focusBorder
    e.target.style.boxShadow   = focusShadow
  }
  const onBlur = (e: React.FocusEvent<any>) => {
    e.target.style.borderColor = inputBorder
    e.target.style.boxShadow   = "none"
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}
      title="Create Assignment" size="xl" scrollable accent="#db2777">
      <form onSubmit={handleSubmit(d => onSubmit({ ...d, deadline: new Date(d.deadline).toISOString() }))}
        className="space-y-4">

        {/* Header banner */}
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: dark ? "rgba(219,39,119,0.08)" : "#fdf2f8", border: dark ? "1px solid rgba(219,39,119,0.2)" : "1px solid #fbcfe8" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: dark ? "rgba(219,39,119,0.15)" : "#fdf2f8", border: dark ? "1px solid rgba(219,39,119,0.3)" : "1px solid #fbcfe8" }}>
            <ClipboardList style={{ width: 18, height: 18, color: "#db2777" }} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[13px] font-bold" style={{ color: textMain }}>New Assignment</p>
            <p className="text-[11px]" style={{ color: textSub }}>Fill in the details below</p>
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Title <span style={{ color: "#ef4444" }}>*</span></label>
          <input {...register("title")} placeholder="e.g. Assignment 1 - Linked Lists"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          {errors.title && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>{errors.title.message}</p>}
        </div>

        {/* Instructions */}
        <div>
          <label style={labelStyle}>Instructions (optional)</label>
          <textarea {...register("instructions")} rows={4}
            placeholder="Detailed instructions for students..."
            style={textareaStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>

        {/* Rubric */}
        <div>
          <label style={labelStyle}>Rubric / Grading Criteria (optional)</label>
          <textarea {...register("rubricNotes")} rows={2}
            placeholder="e.g. 30% code quality, 40% output..."
            style={textareaStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>

        {/* Deadline + Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Deadline <span style={{ color: "#ef4444" }}>*</span></label>
            <input {...register("deadline")} type="datetime-local"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            {errors.deadline && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>{errors.deadline.message}</p>}
          </div>
          <div>
            <label style={labelStyle}>Max Marks <span style={{ color: "#ef4444" }}>*</span></label>
            <input {...register("maxMarks")} type="number" placeholder="100"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            {errors.maxMarks && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4, fontWeight: 600 }}>{errors.maxMarks.message}</p>}
          </div>
        </div>

        {/* Late submission toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl"
          style={{ background: checkBg, border: `1px solid ${checkBorder}` }}>
          <input type="checkbox" {...register("allowLateSubmission")} className="sr-only" id="late" />
          <div className="relative w-9 h-5 rounded-full transition-all shrink-0"
            style={{ background: toggleBg }}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${allowLate ? "left-[18px]" : "left-0.5"}`} />
          </div>
          <span className="text-[13px] font-semibold" style={{ color: textMain }}>Allow late submission</span>
        </label>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={{ background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6", border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#e5e7eb"}`, color: textSub }}
            onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.09)" : "#e5e7eb")}
            onMouseLeave={e => (e.currentTarget.style.background = dark ? "rgba(255,255,255,0.06)" : "#f3f4f6")}>
            Cancel
          </button>
          <button type="submit" disabled={!!isLoading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#db2777,#6366f1)", boxShadow: "0 4px 16px rgba(219,39,119,0.35)" }}>
            {isLoading
              ? <><Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> Creating...</>
              : "Create Assignment"
            }
          </button>
        </div>
      </form>
    </Modal>
  )
}
