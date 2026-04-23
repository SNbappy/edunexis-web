import { BookOpen, FlaskConical, User as UserIcon } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { useAuthStore } from "@/store/authStore"
import type { CourseType } from "@/types/course.types"

interface MiniCourseCardPreviewProps {
  title?:        string
  courseCode?:   string
  courseType?:   CourseType
  department?:   string
  semester?:     string
  section?:      string
  description?:  string
  creditHours?:  number
}

/**
 * Lightweight mirror of the live CourseCard used in the Create Course
 * form. Updates as the teacher types so they can see what their course
 * will look like on the Courses list.
 *
 * Intentionally its own component (not a variant of the real CourseCard)
 * because the card needs different state management and shouldn't pretend
 * to be enrolled/pending/etc.
 */
export default function MiniCourseCardPreview({
  title, courseCode, courseType, department, semester, section,
  description, creditHours,
}: MiniCourseCardPreviewProps) {
  const { user } = useAuthStore()
  const teacherName  = user?.profile?.fullName ?? "You"
  const teacherPhoto = user?.profile?.profilePhotoUrl

  const isLab = courseType === "Lab"
  const TypeIcon = isLab ? FlaskConical : BookOpen
  const accentClass = isLab ? "bg-amber-500" : "bg-teal-500"
  const accentBg    = isLab ? "bg-amber-50"  : "bg-teal-50"
  const accentText  = isLab ? "text-amber-700" : "text-teal-700"

  const displayTitle = title && title.trim().length > 0 ? title : "Course title"
  const displayCode  = courseCode && courseCode.trim().length > 0 ? courseCode : "COURSE-000"
  const metaParts = [department, semester, section ? "Sec " + section : null]
    .filter(Boolean)

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Accent header */}
      <div className={"relative h-20 " + accentClass}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="absolute bottom-2 right-3 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
          <TypeIcon className="h-3 w-3" />
          {courseType ?? "Theory"}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Code pill */}
        <div className={"inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider " + accentBg + " " + accentText}>
          {displayCode}
        </div>

        {/* Title */}
        <h3 className="mt-2 font-display text-[15px] font-bold leading-tight text-foreground line-clamp-2">
          {displayTitle}
        </h3>

        {/* Meta */}
        {metaParts.length > 0 && (
          <p className="mt-1.5 truncate text-[11.5px] text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}

        {/* Description (truncated) */}
        {description && description.trim().length > 0 && (
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
          <Avatar
            src={teacherPhoto}
            name={teacherName}
            size="xs"
            className="h-6 w-6"
          />
          <span className="truncate text-[11.5px] font-semibold text-foreground">
            {teacherName}
          </span>
          {creditHours !== undefined && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-semibold text-muted-foreground">
              <UserIcon className="h-3 w-3" />
              {creditHours} cr
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
