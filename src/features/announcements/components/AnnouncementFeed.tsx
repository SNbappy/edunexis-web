import { motion } from "framer-motion"
import { Pin, Megaphone } from "lucide-react"
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
      <div className="mx-auto max-w-2xl space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-border bg-card p-5"
            style={{ height: i === 1 ? 100 : 140 }}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-1/3 rounded-full bg-muted" />
                <div className="h-2.5 w-1/4 rounded-full bg-muted" />
              </div>
            </div>
            <div className="mt-4 space-y-2 pl-12">
              <div className="h-2.5 w-full rounded-full bg-muted" />
              <div className="h-2.5 w-4/5 rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Composer â€” teachers only */}
      {teacher && (
        <CreateAnnouncementForm
          courseId={courseId}
          onSubmit={create}
          isLoading={isCreating}
        />
      )}

      {/* Empty state */}
      {announcements.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50">
            <Megaphone className="h-7 w-7 text-teal-600" strokeWidth={1.5} />
          </div>
          <h3 className="mt-5 font-display text-[16px] font-bold text-foreground">
            {teacher ? "No announcements yet" : "Nothing posted yet"}
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
            {teacher
              ? "Share your first announcement to keep students in the loop. Use the composer above."
              : "Your teacher hasn't posted anything yet. Check back soon."}
          </p>
        </motion.div>
      )}

      {/* Pinned section */}
      {pinned.length > 0 && (
        <section className="space-y-3">
          <header className="flex items-center gap-2 px-1">
            <Pin className="h-3.5 w-3.5 text-teal-700" />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-teal-700">
              Pinned
            </h2>
            <span className="text-[11px] text-muted-foreground">
              Â· {pinned.length} {pinned.length === 1 ? "post" : "posts"}
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
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Recent
              </h2>
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
