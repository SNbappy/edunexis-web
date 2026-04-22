import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  BookOpen, Users, Bell, Plus, ArrowRight,
  ClipboardList, Megaphone, GraduationCap, Info, Clock, Sparkles, ArrowUpRight,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useDashboard } from "../hooks/useDashboard"
import { isTeacher } from "@/utils/roleGuard"
import { ROUTES } from "@/config/constants"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/utils/cn"

const TITLES = /^(dr|prof|mr|mrs|ms|md|engr)\.?$/i
function getFirstName(fullName?: string | null): string {
  if (!fullName) return "there"
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  while (parts.length > 1 && TITLES.test(parts[0])) parts.shift()
  return parts[0] ?? "there"
}

const COURSE_TONES = [
  { iconBg: "bg-primary/10",   iconText: "text-primary"           },
  { iconBg: "bg-info-soft",    iconText: "text-info"              },
  { iconBg: "bg-success-soft", iconText: "text-success"           },
  { iconBg: "bg-accent/15",    iconText: "text-accent-foreground" },
] as const

// ═════════════════════════════════════════════════════════════
function HeroStrip({ firstName }: { firstName: string }) {
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const today    = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="flex items-end justify-between gap-4 flex-wrap"
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground">
          {greeting}, {firstName}.
        </p>
        <h1 className="font-display text-2xl lg:text-[28px] font-bold tracking-tight text-foreground mt-1">
          Here's what's happening today.
        </h1>
      </div>
      <p className="text-sm text-muted-foreground tabular-nums">{today}</p>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════
interface StatCardProps {
  label:    string
  value:    string | number
  hint?:    string
  icon:     React.ElementType
  loading?: boolean
  href?:    string
}

function StatCard({ label, value, hint, icon: Icon, loading, href }: StatCardProps) {
  const content = (
    <div className="group flex flex-col gap-5 h-full p-5 rounded-2xl border border-border bg-card hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>

      <div className="mt-auto">
        <div className="font-display text-[30px] font-bold leading-none tracking-tight text-foreground tabular-nums">
          {loading ? <span className="inline-block h-7 w-12 rounded-md skeleton" /> : value}
        </div>
        <div className="flex items-baseline gap-1.5 mt-2 flex-wrap">
          <span className="text-[13px] font-semibold text-foreground">{label}</span>
          {hint && (
            <span className="text-[12px] text-muted-foreground">· {hint}</span>
          )}
        </div>
      </div>
    </div>
  )

  return href ? <Link to={href} className="block h-[148px]">{content}</Link> : <div className="h-[148px]">{content}</div>
}

// ═════════════════════════════════════════════════════════════
function ActionCard({ to, title, subtitle, icon: Icon }: {
  to: string; title: string; subtitle: string; icon: React.ElementType
}) {
  return (
    <Link to={to} className="block h-[148px]">
      <div className="group flex flex-col gap-5 h-full p-5 rounded-2xl bg-primary text-primary-foreground hover:brightness-105 transition-all">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-xl bg-white/15 inline-flex items-center justify-center">
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <ArrowRight className="h-4 w-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <div className="mt-auto">
          <p className="font-display text-lg font-bold leading-tight">{title}</p>
          <p className="text-[12px] font-medium text-primary-foreground/80 mt-1">{subtitle}</p>
        </div>
      </div>
    </Link>
  )
}

// ═════════════════════════════════════════════════════════════
function CourseMiniCard({ course, index }: { course: any; index: number }) {
  const archived = course.isArchived
  const tone = COURSE_TONES[index % COURSE_TONES.length]

  return (
    <Link to={`/courses/${course.id}/stream`}>
      <div className="group flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all h-full">
        <div className="flex items-start justify-between">
          <div className={cn("h-10 w-10 rounded-xl inline-flex items-center justify-center", tone.iconBg, tone.iconText)}>
            <BookOpen className="h-[18px] w-[18px]" strokeWidth={2} />
          </div>
          <span className={cn("pill", archived ? "pill-muted" : "pill-brand")}>
            {archived ? "Archived" : "Active"}
          </span>
        </div>

        <div className="flex-1 min-h-0">
          <h3 className="font-display text-[15px] font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title ?? course.name ?? "Untitled course"}
          </h3>
          {(course.courseCode || course.description) && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {course.courseCode ?? course.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {course.enrolledCount ?? course.memberCount ?? course.membersCount ?? 0} members
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground/70 group-hover:text-primary transition-colors">
            Open
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ═════════════════════════════════════════════════════════════
// Activity item — NOW respects isRead properly
// ═════════════════════════════════════════════════════════════
const ACTIVITY_ICON: Record<string, { icon: React.ElementType; tone: string }> = {
  NewAssignment:              { icon: ClipboardList, tone: "bg-primary/10 text-primary" },
  AssignmentDeadlineReminder: { icon: Clock,         tone: "bg-destructive-soft text-destructive" },
  NewAnnouncement:            { icon: Megaphone,     tone: "bg-primary/10 text-primary" },
  NewMaterial:                { icon: BookOpen,      tone: "bg-info-soft text-info" },
  JoinRequestReceived:        { icon: Users,         tone: "bg-warning-soft text-warning" },
  CourseJoinApproved:         { icon: GraduationCap, tone: "bg-success-soft text-success" },
  CourseJoinRejected:         { icon: Info,          tone: "bg-destructive-soft text-destructive" },
  MarksPublished:             { icon: Sparkles,      tone: "bg-success-soft text-success" },
  General:                    { icon: Info,          tone: "bg-muted text-muted-foreground" },
}

function ActivityItem({ n }: { n: any }) {
  const cfg      = ACTIVITY_ICON[n.type] ?? ACTIVITY_ICON.General
  const Icon     = cfg.icon
  const time     = n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ""
  const isUnread = !n.isRead

  const content = (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isUnread
          ? "bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted",
      )}
    >
      {/* Unread dot — mirrors dropdown/page behavior */}
      {isUnread && (
        <span
          className="absolute left-1 top-3.5 h-1.5 w-1.5 rounded-full bg-primary"
          aria-hidden
        />
      )}

      <div className={cn("h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ml-1", cfg.tone)}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-[13px] leading-snug line-clamp-1",
          isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
        )}>
          {n.title ?? n.message ?? "Activity"}
        </p>
        {n.body && (
          <p className="text-[12px] text-muted-foreground line-clamp-1 mt-0.5">{n.body}</p>
        )}
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{time}</p>
      </div>
    </div>
  )

  return n.redirectUrl ? <Link to={n.redirectUrl}>{content}</Link> : content
}

// ═════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuthStore()
  const { courses, stats, recentActivity, isLoading } = useDashboard()
  const teacher   = isTeacher(user?.role ?? "Student")
  const firstName = getFirstName(user?.profile?.fullName)
  const recentCourses = courses.filter((c: any) => !c.isArchived).slice(0, 4)

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      <HeroStrip firstName={firstName} />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.04 }}
        className={cn(
          "grid gap-4",
          teacher
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 lg:grid-cols-3",
        )}
      >
        {teacher ? (
          <>
            <StatCard
              label="Courses"
              value={stats.totalCourses}
              hint={stats.archivedCount > 0 ? `${stats.archivedCount} archived` : `${stats.activeCourses} active`}
              icon={BookOpen}
              loading={isLoading}
              href={ROUTES.COURSES}
            />
            <StatCard
              label="Students"
              value={stats.totalStudents}
              hint="enrolled"
              icon={Users}
              loading={isLoading}
            />
            <StatCard
              label="Unread"
              value={stats.unreadCount}
              hint={stats.unreadCount === 0 ? "caught up" : "new"}
              icon={Bell}
              loading={isLoading}
              href="/notifications"
            />
            <ActionCard
              to="/courses/create"
              title="New course"
              subtitle="Set up in minutes"
              icon={Plus}
            />
          </>
        ) : (
          <>
            <StatCard
              label="Courses"
              value={stats.totalCourses}
              hint={stats.archivedCount > 0 ? `${stats.archivedCount} archived` : `${stats.activeCourses} active`}
              icon={BookOpen}
              loading={isLoading}
              href={ROUTES.COURSES}
            />
            <StatCard
              label="Unread"
              value={stats.unreadCount}
              hint={stats.unreadCount === 0 ? "caught up" : "new"}
              icon={Bell}
              loading={isLoading}
              href="/notifications"
            />
            <ActionCard
              to="/courses/join"
              title="Join a course"
              subtitle="Enter your teacher's code"
              icon={Plus}
            />
          </>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                {teacher ? "Your courses" : "Enrolled courses"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {recentCourses.length > 0
                  ? `Showing ${recentCourses.length} of ${stats.activeCourses} active`
                  : "Nothing here yet"}
              </p>
            </div>
            {courses.length > 0 && (
              <Link
                to={ROUTES.COURSES}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-700 transition-colors"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[164px] rounded-2xl skeleton" />
              ))}
            </div>
          ) : recentCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 px-6 text-center rounded-2xl border border-dashed border-border bg-card">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center">
                <BookOpen className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <p className="font-display text-base font-semibold text-foreground mt-4">
                {teacher ? "No courses yet" : "You haven't joined any courses"}
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                {teacher
                  ? "Create your first course to start managing students, materials, and assignments."
                  : "Ask your teacher for a join code, then enroll in your course."}
              </p>
              <Link
                to={teacher ? "/courses/create" : "/courses/join"}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-xl mt-5 text-sm font-semibold bg-primary text-primary-foreground hover:brightness-105 transition"
              >
                <Plus className="h-4 w-4" />
                {teacher ? "Create course" : "Join course"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentCourses.map((course: any, i: number) => (
                <CourseMiniCard key={course.id} course={course} index={i} />
              ))}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.12 }}
          className="space-y-4"
        >
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                Recent activity
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Latest updates from your courses
              </p>
            </div>
            {recentActivity.length > 0 && (
              <Link
                to="/notifications"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:text-primary-700 transition-colors"
              >
                All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-2">
            {isLoading ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg skeleton" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted text-muted-foreground inline-flex items-center justify-center">
                  <Bell className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <p className="text-sm font-semibold text-foreground mt-3">All quiet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  New updates will show up here.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {recentActivity.map((n: any) => (
                  <ActivityItem key={n.id} n={n} />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  )
}


