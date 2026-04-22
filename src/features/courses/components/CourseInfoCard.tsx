import { useState } from "react"
import {
  Hash, GraduationCap, Calendar, Clock, Award,
  Layers, Users, BookOpen, Copy, Check,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { cn } from "@/utils/cn"
import type { CourseDto } from "@/types/course.types"

interface Props {
  course: CourseDto
  /** If true (teacher), join code is shown. Students see none. */
  showJoinCode?: boolean
  className?: string
}

export default function CourseInfoCard({ course, showJoinCode = false, className }: Props) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    if (!course.joiningCode) return
    navigator.clipboard.writeText(course.joiningCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const info = [
    { icon: Hash,          label: "Course code", value: course.courseCode                                     },
    { icon: GraduationCap, label: "Semester",    value: course.semester                                       },
    { icon: Calendar,      label: "Session",     value: course.academicSession                                },
    { icon: Clock,         label: "Credits",     value: course.creditHours ? `${course.creditHours} hrs` : null },
    { icon: Layers,        label: "Type",        value: course.courseType                                     },
    { icon: Users,         label: "Enrolled",    value: course.memberCount != null ? `${course.memberCount}` : null },
    { icon: BookOpen,      label: "Section",     value: course.section                                        },
  ].filter(i => i.value) as { icon: any; label: string; value: string }[]

  return (
    <div className={cn("rounded-2xl border border-border bg-card overflow-hidden", className)}>
      {/* Instructor */}
      <div className="p-5 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
          Instructor
        </p>
        <div className="flex items-center gap-3">
          <Avatar
            src={course.teacherProfilePhotoUrl}
            name={course.teacherName}
            size="md"
            className="shrink-0"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-foreground truncate">
              {course.teacherName}
            </p>
            {course.department && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {course.department}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info rows */}
      {info.length > 0 && (
        <div className="p-5 border-b border-border">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
            Details
          </p>
          <dl className="space-y-2.5">
            {info.map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-lg inline-flex items-center justify-center bg-muted text-muted-foreground shrink-0">
                  <item.icon className="h-3.5 w-3.5" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0 flex items-baseline justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">{item.label}</span>
                  <span className="text-[12.5px] font-semibold text-foreground truncate">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Join code — teacher only */}
      {showJoinCode && course.joiningCode && (
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Join code
            </p>
            <span className="pill pill-muted">Share with students</span>
          </div>
          <button
            onClick={copyCode}
            className="w-full flex items-center justify-between px-4 h-11 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors group"
            aria-label="Copy join code"
          >
            <span className="font-mono font-bold text-[16px] tracking-[0.2em] text-primary">
              {course.joiningCode}
            </span>
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-semibold transition-colors",
              copied ? "text-success" : "text-primary",
            )}>
              {copied ? (
                <><Check className="h-3.5 w-3.5" /> Copied</>
              ) : (
                <><Copy className="h-3.5 w-3.5" /> Copy</>
              )}
            </span>
          </button>
        </div>
      )}

      {/* Description */}
      {course.description && (
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
            About
          </p>
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        </div>
      )}
    </div>
  )
}
