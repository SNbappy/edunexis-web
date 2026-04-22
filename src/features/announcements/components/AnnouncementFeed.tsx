import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Megaphone, Sparkles } from "lucide-react"
// import gsap from "gsap"
import AnnouncementCard from "./AnnouncementCard"
import CreateAnnouncementForm from "./CreateAnnouncementForm"
import { useAnnouncements } from "../hooks/useAnnouncements"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"

interface Props { courseId: string }

export default function AnnouncementFeed({ courseId }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const { announcements, isLoading, create, isCreating, deleteAnnouncement, togglePin } = useAnnouncements(courseId)
  const listRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading || !listRef.current) return
    const cards = listRef.current.querySelectorAll(".announcement-card")
    if (!cards.length) return
    // gsap.fromTo(cards,
    //   { opacity: 0, y: 16 },
    //   { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.06 }
    // )
  }, [isLoading, announcements.length])

  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const skelBg   = dark ? "rgba(99,102,241,0.06)" : "#f3f4f6"

  if (isLoading) return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {[1,2,3].map(i => (
        <div key={i} className="rounded-2xl animate-pulse p-5 space-y-3"
          style={{ background: cardBg, backdropFilter: blur, border: `1px solid ${border}`, height: i === 1 ? 100 : 140 }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl shrink-0" style={{ background: skelBg }} />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 rounded-full w-1/3" style={{ background: skelBg }} />
              <div className="h-2.5 rounded-full w-1/4" style={{ background: skelBg }} />
            </div>
          </div>
          <div className="space-y-2 pl-12">
            <div className="h-2.5 rounded-full w-full"  style={{ background: skelBg }} />
            <div className="h-2.5 rounded-full w-4/5"   style={{ background: skelBg }} />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {teacher && (
        <CreateAnnouncementForm courseId={courseId} onSubmit={create} isLoading={isCreating} />
      )}

      {announcements.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
          style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `2px dashed ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}` }}>
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #c7d2fe" }}>
              <Megaphone style={{ width: 28, height: 28, color: "#6366f1" }} strokeWidth={1.5} />
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: dark ? "rgba(217,119,6,0.15)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.3)" : "1px solid #fde68a" }}>
              <Sparkles style={{ width: 10, height: 10, color: "#d97706" }} />
            </motion.div>
          </div>
          <p className="text-[15px] font-bold mb-1" style={{ color: textMain }}>No announcements yet</p>
          <p className="text-[13px] max-w-xs" style={{ color: textSub }}>
            {teacher
              ? "Post your first announcement to keep students informed"
              : "Your teacher has not posted any announcements yet"
            }
          </p>
        </motion.div>
      ) : (
        <div ref={listRef} className="space-y-4">
          {announcements.map((a, i) => (
            <div key={a.id} className="announcement-card">
              <AnnouncementCard announcement={a} index={i}
                canPin={teacher} canDelete={teacher || a.authorId === user?.id}
                onPin={togglePin} onDelete={deleteAnnouncement} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
