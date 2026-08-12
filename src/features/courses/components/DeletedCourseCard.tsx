import { useState } from "react"
import { RotateCcw, Clock, Trash2 } from "lucide-react"
import Button from "@/components/ui/Button"
import type { DeletedCourseDto } from "@/types/course.types"

interface Props {
  course:               DeletedCourseDto
  onRestore:            (id: string) => void
  isRestoring?:         boolean
  onPermanentlyDelete:  (id: string) => void
  isPermanentlyDeleting?: boolean
}

function daysLeft(deadline: string): number {
  const ms = new Date(deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function DeletedCourseCard({
  course, onRestore, isRestoring, onPermanentlyDelete, isPermanentlyDeleting,
}: Props) {
  const remaining = daysLeft(course.restoreDeadline)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  let timeLabel = "Restore window expired"
  if (course.canRestore) {
    if (remaining === 0) {
      timeLabel = "Expires today"
    } else {
      timeLabel = remaining + " day" + (remaining === 1 ? "" : "s") + " left to restore"
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 opacity-90">
      <div className="min-w-0">
        <p className="truncate font-display text-[15px] font-bold text-foreground">
          {course.title}
        </p>
        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
          {course.courseCode} &middot; {course.department} &middot; {course.semester}
        </p>
      </div>

      <div
        className={
          "flex items-center gap-1.5 text-[12px] font-semibold " +
          (course.canRestore ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")
        }
      >
        <Clock className="h-3.5 w-3.5" />
        {timeLabel}
      </div>

      {!confirmingDelete ? (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={!course.canRestore || isRestoring}
            loading={isRestoring}
            onClick={() => onRestore(course.id)}
          >
            <RotateCcw className="h-4 w-4" />
            Restore
          </Button>
          <Button
            variant="secondary"
            className="px-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            onClick={() => setConfirmingDelete(true)}
            disabled={isPermanentlyDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
          <p className="text-[12px] font-semibold text-red-700 dark:text-red-300">
            Delete forever? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmingDelete(false)}
              disabled={isPermanentlyDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={isPermanentlyDeleting}
              onClick={() => onPermanentlyDelete(course.id)}
            >
              Delete forever
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}