import { Archive, ArchiveRestore, Eye } from "lucide-react"
import Button from "@/components/ui/Button"
import { ICON_STROKE } from "@/components/ui/appTokens"

/**
 * Explains the freeze at the top of an archived course.
 *
 * Without this the course simply stops accepting things, with no statement
 * anywhere of why or how to undo it — the worst version of a read-only mode.
 * The wording leads with what still works, because "archived" reads as "gone"
 * and the first thing anyone needs to know is that nothing has been lost.
 */
export default function ArchivedCourseBanner({
  isOwner, onUnarchive, isUnarchiving,
}: {
  isOwner: boolean
  onUnarchive?: () => void
  isUnarchiving?: boolean
}) {
  return (
    <div className="mb-6 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
            <Archive className="h-[18px] w-[18px]" strokeWidth={ICON_STROKE} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-[14.5px] font-bold text-amber-900 dark:text-amber-200">
              This course is archived
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-amber-800/90 dark:text-amber-200/75">
              Everything is still here and everyone can still read it — materials,
              marks, submissions and the full register.{" "}
              {isOwner
                ? "Nothing can be changed until you restore it."
                : "Nothing can be changed until the teacher restores it."}
            </p>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-800/80 dark:text-amber-200/65">
              <Eye className="h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
              Read-only
            </p>
          </div>
        </div>

        {isOwner && onUnarchive && (
          <Button
            variant="secondary"
            onClick={onUnarchive}
            loading={isUnarchiving}
            leftIcon={<ArchiveRestore strokeWidth={ICON_STROKE} />}
            className="shrink-0"
          >
            Restore course
          </Button>
        )}
      </div>
    </div>
  )
}
