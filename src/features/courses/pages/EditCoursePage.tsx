import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ArrowLeft, Save, Loader2, BookOpen, FlaskConical,
  Code2, BookText, GraduationCap, AlertTriangle, Archive, Check
} from "lucide-react"
import { courseService } from "@/features/courses/services/courseService"
import { DEPARTMENTS, SEMESTERS, YEARS, CREDIT_HOURS, ACADEMIC_SESSIONS } from "@/config/constants"
import type { UpdateCourseRequest } from "@/types/course.types"

const schema = z.object({
  title: z.string().min(3, "At least 3 characters"),
  courseCode: z.string().min(2, "Required"),
  creditHours: z.coerce.number().min(0.5).max(6),
  courseType: z.string().min(1),
  department: z.string().min(1, "Required"),
  academicSession: z.string().min(1),
  year:     z.string().min(1),
  semester: z.string().min(1),
  section: z.string().optional(),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: "Theory",    label: "Theory",    icon: BookOpen,      color: "#818cf8" },
  { value: "Lab",       label: "Lab",       icon: FlaskConical,  color: "#34d399" },
  { value: "Project",   label: "Project",   icon: Code2,         color: "#f472b6" },
  { value: "Thesis",    label: "Thesis",    icon: BookText,      color: "#fbbf24" },
  { value: "Sessional", label: "Sessional", icon: GraduationCap, color: "#22d3ee" },
]

const fieldStyle = (err?: boolean) => ({
  background: "rgba(7,14,33,0.8)",
  border: `1px solid ${err ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.15)"}`,
  color: "#e2e8f0",
})

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl p-6 space-y-5"
    style={{ background: "rgba(10,18,38,0.7)", border: "1px solid rgba(99,102,241,0.1)" }}>
    <p className="text-[11px] font-extrabold tracking-widest uppercase" style={{ color: "rgba(99,102,241,0.5)" }}>{title}</p>
    {children}
  </div>
)

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => courseService.getById(courseId!),
    enabled: !!courseId,
  })
  const course = data?.data

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const w = watch()
  const selectedType = TYPE_OPTIONS.find(t => t.value === (w.courseType || course?.courseType))

  useEffect(() => {
    if (course) reset({
      title: course.title,
      courseCode: course.courseCode,
      creditHours: course.creditHours,
      courseType: course.courseType,
      department: course.department,
      academicSession: course.academicSession,
      year:     course.year ?? '',
      semester: course.semester,
      section: course.section ?? "",
      description: course.description ?? "",
    })
  }, [course, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCourseRequest) => courseService.updateCourse(courseId!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["course", courseId] })
      qc.invalidateQueries({ queryKey: ["courses"] })
      navigate(`/courses/${courseId}/stream`)
    },
  })

  const archiveMutation = useMutation({
    mutationFn: () => courseService.archiveCourse(courseId!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["courses"] }); navigate("/courses") },
  })

  const onSubmit = (data: FormData) => updateMutation.mutate({
    ...data,
    section: data.section || undefined,
    description: data.description || undefined,
  } as UpdateCourseRequest)

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg,#0d1b35,#070e21)" }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#4f46e5" }} />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#0d1b35 0%,#070e21 100%)" }}>

      {/* Sticky nav */}
      <div className="sticky top-0 z-20 h-16 px-6 flex items-center justify-between"
        style={{ background: "rgba(7,14,33,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(99,102,241,0.12)" }}>
        <button onClick={() => navigate(`/courses/${courseId}/stream`)}
          className="flex items-center gap-2 text-[13px] font-semibold transition-colors"
          style={{ color: "#475569" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#818cf8"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#475569"}>
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </button>

        <div className="flex items-center gap-3">
          {selectedType && (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${selectedType.color}18`, border: `1px solid ${selectedType.color}30` }}>
              <selectedType.icon className="w-4 h-4" style={{ color: selectedType.color }} />
            </div>
          )}
          <div>
            <p className="text-[13px] font-bold leading-tight" style={{ color: "#e2e8f0" }}>Edit Course</p>
            <p className="text-[11px]" style={{ color: "#334155" }}>{course?.courseCode}</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          form="edit-form" type="submit"
          disabled={updateMutation.isPending || !isDirty}
          className="flex items-center gap-2 h-9 px-5 rounded-xl font-bold text-[13px] text-white"
          style={{
            background: isDirty ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(99,102,241,0.1)",
            border: isDirty ? "none" : "1px solid rgba(99,102,241,0.15)",
            color: isDirty ? "#fff" : "#334155",
            boxShadow: isDirty ? "0 4px 16px rgba(79,70,229,0.4)" : "none",
            transition: "all 0.2s",
          }}>
          {updateMutation.isPending
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            : updateMutation.isSuccess
              ? <><Check className="w-3.5 h-3.5" /> Saved</>
              : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
        </motion.button>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <form id="edit-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left — forms */}
            <div className="lg:col-span-2 space-y-5">

              {/* Identity */}
              <Section title="Course Identity">
                <div>
                  <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>Course Title *</label>
                  <input {...register("title")} placeholder="e.g. Data Structures & Algorithms"
                    className="w-full h-12 rounded-xl px-4 text-[14px] font-medium outline-none transition-all"
                    style={fieldStyle(!!errors.title)}
                    onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.45)"}
                    onBlur={e => (e.target as HTMLElement).style.borderColor = errors.title ? "rgba(239,68,68,0.5)" : "rgba(99,102,241,0.15)"} />
                  {errors.title && <p className="text-[11px] text-red-400 mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>Course Code *</label>
                    <input {...register("courseCode")} placeholder="e.g. CSE-301"
                      className="w-full h-11 rounded-xl px-4 text-[13px] font-semibold outline-none transition-all"
                      style={fieldStyle(!!errors.courseCode)}
                      onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.45)"}
                      onBlur={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.15)"} />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>Credit Hours *</label>
                    <select {...register("creditHours")}
                      className="w-full h-11 rounded-xl px-4 text-[13px] font-semibold outline-none cursor-pointer"
                      style={fieldStyle()}>
                      {CREDIT_HOURS.map(c => <option key={c} value={c}>{c} Credit{c !== 1 ? "s" : ""}</option>)}
                    </select>
                  </div>
                </div>
              </Section>

              {/* Course type */}
              <Section title="Course Type">
                <div className="grid grid-cols-5 gap-2">
                  {TYPE_OPTIONS.map(opt => {
                    const Icon = opt.icon
                    const sel = w.courseType === opt.value
                    return (
                      <label key={opt.value} className="cursor-pointer">
                        <input type="radio" {...register("courseType")} value={opt.value} className="sr-only" />
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl text-center"
                          style={{
                            background: sel ? `${opt.color}18` : "rgba(7,14,33,0.6)",
                            border: `1.5px solid ${sel ? opt.color + "45" : "rgba(99,102,241,0.08)"}`,
                            boxShadow: sel ? `0 4px 16px ${opt.color}18` : "none",
                            transition: "all 0.15s",
                          }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: sel ? `${opt.color}22` : "rgba(99,102,241,0.06)" }}>
                            <Icon className="w-4 h-4" style={{ color: sel ? opt.color : "#334155" }} strokeWidth={2} />
                          </div>
                          <span className="text-[11px] font-bold" style={{ color: sel ? opt.color : "#334155" }}>{opt.label}</span>
                        </motion.div>
                      </label>
                    )
                  })}
                </div>
              </Section>

              {/* Academic details */}
              <Section title="Academic Details">
                <div>
                  <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>Department *</label>
                  <select {...register("department")}
                    className="w-full h-11 rounded-xl px-4 text-[13px] font-semibold outline-none cursor-pointer"
                    style={fieldStyle(!!errors.department)}>
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <p className="text-[11px] text-red-400 mt-1">{errors.department.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>Academic Session</label>
                    <select {...register("academicSession")}
                      className="w-full h-11 rounded-xl px-4 text-[13px] font-semibold outline-none cursor-pointer"
                      style={fieldStyle()}>
                      {ACADEMIC_SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>Semester</label>
                    <select {...register("semester")}
                      className="w-full h-11 rounded-xl px-4 text-[13px] font-semibold outline-none cursor-pointer"
                      style={fieldStyle()}>
                      {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="block text-[12px] font-bold mb-2" style={{ color: "#64748b" }}>
                    Section <span style={{ color: "#1e3a5f" }}>(optional)</span>
                  </label>
                  <input {...register("section")} placeholder="e.g. A, B, C"
                    className="w-full h-11 rounded-xl px-4 text-[13px] font-medium outline-none transition-all"
                    style={fieldStyle()}
                    onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.45)"}
                    onBlur={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.15)"} />
                </div>
              </Section>

              {/* Description */}
              <Section title="Description">
                <textarea {...register("description")} rows={4}
                  placeholder="What will students learn in this course..."
                  className="w-full rounded-xl px-4 py-3 text-[13px] font-medium outline-none transition-all resize-none"
                  style={fieldStyle()}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.45)"}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = "rgba(99,102,241,0.15)"} />
              </Section>
            </div>

            {/* Right — sidebar */}
            <div className="space-y-5">

              {/* Live preview */}
              <div className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(10,18,38,0.8)", border: "1px solid rgba(99,102,241,0.12)" }}>
                <div className="h-24 relative"
                  style={{ background: course?.coverImageUrl ? undefined : `linear-gradient(135deg,${selectedType?.color ?? "#4f46e5"}25,transparent)` }}>
                  {course?.coverImageUrl
                    ? <img src={course.coverImageUrl} className="w-full h-full object-cover" />
                    : selectedType && <selectedType.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-10" style={{ color: selectedType.color }} />
                  }
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(10,18,38,0.95),transparent 55%)" }} />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                    style={{ background: `${selectedType?.color ?? "#4f46e5"}20`, color: selectedType?.color ?? "#818cf8", border: `1px solid ${selectedType?.color ?? "#4f46e5"}30` }}>
                    {w.courseType || course?.courseType}
                  </span>
                </div>
                <div className="p-4 space-y-1.5">
                  <p className="text-[14px] font-extrabold leading-snug" style={{ color: "#e2e8f0" }}>
                    {w.title || course?.title}
                  </p>
                  <p className="text-[12px] font-semibold" style={{ color: "#334155" }}>
                    {w.courseCode || course?.courseCode} &bull; {w.creditHours || course?.creditHours} Credits
                  </p>
                  {w.description && (
                    <p className="text-[11px] leading-relaxed line-clamp-2 pt-1" style={{ color: "#1e3a5f" }}>{w.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(w.department || course?.department) && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}>
                        {(w.department || course?.department || "").split(" ")[0]}
                      </span>
                    )}
                    {(w.semester || course?.semester) && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}>
                        {w.semester || course?.semester}
                      </span>
                    )}
                    {(w.section || course?.section) && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>
                        Sec {w.section || course?.section}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Joining code */}
              {course?.joiningCode && (
                <div className="rounded-2xl p-4"
                  style={{ background: "rgba(10,18,38,0.7)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: "rgba(99,102,241,0.4)" }}>Joining Code</p>
                  <p className="text-[22px] font-extrabold tracking-[0.25em] text-center py-2 rounded-xl"
                    style={{ color: "#818cf8", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)", letterSpacing: "0.3em" }}>
                    {course.joiningCode}
                  </p>
                  <p className="text-[10px] mt-2 text-center" style={{ color: "#1e3a5f" }}>Share with students to join</p>
                </div>
              )}

              {/* Danger zone */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                  <p className="text-[11px] font-extrabold uppercase tracking-widest" style={{ color: "rgba(239,68,68,0.6)" }}>Danger Zone</p>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: "#475569" }}>
                  Archiving will hide this course from all members. This action can be reversed.
                </p>
                <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { if (confirm("Archive this course?")) archiveMutation.mutate() }}
                  disabled={archiveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-[12px]"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                  {archiveMutation.isPending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Archiving...</>
                    : <><Archive className="w-3.5 h-3.5" /> Archive Course</>}
                </motion.button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

