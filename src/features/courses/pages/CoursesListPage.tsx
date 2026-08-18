import { useState, useMemo, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus, LogIn, Search, BookOpen, Archive as ArchiveIcon, Inbox, Trash2, Mail } from "lucide-react"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Skeleton from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import { Page, PageHero } from "@/components/ui/Page"
import { ICON_STROKE, FOCUS, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import {
  ActiveCourseCard, PendingCourseCard, RejectedCourseCard,
} from "../components/CourseCard"
import DeletedCourseCard from "../components/DeletedCourseCard"
import { useCourses } from "../hooks/useCourses"
import { useMyCourseInvitations } from "../hooks/useCourseTeachers"
import { useDeletedCourses } from "../hooks/useDeletedCourses"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"

type FilterKey = "active" | "archived" | "requests" | "deleted"

export default function CoursesListPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? "Student")

  const {
    enrolled, pending, rejected,
    isLoading, dismissRequest, isDismissing,
    restoreCourse, isRestoring, permanentlyDeleteCourse, isPermanentlyDeleting,
  } = useCourses()
  const { data: deletedCourses = [], isLoading: isDeletedLoading } = useDeletedCourses()

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

  /* Co-teaching invitations addressed to this teacher. Surfaced here rather
     than only in notifications: a notification is easy to miss, and an
     invitation that is never answered leaves the sender waiting. */
  const { invitations, respond, isResponding } = useMyCourseInvitations(teacher)
  const hasInvitations = teacher && invitations.length > 0

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

  const showingEnrolled = filter !== "requests" && filter !== "deleted"
  const showingRequests = filter === "requests"
  const showingDeleted  = filter === "deleted"

  // Loading state
  if (isLoading) {
    return (
      <Page>
        <Skeleton className="mb-3 h-8 w-56" />
        <Skeleton className="mb-6 h-9 w-full max-w-sm" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" rounded="2xl" />
          ))}
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <PageHero
        eyebrow={teacher ? "Teaching" : "Enrolled"}
        title={teacher ? "Your courses" : "My courses"}
        description={
          teacher
            ? "Everything you're running this semester — attendance, materials, assignments and marks."
            : "Every class you've joined, with your materials, deadlines and results."
        }
        figures={[
          { value: enrolled.filter(c => !c.isArchived).length, label: "active" },
          ...(enrolled.some(c => c.isArchived)
            ? [{ value: enrolled.filter(c => c.isArchived).length, label: "archived" }]
            : []),
        ]}
        actions={
          teacher ? (
            <Button onClick={() => navigate("/courses/create")} leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
              New course
            </Button>
          ) : (
            <Button onClick={() => navigate("/courses/join")} leftIcon={<LogIn strokeWidth={ICON_STROKE} />}>
              Join course
            </Button>
          )
        }
      />

      <div className="h-6" />

      {/* Search + filter chips */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search by title, code, or teacher…"
            value={q}
            onChange={e => setQ(e.target.value)}
            leftIcon={<Search strokeWidth={ICON_STROKE} />}
            className="pr-10"
          />
          {!q && (
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
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
          {teacher && deletedCourses.length > 0 && (
            <FilterChip
              active={filter === "deleted"}
              onClick={() => setFilter("deleted")}
              badge={deletedCourses.length}
            >
              Deleted
            </FilterChip>
          )}
        </div>
      </div>

      {/* Co-teaching invitations, above the grid — an unanswered invitation is
          somebody waiting on you, so it should not be buried under the list of
          courses you already have. */}
      {hasInvitations && (
        <div className="mb-4 space-y-2">
          {invitations.map((inv: any) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary-soft px-4 py-3"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">
                  {inv.invitedByName} invited you to co-teach {inv.courseCode} — {inv.courseTitle}
                </p>
                {inv.message && (
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    “{inv.message}”
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isResponding}
                  onClick={() => respond({ invitationId: inv.id, accept: false })}
                >
                  Decline
                </Button>
                <Button
                  size="sm"
                  loading={isResponding}
                  onClick={() => respond({ invitationId: inv.id, accept: true })}
                >
                  Accept
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {showingEnrolled && filteredEnrolled.length === 0 && (
        <CoursesEmpty
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
              <h2 className={cn(TEXT.eyebrow, "mb-3")}>
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
              <h2 className={cn(TEXT.eyebrow, "mb-3")}>
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
      {showingDeleted && !isDeletedLoading && deletedCourses.length === 0 && (
        <EmptyState
          variant="panel"
          icon={<Trash2 strokeWidth={ICON_STROKE} />}
          title="Nothing in Recently Deleted"
          description="Courses you delete stay here for 30 days before they are removed permanently."
        />
      )}
      {showingDeleted && deletedCourses.length > 0 && (
        <motion.div
          layout
          className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {deletedCourses.map(course => (
            <DeletedCourseCard
              key={course.id}
              course={course}
              onRestore={restoreCourse}
              isRestoring={isRestoring}
              onPermanentlyDelete={permanentlyDeleteCourse}
              isPermanentlyDeleting={isPermanentlyDeleting}
            />
          ))}
        </motion.div>
      )}
    </Page>
  )
}

/* ─── Sub-components ─────────────────────────────────────────────── */

/**
 * Filter chip. A segmented set rather than loose pills: the active chip is the
 * only filled one, and the group shares a track so it reads as "pick one".
 */
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
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-xl border px-3 text-[12.5px] font-semibold transition-colors duration-120",
        FOCUS,
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            "inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

/** Picks the right copy for why the grid is empty, then defers to the shared
 *  EmptyState primitive — this page previously hand-rolled three of them. */
function CoursesEmpty({
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
      <EmptyState
        variant="panel"
        icon={<Search strokeWidth={ICON_STROKE} />}
        title="No courses match your search"
        description="Try a different title, course code or teacher name."
      />
    )
  }

  if (filter === "archived") {
    return (
      <EmptyState
        variant="panel"
        icon={<ArchiveIcon strokeWidth={ICON_STROKE} />}
        title="No archived courses"
        description="Courses you retire at the end of a semester appear here, with all their records intact."
      />
    )
  }

  return teacher ? (
    <EmptyState
      variant="panel"
      icon={<BookOpen strokeWidth={ICON_STROKE} />}
      title="No courses yet"
      description="Create your first course to start taking attendance, posting materials and grading."
      action={
        <Button onClick={onCreate} leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
          New course
        </Button>
      }
    />
  ) : (
    <EmptyState
      variant="panel"
      icon={<Inbox strokeWidth={ICON_STROKE} />}
      title="Not enrolled in any courses"
      description="Ask your teacher for a joining code, then enrol to see everything here."
      action={
        <Button onClick={onJoin} leftIcon={<LogIn strokeWidth={ICON_STROKE} />}>
          Join course
        </Button>
      }
    />
  )
}
