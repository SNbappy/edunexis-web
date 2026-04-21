import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, ChevronDown, ChevronUp, MoreVertical, Pin, PinOff, Trash2 } from "lucide-react"
import Avatar from "@/components/ui/Avatar"
import { formatRelative } from "@/utils/dateUtils"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import type { AnnouncementDto } from "@/types/announcement.types"

interface Props {
  announcement: AnnouncementDto
  index?:       number
  canPin?:      boolean
  canDelete?:   boolean
  onPin?:       (id: string) => void
  onDelete?:    (id: string) => void
}

function getFileName(url: string) {
  try { return decodeURIComponent(url.split("/").pop() ?? "Attachment") }
  catch { return "Attachment" }
}

export default function AnnouncementCard({ announcement, index = 0, canPin = false, canDelete = false, onPin, onDelete }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef   = useRef<HTMLDivElement>(null)
  const isLong    = announcement.content.length > 280
  const showMenu  = canPin || canDelete
  const isPinned  = announcement.isPinned

  const photoUrl = announcement.authorId === user?.id
    ? (user?.profile?.profilePhotoUrl ?? undefined) : undefined

  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [menuOpen])

  // Theme
  const cardBg    = dark
    ? isPinned ? "rgba(99,102,241,0.1)" : "rgba(16,24,44,0.75)"
    : isPinned ? "rgba(99,102,241,0.03)" : "rgba(255,255,255,0.92)"
  const blur      = "blur(20px)"
  const border    = dark
    ? isPinned ? "rgba(99,102,241,0.3)" : "rgba(99,102,241,0.12)"
    : isPinned ? "#c7d2fe" : "#e5e7eb"
  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#8896c8" : "#6b7280"
  const textMuted = dark ? "#5a6a9a" : "#9ca3af"
  const menuBg    = dark ? "rgb(16,24,44)" : "white"
  const menuBorder= dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"
  const attachBg  = dark ? "rgba(99,102,241,0.08)" : "#eef2ff"
  const attachBorder = dark ? "rgba(99,102,241,0.2)" : "#c7d2fe"

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}
      className="relative rounded-2xl overflow-hidden group"
      style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>

      {/* Pin accent line */}
      {isPinned && (
        <div className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, #6366f1, #0891b2, transparent)" }} />
      )}

      <div className="relative p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="rounded-xl overflow-hidden"
              style={{ border: dark ? "1.5px solid rgba(99,102,241,0.3)" : "1.5px solid #c7d2fe", width: 36, height: 36 }}>
              <Avatar src={photoUrl} name={announcement.authorName} size="sm" className="w-full h-full rounded-none" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold" style={{ color: textMain }}>{announcement.authorName}</p>
            <p className="text-[11px]" style={{ color: textMuted }}>{formatRelative(announcement.createdAt)}</p>
          </div>

          {isPinned && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0"
              style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.3)" : "1px solid #c7d2fe" }}>
              <Pin style={{ width: 10, height: 10, color: "#6366f1" }} />
              <span className="text-[10px] font-bold" style={{ color: "#6366f1" }}>Pinned</span>
            </motion.div>
          )}

          {showMenu && (
            <div className="relative shrink-0" ref={menuRef}>
              <motion.button whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(v => !v)}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: menuOpen ? "#6366f1" : textMuted, background: menuOpen ? (dark ? "rgba(99,102,241,0.12)" : "#eef2ff") : "transparent" }}>
                <MoreVertical style={{ width: 15, height: 15 }} />
              </motion.button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: -4 }}
                    animate={{ opacity: 1, scale: 1,    y: 0   }}
                    exit={{   opacity: 0, scale: 0.94, y: -4   }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 z-50 w-44 rounded-xl overflow-hidden"
                    style={{ background: menuBg, border: `1px solid ${menuBorder}`, boxShadow: dark ? "0 12px 32px rgba(0,0,0,0.5)" : "0 8px 24px rgba(0,0,0,0.12)" }}>
                    {canPin && (
                      <button onClick={() => { onPin?.(announcement.id); setMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium transition-colors"
                        style={{ color: "#6366f1" }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.1)" : "#eef2ff")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        {isPinned
                          ? <><PinOff style={{ width: 14, height: 14 }} /> Unpin</>
                          : <><Pin    style={{ width: 14, height: 14 }} /> Pin to top</>
                        }
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => { onDelete?.(announcement.id); setMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium transition-colors"
                        style={{ color: "#ef4444" }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.1)" : "#fef2f2")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                        <Trash2 style={{ width: 14, height: 14 }} /> Delete
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pl-11 space-y-3">
          <div>
            <p className={`text-[13.5px] leading-relaxed whitespace-pre-wrap ${!expanded && isLong ? "line-clamp-4" : ""}`}
              style={{ color: textSub }}>
              {announcement.content}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-1 mt-1.5 text-[12px] font-semibold transition-colors"
                style={{ color: "#6366f1" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6366f1")}>
                {expanded
                  ? <><ChevronUp style={{ width: 12, height: 12 }} /> Show less</>
                  : <><ChevronDown style={{ width: 12, height: 12 }} /> Read more</>
                }
              </button>
            )}
          </div>

          {/* Attachment */}
          {announcement.attachmentUrl && (
            <motion.a whileHover={{ scale: 1.01 }}
              href={announcement.attachmentUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{ background: attachBg, border: `1px solid ${attachBorder}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff" }}>
                <FileText style={{ width: 16, height: 16, color: "#6366f1" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: textMain }}>
                  {getFileName(announcement.attachmentUrl)}
                </p>
                <p className="text-[11px]" style={{ color: textMuted }}>Click to open</p>
              </div>
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
