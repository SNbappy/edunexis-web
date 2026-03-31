import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft, ArrowRight, Check, BookOpen, FlaskConical,
  Code2, BookText, GraduationCap, ImagePlus, X, Loader2,
  Sparkles, ChevronRight, AlertTriangle
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { courseService } from "@/features/courses/services/courseService"
import { DEPARTMENTS, SEMESTERS, YEARS, CREDIT_HOURS, ACADEMIC_SESSIONS } from "@/config/constants"
import type { CreateCourseRequest } from "@/types/course.types"

const schema = z.object({
  title:           z.string().min(3, "At least 3 characters"),
  courseCode:      z.string().min(2, "Required"),
  creditHours:     z.coerce.number().min(0.5).max(6),
  courseType:      z.string().min(1, "Select a type"),
  department:      z.string().min(1, "Select department"),
  academicSession: z.string().min(1, "Required"),
  year:            z.string().min(1, "Select year"),
  semester:        z.string().min(1, "Select semester"),
  section:         z.string().optional(),
  description:     z.string().optional(),
})
type FormData = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: "Theory",    label: "Theory",    Icon: BookOpen,      color: "#818cf8" },
  { value: "Lab",       label: "Lab",       Icon: FlaskConical,  color: "#34d399" },
  { value: "Project",   label: "Project",   Icon: Code2,         color: "#f472b6" },
  { value: "Thesis",    label: "Thesis",    Icon: BookText,      color: "#fbbf24" },
  { value: "Sessional", label: "Sessional", Icon: GraduationCap, color: "#22d3ee" },
]

const STEPS = [
  { id: 1, title: "Course Identity"  },
  { id: 2, title: "Academic Details" },
  { id: 3, title: "Final Touches"    },
]

const BASE_INPUT  = "w-full rounded-xl px-4 text-[14px] font-medium outline-none transition-colors"
const BASE_SELECT = "w-full rounded-xl px-4 text-[13px] font-semibold outline-none cursor-pointer"
const LBL         = "block text-[12px] font-bold mb-2"
const LBL_COLOR   = { color: "#94a3b8" }

function fieldStyle(err?: boolean): React.CSSProperties {
  return {
    background: "rgba(13,24,42,0.8)",
    border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.2)"}`,
    color: "#e2e8f0",
    height: "3rem",
  }
}

export default function CreateCoursePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const [step,         setStep]         = useState(1)
  const [coverFile,    setCoverFile]    = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [isDragging,   setIsDragging]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      courseType:      "Theory",
      creditHours:     3,
      academicSession: ACADEMIC_SESSIONS[4],
      year:            YEARS[0],
      semester:        SEMESTERS[0],
    },
  })

  const w     = watch()
  const selT  = TYPE_OPTIONS.find(t => t.value === w.courseType)
  const SelIcon = selT?.Icon ?? null

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      let coverImageUrl = ""
      if (coverFile) {
        try {
          const r = await courseService.uploadCover(coverFile)
          coverImageUrl = r.data ?? ""
        } catch {
          // cover upload unavailable — continue without it
        }
      }
      return courseService.create({
        ...data,
        coverImageUrl,
        teacherId:   user!.id,
        section:     data.section     || undefined,
        description: data.description || undefined,
      } as CreateCourseRequest)
    },
    onSuccess: (res) => {
      if (res.success) {
        qc.invalidateQueries({ queryKey: ["courses"] })
        navigate(`/courses/${res.data?.id}/stream`)
      }
    },
  })

  const handleFile = useCallback((file: File) => {
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }, [])

  const next = useCallback(async () => {
    const fields = step === 1
      ? (["title", "courseCode", "creditHours", "courseType"] as const)
      : (["department", "academicSession", "year", "semester"] as const)
    const ok = await trigger(fields)
    if (ok) setStep(s => s + 1)
  }, [step, trigger])

  const onFocusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = "rgba(99,102,241,0.55)")
  const onFocusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = "rgba(99,102,241,0.2)")

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0d1b35 0%,#070e21 100%)" }}>

      {/* ── Top nav ── */}
      <div className="sticky top-0 z-20 px-6 h-16 flex items-center gap-4"
        style={{ background: "rgba(7,14,33,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
        <button onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-[13px] font-semibold shrink-0"
          style={{ color: "#475569" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#475569")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center gap-1.5 mx-auto">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <button type="button"
                onClick={() => step > s.id && setStep(s.id)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                style={{
                  background: step === s.id ? "rgba(99,102,241,0.15)" : "transparent",
                  border:     step === s.id ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                  cursor:     step > s.id ? "pointer" : "default",
                }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{
                    background: step > s.id  ? "linear-gradient(135deg,#4f46e5,#7c3aed)"
                              : step === s.id ? "rgba(99,102,241,0.25)"
                              : "rgba(99,102,241,0.08)",
                    color: step >= s.id ? "#e2e8f0" : "#334155",
                  }}>
                  {step > s.id ? <Check className="w-3 h-3" /> : s.id}
                </div>
                <span className="hidden sm:block text-[12px] font-semibold"
                  style={{ color: step === s.id ? "#a5b4fc" : step > s.id ? "#4ade80" : "#334155" }}>
                  {s.title}
                </span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "#1e2d4d" }} />}
            </div>
          ))}
        </div>
        <div className="w-16 shrink-0" />
      </div>

      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: "rgba(99,102,241,0.08)" }}>
        <motion.div className="h-full" animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.4 }}
          style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed)" }} />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
          <AnimatePresence mode="wait">

            {/* ══ STEP 1 ══ */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }}
                className="space-y-6">

                <div>
                  <h2 className="text-[28px] font-extrabold" style={{ color: "#e2e8f0" }}>Course Identity</h2>
                  <p className="text-[14px] mt-1" style={{ color: "#475569" }}>Start with what makes your course unique</p>
                </div>

                <div>
                  <label className={LBL} style={LBL_COLOR}>Course Title *</label>
                  <input {...register("title")} placeholder="e.g. Data Structures & Algorithms"
                    className={BASE_INPUT} style={fieldStyle(!!errors.title)}
                    onFocus={onFocusIn} onBlur={onFocusOut} />
                  {errors.title && <p className="text-[11px] text-red-400 mt-1.5">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LBL} style={LBL_COLOR}>Course Code *</label>
                    <input {...register("courseCode")} placeholder="e.g. CSE-301"
                      className={BASE_INPUT} style={fieldStyle(!!errors.courseCode)}
                      onFocus={onFocusIn} onBlur={onFocusOut} />
                    {errors.courseCode && <p className="text-[11px] text-red-400 mt-1.5">{errors.courseCode.message}</p>}
                  </div>
                  <div>
                    <label className={LBL} style={LBL_COLOR}>Credit Hours *</label>
                    <select {...register("creditHours")} className={BASE_SELECT} style={fieldStyle()}>
                      {CREDIT_HOURS.map(c => <option key={c} value={c}>{c} Credit{c !== 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={LBL} style={LBL_COLOR}>Course Type *</label>
                  <div className="grid grid-cols-5 gap-2.5">
                    {TYPE_OPTIONS.map(({ value, label, Icon, color }) => {
                      const sel = w.courseType === value
                      return (
                        <label key={value} className="cursor-pointer">
                          <input type="radio" {...register("courseType")} value={value} className="sr-only" />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl text-center"
                            style={{
                              background: sel ? `${color}18` : "rgba(13,24,42,0.7)",
                              border:     `1.5px solid ${sel ? color + "55" : "rgba(99,102,241,0.1)"}`,
                              boxShadow:  sel ? `0 4px 20px ${color}20` : "none",
                              transition: "all 0.15s",
                            }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: sel ? `${color}25` : "rgba(99,102,241,0.07)" }}>
                              <Icon className="w-4 h-4" style={{ color: sel ? color : "#334155" }} strokeWidth={2} />
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: sel ? color : "#475569" }}>{label}</span>
                          </motion.div>
                        </label>
                      )
                    })}
                  </div>
                  {errors.courseType && <p className="text-[11px] text-red-400 mt-1.5">{errors.courseType.message}</p>}
                </div>

                <div className="flex justify-end pt-2">
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={next}
                    className="flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-[14px] text-white"
                    style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 20px rgba(79,70,229,0.4)" }}>
                    Academic Details <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 2 ══ */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }}
                className="space-y-6">

                <div>
                  <h2 className="text-[28px] font-extrabold" style={{ color: "#e2e8f0" }}>Academic Details</h2>
                  <p className="text-[14px] mt-1" style={{ color: "#475569" }}>Place this course in the right academic context</p>
                </div>

                {/* Department */}
                <div>
                  <label className={LBL} style={LBL_COLOR}>Department *</label>
                  <select {...register("department")} className={BASE_SELECT} style={fieldStyle(!!errors.department)}>
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-[11px] text-red-400 mt-1.5">{errors.department.message}</p>}
                </div>

                {/* Academic Session */}
                <div>
                  <label className={LBL} style={LBL_COLOR}>Academic Session *</label>
                  <select {...register("academicSession")} className={BASE_SELECT} style={fieldStyle()}>
                    {ACADEMIC_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Year + Semester side by side */}
                <div>
                  <label className={LBL} style={LBL_COLOR}>Year & Semester *</label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Year tiles */}
                    <div className="grid grid-cols-2 gap-2">
                      {YEARS.map(yr => {
                        const sel = w.year === yr
                        const num = yr.split(" ")[0] // "1st", "2nd"…
                        return (
                          <label key={yr} className="cursor-pointer">
                            <input type="radio" {...register("year")} value={yr} className="sr-only" />
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                              className="flex flex-col items-center justify-center py-3 rounded-xl text-center"
                              style={{
                                background: sel ? "rgba(99,102,241,0.18)" : "rgba(13,24,42,0.7)",
                                border:     `1.5px solid ${sel ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.1)"}`,
                                boxShadow:  sel ? "0 4px 16px rgba(99,102,241,0.2)" : "none",
                                transition: "all 0.15s",
                              }}>
                              <span className="text-[18px] font-extrabold leading-none"
                                style={{ color: sel ? "#a5b4fc" : "#334155" }}>{num}</span>
                              <span className="text-[10px] font-semibold mt-0.5"
                                style={{ color: sel ? "#818cf8" : "#1e3a5f" }}>Year</span>
                            </motion.div>
                          </label>
                        )
                      })}
                    </div>

                    {/* Semester tiles */}
                    <div className="grid grid-cols-1 gap-2">
                      {SEMESTERS.map(sem => {
                        const sel = w.semester === sem
                        const num = sem.split(" ")[0]
                        return (
                          <label key={sem} className="cursor-pointer">
                            <input type="radio" {...register("semester")} value={sem} className="sr-only" />
                            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                              className="flex flex-col items-center justify-center py-4 rounded-xl text-center h-full"
                              style={{
                                background: sel ? "rgba(34,211,238,0.12)" : "rgba(13,24,42,0.7)",
                                border:     `1.5px solid ${sel ? "rgba(34,211,238,0.4)" : "rgba(99,102,241,0.1)"}`,
                                boxShadow:  sel ? "0 4px 16px rgba(34,211,238,0.15)" : "none",
                                transition: "all 0.15s",
                              }}>
                              <span className="text-[18px] font-extrabold leading-none"
                                style={{ color: sel ? "#67e8f9" : "#334155" }}>{num}</span>
                              <span className="text-[10px] font-semibold mt-0.5"
                                style={{ color: sel ? "#22d3ee" : "#1e3a5f" }}>Semester</span>
                            </motion.div>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Combined label showing selection */}
                  {w.year && w.semester && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                      style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <GraduationCap className="w-4 h-4 shrink-0" style={{ color: "#818cf8" }} />
                      <span className="text-[13px] font-semibold" style={{ color: "#a5b4fc" }}>
                        {w.year} &bull; {w.semester}
                      </span>
                    </motion.div>
                  )}
                  {(errors.year || errors.semester) && (
                    <p className="text-[11px] text-red-400 mt-1.5">Please select both year and semester</p>
                  )}
                </div>

                {/* Section */}
                <div className="max-w-xs">
                  <label className={LBL} style={LBL_COLOR}>
                    Section <span style={{ color: "#334155" }}>(optional)</span>
                  </label>
                  <input {...register("section")} placeholder="e.g. A, B, C"
                    className={BASE_INPUT} style={fieldStyle()}
                    onFocus={onFocusIn} onBlur={onFocusOut} />
                </div>

                <div className="flex justify-between pt-2">
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-[14px]"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", color: "#818cf8" }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={next}
                    className="flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-[14px] text-white"
                    style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 20px rgba(79,70,229,0.4)" }}>
                    Final Touches <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ══ STEP 3 ══ */}
            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.2 }}
                className="space-y-6">

                <div>
                  <h2 className="text-[28px] font-extrabold" style={{ color: "#e2e8f0" }}>Final Touches</h2>
                  <p className="text-[14px] mt-1" style={{ color: "#475569" }}>Add a cover and description, then launch</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <label className={LBL} style={LBL_COLOR}>
                        Cover Image <span style={{ color: "#334155" }}>(optional)</span>
                      </label>
                      {coverPreview ? (
                        <div className="relative h-40 rounded-xl overflow-hidden"
                          style={{ border: "1px solid rgba(99,102,241,0.2)" }}>
                          <img src={coverPreview} className="w-full h-full object-cover" alt="cover" />
                          <button type="button"
                            onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: "rgba(0,0,0,0.7)" }}>
                            <X className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={e  => { e.preventDefault(); setIsDragging(true) }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={e => {
                            e.preventDefault(); setIsDragging(false)
                            const f = e.dataTransfer.files[0]
                            if (f?.type.startsWith("image/")) handleFile(f)
                          }}
                          onClick={() => fileRef.current?.click()}
                          className="h-40 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
                          style={{
                            background: isDragging ? "rgba(99,102,241,0.1)" : "rgba(13,24,42,0.6)",
                            border: `2px dashed ${isDragging ? "rgba(99,102,241,0.5)" : "rgba(99,102,241,0.15)"}`,
                          }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "rgba(99,102,241,0.1)" }}>
                            <ImagePlus className="w-5 h-5" style={{ color: "#4f46e5" }} />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] font-semibold" style={{ color: "#475569" }}>Drop image or click to browse</p>
                            <p className="text-[11px] mt-0.5" style={{ color: "#1e3a5f" }}>Skipping uses default cover</p>
                          </div>
                        </div>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                    </div>

                    <div>
                      <label className={LBL} style={LBL_COLOR}>
                        Description <span style={{ color: "#334155" }}>(optional)</span>
                      </label>
                      <textarea {...register("description")} rows={5}
                        placeholder="What will students learn in this course..."
                        className="w-full rounded-xl px-4 py-3 text-[13px] font-medium outline-none transition-colors resize-none"
                        style={{ background: "rgba(13,24,42,0.8)", border: "1px solid rgba(99,102,241,0.2)", color: "#e2e8f0" }}
                        onFocus={onFocusIn} onBlur={onFocusOut} />
                    </div>
                  </div>

                  {/* Live preview */}
                  <div>
                    <label className={LBL} style={LBL_COLOR}>Live Preview</label>
                    <div className="rounded-2xl overflow-hidden"
                      style={{ background: "rgba(10,18,38,0.9)", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
                      <div className="h-28 relative"
                        style={{ background: coverPreview ? undefined : `linear-gradient(135deg,${selT?.color ?? "#4f46e5"}28,${selT?.color ?? "#4f46e5"}08)` }}>
                        {coverPreview
                          ? <img src={coverPreview} className="w-full h-full object-cover" alt="" />
                          : SelIcon && <SelIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 opacity-10" style={{ color: selT?.color }} />
                        }
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(10,18,38,0.9),transparent 60%)" }} />
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                          style={{ background: `${selT?.color ?? "#4f46e5"}20`, color: selT?.color ?? "#818cf8", border: `1px solid ${selT?.color ?? "#4f46e5"}35` }}>
                          {w.courseType || "Theory"}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-[15px] font-extrabold leading-tight mb-1" style={{ color: "#e2e8f0" }}>
                          {w.title || <span style={{ color: "#1e3a5f" }}>Course Title</span>}
                        </p>
                        <p className="text-[12px] font-semibold mb-2" style={{ color: "#334155" }}>
                          {w.courseCode || "CSE-000"} &bull; {w.creditHours || 3} Credits
                        </p>
                        {w.description && (
                          <p className="text-[11px] leading-relaxed line-clamp-2 mb-2" style={{ color: "#334155" }}>{w.description}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {w.department && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                              {w.department.split(" ")[0]}
                            </span>
                          )}
                          {w.year && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                              {w.year}
                            </span>
                          )}
                          {w.semester && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}>
                              {w.semester}
                            </span>
                          )}
                          {w.section && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                              style={{ background: "rgba(244,114,182,0.1)", color: "#f472b6" }}>
                              Sec {w.section}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {mutation.isError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#f87171" }} />
                    <p className="text-[12px]" style={{ color: "#f87171" }}>Something went wrong. Please try again.</p>
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl font-bold text-[14px]"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", color: "#818cf8" }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    disabled={mutation.isPending}
                    className="flex items-center gap-2 h-11 px-8 rounded-xl font-bold text-[14px] text-white"
                    style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 20px rgba(79,70,229,0.4)", opacity: mutation.isPending ? 0.7 : 1 }}>
                    {mutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                      : <><Sparkles className="w-4 h-4" /> Create Course</>}
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}
