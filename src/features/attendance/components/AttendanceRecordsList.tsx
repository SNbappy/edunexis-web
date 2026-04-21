import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Users, CheckCircle2, XCircle, HelpCircle, Trash2, Pencil, ClipboardCheck } from "lucide-react"
import gsap from "gsap"
import { formatDate, getDayName } from "@/utils/dateUtils"
import { useThemeStore } from "@/store/themeStore"
import type { AttendanceSessionDto } from "@/types/attendance.types"

interface Props {
  sessions:  AttendanceSessionDto[]
  onDelete?: (id: string) => void
  onEdit?:   (id: string) => void
  onView?:   (id: string) => void
}

function getStats(s: AttendanceSessionDto) {
  const total    = s.records.length
  const present  = s.records.filter(r => r.status === "Present").length
  const absent   = s.records.filter(r => r.status === "Absent").length
  const unmarked = s.records.filter(r => r.status === "Unmarked").length
  const pct      = total > 0 ? Math.round((present / total) * 100) : 0
  return { total, present, absent, unmarked, pct }
}

function getBarColor(pct: number) {
  return pct >= 90 ? "#059669" : pct >= 75 ? "#6366f1" : pct >= 60 ? "#d97706" : "#ef4444"
}

export default function AttendanceRecordsList({ sessions, onDelete, onEdit, onView }: Props) {
  const { dark } = useThemeStore()
  const listRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current || !sessions.length) return
    const items = listRef.current.querySelectorAll(".session-row")
    gsap.fromTo(items,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power3.out", stagger: 0.05 }
    )
  }, [sessions.length])

  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const textMuted= dark ? "#5a6a9a" : "#9ca3af"
  const divider  = dark ? "rgba(255,255,255,0.05)" : "#f3f4f6"

  if (sessions.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
      style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `2px dashed ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}` }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: dark ? "rgba(5,150,105,0.12)" : "#ecfdf5", border: dark ? "1px solid rgba(5,150,105,0.25)" : "1px solid #a7f3d0" }}>
        <ClipboardCheck style={{ width: 28, height: 28, color: "#059669" }} strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-bold mb-1" style={{ color: textMain }}>No attendance records yet</p>
      <p className="text-[13px]" style={{ color: textSub }}>Take attendance for today's class to get started</p>
    </motion.div>
  )

  return (
    <div ref={listRef} className="space-y-3">
      <AnimatePresence>
        {sessions.map((session, i) => {
          const { total, present, absent, unmarked, pct } = getStats(session)
          const sessionNumber = sessions.length - i
          const barColor = getBarColor(pct)
          const lightBg = dark ? `${barColor}12` : `${barColor}08`

          return (
            <motion.div key={session.id} exit={{ opacity: 0, x: -20 }}
              className="session-row group relative rounded-2xl overflow-hidden"
              style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${dark ? `${barColor}22` : border}` }}
              whileHover={{ y: -2, boxShadow: `0 8px 24px ${barColor}18`, borderColor: `${barColor}35` }}>

              {/* Left accent bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                style={{ background: `linear-gradient(180deg, ${barColor}, ${barColor}60)` }} />

              {/* Bottom progress bar */}
              <motion.div className="absolute bottom-0 left-0 h-[2px]"
                initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "circOut", delay: i * 0.04 }}
                style={{ background: `linear-gradient(90deg, ${barColor}70, transparent)` }} />

              <div className="flex items-center gap-4 p-4 pl-5">
                {/* Date block */}
                <div className="text-center rounded-xl px-3 py-2.5 shrink-0 w-[62px]"
                  style={{ background: lightBg, border: `1px solid ${barColor}22` }}>
                  <p className="text-[10px] font-bold uppercase" style={{ color: barColor }}>
                    {getDayName(session.date).slice(0, 3)}
                  </p>
                  <p className="text-[20px] font-extrabold leading-tight" style={{ color: textMain }}>
                    {formatDate(session.date, "dd")}
                  </p>
                  <p className="text-[10px] font-semibold" style={{ color: textMuted }}>
                    {formatDate(session.date, "MMM")}
                  </p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-[13.5px] font-bold" style={{ color: textMain }}>
                      Session {sessionNumber}{session.topic ? ` - ${session.topic}` : ""}
                    </p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: lightBg, border: `1px solid ${barColor}25`, color: barColor }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "#059669" }}>
                      <CheckCircle2 style={{ width: 12, height: 12 }} />{present} Present
                    </span>
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "#ef4444" }}>
                      <XCircle style={{ width: 12, height: 12 }} />{absent} Absent
                    </span>
                    {unmarked > 0 && (
                      <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: "#d97706" }}>
                        <HelpCircle style={{ width: 12, height: 12 }} />{unmarked} Unmarked
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11.5px]" style={{ color: textMuted }}>
                      <Users style={{ width: 12, height: 12 }} />{total} Total
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(session.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ color: "#6366f1" }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(99,102,241,0.15)" : "#eef2ff")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Pencil style={{ width: 13, height: 13 }} />
                    </motion.button>
                  )}
                  {onDelete && (
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(session.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={e => (e.currentTarget.style.background = dark ? "rgba(239,68,68,0.12)" : "#fef2f2")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
