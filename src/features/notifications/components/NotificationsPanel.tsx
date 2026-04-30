import InlineSpinner from "@/components/ui/InlineSpinner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, BellOff, CheckCheck, Loader2,
  ClipboardList, Megaphone, Users, BookOpen,
  GraduationCap, Info, AlertCircle, Sparkles,
  Clock, Check, X, Trash2, TrendingUp,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useNavigate } from "react-router-dom"
import { useNotifications } from "../hooks/useNotifications"
import { cn } from "@/utils/cn"

interface Props { isOpen: boolean; onClose: () => void }

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "muted"

const TONE: Record<Tone, { wrap: string; dot: string }> = {
  primary: { wrap: "bg-primary/10        text-primary",      dot: "bg-primary" },
  success: { wrap: "bg-success-soft      text-success",      dot: "bg-success" },
  warning: { wrap: "bg-warning-soft      text-warning",      dot: "bg-warning" },
  danger:  { wrap: "bg-destructive-soft  text-destructive",  dot: "bg-destructive" },
  info:    { wrap: "bg-info-soft         text-info",         dot: "bg-info" },
  muted:   { wrap: "bg-muted             text-muted-foreground", dot: "bg-muted-foreground" },
}

const TYPE_CONFIG: Record<string, { icon: any; tone: Tone; label: string }> = {
  JoinRequestReceived:        { icon: Users,         tone: "warning", label: "Join Request"  },
  CourseJoinApproved:         { icon: GraduationCap, tone: "success", label: "Approved"      },
  CourseJoinRejected:         { icon: AlertCircle,   tone: "danger",  label: "Rejected"      },
  NewMaterial:                { icon: BookOpen,      tone: "info",    label: "Material"      },
  NewAssignment:              { icon: ClipboardList, tone: "primary", label: "Assignment"    },
  AssignmentDeadlineReminder: { icon: Clock,         tone: "danger",  label: "Deadline"      },
  MarksPublished:             { icon: TrendingUp,    tone: "success", label: "Marks"         },
  GradeComplaint:             { icon: Sparkles,      tone: "warning", label: "Complaint"     },
  NewAnnouncement:            { icon: Megaphone,     tone: "primary", label: "Announcement"  },
  General:                    { icon: Info,          tone: "muted",   label: "General"       },
}
const getConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.General

export default function NotificationsPanel({ isOpen, onClose }: Props) {
  const { notifications, unreadCount, isLoading, markRead, markAllRead, deleteNotification } = useNotifications()
  const navigate = useNavigate()

  // NOTE: No auto-mark-all-read here anymore. The badge clearing is handled
  // in Topbar via markBadgeSeen. Individual notifications stay "unread"
  // (bold styling) until the user clicks them or hits Mark all.

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden />

          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[68px] right-4 lg:right-6 w-[380px] max-w-[calc(100vw-2rem)] max-h-[78vh] z-50 flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-xl"
            role="dialog"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg inline-flex items-center justify-center bg-primary/10 text-primary">
                  <Bell className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 h-5 rounded-full inline-flex items-center text-[10px] font-bold bg-primary/15 text-primary">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="inline-flex items-center gap-1 px-2 h-7 rounded-md text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all
                  </button>
                )}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <InlineSpinner size={20} className="text-primary" />
                  <span className="text-xs text-muted-foreground">Loading…</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
                  <div className="h-12 w-12 rounded-2xl inline-flex items-center justify-center bg-muted text-muted-foreground">
                    <BellOff className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">You're all caught up</p>
                    <p className="text-xs text-muted-foreground mt-0.5">New updates will appear here.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <AnimatePresence initial={false}>
                    {notifications.map((n: any) => {
                      const cfg      = getConfig(n.type)
                      const Icon     = cfg.icon
                      const tone     = TONE[cfg.tone]
                      const isUnread = !n.isRead
                      const timeAgo  = n.createdAt
                        ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                        : ""

                      return (
                        <motion.div
                          key={n.id}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{    opacity: 0, x: 24, scale: 0.96 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => {
                            if (isUnread) markRead?.(n.id)
                            if (n.redirectUrl) { navigate(n.redirectUrl); onClose() }
                          }}
                          className={cn(
                            "group relative flex gap-3 rounded-xl p-3 cursor-pointer transition-colors",
                            isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/60",
                          )}
                        >
                          {isUnread && (
                            <span className="absolute left-1 top-4 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          )}
                          <div className={cn("h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0", tone.wrap)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[13px] leading-snug line-clamp-2",
                              isUnread ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
                            )}>
                              {n.title ?? n.message ?? "Notification"}
                            </p>
                            {n.body && (
                              <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2 mt-0.5">
                                {n.body}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {timeAgo}
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUnread && (
                                  <button
                                    onClick={e => { e.stopPropagation(); markRead?.(n.id) }}
                                    className="inline-flex items-center gap-1 px-1.5 h-6 rounded text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="h-2.5 w-2.5" />
                                    Read
                                  </button>
                                )}
                                <button
                                  onClick={e => { e.stopPropagation(); deleteNotification?.(n.id) }}
                                  className="h-6 w-6 rounded inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="shrink-0 px-3 py-2 border-t border-border">
                <button
                  onClick={() => { navigate("/notifications"); onClose() }}
                  className="w-full h-9 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
