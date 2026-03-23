import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isToday, getDay, addMonths, subMonths, parseISO, isValid
} from 'date-fns'
import type { AttendanceSessionDto } from '@/types/attendance.types'

interface Props {
  sessions: AttendanceSessionDto[]
  onSelectDate?: (date: string) => void
}

function safeIso(dateStr: string): string {
  // handles both "2026-03-20" and "2026-03-20T00:00:00"
  const d = dateStr.includes('T') ? parseISO(dateStr) : parseISO(dateStr + 'T00:00:00')
  return isValid(d) ? format(d, 'yyyy-MM-dd') : dateStr
}

function getSessionPct(s: AttendanceSessionDto) {
  const total = s.records.length
  if (!total) return 0
  return Math.round((s.records.filter(r => r.status === 'Present').length / total) * 100)
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const LEGEND = [
  { color: '#34d399', glow: 'rgba(52,211,153,0.6)',  label: '≥90%' },
  { color: '#818cf8', glow: 'rgba(129,140,248,0.6)', label: '≥75%' },
  { color: '#fbbf24', glow: 'rgba(251,191,36,0.6)',  label: '≥60%' },
  { color: '#f87171', glow: 'rgba(248,113,113,0.6)', label: '<60%'  },
]

function dotColor(pct: number) {
  return pct >= 90 ? '#34d399' : pct >= 75 ? '#818cf8' : pct >= 60 ? '#fbbf24' : '#f87171'
}
function dotGlow(pct: number) {
  return pct >= 90 ? 'rgba(52,211,153,0.7)' : pct >= 75 ? 'rgba(129,140,248,0.7)' : pct >= 60 ? 'rgba(251,191,36,0.7)' : 'rgba(248,113,113,0.7)'
}

export default function AttendanceCalendar({ sessions, onSelectDate }: Props) {
  const [current, setCurrent] = useState(new Date())

  const monthStart = startOfMonth(current)
  const monthEnd   = endOfMonth(current)
  const days       = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad   = getDay(monthStart)

  // Build session map with safe date parsing
  const sessionMap = new Map<string, AttendanceSessionDto>()
  sessions.forEach(s => {
    const key = safeIso(s.date)
    sessionMap.set(key, s)
  })

  const monthKey = format(current, 'yyyy-MM')
  const monthSessions = sessions.filter(s => safeIso(s.date).startsWith(monthKey))
  const avgPct = monthSessions.length
    ? Math.round(monthSessions.reduce((acc, s) => acc + getSessionPct(s), 0) / monthSessions.length)
    : null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,rgba(6,13,31,0.97) 100%)',
        border: '1px solid rgba(99,102,241,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}>

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.5),rgba(6,182,212,0.3),transparent)' }} />

      <div className="p-5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.28)' }}>
              <Calendar className="w-4 h-4" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h3 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>
                {format(current, 'MMMM yyyy')}
              </h3>
              <p className="text-[11px]" style={{ color: '#475569' }}>
                {avgPct !== null
                  ? `${monthSessions.length} session${monthSessions.length !== 1 ? 's' : ''} · avg ${avgPct}%`
                  : 'No sessions this month'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCurrent(subMonths(current, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8' }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setCurrent(new Date())}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8' }}>
              Today
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setCurrent(addMonths(current, 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: '#818cf8' }}>
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* ── Day headers ── */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-bold py-1.5"
              style={{ color: 'rgba(99,102,241,0.45)' }}>{d}</div>
          ))}
        </div>

        {/* ── Days grid ── */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day, idx) => {
            const iso = format(day, 'yyyy-MM-dd')
            const session = sessionMap.get(iso)
            const pct = session ? getSessionPct(session) : 0
            const has = !!session
            const today = isToday(day)

            return (
              <motion.button key={iso}
                whileHover={has ? { scale: 1.18 } : today ? { scale: 1.06 } : {}}
                whileTap={has ? { scale: 0.93 } : {}}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.007, duration: 0.2 }}
                onClick={() => has && onSelectDate?.(iso)}
                className="relative flex flex-col items-center justify-center h-10 w-full rounded-xl text-[12px] font-semibold"
                style={{
                  background: today
                    ? 'rgba(99,102,241,0.2)'
                    : has ? `${dotColor(pct)}12` : 'transparent',
                  border: today
                    ? '1.5px solid rgba(99,102,241,0.5)'
                    : has ? `1px solid ${dotColor(pct)}30` : '1px solid transparent',
                  color: today ? '#818cf8' : has ? '#e2e8f0' : '#334155',
                  cursor: has ? 'pointer' : 'default',
                  boxShadow: has ? `0 2px 14px ${dotGlow(pct)}` : 'none',
                }}
                title={has ? `${session!.topic || 'Class'} — ${pct}% attendance` : undefined}>
                {day.getDate()}
                {has && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: dotColor(pct), boxShadow: `0 0 6px ${dotGlow(pct)}` }} />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* ── Legend ── */}
        <div className="flex items-center gap-4 mt-4 pt-4 flex-wrap"
          style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          {LEGEND.map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#475569' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 6px ${l.glow}` }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}