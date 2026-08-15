import { Link } from "react-router-dom"
import { CalendarClock, FileText, Users, ArrowRight } from "lucide-react"
import { RailCard } from "@/components/ui/Page"
import { ICON_STROKE, FOCUS, TEXT } from "@/components/ui/appTokens"
import { useAssignments } from "@/features/assignments/hooks/useAssignments"
import { useMaterials } from "@/features/materials/hooks/useMaterials"
import { formatDate } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"

/**
 * Context rail beside the announcement feed.
 *
 * The stream was a narrow column with a third of the screen empty next to
 * it. Rather than stretch a feed — which is unreadable past ~70 characters
 * — the space carries the two things people leave the stream to check:
 * what is due next, and what was posted recently. Both are read from the
 * caches the other tabs already populate, so this adds no new requests
 * when you have visited them, and one cheap one when you have not.
 */
export default function StreamRail({ courseId }: { courseId: string }) {
  const { assignments } = useAssignments(courseId)
  const { materials } = useMaterials(courseId)

  const now = Date.now()
  const upcoming = assignments
    .filter(a => a.isOpen && new Date(a.deadline).getTime() > now)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 3)

  const recentFiles = (materials ?? [])
    .filter((m: any) => m.type !== "Folder")
    .slice(0, 4)

  return (
    <>
      <RailCard title="Due next">
        {upcoming.length === 0 ? (
          <p className={TEXT.muted}>Nothing due right now.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map(a => {
              const days = Math.ceil((new Date(a.deadline).getTime() - now) / 86_400_000)
              const soon = days <= 2
              return (
                <li key={a.id}>
                  <Link
                    to={`/courses/${courseId}/assignments/${a.id}`}
                    className={cn("group block rounded-lg", FOCUS)}
                  >
                    <p className="line-clamp-2 text-[12.5px] font-semibold text-foreground transition-colors duration-120 group-hover:text-primary">
                      {a.title}
                    </p>
                    <p className={cn(
                      "mt-1 inline-flex items-center gap-1.5 text-[11.5px]",
                      soon ? "font-semibold text-warning" : "text-muted-foreground",
                    )}>
                      <CalendarClock className="h-3 w-3" strokeWidth={ICON_STROKE} />
                      {days <= 0 ? "Due today" : days === 1 ? "Due tomorrow" : `Due in ${days} days`}
                      <span className="text-muted-foreground/70">
                        · {formatDate(a.deadline, "dd MMM")}
                      </span>
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <Link
          to={`/courses/${courseId}/assignments`}
          className={cn(
            "mt-3.5 inline-flex items-center gap-1 rounded-lg text-[12px] font-semibold text-primary transition-opacity duration-120 hover:opacity-75",
            FOCUS,
          )}
        >
          All assignments
          <ArrowRight className="h-3 w-3" strokeWidth={ICON_STROKE} />
        </Link>
      </RailCard>

      <RailCard title="Recent materials">
        {recentFiles.length === 0 ? (
          <p className={TEXT.muted}>Nothing posted yet.</p>
        ) : (
          <ul className="space-y-2.5">
            {recentFiles.map((m: any) => (
              <li key={m.id} className="flex items-start gap-2.5">
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={ICON_STROKE} />
                <span className="line-clamp-2 text-[12.5px] text-foreground">{m.title}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          to={`/courses/${courseId}/materials`}
          className={cn(
            "mt-3.5 inline-flex items-center gap-1 rounded-lg text-[12px] font-semibold text-primary transition-opacity duration-120 hover:opacity-75",
            FOCUS,
          )}
        >
          All materials
          <ArrowRight className="h-3 w-3" strokeWidth={ICON_STROKE} />
        </Link>
      </RailCard>

      <Link
        to={`/courses/${courseId}/members`}
        className={cn(
          "flex items-center justify-between rounded-2xl border border-border bg-card px-3.5 py-3 text-[12.5px] font-semibold text-foreground transition-colors duration-120 hover:bg-muted",
          FOCUS,
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={ICON_STROKE} />
          Class members
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={ICON_STROKE} />
      </Link>
    </>
  )
}
