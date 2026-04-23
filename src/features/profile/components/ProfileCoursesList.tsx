import { Link } from "react-router-dom"
import { BookOpen, ArrowRight } from "lucide-react"
import type { PublicCourseDto } from "@/types/auth.types"

const ACCENTS = [
  "bg-teal-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
] as const

function pickAccent(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(hash) % ACCENTS.length]
}

interface ProfileCoursesListProps {
  courses:      PublicCourseDto[]
  isSelf:       boolean
  isTeacher:    boolean
}

export default function ProfileCoursesList({
  courses, isSelf, isTeacher,
}: ProfileCoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-stone-50/50 px-4 py-8 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        <p className="mt-3 text-[13px] font-semibold text-foreground">
          {isTeacher ? "No courses taught yet" : "No enrolled courses"}
        </p>
        {isSelf && (
          <p className="mt-1 text-[12px] text-muted-foreground">
            {isTeacher
              ? "Courses you create will appear here."
              : "Courses you join will appear here."}
          </p>
        )}
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {courses.map(c => {
        const accent = pickAccent(c.id)
        return (
          <li key={c.id}>
            <Link
              to={isSelf ? `/courses/${c.id}/stream` : "#"}
              className={`group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors ${isSelf ? "hover:border-teal-300 hover:bg-teal-50/30" : "cursor-default"}`}
              onClick={e => { if (!isSelf) e.preventDefault() }}
            >
              <div className={`h-8 w-1 rounded-full ${accent}`} aria-hidden />

              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[13px] font-bold text-foreground">
                  {c.title}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="font-mono font-semibold uppercase tracking-wider">
                    {c.courseCode}
                  </span>
                  <span>·</span>
                  <span className="truncate">{c.semester}</span>
                </p>
              </div>

              {isSelf && (
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
