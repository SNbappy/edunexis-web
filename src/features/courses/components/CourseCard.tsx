import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Archive, Users, X, Clock, XCircle } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { ICON_STROKE, FOCUS, SURFACE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import type {
  CourseSummaryDto, PendingCourseDto, RejectedCourseDto,
} from "@/types/course.types"

function formatRelative(iso: string): string {
  const d   = new Date(iso)
  const now = new Date()
  const ms  = now.getTime() - d.getTime()
  const h   = ms / 3_600_000
  if (h < 1)  return "just now"
  if (h < 24) return `${Math.floor(h)}h ago`
  const days = Math.floor(h / 24)
  if (days < 7)  return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

/* ────────────────────────────────────────────────────────────────── */
/*   ACTIVE CARD — enrolled, clickable                                */
/* ────────────────────────────────────────────────────────────────── */

interface ActiveCardProps {
  course:    CourseSummaryDto
  viewMode?: "grid" | "list"   // back-compat, unused
}

/**
 * Active course card — the canonical one, used by both the courses grid and the
 * dashboard so the two can't drift apart again.
 *
 * The course *code* leads. Previously every card opened with a coloured strip
 * whose hue came from hashing the course id: four courses got four different
 * colours that encoded nothing, and a teacher could never learn what teal meant
 * because it meant nothing. CSE-327 is the thing people actually scan for.
 */
export function ActiveCourseCard({ course }: ActiveCardProps) {
  return (
    <Link
      to={`/courses/${course.id}/stream`}
      className={cn("group block rounded-2xl", FOCUS, course.isArchived && "opacity-70")}
    >
      <div className={cn(SURFACE.cardInteractive, "flex h-full flex-col p-4")}>
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-[11px] font-bold tracking-wide text-primary">
            {course.courseCode}
          </span>
          {course.isArchived && (
            <Badge variant="neutral" size="sm" icon={<Archive strokeWidth={ICON_STROKE} />}>
              Archived
            </Badge>
          )}
        </div>

        <h3 className="mt-2.5 line-clamp-2 font-display text-[15px] font-bold leading-snug text-foreground transition-colors duration-120 group-hover:text-primary">
          {course.title}
        </h3>

        <div className="mt-2 flex items-center gap-2">
          <Avatar
            src={course.teacherProfilePhotoUrl}
            name={course.teacherName}
            size="xs"
            className="h-5 w-5 shrink-0"
          />
          <span className="truncate text-[12.5px] text-muted-foreground">
            {course.teacherName}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <span className="truncate">{course.semester}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5">
            <Users className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
            <span className="font-semibold tabular-nums text-foreground">{course.memberCount}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*   PENDING CARD — awaiting teacher review, not clickable            */
/* ────────────────────────────────────────────────────────────────── */

interface PendingCardProps {
  course: PendingCourseDto
}

export function PendingCourseCard({ course }: PendingCardProps) {
  return (
    <div
      aria-disabled="true"
      className={cn(SURFACE.card, "group relative overflow-hidden")}
    >
      {/* Stripe means "awaiting review" here, rather than being a colour drawn
          from the course id — status is the only thing worth colouring. */}
      <div className="h-1 w-full bg-warning" />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[11px] font-bold tracking-wide text-primary">
              {course.courseCode}
            </p>
            <h3 className="truncate font-display text-[17px] font-bold text-foreground">
              {course.title}
            </h3>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {course.teacherProfilePhotoUrl ? (
            <img
              src={course.teacherProfilePhotoUrl}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {course.teacherName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-[13px] text-muted-foreground">
            {course.teacherName}
          </span>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>Waiting for teacher</span>
          <span className="tabular-nums">{formatRelative(course.requestedAt)}</span>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*   REJECTED CARD — declined, dismissible                            */
/* ────────────────────────────────────────────────────────────────── */

interface RejectedCardProps {
  course:      RejectedCourseDto
  onDismiss:   (requestId: string) => void
  isDismissing?: boolean
}

export function RejectedCourseCard({
  course, onDismiss, isDismissing,
}: RejectedCardProps) {
  return (
    <div
      aria-disabled="true"
      className={cn(SURFACE.card, "group relative overflow-hidden")}
    >
      <div className="h-1 w-full bg-destructive" />

      {/* Dismiss button (top right absolute) */}
      <button
        type="button"
        onClick={() => onDismiss(course.requestId)}
        disabled={isDismissing}
        aria-label="Dismiss rejected request"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 opacity-0 transition-all hover:bg-stone-200 hover:text-stone-900 group-hover:opacity-100 disabled:opacity-40 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700 dark:hover:text-stone-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 pr-8">
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-700">
              {course.courseCode}
            </p>
            <h3 className="truncate font-display text-[17px] font-bold text-foreground">
              {course.title}
            </h3>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-300">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {course.teacherProfilePhotoUrl ? (
            <img
              src={course.teacherProfilePhotoUrl}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              {course.teacherName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-[13px] text-muted-foreground">
            {course.teacherName}
          </span>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <span>Teacher declined</span>
          <span className="tabular-nums">
            {formatRelative(course.reviewedAt ?? course.requestedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*   BACKCOMPAT DEFAULT EXPORT                                        */
/* ────────────────────────────────────────────────────────────────── */

/**
 * Default export kept for backward compatibility with existing imports.
 * New code should import named variants directly.
 *
 * @deprecated use ActiveCourseCard instead
 */
export default ActiveCourseCard


