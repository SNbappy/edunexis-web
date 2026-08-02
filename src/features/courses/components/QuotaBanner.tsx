import { AlertCircle, Info, Sparkles } from "lucide-react"
import type { TeacherQuotaDto } from "@/types/course.types"

interface Props {
  quota?:   TeacherQuotaDto
  loading?: boolean
}

/**
 * Compact status card for a teacher's course-creation quota.
 * - Green/muted: healthy remaining
 * - Amber: on last slot
 * - Red: exhausted; hints at admin request flow
 */
export default function QuotaBanner({ quota, loading }: Props) {
  if (loading) {
    return (
      <div className="h-10 w-full max-w-xl animate-pulse rounded-lg bg-muted/40" />
    )
  }
  if (!quota) return null

  const { totalQuota, usedQuota, remainingQuota, isStarterQuota, isAccessActive } = quota

  if (!isAccessActive) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/20">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-rose-800 dark:text-rose-200">Access period expired</p>
          <p className="mt-0.5 text-[11.5px] text-rose-700/80 dark:text-rose-300/70">
            Contact your admin to renew your course-creation access.
          </p>
        </div>
      </div>
    )
  }

  if (remainingQuota <= 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-950/20">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" strokeWidth={2.25} />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-rose-800 dark:text-rose-200">
            Course creation quota exhausted ({usedQuota} / {totalQuota})
          </p>
          <p className="mt-0.5 text-[11.5px] text-rose-700/80 dark:text-rose-300/70">
            You've used every slot you were granted. Request more from your admin to create additional courses.
          </p>
        </div>
      </div>
    )
  }

  if (remainingQuota === 1) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" strokeWidth={2.25} />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold text-amber-800 dark:text-amber-200">
            {isStarterQuota
              ? "You have your 1 free course slot available."
              : "Last course slot available ( /  used)."}
          </p>
          <p className="mt-0.5 text-[11.5px] text-amber-700/80 dark:text-amber-300/70">
            Need to create more later? Request additional slots from your admin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" strokeWidth={2.25} />
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold text-foreground">
          {remainingQuota} course slots remaining ({usedQuota} / {totalQuota} used)
        </p>
      </div>
    </div>
  )
}