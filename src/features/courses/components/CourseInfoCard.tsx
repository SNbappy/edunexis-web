import { BookOpen, Hash, GraduationCap, Calendar, Clock, Award, Eye, EyeOff, Copy, Check, Users, Layers } from "lucide-react"
import { useState } from "react"
import Avatar from "@/components/ui/Avatar"
import { useThemeStore } from "@/store/themeStore"
import type { CourseDto } from "@/types/course.types"

interface Props { course: CourseDto }

export default function CourseInfoCard({ course }: Props) {
  const { dark } = useThemeStore()
  const [codeVisible, setCodeVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    if (!course.joiningCode) return
    navigator.clipboard.writeText(course.joiningCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardBg  = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur    = "blur(20px)"
  const border  = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const divider = dark ? "rgba(99,102,241,0.1)"  : "#f3f4f6"
  const textMain= dark ? "#e2e8f8" : "#111827"
  const textSub = dark ? "#8896c8" : "#6b7280"
  const textMuted=dark ? "#5a6a9a" : "#9ca3af"
  const labelCol= dark ? "rgba(99,102,241,0.5)" : "#9ca3af"

  const INFO = [
    { icon: Hash,          label: "Course Code", value: course.courseCode,              color: "#6366f1" },
    { icon: GraduationCap, label: "Semester",    value: course.semester,                color: "#0891b2" },
    { icon: Calendar,      label: "Session",     value: course.academicSession,         color: "#d97706" },
    { icon: Award,         label: "Credits",     value: course.creditHours ? `${course.creditHours} hrs` : null, color: "#db2777" },
    { icon: Layers,        label: "Type",        value: course.courseType,              color: "#7c3aed" },
    { icon: Users,         label: "Members",     value: course.memberCount != null ? `${course.memberCount} students` : null, color: "#059669" },
    ...(course.section ? [{ icon: BookOpen, label: "Section", value: course.section, color: "#0891b2" }] : []),
  ].filter(i => i.value)

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>

      {/* Instructor */}
      <div className="p-4" style={{ borderBottom: `1px solid ${divider}` }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: labelCol }}>
          Instructor
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0"
            style={{ border: `2px solid ${dark ? "rgba(99,102,241,0.3)" : "#c7d2fe"}` }}>
            <Avatar src={course.teacherProfilePhotoUrl} name={course.teacherName} size="md" className="w-full h-full" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold truncate" style={{ color: textMain }}>{course.teacherName}</p>
            <p className="text-[11px] truncate" style={{ color: textMuted }}>{course.department}</p>
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="p-4 space-y-2.5" style={{ borderBottom: `1px solid ${divider}` }}>
        {INFO.map(item => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${item.color}15`, border: `1px solid ${item.color}28` }}>
              <item.icon style={{ width: 13, height: 13, color: item.color }} strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: labelCol }}>{item.label}</p>
              <p className="text-[12.5px] font-semibold truncate" style={{ color: textSub }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Join code */}
      {course.joiningCode && (
        <div className="p-4" style={{ borderBottom: course.description ? `1px solid ${divider}` : "none" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: labelCol }}>Join Code</p>
            <button onClick={() => setCodeVisible(v => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
              style={{ color: "#6366f1" }}>
              {codeVisible ? <><EyeOff style={{ width: 11, height: 11 }} /> Hide</> : <><Eye style={{ width: 11, height: 11 }} /> Show</>}
            </button>
          </div>
          {codeVisible ? (
            <button onClick={copyCode}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all"
              style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: `1px solid ${dark ? "rgba(99,102,241,0.25)" : "#c7d2fe"}` }}>
              <span className="text-[18px] font-black font-mono tracking-[0.25em]" style={{ color: "#6366f1" }}>
                {course.joiningCode}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold"
                style={{ color: copied ? "#059669" : "#6366f1" }}>
                {copied
                  ? <><Check style={{ width: 13, height: 13 }} /> Copied!</>
                  : <><Copy style={{ width: 13, height: 13 }} /> Copy</>}
              </span>
            </button>
          ) : (
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: dark ? "rgba(99,102,241,0.05)" : "#f9fafb", border: `1px solid ${dark ? "rgba(99,102,241,0.1)" : "#e5e7eb"}` }}>
              <span className="text-[18px] font-black tracking-[0.25em] select-none"
                style={{ color: dark ? "rgba(99,102,241,0.15)" : "#d1d5db" }}>
                {"*".repeat(course.joiningCode.length)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {course.description && (
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: labelCol }}>About</p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: textSub }}>{course.description}</p>
        </div>
      )}
    </div>
  )
}
