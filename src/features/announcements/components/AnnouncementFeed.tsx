import { Pin, Megaphone } from "lucide-react"
import EmptyState from "@/components/ui/EmptyState"
import { SkeletonCard } from "@/components/ui/Skeleton"
import { ICON_STROKE, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import AnnouncementCard from "./AnnouncementCard"
import CreateAnnouncementForm from "./CreateAnnouncementForm"
import { useAnnouncements } from "../hooks/useAnnouncements"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { AnnouncementDto } from "@/types/announcement.types"

interface AnnouncementFeedProps {
  courseId: string
}

export default function AnnouncementFeed({ courseId }: AnnouncementFeedProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const {
    announcements, isLoading, create, isCreating,
    deleteAnnouncement, togglePin,
  } = useAnnouncements(courseId)

  /* Split into pinned + unpinned, preserving creation order within each group. */
  const pinned: AnnouncementDto[] = []
  const unpinned: AnnouncementDto[] = []
  for (const a of announcements) {
    if (a.isPinned) pinned.push(a)
    else unpinned.push(a)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        {[1, 2, 3].map(i => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Composer — teachers only */}
      {teacher && (
        <CreateAnnouncementForm
          courseId={courseId}
          onSubmit={create}
          isLoading={isCreating}
        />
      )}

      {/* Empty state */}
      {announcements.length === 0 && (
        <EmptyState
          variant="panel"
          icon={<Megaphone strokeWidth={ICON_STROKE} />}
          title={teacher ? "No announcements yet" : "Nothing posted yet"}
          description={
            teacher
              ? "Post your first announcement to keep the class in the loop — use the composer above."
              : "Your teacher hasn't posted anything yet. Check back soon."
          }
        />
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section className="space-y-3">
          <header className="flex items-center gap-2 px-1">
            <Pin className="h-3.5 w-3.5 text-primary" strokeWidth={ICON_STROKE} />
            <h2 className={cn(TEXT.eyebrow, "text-primary")}>Pinned</h2>
            <span className="text-[11px] text-muted-foreground">
              · {pinned.length} {pinned.length === 1 ? "post" : "posts"}
            </span>
          </header>
          <div className="space-y-3">
            {pinned.map((a, i) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                index={i}
                canPin={teacher}
                canDelete={teacher || a.authorId === user?.id}
                onPin={togglePin}
                onDelete={deleteAnnouncement}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent section */}
      {unpinned.length > 0 && (
        <section className="space-y-3">
          {pinned.length > 0 && (
            <header className="flex items-center gap-2 px-1">
              <h2 className={TEXT.eyebrow}>Recent</h2>
            </header>
          )}
          <div className="space-y-3">
            {unpinned.map((a, i) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                index={i}
                canPin={teacher}
                canDelete={teacher || a.authorId === user?.id}
                onPin={togglePin}
                onDelete={deleteAnnouncement}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}


