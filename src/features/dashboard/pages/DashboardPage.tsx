import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { BookOpen, Users, Bell, Plus, ArrowRight, ArrowUpRight } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useDashboard } from "../hooks/useDashboard"
import NotificationItem from "@/features/notifications/components/NotificationItem"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { isTeacher } from "@/utils/roleGuard"
import { getFirstName } from "@/utils/names"
import { getGreeting } from "@/utils/greeting"
import { ROUTES } from "@/config/constants"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import Skeleton from "@/components/ui/Skeleton"
import { Page, PageHero } from "@/components/ui/Page"
import { ActiveCourseCard } from "@/features/courses/components/CourseCard"
import { ICON_STROKE, SURFACE, TEXT, FOCUS, MOTION } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"

// Greeting name comes from the shared helper — see utils/names.ts.

/* ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { courses, stats, recentActivity, isLoading } = useDashboard()
  const { markRead, deleteNotification } = useNotifications()

  const teacher   = isTeacher(user?.role ?? "Student")
  const firstName = getFirstName(user?.profile?.fullName)
  const active    = courses.filter((c: any) => !c.isArchived)

  const greeting = getGreeting()
  const today    = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  return (
    <Page width="wide">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: MOTION.ease }}
      >
        <PageHero
          eyebrow={today}
          title={<>{greeting}, <span className="text-teal-300">{firstName}.</span></>}
          description={
            teacher
              ? "Everything you teach, in one place."
              : "Everything you're enrolled in, in one place."
          }
          figures={isLoading ? undefined : [
            {
              value: stats.activeCourses,
              label: stats.activeCourses === 1 ? "active course" : "active courses",
              to: ROUTES.COURSES,
            },
            ...(teacher ? [{ value: stats.totalStudents, label: "students taught" }] : []),
            { value: stats.unreadCount, label: "unread", to: "/notifications" },
          ]}
        />
      </motion.div>

      <div className="mt-7 grid grid-cols-1 gap-7 lg:grid-cols-3">
        {/* ── Courses ─────────────────────────────────────────── */}
        <section className="lg:col-span-2">
          <div className="mb-3.5 flex items-end justify-between gap-4">
            <div>
              <h2 className={TEXT.section}>{teacher ? "Your courses" : "Enrolled courses"}</h2>
              <p className={cn(TEXT.muted, "mt-0.5")}>
                {active.length > 0
                  ? `${active.length} running this semester`
                  : "Nothing running yet"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {courses.length > 0 && (
                <Link
                  to={ROUTES.COURSES}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-1 py-0.5 text-[12.5px] font-semibold text-primary transition-opacity duration-120 hover:opacity-75",
                    FOCUS,
                  )}
                >
                  View all
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                </Link>
              )}
              <Link to={teacher ? "/courses/create" : "/courses/join"}>
                <Button size="sm" leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
                  {teacher ? "New course" : "Join"}
                </Button>
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[168px]" rounded="2xl" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <EmptyState
              variant="panel"
              icon={<BookOpen strokeWidth={ICON_STROKE} />}
              title={teacher ? "Create your first course" : "Join your first course"}
              description={
                teacher
                  ? "Set one up in about a minute — then take attendance, post materials and grade from the same place."
                  : "Ask your teacher for the joining code. Everything for that course then lives here."
              }
              action={
                <Link to={teacher ? "/courses/create" : "/courses/join"}>
                  <Button leftIcon={<Plus strokeWidth={ICON_STROKE} />}>
                    {teacher ? "Create course" : "Join course"}
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {active.slice(0, 6).map((c: any) => (
                <ActiveCourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>

        {/* ── Activity ────────────────────────────────────────── */}
        <section>
          <div className="mb-3.5 flex items-end justify-between gap-4">
            <div>
              <h2 className={TEXT.section}>Recent activity</h2>
              <p className={cn(TEXT.muted, "mt-0.5")}>Across all your courses</p>
            </div>
            {recentActivity.length > 0 && (
              <Link
                to="/notifications"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-1 py-0.5 text-[12.5px] font-semibold text-primary transition-opacity duration-120 hover:opacity-75",
                  FOCUS,
                )}
              >
                All
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
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
              title="Nothing yet today"
              description={
                teacher
                  ? "Post an announcement or take attendance and it'll show up here."
                  : "Announcements, new assignments and published marks land here."
              }
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
