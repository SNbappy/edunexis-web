import { Link } from "react-router-dom"
import { BookOpen } from "lucide-react"
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-teal-300 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.12)] dark:hover:border-teal-700"
    >
      {/* Photo — large, full-width, square */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30">
        {teacher.profilePhotoUrl ? (
          <img
            src={teacher.profilePhotoUrl}
            alt={teacher.fullName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-teal-700 dark:text-teal-300">
            {initials || "T"}
          </div>
        )}
        {/* Active courses badge — overlay top-right when present */}
        {teacher.coursesTaught > 0 ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-bold text-teal-700 backdrop-blur-sm shadow-sm dark:bg-stone-900/95 dark:text-teal-300">
            <BookOpen className="h-2.5 w-2.5" />
            {teacher.coursesTaught} {teacher.coursesTaught === 1 ? "course" : "courses"}
          </span>
        ) : null}
      </div>

      {/* Info block */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-display text-[15px] font-bold leading-tight text-foreground group-hover:text-teal-700 dark:group-hover:text-teal-300">
          {teacher.fullName}
        </h3>
        {teacher.designation ? (
          <p className="mt-1 text-[12.5px] font-semibold text-muted-foreground">
            {teacher.designation}
          </p>
        ) : null}
        <p className="mt-2 text-[11.5px] text-muted-foreground">
          {teacher.department}
        </p>
        {teacher.headline ? (
          <p className="mt-3 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {teacher.headline}
          </p>
        ) : null}
      </div>
    </Link>
  )
}