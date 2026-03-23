import { motion } from "framer-motion"
import { Activity, UserPlus, Bell, BookOpen, CheckCircle, Zap, Info, Clock } from "lucide-react"

interface ActivityItem {
  id?: string; type?: string; title: string
  description?: string; message?: string
  createdAt?: string; timeAgo?: string; time?: string
}
interface Props { activities: ActivityItem[] }

const TYPE_CFG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; label: string; labelBg: string }> = {
  join:         { icon: UserPlus,    color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd", label: "Join",     labelBg: "#f5f3ff" },
  member:       { icon: UserPlus,    color: "#7c3aed", bg: "#ede9fe", border: "#c4b5fd", label: "Member",   labelBg: "#f5f3ff" },
  announcement: { icon: Bell,        color: "#0891b2", bg: "#cffafe", border: "#a5f3fc", label: "Notice",   labelBg: "#f0fdff" },
  assignment:   { icon: BookOpen,    color: "#059669", bg: "#d1fae5", border: "#6ee7b7", label: "Task",     labelBg: "#f0fdf4" },
  submission:   { icon: CheckCircle, color: "#059669", bg: "#d1fae5", border: "#6ee7b7", label: "Submitted",labelBg: "#f0fdf4" },
  notification: { icon: Info,        color: "#d97706", bg: "#fef3c7", border: "#fcd34d", label: "Alert",    labelBg: "#fffbeb" },
  default:      { icon: Zap,         color: "#ec4899", bg: "#fce7f3", border: "#f9a8d4", label: "Event",    labelBg: "#fdf2f8" },
}

function getIconCfg(type?: string, title?: string) {
  const str = `${type ?? ""} ${title ?? ""}`.toLowerCase()
  const key = Object.keys(TYPE_CFG).find(k => k !== "default" && str.includes(k)) ?? "default"
  return TYPE_CFG[key]
}

export default function RecentActivityWidget({ activities }: Props) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden h-full bg-white"
      style={{ border: "1px solid #ede9fe", boxShadow: "0 4px 24px rgba(124,58,237,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid #f3f1ff" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 12px rgba(124,58,237,0.35)" }}>
            <Activity style={{ width: 17, height: 17, color: "#fff" }} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[14.5px] font-bold text-gray-900">Activity Feed</h3>
            <p className="text-[11px] font-medium text-gray-400">Real-time updates</p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #c4b5fd" }}>
          {activities.length} events
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 no-scrollbar">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-3 py-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
              <Activity className="w-6 h-6 text-violet-300" />
            </div>
            <div className="text-center">
              <p className="text-[13.5px] font-bold text-gray-700">All caught up!</p>
              <p className="text-[12px] mt-0.5 text-gray-400">No recent activity to show.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            {activities.map((item, i) => {
              const cfg = getIconCfg(item.type, item.title)
              return (
                <motion.div
                  key={item.id ?? i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-150 cursor-default group hover:bg-violet-50"
                  style={{ border: "1px solid transparent" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "#ede9fe"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "transparent"}
                >
                  <div className="w-0.5 self-stretch rounded-full shrink-0" style={{ background: cfg.color, opacity: 0.5 }} />
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <cfg.icon className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-gray-800 truncate">{item.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 hidden sm:inline" style={{ background: cfg.labelBg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.label}
                      </span>
                    </div>
                    {(item.description ?? item.message) && (
                      <p className="text-[12px] mt-0.5 truncate font-medium" style={{ color: cfg.color }}>
                        {item.description ?? item.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 pl-2">
                    <Clock className="w-3 h-3 text-gray-300" />
                    <span className="text-[11px] text-gray-400">
                      {item.timeAgo ?? item.time ?? (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "")}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
