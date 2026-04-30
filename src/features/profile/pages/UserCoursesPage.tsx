import { useState, useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, BookOpen, Archive, Search, X } from "lucide-react"
import { useUserCourses } from "../hooks/useUserCourses"
import { usePublicProfile } from "../hooks/usePublicProfile"
import BrandLoader from "@/components/ui/BrandLoader"
import Button from "@/components/ui/Button"
import { isTeacher } from "@/utils/roleGuard"
import ProfileCoursesList from "../components/ProfileCoursesList"

export default function UserCoursesPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const profile = usePublicProfile(userId)
  const courses = useUserCourses(userId)

  // ── All memos must run unconditionally on every render ──
  const q = query.trim().toLowerCase()

  const running = useMemo(() => {
    const list = courses.data?.running ?? []
    if (!q) return list
    return list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      c.semester.toLowerCase().includes(q),
    )
  }, [courses.data, q])

  const archived = useMemo(() => {
    const list = courses.data?.archived ?? []
    if (!q) return list
    return list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      c.semester.toLowerCase().includes(q),
    )
  }, [courses.data, q])

  // ── Now safe to early-return ──
  if (profile.isLoading || courses.isLoading) {
    return <BrandLoader variant="page" />
  }

  if (!profile.data || !courses.data) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Profile not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This profile may not exist or you don't have permission to view it.
        </p>
        <Button className="mt-5" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const teacher = isTeacher(profile.data.role)
  const isSelf = profile.data.viewerRelation === "Self"
  const total = running.length + archived.length

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="mt-6 flex items-center gap-3">
        <Link
          to={isSelf ? "/profile" : "/users/" + profile.data.userId}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>
      </div>

      <header className="mt-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {teacher ? "Courses taught by" : "Courses enrolled by"}{" "}
          <span className="text-teal-700 dark:text-teal-400">{profile.data.fullName}</span>
        </h1>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          {profile.data.runningCoursesCount} running {"\u00B7"} {profile.data.archivedCoursesCount} archived
        </p>
      </header>

      <div className="mt-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, code, or semester"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-10 text-[13.5px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {total === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-4 font-display text-[15px] font-semibold text-foreground">
            {q ? "No courses match your search" : "No courses to show"}
          </p>
        </div>
      ) : null}

      {running.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-600" />
            <h2 className="font-display text-[15px] font-bold text-foreground">Running</h2>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              {running.length}
            </span>
          </div>
          <ProfileCoursesList courses={running} isSelf={isSelf} isTeacher={teacher} />
        </section>
      ) : null}

      {archived.length > 0 ? (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5">
          <div className="mb-4 flex items-center gap-2">
            <Archive className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-[15px] font-bold text-foreground">Archived</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
              {archived.length}
            </span>
          </div>
          <ProfileCoursesList courses={archived} isSelf={isSelf} isTeacher={teacher} />
        </section>
      ) : null}
    </div>
  )
}