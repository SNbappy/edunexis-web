import { RotateCcw, Clock } from "lucide-react"
import Button from "@/components/ui/Button"
import type { DeletedCourseDto } from "@/types/course.types"

interface Props {
  course:      DeletedCourseDto
  onRestore:   (id: string) => void
  isRestoring?: boolean
}

function daysLeft(deadline: string): number {
  const ms = new Date(deadline).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export default function DeletedCourseCard({ course, onRestore, isRestoring }: Props) {
  const remaining = daysLeft(course.restoreDeadline)

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

      <div className={"flex items-center gap-1.5 text-[12px] font-semibold " + (course.canRestore ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
        <Clock className="h-3.5 w-3.5" />
        {course.canRestore
          ? (remaining === 0 ? "Expires today" : " day" + (remaining === 1 ? "" : "s") + " left to restore")
          : "Restore window expired"}
      </div>

      <Button
        variant="secondary"
        className="w-full"
        disabled={!course.canRestore || isRestoring}
        loading={isRestoring}
        onClick={() => onRestore(course.id)}
      >
        <RotateCcw className="h-4 w-4" />
        Restore course
      </Button>
    </div>
  )
}