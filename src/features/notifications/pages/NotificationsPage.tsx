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
import { Page, PageHero, TabSplit, RailCard } from "@/components/ui/Page"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import SharedEmptyState from "@/components/ui/EmptyState"
import { ICON_STROKE, FOCUS } from "@/components/ui/appTokens"
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
    <Page>
      <PageHero
        eyebrow="Activity"
        title="Notifications"
        description="Announcements, new assignments, join requests and published marks from every course."
        figures={[
          { value: notifications.length, label: "total" },
          { value: unreadCount, label: "unread" },
        ]}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              onClick={() => markAllRead?.()}
              leftIcon={<CheckCheck strokeWidth={ICON_STROKE} />}
            >
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="h-6" />

      {/* Inbox layout: categories in a rail, the list in the main column.
          These were chips stacked above a 672px column, which left most of
          a laptop screen empty and buried the category counts. */}
      <TabSplit
        aside={
          <RailCard title="Filter">
            <ul className="space-y-0.5">
              {FILTERS.map(f => {
                const active = activeFilter === f.id
                const count  = countFor(f.id)
                return (
                  <li key={f.id}>
                    <button
                      onClick={() => setActiveFilter(f.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-semibold transition-colors duration-120",
                        FOCUS,
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {f.label}
                      {count > 0 && (
                        <span className={cn(
                          "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </RailCard>
        }
      >
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" rounded="xl" />
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

                    <div className="flex items-center gap-1 shrink-0 focus-within:opacity-100 transition-opacity self-center">
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
      </TabSplit>
    </Page>
  )
}

function EmptyState({ filter }: { filter: FilterId }) {
  const label = FILTERS.find(f => f.id === filter)?.label.toLowerCase() ?? "notifications"
  return (
    <SharedEmptyState
      variant="panel"
      icon={<BellOff strokeWidth={ICON_STROKE} />}
      title={filter === "all" ? "You're all caught up" : `No ${label} notifications`}
      description={
        filter === "all"
          ? "New updates about your courses and assignments will appear here."
          : "Try a different filter to see more notifications."
      }
    />
  )
}
