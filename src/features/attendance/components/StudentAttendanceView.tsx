import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, TrendingUp, Award } from 'lucide-react'
import gsap from 'gsap'
import { useMyAttendance } from '../hooks/useAttendanceStats'

interface Props { courseId: string }

export default function StudentAttendanceView({ courseId }: Props) {
  const { data: summary, isLoading } = useMyAttendance(courseId)
  const barRef  = useRef<HTMLDivElement>(null)
  const numRef  = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)

  const pct = summary?.attendancePercent ?? 0
  const barColor = pct >= 75 ? '#34d399' : pct >= 50 ? '#fbbf24' : '#f87171'
  const barGlow  = pct >= 75 ? 'rgba(52,211,153,0.5)' : pct >= 50 ? 'rgba(251,191,36,0.5)' : 'rgba(248,113,113,0.5)'

  useEffect(() => {
    if (!summary) return
    if (barRef.current) {
      gsap.fromTo(barRef.current, { width: '0%' }, { width: `${Math.min(pct, 100)}%`, duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 })
    }
    if (numRef.current) {
      gsap.fromTo({ val: 0 }, { val: pct }, {
        duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3,
        onUpdate: function() { if (numRef.current) numRef.current.textContent = Math.round(this.targets()[0].val) + '%' }
      })
    }
    if (ringRef.current) {
      const circumference = 2 * Math.PI * 44
      gsap.fromTo(ringRef.current,
        { strokeDashoffset: circumference },
        { strokeDashoffset: circumference - (pct / 100) * circumference, duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }
      )
    }
  }, [summary])

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2].map(i => (
        <div key={i} className="h-28 rounded-2xl animate-pulse"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
      ))}
    </div>
  )

  if (!summary) return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 rounded-3xl text-center"
      style={{ background: 'rgba(10,22,40,0.6)', border: '1px dashed rgba(99,102,241,0.15)' }}>
      <Clock className="w-10 h-10 mb-3 opacity-20" style={{ color: '#818cf8' }} />
      <p className="text-sm font-semibold" style={{ color: '#334155' }}>No attendance records yet.</p>
    </motion.div>
  )

  const statusLabel = pct >= 75 ? 'âœ… Good standing' : pct >= 50 ? 'âš ï¸ At risk â€” below 75%' : 'ðŸš¨ Critical â€” below 50%'

  const STATS = [
    { label: 'Present',  value: summary.presentCount,  icon: CheckCircle2, color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)'  },
    { label: 'Absent',   value: summary.absentCount,   icon: XCircle,      color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.2)' },
    { label: 'Unmarked', value: summary.unmarkedCount, icon: Clock,        color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
    { label: 'Total',    value: summary.totalSessions, icon: TrendingUp,   color: '#818cf8', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)'  },
  ]

  const circumference = 2 * Math.PI * 44

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Hero rate card */}
      <div className="relative rounded-2xl p-6 overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.92),rgba(6,13,31,0.97))', border: `1px solid ${barColor}28`, boxShadow: `0 4px 28px rgba(0,0,0,0.4), 0 0 0 1px ${barColor}10 inset` }}>
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: `linear-gradient(90deg,transparent,${barColor}60,transparent)` }} />
        <div className="flex items-center gap-6">
          {/* SVG ring */}
          <div className="relative shrink-0">
            <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle ref={ringRef} cx="55" cy="55" r="44" fill="none"
                stroke={barColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={circumference}
                style={{ filter: `drop-shadow(0 0 8px ${barGlow})` }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span ref={numRef} className="text-2xl font-extrabold" style={{ color: barColor }}>0%</span>
              <span className="text-[10px] font-semibold" style={{ color: '#475569' }}>Rate</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-lg font-extrabold mb-1" style={{ color: '#e2e8f0' }}>Attendance Rate</p>
            <p className="text-sm mb-3" style={{ color: '#475569' }}>{statusLabel}</p>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div ref={barRef} className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg,${barColor},${barColor}aa)`, boxShadow: `0 0 12px ${barGlow}`, width: 0 }} />
            </div>
            <p className="text-[11px] mt-2" style={{ color: '#334155' }}>
              {summary.presentCount} of {summary.totalSessions} sessions attended
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3, boxShadow: `0 10px 28px rgba(0,0,0,0.4)` }}
            className="relative rounded-2xl p-4 overflow-hidden"
            style={{ background: s.bg, border: `1px solid ${s.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', transition: 'all 0.2s' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}18`, border: `1px solid ${s.border}` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-extrabold leading-none mb-1" style={{ color: '#f1f5f9' }}>{s.value}</p>
            <p className="text-[11px] font-semibold" style={{ color: '#64748b' }}>{s.label}</p>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
              style={{ background: `linear-gradient(90deg,${s.color}50,transparent)` }} />
          </motion.div>
        ))}
      </div>

      {/* Status message */}
      {pct < 75 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Award className="w-5 h-5 shrink-0" style={{ color: '#fbbf24' }} />
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            You need <span className="font-bold" style={{ color: '#fbbf24' }}>{Math.max(0, Math.ceil((75 * summary.totalSessions / 100) - summary.presentCount))} more</span> attended sessions to reach 75% attendance.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
