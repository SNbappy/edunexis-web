import { AlertCircle, Clock, Info } from "lucide-react"
import { ICON_STROKE } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import type { TeacherQuotaDto } from "@/types/course.types"

interface Props {
  quota?:   TeacherQuotaDto
  loading?: boolean
}

/**
 * A teacher's course-creation allowance.
 *
 * One row, one shape, four states — the previous version was four separate
 * hand-built blocks with their own colours and paddings, and the "last slot"
 * branch shipped a broken string that rendered as "Last course slot available
 * ( /  used)" because the counts were never interpolated.
 *
 * The expiry is shown whenever it is near, since that is the part a teacher
 * cannot infer: unused slots lapse on that date and need a fresh grant.
 */
export default function QuotaBanner({ quota, loading }: Props) {
  if (loading) return <div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-muted/50" />
  if (!quota) return null

  const {
    totalQuota, usedQuota, remainingQuota,
    isStarterQuota, isAccessActive, expiresInDays,
  } = quota

  const state =
    !isAccessActive ? "expired"
      : remainingQuota <= 0 ? "exhausted"
        : remainingQuota === 1 ? "last"
          : "ok"

  const TONE = {
    expired:   "border-destructive/25 bg-destructive-soft text-destructive",
    exhausted: "border-destructive/25 bg-destructive-soft text-destructive",
    last:      "border-warning/25 bg-warning-soft text-warning",
    ok:        "border-border bg-muted/40 text-muted-foreground",
  }[state]

  const Icon = state === "ok" ? Info : AlertCircle

  const title =
    state === "expired"  ? "Course creation access has expired"
      : state === "exhausted" ? `No course slots left — ${usedQuota} of ${totalQuota} used`
        : state === "last"      ? (isStarterQuota
            ? "You have 1 free course slot"
            : `Last course slot — ${usedQuota} of ${totalQuota} used`)
          : `${remainingQuota} course slots left — ${usedQuota} of ${totalQuota} used`

  const detail =
    state === "expired" || state === "exhausted"
      ? "Ask your admin for more slots. Courses you have already created are unaffected."
      : null

  /* Only surface the countdown when it is close enough to matter — a date two
     years out is noise, a week out is something to act on. */
  const showExpiry =
    isAccessActive && expiresInDays !== null && expiresInDays !== undefined && expiresInDays <= 60

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3", TONE)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={ICON_STROKE} />
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold">{title}</p>
        {detail && <p className="mt-0.5 text-[11.5px] opacity-80">{detail}</p>}
        {showExpiry && (
          <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] opacity-80">
            <Clock className="h-3 w-3" strokeWidth={ICON_STROKE} />
            {expiresInDays === 0
              ? "Unused slots lapse today"
              : `Unused slots lapse in ${expiresInDays} day${expiresInDays === 1 ? "" : "s"}`}
          </p>
        )}
      </div>
    </div>
  )
}
