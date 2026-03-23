import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, Check, CheckCheck, Trash2, Filter, BookOpen,
  ClipboardList, Megaphone, Users, GraduationCap, Info,
  AlertCircle, Clock, Sparkles, X
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"

// -- Type ? visual config ------------------------------------------------------
const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; border: string; label: string }> = {
  Assignment:       { icon: ClipboardList, color: "#60a5fa", bg: "rgba(59,130,246,0.12)",   border: "rgba(59,130,246,0.3)",   label: "Assignment"    },
  Announcement:     { icon: Megaphone,     color: "#a78bfa", bg: "rgba(139,92,246,0.12)",   border: "rgba(139,92,246,0.3)",   label: "Announcement"  },
  CourseEnrollment: { icon: GraduationCap, color: "#34d399", bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.3)",   label: "Enrollment"    },
  CourseMaterial:   { icon: BookOpen,      color: "#22d3ee", bg: "rgba(6,182,212,0.12)",    border: "rgba(6,182,212,0.3)",    label: "Material"      },
  JoinRequest:      { icon: Users,         color: "#fb923c", bg: "rgba(251,146,60,0.12)",   border: "rgba(251,146,60,0.3)",   label: "Join Request"  },
  Grade:            { icon: Sparkles,      color: "#fbbf24", bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.3)",   label: "Grade"         },
  General:          { icon: Info,          color: "#94a3b8", bg: "rgba(148,163,184,0.10)",  border: "rgba(148,163,184,0.25)", label: "General"       },
  Alert:            { icon: AlertCircle,   color: "#f87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.3)",  label: "Alert"         },
}
const getConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.General

const FILTERS = ["All", "Unread", "Assignment", "Announcement", "Grade", "Enrollment"]

export default function NotificationsPage() {
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

  return (
    <div className="min-h-full pb-10" style={{ background: "linear-gradient(180deg,#0d1b35 0%,#0a1628 100%)", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* -- Header -- */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow: "0 4px 20px rgba(79,70,229,0.4)" }}>
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold" style={{ color: "#f1f5f9" }}>Notifications</h1>
              <p className="text-[12px] font-medium" style={{ color: "#334155" }}>
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#ef4444,#ec4899)", boxShadow: "0 2px 8px rgba(239,68,68,0.4)" }}>
                {unreadCount}
              </motion.span>
            )}
          </div>

          {unreadCount > 0 && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
              style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(79,70,229,0.35)", color: "#a5b4fc" }}>
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </motion.button>
          )}
        </div>

        {/* -- Filter tabs -- */}
        <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map(f => (
            <motion.button key={f} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f)}
              className="px-3.5 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all"
              style={{
                background: activeFilter === f ? "linear-gradient(135deg,#4f46e5,#7c3aed)" : "rgba(15,25,50,0.8)",
                color: activeFilter === f ? "#fff" : "#475569",
                border: activeFilter === f ? "1px solid transparent" : "1px solid rgba(99,102,241,0.15)",
                boxShadow: activeFilter === f ? "0 4px 14px rgba(79,70,229,0.35)" : "none",
              }}>
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold"
                  style={{ background: "rgba(255,255,255,0.25)" }}>{unreadCount}</span>
              )}
            </motion.button>
          ))}
        </div>

        {/* -- List -- */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 rounded-2xl animate-pulse"
                style={{ background: "rgba(15,25,50,0.6)", border: "1px solid rgba(99,102,241,0.08)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(79,70,229,0.12)", border: "1px solid rgba(79,70,229,0.2)" }}>
              <Bell className="w-7 h-7" style={{ color: "#4f46e5" }} />
            </div>
            <p className="text-[15px] font-bold mb-1" style={{ color: "#334155" }}>No notifications</p>
            <p className="text-[12px]" style={{ color: "#1e293b" }}>
              {activeFilter === "Unread" ? "You've read everything!" : "Nothing here yet"}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            <div className="space-y-2">
              {filtered.map((notif: any, i: number) => {
                const cfg = getConfig(notif.type)
                const Icon = cfg.icon
                const isUnread = !notif.isRead
                const timeAgo = notif.createdAt
                  ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })
                  : ""

                return (
                  <motion.div key={notif.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="group relative overflow-hidden rounded-2xl cursor-pointer"
                    style={{
                      background: isUnread
                        ? `linear-gradient(135deg,rgba(13,22,48,0.98),rgba(10,18,42,0.99))`
                        : "rgba(10,16,34,0.7)",
                      border: isUnread ? `1px solid ${cfg.border}` : "1px solid rgba(99,102,241,0.08)",
                      boxShadow: isUnread ? `0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${cfg.bg}` : "none",
                    }}
                    onClick={() => isUnread && markRead?.(notif.id)}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = cfg.border }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = isUnread
                        ? cfg.border : "rgba(99,102,241,0.08)"
                    }}>

                    {/* Unread left bar */}
                    {isUnread && (
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                        style={{ background: `linear-gradient(180deg,${cfg.color},${cfg.color}80)` }} />
                    )}

                    <div className="flex items-start gap-3.5 px-4 py-3.5 pl-5">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-bold leading-snug line-clamp-1"
                            style={{ color: isUnread ? "#e2e8f0" : "#475569" }}>
                            {notif.title ?? notif.message ?? "Notification"}
                          </p>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isUnread && (
                              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
                            )}
                            <span className="text-[10.5px] font-semibold whitespace-nowrap flex items-center gap-1"
                              style={{ color: "#1e293b" }}>
                              <Clock className="w-3 h-3" />{timeAgo}
                            </span>
                          </div>
                        </div>

                        {notif.body && (
                          <p className="text-[12px] leading-relaxed line-clamp-2 mt-0.5"
                            style={{ color: isUnread ? "#334155" : "#1e293b" }}>
                            {notif.body}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                            {cfg.label}
                          </span>

                          {/* Actions (show on hover) */}
                          <div className="ml-auto flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                            {isUnread && (
                              <motion.button whileTap={{ scale: 0.9 }}
                                onClick={e => { e.stopPropagation(); markRead?.(notif.id) }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold"
                                style={{ background: "rgba(79,70,229,0.15)", color: "#a5b4fc", border: "1px solid rgba(79,70,229,0.25)" }}>
                                <Check className="w-3 h-3" /> Read
                              </motion.button>
                            )}
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={e => { e.stopPropagation(); handleDelete(notif.id) }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
                              {deleting === notif.id
                                ? <div className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" style={{ color: "#f87171" }} />}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
