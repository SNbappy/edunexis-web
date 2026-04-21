import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, CheckCheck, Trash2, BookOpen, ClipboardList,
  Megaphone, Users, GraduationCap, Info, AlertCircle,
  Sparkles, BellOff, Check,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { useThemeStore } from "@/store/themeStore"

const TYPE_CONFIG: Record<string, { icon: any; color: string; lightBg: string; darkBg: string; label: string }> = {
  Assignment:       { icon: ClipboardList, color: "#6366f1", lightBg: "#eef2ff",  darkBg: "rgba(99,102,241,0.15)",  label: "Assignment"   },
  Announcement:     { icon: Megaphone,     color: "#7c3aed", lightBg: "#f5f3ff",  darkBg: "rgba(124,58,237,0.15)", label: "Announcement" },
  CourseEnrollment: { icon: GraduationCap, color: "#059669", lightBg: "#ecfdf5",  darkBg: "rgba(5,150,105,0.15)",  label: "Enrollment"   },
  CourseMaterial:   { icon: BookOpen,      color: "#0891b2", lightBg: "#ecfeff",  darkBg: "rgba(8,145,178,0.15)",  label: "Material"     },
  JoinRequest:      { icon: Users,         color: "#d97706", lightBg: "#fffbeb",  darkBg: "rgba(217,119,6,0.15)",  label: "Join Request" },
  Grade:            { icon: Sparkles,      color: "#d97706", lightBg: "#fffbeb",  darkBg: "rgba(217,119,6,0.15)",  label: "Grade"        },
  General:          { icon: Info,          color: "#6b7280", lightBg: "#f9fafb",  darkBg: "rgba(107,114,128,0.12)",label: "General"      },
  Alert:            { icon: AlertCircle,   color: "#ef4444", lightBg: "#fef2f2",  darkBg: "rgba(239,68,68,0.15)",  label: "Alert"        },
}
const getCfg = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.General

const FILTERS = ["All", "Unread", "Assignment", "Announcement", "Grade", "Enrollment"]

export default function NotificationsPage() {
  const { dark } = useThemeStore()
  const { notifications = [], unreadCount, markAllRead, markRead, deleteNotification, isLoading }
    = useNotifications()

  const [activeFilter, setActiveFilter] = useState("All")
  const [deleting, setDeleting]         = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (activeFilter === "All")    return notifications
    if (activeFilter === "Unread") return notifications.filter((n: any) => !n.isRead)
    return notifications.filter((n: any) =>
      n.type?.toLowerCase().includes(activeFilter.toLowerCase())
    )
  }, [notifications, activeFilter])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await deleteNotification?.(id)
    setDeleting(null)
  }

  // Theme tokens
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.9)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const textMuted= dark ? "#5a6a9a" : "#9ca3af"
  const hoverBg  = dark ? "rgba(99,102,241,0.06)" : "#f9fafb"
  const unreadBg = dark ? "rgba(99,102,241,0.08)" : "#fafafa"
  const inputBg  = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"

  const unread = typeof unreadCount === "number" ? unreadCount : (unreadCount as any)?.unreadCount ?? 0

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-4xl mx-auto">

      {/* -- Header -- */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #c7d2fe" }}>
              <Bell style={{ width: 16, height: 16, color: "#6366f1" }} strokeWidth={2} />
            </div>
            <h1 className="text-[22px] font-extrabold" style={{ color: textMain }}>Notifications</h1>
            {unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[12px] font-bold text-white"
                style={{ background: "#6366f1" }}>
                {unread} new
              </span>
            )}
          </div>
          <p className="text-[13px]" style={{ color: textMuted }}>
            {notifications.length} total notifications
          </p>
        </div>

        {unread > 0 && (
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => markAllRead?.()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold"
            style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff", color: "#6366f1", border: dark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #c7d2fe" }}>
            <CheckCheck style={{ width: 15, height: 15 }} />
            Mark all read
          </motion.button>
        )}
      </motion.div>

      {/* -- Filter chips -- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="flex items-center gap-2 flex-wrap mb-6">
        {FILTERS.map(f => {
          const active = activeFilter === f
          const count  = f === "Unread" ? unread : f === "All" ? notifications.length : notifications.filter((n: any) => n.type?.toLowerCase().includes(f.toLowerCase())).length
          return (
            <motion.button key={f} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveFilter(f)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: active ? "#6366f1" : inputBg,
                color:      active ? "white"   : textSub,
                border:     active ? "none"    : `1px solid ${border}`,
                boxShadow:  active ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
              }}>
              {f}
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: active ? "rgba(255,255,255,0.25)" : (dark ? "rgba(99,102,241,0.15)" : "#eef2ff"), color: active ? "white" : "#6366f1" }}>
                  {count}
                </span>
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* -- Notification list -- */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse"
              style={{ background: dark ? "rgba(99,102,241,0.06)" : "#f3f4f6" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `2px dashed ${border}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff" }}>
            <BellOff style={{ width: 28, height: 28, color: "#6366f1" }} strokeWidth={1.5} />
          </div>
          <p className="text-[16px] font-bold mb-1" style={{ color: textMain }}>No notifications</p>
          <p className="text-[13px]" style={{ color: textMuted }}>
            {activeFilter !== "All" ? `No ${activeFilter.toLowerCase()} notifications` : "You are all caught up!"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif: any, i: number) => {
              const cfg     = getCfg(notif.type)
              const isUnread= !notif.isRead
              return (
                <motion.div key={notif.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group relative flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: isUnread ? (dark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.03)") : cardBg,
                    backdropFilter: blur, WebkitBackdropFilter: blur,
                    border: isUnread ? (dark ? "1px solid rgba(99,102,241,0.2)" : "1px solid #c7d2fe") : `1px solid ${border}`,
                  }}
                  onClick={() => !notif.isRead && markRead?.(notif.id)}
                  onMouseEnter={e => { if (!isUnread) (e.currentTarget as HTMLElement).style.background = hoverBg }}
                  onMouseLeave={e => { if (!isUnread) (e.currentTarget as HTMLElement).style.background = cardBg }}
                >
                  {/* Unread dot */}
                  {isUnread && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full shrink-0"
                      style={{ background: "#6366f1" }} />
                  )}

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: dark ? cfg.darkBg : cfg.lightBg, border: `1px solid ${cfg.color}28` }}>
                    <cfg.icon style={{ width: 17, height: 17, color: cfg.color }} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: dark ? cfg.darkBg : cfg.lightBg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      <span className="text-[11px]" style={{ color: textMuted }}>
                        {notif.createdAt
                          ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                          : "Just now"}
                      </span>
                    </div>
                    <p className="text-[13.5px] font-medium leading-snug" style={{ color: isUnread ? textMain : textSub }}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUnread && (
                      <motion.button whileTap={{ scale: 0.9 }}
                        onClick={e => { e.stopPropagation(); markRead?.(notif.id) }}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ color: "#6366f1" }}
                        onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.15)" : "#eef2ff")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                        title="Mark as read">
                        <Check style={{ width: 14, height: 14 }} />
                      </motion.button>
                    )}
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={e => { e.stopPropagation(); handleDelete(notif.id) }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ color: deleting === notif.id ? "#ef4444" : textMuted }}
                      onMouseEnter={e => { (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.12)" : "#fef2f2"); (e.currentTarget.style.color = "#ef4444") }}
                      onMouseLeave={e => { (e.currentTarget.style.background = "transparent"); (e.currentTarget.style.color = textMuted) }}
                      title="Delete">
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
