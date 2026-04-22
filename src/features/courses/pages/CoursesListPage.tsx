import { useState, useMemo, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Search, Plus, LogIn, X } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { useCourses } from "@/features/courses/hooks/useCourses"
import CourseCard from "@/features/courses/components/CourseCard"
import { cn } from "@/utils/cn"

type Status = "all" | "active" | "archived"

const STATUS_FILTERS = [
  { id: "all",      label: "All"      },
  { id: "active",   label: "Active"   },
  { id: "archived", label: "Archived" },
] as const

export default function CoursesListPage() {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")
  const { courses = [], isLoading } = useCourses()

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<Status>("active")
  const searchRef = useRef<HTMLInputElement>(null)

  // "/" keyboard shortcut focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "/") return
      const t = e.target as HTMLElement
      const typing = t && ["INPUT", "TEXTAREA"].includes(t.tagName) || t?.isContentEditable
      if (typing) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const filtered = useMemo(() => {
    let list = [...courses]

    // Status filter
    if (status === "active")   list = list.filter((c: any) => !c.isArchived)
    if (status === "archived") list = list.filter((c: any) =>  c.isArchived)

    // Search
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((c: any) =>
        c.title?.toLowerCase().includes(q)        ||
        c.courseCode?.toLowerCase().includes(q)   ||
        c.teacherName?.toLowerCase().includes(q)  ||
        c.department?.toLowerCase().includes(q),
      )
    }

    // Most-recent first by default
    list.sort((a: any, b: any) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    )

    return list
  }, [courses, search, status])

  const countFor = (id: Status): number => {
    if (id === "all")      return courses.length
    if (id === "active")   return courses.filter((c: any) => !c.isArchived).length
    return                        courses.filter((c: any) =>  c.isArchived).length
  }

  const primaryCTA = teacher
    ? { to: "/courses/create", label: "Create course",    icon: Plus  }
    : { to: "/courses/join",   label: "Join a course",    icon: LogIn }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="font-display text-2xl lg:text-[28px] font-bold tracking-tight text-foreground">
            {teacher ? "Your courses" : "Enrolled courses"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses.length === 0
              ? teacher
                ? "Create your first course to get started."
                : "Join a course to start learning."
              : `${courses.length} course${courses.length === 1 ? "" : "s"} in total`}
          </p>
        </div>

        <Link to={primaryCTA.to}>
          <button className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-105 focus-ring transition-all">
            <primaryCTA.icon className="h-4 w-4" strokeWidth={2.25} />
            {primaryCTA.label}
          </button>
        </Link>
      </motion.header>

      {/* ─── Filter bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: 0.04 }}
        className="flex items-center gap-3 flex-wrap"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses by name, code, teacher…"
            aria-label="Search courses"
            className={cn(
              "w-full h-10 pl-10 pr-20 rounded-xl text-sm font-medium outline-none",
              "bg-input text-foreground placeholder:text-muted-foreground/70",
              "border border-border hover:border-border-strong",
              "focus:border-primary focus:shadow-[0_0_0_3px_rgb(var(--ring)/0.18)]",
              "transition-[border-color,box-shadow] duration-150",
            )}
          />
          {search ? (
            <button
              onClick={() => { setSearch(""); searchRef.current?.focus() }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center h-6 px-1.5 rounded-md border border-border bg-background font-mono text-[10px] font-semibold text-muted-foreground">
              /
            </kbd>
          )}
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map(f => {
            const active = status === f.id
            const count  = countFor(f.id)
            return (
              <button
                key={f.id}
                onClick={() => setStatus(f.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors focus-ring",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-subtle hover:text-foreground border border-border",
                )}
              >
                {f.label}
                {count > 0 && (
                  <span className={cn(
                    "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ─── Body ─── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[220px] rounded-2xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          search={search}
          status={status}
          teacher={teacher}
          onClearSearch={() => setSearch("")}
          onClearStatus={() => setStatus("all")}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course: any, i: number) => (
            <CourseCard
              key={course.id}
              course={course}
              index={i}
              isTeacher={teacher}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════
function EmptyState({
  search, status, teacher, onClearSearch, onClearStatus,
}: {
  search: string
  status: Status
  teacher: boolean
  onClearSearch: () => void
  onClearStatus: () => void
}) {
  const searching = search.trim().length > 0
  const statusFiltered = status !== "all"

  // Filter-level empty (has courses but current filter hides them)
  if (searching || statusFiltered) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-border bg-card"
      >
        <div className="h-14 w-14 rounded-2xl inline-flex items-center justify-center bg-muted text-muted-foreground mb-4">
          <Search className="h-6 w-6" strokeWidth={1.8} />
        </div>
        <p className="font-display text-base font-semibold text-foreground">
          {searching ? "No matches" : "Nothing here"}
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          {searching
            ? `No courses match "${search}".`
            : `You don't have any ${status} courses.`}
        </p>
        <div className="flex gap-2 mt-5">
          {searching && (
            <button
              onClick={onClearSearch}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-muted hover:bg-subtle text-foreground transition-colors"
            >
              Clear search
            </button>
          )}
          {statusFiltered && (
            <button
              onClick={onClearStatus}
              className="h-9 px-3 rounded-lg text-xs font-semibold bg-muted hover:bg-subtle text-foreground transition-colors"
            >
              Show all
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  // True empty — no courses at all
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-2xl border border-dashed border-border bg-card"
    >
      <div className="h-16 w-16 rounded-2xl inline-flex items-center justify-center bg-primary/10 text-primary mb-5">
        <BookOpen className="h-7 w-7" strokeWidth={1.8} />
      </div>
      <p className="font-display text-lg font-semibold text-foreground">
        {teacher ? "No courses yet" : "You haven't joined any courses"}
      </p>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">
        {teacher
          ? "Create your first course to start managing students, materials, assignments, and grades — all in one place."
          : "Ask your teacher for a course join code, then enroll to access materials, submit assignments, and track your grades."}
      </p>
      <Link
        to={teacher ? "/courses/create" : "/courses/join"}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl mt-6 text-sm font-semibold bg-primary text-primary-foreground hover:brightness-105 transition"
      >
        {teacher
          ? <><Plus className="h-4 w-4" /> Create course</>
          : <><LogIn className="h-4 w-4" /> Join a course</>
        }
      </Link>
    </motion.div>
  )
}
