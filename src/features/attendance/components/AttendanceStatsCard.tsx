import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Calendar, Activity } from 'lucide-react'
import gsap from 'gsap'

interface Props {
  totalSessions: number
  averageAttendance: number
  totalStudents?: number
  lastSessionDate?: string
}

export default function AttendanceStatsCard({ totalSessions, averageAttendance, totalStudents, lastSessionDate }: Props) {
  const barRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  const isGood = averageAttendance >= 75
  const barColor = averageAttendance >= 90 ? '#34d399' : averageAttendance >= 75 ? '#818cf8' : averageAttendance >= 60 ? '#fbbf24' : '#f87171'
  const barGlow  = averageAttendance >= 90 ? 'rgba(52,211,153,0.5)' : averageAttendance >= 75 ? 'rgba(129,140,248,0.5)' : averageAttendance >= 60 ? 'rgba(251,191,36,0.5)' : 'rgba(248,113,113,0.5)'

  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(barRef.current,
        { width: '0%' },
        { width: `${Math.min(averageAttendance, 100)}%`, duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }
      )
    }
    if (numRef.current) {
      gsap.fromTo({ val: 0 }, { val: averageAttendance },
        { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3,
          onUpdate: function() { if (numRef.current) numRef.current.textContent = this.targets()[0].val.toFixed(1) + '%' }
        }
      )
    }
  }, [averageAttendance])

  const CARDS = [
    { label: 'Total Sessions',  value: totalSessions,  icon: Calendar,   color: '#818cf8', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.2)',  glow: 'rgba(99,102,241,0.25)' },
    { label: 'Avg. Attendance', value: null,           icon: isGood ? TrendingUp : TrendingDown, color: barColor, bg: `${barColor}18`, border: `${barColor}30`, glow: barGlow },
    ...(totalStudents !== undefined ? [{ label: 'Total Students', value: totalStudents, icon: Users, color: '#38bdf8', bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', glow: 'rgba(56,189,248,0.25)' }] : []),
  ]

  return (
    <div className="space-y-4 mb-2">
      {/* Rate bar card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl p-5 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,rgba(6,13,31,0.95) 100%)', border: `1px solid ${barColor}28`, boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 0 1px ${barColor}10 inset` }}>
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(90deg,transparent,${barColor}60,transparent)` }} />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${barColor}18`, border: `1px solid ${barColor}30` }}>
              <Activity className="w-4 h-4" style={{ color: barColor }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Overall Attendance Rate</p>
              <p className="text-xs" style={{ color: '#475569' }}>
                {averageAttendance >= 90 ? 'Excellent â€” keep it up!' : averageAttendance >= 75 ? 'Good standing' : averageAttendance >= 60 ? 'At risk â€” below 75%' : 'Critical â€” below 60%'}
              </p>
            </div>
          </div>
          <span ref={numRef} className="text-3xl font-extrabold" style={{ color: barColor }}>0%</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div ref={barRef} className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${barColor},${barColor}aa)`, boxShadow: `0 0 10px ${barGlow}`, width: 0 }} />
        </div>
      </motion.div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CARDS.map((c, i) => (
          <motion.div key={c.label}
            initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08 + 0.1 }}
            whileHover={{ y: -3, boxShadow: `0 12px 32px ${c.glow}` }}
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 4px 16px rgba(0,0,0,0.3)`, transition: 'box-shadow 0.2s, transform 0.2s' }}>
            <div className="absolute -top-3 -right-3 w-14 h-14 rounded-full pointer-events-none opacity-30"
              style={{ background: `radial-gradient(circle,${c.color}50 0%,transparent 70%)`, filter: 'blur(8px)' }} />
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${c.color}18`, border: `1px solid ${c.color}30` }}>
              <c.icon className="w-4 h-4" style={{ color: c.color }} />
            </div>
            <p className="text-2xl font-extrabold leading-none" style={{ color: '#f1f5f9' }}>
              {c.value !== null ? c.value : <span ref={undefined}>{averageAttendance.toFixed(1)}%</span>}
            </p>
            <p className="text-[11px] font-semibold mt-1" style={{ color: '#64748b' }}>{c.label}</p>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
              style={{ background: `linear-gradient(90deg,${c.color}50,transparent)` }} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
