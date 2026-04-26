import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, ChevronDown, ChevronUp, MoreVertical,
  Pin, PinOff, Trash2, ExternalLink,
} from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { formatRelative } from "@/utils/dateUtils"
import { useAuthStore } from "@/store/authStore"
import type { AnnouncementDto } from "@/types/announcement.types"

interface AnnouncementCardProps {
  announcement: AnnouncementDto
  index?: number
  canPin?: boolean
  canDelete?: boolean
  onPin?: (id: string) => void
  onDelete?: (id: string) => void
}

function getFileName(url: string): string {
  try { return decodeURIComponent(url.split("/").pop() ?? "Attachment") }
  catch { return "Attachment" }
}

const LONG_CONTENT_THRESHOLD = 280

export default function AnnouncementCard({
  announcement, index = 0, canPin = false, canDelete = false, onPin, onDelete,
}: AnnouncementCardProps) {
  const { user } = useAuthStore()
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isLong = announcement.content.length > LONG_CONTENT_THRESHOLD
  const showMenu = canPin || canDelete
  const isPinned = announcement.isPinned
  const isOwn = announcement.authorId === user?.id

  const photoUrl = isOwn ? user?.profile?.profilePhotoUrl ?? undefined : undefined

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.25 }}
      whileHover={{ y: -2 }}
      className={
        "group relative overflow-hidden rounded-2xl border bg-card shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_12px_32px_-8px_rgba(20,184,166,0.18)] " +
        (isPinned
          ? "border-teal-300 bg-teal-50/30"
          : "border-border")
      }
    >
      {/* Pinned accent stripe */}
      {isPinned && (
        <div className="absolute inset-y-0 left-0 w-1 bg-teal-500" aria-hidden />
      )}

      <div className={"relative space-y-4 p-5 " + (isPinned ? "pl-6" : "")}>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="shrink-0">
            <Avatar
              src={photoUrl}
              name={announcement.authorName}
              size="sm"
              className="h-10 w-10"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-display text-[14px] font-bold text-foreground">
                {announcement.authorName}
              </p>
              {isPinned && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700"
                >
                  <Pin className="h-2.5 w-2.5" />
                  Pinned
                </motion.span>
              )}
            </div>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {formatRelative(announcement.createdAt)}
            </p>
          </div>

          {showMenu && (
            <div className="relative shrink-0" ref={menuRef}>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Announcement actions"
                aria-expanded={menuOpen}
                className={
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors " +
                  (menuOpen
                    ? "bg-stone-100 text-foreground"
                    : "text-muted-foreground hover:bg-stone-50 hover:text-foreground")
                }
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 z-50 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
                  >
                    {canPin && (
                      <button
                        type="button"
                        onClick={() => { onPin?.(announcement.id); setMenuOpen(false) }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-teal-50"
                      >
                        {isPinned ? (
                          <>
                            <PinOff className="h-3.5 w-3.5 text-teal-700" />
                            Unpin
                          </>
                        ) : (
                          <>
                            <Pin className="h-3.5 w-3.5 text-teal-700" />
                            Pin to top
                          </>
                        )}
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => { onDelete?.(announcement.id); setMenuOpen(false) }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 pl-13" style={{ paddingLeft: 52 }}>
          <div>
            <p
              className={
                "whitespace-pre-wrap text-[14px] leading-relaxed text-foreground " +
                (!expanded && isLong ? "line-clamp-4" : "")
              }
            >
              {announcement.content}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-teal-700 transition-colors hover:text-teal-800"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Read more
                  </>
                )}
              </button>
            )}
          </div>

          {/* Attachment */}
          {announcement.attachmentUrl && (
            <motion.a
              whileHover={{ scale: 1.005 }}
              href={announcement.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/attach flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50/50 p-3 transition-colors hover:border-teal-300 hover:bg-teal-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-foreground">
                  {getFileName(announcement.attachmentUrl)}
                </p>
                <p className="text-[11px] text-muted-foreground">Click to open</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-teal-700 opacity-0 transition-opacity group-hover/attach:opacity-100" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.article>
  )
}