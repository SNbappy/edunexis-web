import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, LogIn, Search, BookOpen, Archive as ArchiveIcon, Inbox } from "lucide-react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import {
  ActiveCourseCard, PendingCourseCard, RejectedCourseCard,
} from "../components/CourseCard"
import { useCourses } from "../hooks/useCourses"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"

type FilterKey = "active" | "archived" | "requests"

export default function CoursesListPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")

  const {
    enrolled, pending, rejected,
    isLoading, dismissRequest, isDismissing,
  } = useCourses()

  const [filter, setFilter] = useState<FilterKey>("active")
  const [q, setQ] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  // "/" shortcut to focus search
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement)?.matches("input, textarea")) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [])

  const requestCount = pending.length + rejected.length
  const hasRequests  = !teacher && requestCount > 0

  // Filter enrolled courses by search + archive status
  const filteredEnrolled = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return enrolled.filter(c => {
      if (filter === "active"   && c.isArchived)  return false
      if (filter === "archived" && !c.isArchived) return false
      if (!needle) return true
      return (
        c.title.toLowerCase().includes(needle) ||
        c.courseCode.toLowerCase().includes(needle) ||
        c.teacherName.toLowerCase().includes(needle)
      )
    })
  }, [enrolled, filter, q])

  const showingEnrolled = filter !== "requests"
  const showingRequests = filter === "requests"

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Skeleton className="mb-6 h-10 w-64" />
        <Skeleton className="mb-8 h-12 w-full max-w-md" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
            {teacher ? "Your courses" : "My courses"}
          </h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {teacher
              ? "Courses you're teaching this semester."
              : "Classes you're enrolled in."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {teacher ? (
            <Button onClick={() => navigate("/courses/create")}>
              <Plus className="h-4 w-4" />
              New course
            </Button>
          ) : (
            <Button onClick={() => navigate("/courses/join")}>
              <LogIn className="h-4 w-4" />
              Join course
            </Button>
          )}
        </div>
      </header>

      {/* Search + filter chips */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by title, code, or teacher..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-16 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/30"
          />
          {!q && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
              /
            </kbd>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <FilterChip active={filter === "active"}   onClick={() => setFilter("active")}>
            Active
          </FilterChip>
          <FilterChip active={filter === "archived"} onClick={() => setFilter("archived")}>
            Archived
          </FilterChip>
          {hasRequests && (
            <FilterChip
              active={filter === "requests"}
              onClick={() => setFilter("requests")}
              badge={requestCount}
            >
              Requests
            </FilterChip>
          )}
        </div>
      </div>

      {/* Grid */}
      {showingEnrolled && filteredEnrolled.length === 0 && (
        <EmptyState
          filter={filter}
          teacher={teacher}
          hasSearch={!!q}
          onCreate={() => navigate("/courses/create")}
          onJoin={()   => navigate("/courses/join")}
        />
      )}

      {showingEnrolled && filteredEnrolled.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredEnrolled.map(course => (
            <ActiveCourseCard key={course.id} course={course} />
          ))}
        </motion.div>
      )}

      {showingRequests && (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Pending ({pending.length})
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {pending.map(p => (
                  <PendingCourseCard key={p.requestId} course={p} />
                ))}
              </div>
            </section>
          )}

          {rejected.length > 0 && (
            <section>
              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Declined ({rejected.length})
              </h2>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {rejected.map(r => (
                  <RejectedCourseCard
                    key={r.requestId}
                    course={r}
                    onDismiss={dismissRequest}
                    isDismissing={isDismissing}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function FilterChip({
  active, onClick, children, badge,
}: {
  active:   boolean
  onClick:  () => void
  children: React.ReactNode
  badge?:   number
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all ${
        active
          ? "bg-teal-600 text-white"
          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
            active ? "bg-white/20 text-white" : "bg-white text-teal-700"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

function EmptyState({
  filter, teacher, hasSearch, onCreate, onJoin,
}: {
  filter:    FilterKey
  teacher:   boolean
  hasSearch: boolean
  onCreate:  () => void
  onJoin:    () => void
}) {
  if (hasSearch) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-stone-50/50 py-16 text-center">
        <Search className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-semibold text-foreground">No courses match your search</p>
        <p className="mt-1 text-sm text-muted-foreground">Try different keywords.</p>
      </div>
    )
  }

  if (filter === "archived") {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-stone-50/50 py-16 text-center">
        <ArchiveIcon className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-4 font-semibold text-foreground">No archived courses</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Archived courses appear here when you retire them.
        </p>
      </div>
    )
  }

  // filter === "active", no courses
  return (
    <div className="rounded-2xl border border-dashed border-border bg-stone-50/50 py-16 text-center">
      {teacher ? (
        <>
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">No courses yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first course to get started.
          </p>
          <Button className="mt-5" onClick={onCreate}>
            <Plus className="h-4 w-4" />
            New course
          </Button>
        </>
      ) : (
        <>
          <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-semibold text-foreground">Not enrolled in any courses</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask your teacher for a joining code.
          </p>
          <Button className="mt-5" onClick={onJoin}>
            <LogIn className="h-4 w-4" />
            Join course
          </Button>
        </>
      )}
    </div>
  )
}
