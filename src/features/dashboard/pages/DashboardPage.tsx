import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Users, Bell, Plus, ArrowRight, Clock } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useDashboard } from "../hooks/useDashboard"
import NotificationItem from "@/features/notifications/components/NotificationItem"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { isTeacher } from "@/utils/roleGuard"
import { ROUTES } from "@/config/constants"
import { Page, PageHeader } from "@/components/ui/Page"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import { ActiveCourseCard } from "@/features/courses/components/CourseCard"
import { ICON, ICON_STROKE, SURFACE, TEXT, FOCUS, MOTION } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

const TITLES = /^(dr|prof|mr|mrs|ms|md|engr)\.?$/i
function getFirstName(fullName?: string | null): string {
  if (!fullName) return "there"
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  while (parts.length > 1 && TITLES.test(parts[0])) parts.shift()
  return parts[0] ?? "there"
}

/* ═══════════════════════════════════════════════════════════════
   Summary line.

   This replaces four 148px stat tiles that between them reported
   "1 course, 18 students, 0 unread". Counts that small are read in a
   glance and then never again — they do not deserve a quarter of the
   screen each. They are one line now, and the space goes to the courses,
   which are the thing people actually came to click.
   ═══════════════════════════════════════════════════════════════ */
function SummaryLine({
  items, loading,
}: {
  items: { icon: React.ElementType; value: number | string; label: string; to?: string }[]
  loading?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      {items.map((it, i) => {
        const body = (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5",
              it.to && "transition-colors duration-120 hover:border-border-strong hover:bg-muted",
            )}
          >
            <it.icon className={cn(ICON.xs, "text-muted-foreground")} strokeWidth={ICON_STROKE} />
            {loading ? (
              <Skeleton className="h-3.5 w-6" />
            ) : (
              <span className="font-display text-[14px] font-bold tabular-nums text-foreground">
                {it.value}
              </span>
            )}
            <span className="text-[12.5px] text-muted-foreground">{it.label}</span>
          </span>
        )
        return it.to ? (
          <Link key={i} to={it.to} className={cn("rounded-xl", FOCUS)}>{body}</Link>
        ) : (
          <span key={i}>{body}</span>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { courses, stats, recentActivity, isLoading } = useDashboard()
  const { markRead, deleteNotification } = useNotifications()

  const teacher   = isTeacher(user?.role ?? "Student")
  const firstName = getFirstName(user?.profile?.fullName)
  const active    = courses.filter((c: any) => !c.isArchived)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const today    = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  const summary = [
    { icon: BookOpen, value: stats.activeCourses, label: stats.activeCourses === 1 ? "active course" : "active courses", to: ROUTES.COURSES },
    ...(teacher ? [{ icon: Users, value: stats.totalStudents, label: "students" }] : []),
    { icon: Bell, value: stats.unreadCount, label: "unread", to: "/notifications" },
    ...(stats.archivedCount > 0 ? [{ icon: Clock, value: stats.archivedCount, label: "archived", to: ROUTES.COURSES }] : []),
  ]

  return (
    <Page width="wide">
      <PageHeader
        title={`${greeting}, ${firstName}.`}
        description={today}
        actions={
          <Link to={teacher ? "/courses/create" : "/courses/join"}>
            <Button variant="primary" leftIcon={<Plus />}>
              {teacher ? "New course" : "Join course"}
            </Button>
          </Link>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.base, ease: MOTION.ease }}
        className="-mt-2 mb-7"
      >
        <SummaryLine items={summary} loading={isLoading} />
      </motion.div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        {/* ── Courses ─────────────────────────────────────────── */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className={TEXT.section}>{teacher ? "Your courses" : "Enrolled courses"}</h2>
            {courses.length > 0 && (
              <Link
                to={ROUTES.COURSES}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg text-[12.5px] font-semibold text-primary transition-opacity duration-120 hover:opacity-75",
                  FOCUS,
                )}
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[158px]" rounded="2xl" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <EmptyState
              variant="panel"
              icon={<BookOpen strokeWidth={ICON_STROKE} />}
              title={teacher ? "No courses yet" : "You haven't joined a course"}
              description={
                teacher
                  ? "Create your first course to start taking attendance, posting materials and grading."
                  : "Ask your teacher for a joining code, then enrol to see everything here."
              }
              action={
                <Link to={teacher ? "/courses/create" : "/courses/join"}>
                  <Button leftIcon={<Plus />}>{teacher ? "Create course" : "Join course"}</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {active.slice(0, 6).map((c: any) => (
                <ActiveCourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>

        {/* ── Activity ────────────────────────────────────────── */}
        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <h2 className={TEXT.section}>Recent activity</h2>
            {recentActivity.length > 0 && (
              <Link
                to="/notifications"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg text-[12.5px] font-semibold text-primary transition-opacity duration-120 hover:opacity-75",
                  FOCUS,
                )}
              >
                All
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className={cn(SURFACE.card, "space-y-2 p-2")}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" rounded="xl" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <EmptyState
              variant="panel"
              icon={<Bell strokeWidth={ICON_STROKE} />}
              title="All quiet"
              description="Announcements, assignments and marks will appear here as they happen."
              className="py-12"
            />
          ) : (
            <div className={cn(SURFACE.card, "divide-y divide-border overflow-hidden")}>
              {recentActivity.map((n: any) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Page>
  )
}
