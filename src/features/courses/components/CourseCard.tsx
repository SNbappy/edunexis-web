import { memo } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Users, BookOpen, ArrowRight, Clock } from "lucide-react"
import { cn } from "@/utils/cn"

// Subtle accent-strip rotation — same palette as dashboard mini-cards
const ACCENTS = [
  "bg-primary",
  "bg-info",
  "bg-success",
  "bg-accent",
] as const

interface CourseCardProps {
  course: any
  index?: number
  isTeacher?: boolean
  /** Kept for backward compatibility; the list-mode UI is de-emphasized. */
  viewMode?: "grid" | "list"
}

export default memo(function CourseCard({
  course, index = 0, isTeacher = false, viewMode = "grid",
}: CourseCardProps) {
  const members  = course.memberCount ?? course.enrollmentCount ?? course.studentCount ?? 0
  const archived = !!course.isArchived
  const link     = `/courses/${course.id}/stream`
  const accent   = ACCENTS[index % ACCENTS.length]

  // ────── List view (compact, for power users) ──────
  if (viewMode === "list") {
    return (
      <Link to={link}>
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className={cn(
            "group flex items-center gap-4 px-4 py-3 rounded-xl border bg-card transition-colors",
            "hover:border-primary/40 hover:bg-muted/50",
            archived && "opacity-70",
          )}
        >
          <div className={cn(
            "h-10 w-10 rounded-lg inline-flex items-center justify-center shrink-0 text-white",
            accent,
          )}>
            <BookOpen className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {course.courseCode && (
                <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wide">
                  {course.courseCode}
                </span>
              )}
              <p className="text-[14px] font-semibold text-foreground truncate">
                {course.title ?? "Untitled"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {[course.semester, course.department, course.teacherName].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />
              {members}
            </span>
            <span className={cn("pill", archived ? "pill-muted" : "pill-brand")}>
              {archived ? "Archived" : "Active"}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </div>
        </motion.div>
      </Link>
    )
  }

  // ────── Grid view (default) ──────
  return (
    <Link to={link}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all h-full",
          "hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5",
          archived && "opacity-70",
        )}
      >
        {/* Accent strip on top — subtle visual differentiation */}
        <div className={cn("h-1 w-full", accent)} aria-hidden />

        <div className="flex flex-col gap-3 p-5 flex-1 min-h-0">
          {/* Header: icon + status */}
          <div className="flex items-start justify-between">
            <div className={cn(
              "h-11 w-11 rounded-xl inline-flex items-center justify-center shrink-0 text-white",
              accent,
            )}>
              <BookOpen className="h-5 w-5" strokeWidth={2} />
            </div>
            <span className={cn("pill", archived ? "pill-muted" : "pill-brand")}>
              {archived ? "Archived" : "Active"}
            </span>
          </div>

          {/* Course code + semester row */}
          {(course.courseCode || course.semester) && (
            <div className="flex items-center gap-2 flex-wrap">
              {course.courseCode && (
                <span className="font-mono text-[11px] font-bold text-primary uppercase tracking-wide">
                  {course.courseCode}
                </span>
              )}
              {course.semester && (
                <span className="text-[11px] text-muted-foreground">
                  {course.semester}
                </span>
              )}
              {course.creditHours && (
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {course.creditHours} cr
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-display text-[15px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title ?? "Untitled Course"}
          </h3>

          {/* Subtitle: teacher (for students) or department */}
          <div className="flex-1 min-h-0">
            {!isTeacher && course.teacherName ? (
              <div className="flex items-center gap-2">
                <div className={cn(
                  "h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                  accent,
                )}>
                  {course.teacherName.charAt(0).toUpperCase()}
                </div>
                <p className="text-[12px] text-muted-foreground truncate">
                  {course.teacherName}
                </p>
              </div>
            ) : course.department ? (
              <p className="text-[12px] text-muted-foreground truncate">
                {course.department}
              </p>
            ) : null}
          </div>

          {/* Footer: members + open cta */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />
              {members} member{members === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Open
              <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
})
