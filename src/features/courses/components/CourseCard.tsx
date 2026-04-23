import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Archive, Users, GraduationCap, X, Clock, XCircle } from "lucide-react"
import type {
  CourseSummaryDto, PendingCourseDto, RejectedCourseDto,
} from "@/types/course.types"

/** Teal / amber / blue / violet rotation driven by course.id hash. */
const ACCENTS = [
  "bg-teal-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
] as const

function pickAccent(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return ACCENTS[Math.abs(hash) % ACCENTS.length]
}

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

export function ActiveCourseCard({ course }: ActiveCardProps) {
  const accent = pickAccent(course.id)

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md ${course.isArchived ? "opacity-70" : ""}`}
    >
      {/* Top accent strip */}
      <div className={`h-1 w-full ${accent}`} />

      <Link to={`/courses/${course.id}/stream`} className="block p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-700">
              {course.courseCode}
            </p>
            <h3 className="truncate font-display text-[17px] font-bold text-foreground group-hover:text-teal-700">
              {course.title}
            </h3>
          </div>

          {course.isArchived && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
              <Archive className="h-3 w-3" />
              Archived
            </span>
          )}
        </div>

        {/* Teacher */}
        <div className="mt-3 flex items-center gap-2">
          {course.teacherProfilePhotoUrl ? (
            <img
              src={course.teacherProfilePhotoUrl}
              alt=""
              className="h-6 w-6 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-600">
              {course.teacherName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-[13px] text-muted-foreground">
            {course.teacherName}
          </span>
        </div>

        {/* Divider */}
        <div className="my-4 h-px bg-border" />

        {/* Meta row */}
        <div className="flex items-center justify-between text-[12px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="truncate">{course.semester}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span className="font-semibold tabular-nums">{course.memberCount}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────── */
/*   PENDING CARD — awaiting teacher review, not clickable            */
/* ────────────────────────────────────────────────────────────────── */

interface PendingCardProps {
  course: PendingCourseDto
}

export function PendingCourseCard({ course }: PendingCardProps) {
  const accent = pickAccent(course.id)

  return (
    <div
      aria-disabled="true"
      className="group relative overflow-hidden rounded-2xl border border-border bg-card opacity-70 transition-all hover:opacity-85"
    >
      <div className={`h-1 w-full ${accent}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="mb-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-teal-700">
              {course.courseCode}
            </p>
            <h3 className="truncate font-display text-[17px] font-bold text-foreground">
              {course.title}
            </h3>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
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
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-600">
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
  const accent = pickAccent(course.id)

  return (
    <div
      aria-disabled="true"
      className="group relative overflow-hidden rounded-2xl border border-border bg-card opacity-75 transition-all hover:opacity-95"
    >
      <div className={`h-1 w-full ${accent}`} />

      {/* Dismiss button (top right absolute) */}
      <button
        type="button"
        onClick={() => onDismiss(course.requestId)}
        disabled={isDismissing}
        aria-label="Dismiss rejected request"
        className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-600 opacity-0 transition-all hover:bg-stone-200 hover:text-stone-900 group-hover:opacity-100 disabled:opacity-40"
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

          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
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
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-[11px] font-bold text-stone-600">
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
