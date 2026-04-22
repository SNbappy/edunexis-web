import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, BellOff, CheckCheck, Trash2, Check,
  BookOpen, ClipboardList, Megaphone, Users,
  GraduationCap, Info, AlertCircle, Sparkles,
  Clock, TrendingUp,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useNotifications } from "@/features/notifications/hooks/useNotifications"
import { cn } from "@/utils/cn"

type Tone = "primary" | "success" | "warning" | "danger" | "info" | "muted"

const TONE: Record<Tone, { wrap: string; dot: string }> = {
  primary: { wrap: "bg-primary/10        text-primary",      dot: "bg-primary" },
  success: { wrap: "bg-success-soft      text-success",      dot: "bg-success" },
  warning: { wrap: "bg-warning-soft      text-warning",      dot: "bg-warning" },
  danger:  { wrap: "bg-destructive-soft  text-destructive",  dot: "bg-destructive" },
  info:    { wrap: "bg-info-soft         text-info",         dot: "bg-info" },
  muted:   { wrap: "bg-muted             text-muted-foreground", dot: "bg-muted-foreground" },
}

const TYPE_CONFIG: Record<string, { icon: any; tone: Tone; label: string; group: string }> = {
  NewAssignment:              { icon: ClipboardList, tone: "primary", label: "Assignment",    group: "assignment"   },
  AssignmentDeadlineReminder: { icon: Clock,         tone: "danger",  label: "Deadline",      group: "assignment"   },
  NewAnnouncement:            { icon: Megaphone,     tone: "primary", label: "Announcement",  group: "announcement" },
  NewMaterial:                { icon: BookOpen,      tone: "info",    label: "Material",      group: "material"     },
  JoinRequestReceived:        { icon: Users,         tone: "warning", label: "Join Request",  group: "enrollment"   },
  CourseJoinApproved:         { icon: GraduationCap, tone: "success", label: "Approved",      group: "enrollment"   },
  CourseJoinRejected:         { icon: AlertCircle,   tone: "danger",  label: "Rejected",      group: "enrollment"   },
  MarksPublished:             { icon: TrendingUp,    tone: "success", label: "Grade",         group: "grade"        },
  GradeComplaint:             { icon: Sparkles,      tone: "warning", label: "Complaint",     group: "grade"        },
  General:                    { icon: Info,          tone: "muted",   label: "General",       group: "general"      },
}
const getCfg = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.General

const FILTERS = [
  { id: "all",          label: "All"           },
  { id: "unread",       label: "Unread"        },
  { id: "assignment",   label: "Assignments"   },
  { id: "announcement", label: "Announcements" },
  { id: "grade",        label: "Grades"        },
  { id: "enrollment",   label: "Enrollment"    },
] as const
type FilterId = typeof FILTERS[number]["id"]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const {
    notifications = [],
    unreadCount,
    markAllRead,
    markRead,
    markBadgeSeen,
    deleteNotification,
    isLoading,
  } = useNotifications()

  const [activeFilter, setActiveFilter] = useState<FilterId>("all")

  // Visiting this page counts as "seeing the badge" — matches Topbar behavior.
  // Individual cards still require a click to become read.
  useEffect(() => { markBadgeSeen() }, [markBadgeSeen])

  const filtered = useMemo(() => {
    if (activeFilter === "all")    return notifications
    if (activeFilter === "unread") return notifications.filter((n: any) => !n.isRead)
    return notifications.filter((n: any) => getCfg(n.type).group === activeFilter)
  }, [notifications, activeFilter])

  const countFor = (id: FilterId): number => {
    if (id === "all")    return notifications.length
    if (id === "unread") return unreadCount
    return notifications.filter((n: any) => getCfg(n.type).group === id).length
  }

  const handleCardClick = (n: any) => {
    if (!n.isRead) markRead?.(n.id)
    if (n.redirectUrl) navigate(n.redirectUrl)
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="flex items-start justify-between gap-4 mb-8 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-primary/10 text-primary">
              <Bell className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground leading-none">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {notifications.length} total
                {unreadCount > 0 && <> · <span className="font-semibold text-primary">{unreadCount} unread</span></>}
              </p>
            </div>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead?.()}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/15 focus-ring transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </motion.header>

      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {FILTERS.map(f => {
          const active = activeFilter === f.id
          const count  = countFor(f.id)
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors focus-ring",
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-subtle hover:text-foreground border border-border",
              )}
            >
              {f.label}
              {count > 0 && (
                <span className={cn(
                  "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold",
                  active
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-primary/10 text-primary",
                )}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {filtered.map((n: any) => {
              const cfg      = getCfg(n.type)
              const Icon     = cfg.icon
              const tone     = TONE[cfg.tone]
              const isUnread = !n.isRead
              const timeAgo  = n.createdAt
                ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })
                : "Just now"

              return (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{    opacity: 0, x: -16, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    onClick={() => handleCardClick(n)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleCardClick(n) } }}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "group relative flex items-start gap-4 p-4 rounded-xl cursor-pointer border transition-colors focus-ring",
                      isUnread
                        ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                        : "bg-card border-border hover:bg-muted",
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-xl inline-flex items-center justify-center shrink-0",
                      tone.wrap,
                    )}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "inline-flex items-center h-5 px-2 rounded text-[10px] font-bold uppercase tracking-wide",
                          tone.wrap,
                        )}>
                          {cfg.label}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {timeAgo}
                        </span>
                        {n.redirectUrl && (
                          <span className="text-[10px] text-muted-foreground/70 italic">
                            · click to open
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm mt-1.5 leading-snug",
                        isUnread ? "font-semibold text-foreground" : "text-muted-foreground",
                      )}>
                        {n.title ?? n.message ?? "Notification"}
                      </p>
                      {n.body && (
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                      )}
                    </div>

                    {isUnread && (
                      <span
                        className={cn("absolute top-4 right-4 h-2 w-2 rounded-full", tone.dot)}
                        aria-label="Unread"
                      />
                    )}

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity self-center">
                      {isUnread && (
                        <button
                          onClick={e => { e.stopPropagation(); markRead?.(n.id) }}
                          className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotification?.(n.id) }}
                        className="h-8 w-8 rounded-lg inline-flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-colors"
                        title="Delete"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}

function EmptyState({ filter }: { filter: FilterId }) {
  const label = FILTERS.find(f => f.id === filter)?.label.toLowerCase() ?? "notifications"
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-border bg-card text-center px-6"
    >
      <div className="h-14 w-14 rounded-2xl inline-flex items-center justify-center bg-muted text-muted-foreground mb-4">
        <BellOff className="h-6 w-6" strokeWidth={1.8} />
      </div>
      <p className="text-base font-semibold text-foreground">
        {filter === "all" ? "You're all caught up" : `No ${label} notifications`}
      </p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        {filter === "all"
          ? "New updates about your courses and assignments will appear here."
          : "Try a different filter to see more notifications."}
      </p>
    </motion.div>
  )
}
