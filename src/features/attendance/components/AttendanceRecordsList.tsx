import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Users, CheckCircle2, XCircle, HelpCircle, Trash2, Pencil, ClipboardCheck } from 'lucide-react'
import gsap from 'gsap'
import { formatDate, getDayName } from '@/utils/dateUtils'
import type { AttendanceSessionDto } from '@/types/attendance.types'

interface Props {
  sessions: AttendanceSessionDto[]
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  onView?: (id: string) => void
}

function getStats(s: AttendanceSessionDto) {
  const total    = s.records.length
  const present  = s.records.filter(r => r.status === 'Present').length
  const absent   = s.records.filter(r => r.status === 'Absent').length
  const unmarked = s.records.filter(r => r.status === 'Unmarked').length
  const pct      = total > 0 ? Math.round((present / total) * 100) : 0
  return { total, present, absent, unmarked, pct }
}

function PctBadge({ pct }: { pct: number }) {
  const color  = pct >= 90 ? '#34d399' : pct >= 75 ? '#818cf8' : pct >= 60 ? '#fbbf24' : '#f87171'
  const bg     = pct >= 90 ? 'rgba(52,211,153,0.12)' : pct >= 75 ? 'rgba(129,140,248,0.12)' : pct >= 60 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)'
  const border = pct >= 90 ? 'rgba(52,211,153,0.3)'  : pct >= 75 ? 'rgba(129,140,248,0.3)'  : pct >= 60 ? 'rgba(251,191,36,0.3)'  : 'rgba(248,113,113,0.3)'
  return (
    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg"
      style={{ background: bg, border: `1px solid ${border}`, color }}>{pct}%</span>
  )
}

export default function AttendanceRecordsList({ sessions, onDelete, onEdit, onView }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listRef.current || !sessions.length) return
    const items = listRef.current.querySelectorAll('.session-row')
    gsap.fromTo(items,
      { opacity: 0, y: 18, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], stagger: 0.06 }
    )
  }, [sessions.length])

  if (sessions.length === 0) return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-3xl text-center"
      style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.6),rgba(6,13,31,0.8))', border: '1px dashed rgba(99,102,241,0.15)' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
        <ClipboardCheck className="w-8 h-8" style={{ color: '#818cf8' }} strokeWidth={1.5} />
      </div>
      <p className="text-base font-bold mb-1" style={{ color: '#e2e8f0' }}>No attendance records yet</p>
      <p className="text-sm" style={{ color: '#475569' }}>Take attendance for today's class to get started</p>
    </motion.div>
  )

  return (
    <div ref={listRef} className="space-y-3">
      <AnimatePresence>
        {sessions.map((session, i) => {
          const { total, present, absent, unmarked, pct } = getStats(session)
          const sessionNumber = sessions.length - i
          const barColor = pct >= 90 ? '#34d399' : pct >= 75 ? '#818cf8' : pct >= 60 ? '#fbbf24' : '#f87171'

          return (
            <motion.div key={session.id} exit={{ opacity: 0, x: -20, scale: 0.97 }}
              className="session-row group relative rounded-2xl overflow-hidden cursor-default"
              style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.88),rgba(6,13,31,0.95))', border: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
              whileHover={{ borderColor: 'rgba(99,102,241,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>

              {/* Left accent bar */}
              <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                style={{ background: `linear-gradient(180deg,${barColor},${barColor}60)` }} />

              {/* Bottom progress bar */}
              <motion.div className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl"
                initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.05 }}
                style={{ background: `linear-gradient(90deg,${barColor}80,transparent)` }} />

              <div className="flex items-center gap-4 p-4 pl-5">
                {/* Date block */}
                <div className="text-center rounded-xl px-3 py-2.5 shrink-0 w-[62px]"
                  style={{ background: `${barColor}10`, border: `1px solid ${barColor}25` }}>
                  <p className="text-[10px] font-bold uppercase" style={{ color: barColor }}>{getDayName(session.date).slice(0, 3)}</p>
                  <p className="text-xl font-extrabold leading-tight" style={{ color: '#f1f5f9' }}>{formatDate(session.date, 'dd')}</p>
                  <p className="text-[10px] font-semibold" style={{ color: '#475569' }}>{formatDate(session.date, 'MMM')}</p>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-[13.5px] font-bold" style={{ color: '#e2e8f0' }}>
                      Session {sessionNumber}{session.topic ? ` â€” ${session.topic}` : ''}
                    </p>
                    <PctBadge pct={pct} />
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#34d399' }}>
                      <CheckCircle2 className="w-3 h-3" />{present} Present
                    </span>
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#f87171' }}>
                      <XCircle className="w-3 h-3" />{absent} Absent
                    </span>
                    {unmarked > 0 && (
                      <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#fbbf24' }}>
                        <HelpCircle className="w-3 h-3" />{unmarked} Unmarked
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11.5px]" style={{ color: '#475569' }}>
                      <Users className="w-3 h-3" />{total} Total
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                      onClick={() => onEdit(session.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                  {onDelete && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                      onClick={() => onDelete(session.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                      <Trash2 className="w-3.5 h-3.5" />
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
