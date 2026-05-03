import { Link } from "react-router-dom"
import { BookOpen, MapPin } from "lucide-react"
import type { PublicFacultyCardDto } from "@/types/auth.types"

interface Props {
  teacher: PublicFacultyCardDto
}

export default function PublicTeacherCard({ teacher }: Props) {
  const initials = teacher.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join("")

  return (
    <Link
      to={`/faculty/${teacher.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-teal-300 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] dark:hover:border-teal-700"
    >
      <div className="flex items-start gap-4">
        {teacher.profilePhotoUrl ? (
          <img
            src={teacher.profilePhotoUrl}
            alt={teacher.fullName}
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-border"
            loading="lazy"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-[15px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            {initials || "T"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[14.5px] font-bold text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300">
            {teacher.fullName}
          </h3>
          {teacher.designation ? (
            <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
              {teacher.designation}
            </p>
          ) : null}
        </div>
      </div>

      {teacher.headline ? (
        <p className="mt-4 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
          {teacher.headline}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-[11.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2 py-1 font-semibold">
          <MapPin className="h-3 w-3" />
          {teacher.department}
        </span>
        {teacher.coursesTaught > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2 py-1 font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            <BookOpen className="h-3 w-3" />
            {teacher.coursesTaught} {teacher.coursesTaught === 1 ? "course" : "courses"}
          </span>
        ) : null}
      </div>
    </Link>
  )
}