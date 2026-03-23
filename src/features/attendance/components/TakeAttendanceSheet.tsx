import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, HelpCircle, Calendar, BookOpen, Search, Users } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import { todayISO } from '@/utils/dateUtils'
import type { AttendanceStatus } from '@/types/attendance.types'

interface Member { userId: string; fullName: string; studentId?: string; profilePhotoUrl?: string }
interface Props {
  isOpen: boolean; onClose: () => void; members: Member[]; courseId: string
  onSubmit: (data: { courseId: string; date: string; topic?: string; records: { studentId: string; status: AttendanceStatus }[] }) => void
  isLoading?: boolean; initialDate?: string; initialTopic?: string; initialStatuses?: Record<string, AttendanceStatus>
}
type StatusMap = Record<string, AttendanceStatus>

const STATUS_CFG = [
  { value: 'Present'  as AttendanceStatus, label: 'Present',  icon: CheckCircle2, color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  { value: 'Absent'   as AttendanceStatus, label: 'Absent',   icon: XCircle,      color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  { value: 'Unmarked' as AttendanceStatus, label: 'Late',     icon: HelpCircle,   color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
]

export default function TakeAttendanceSheet({ isOpen, onClose, members, courseId, onSubmit, isLoading, initialDate, initialTopic, initialStatuses }: Props) {
  const [date, setDate] = useState(initialDate ?? todayISO())
  const [topic, setTopic] = useState(initialTopic ?? '')
  const [statuses, setStatuses] = useState<StatusMap>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isOpen || !members.length) return
    const init: StatusMap = {}
    members.forEach(m => { init[m.userId] = initialStatuses?.[m.userId] ?? 'Unmarked' })
    setStatuses(init); setSearch(''); setDate(initialDate ?? todayISO()); setTopic(initialTopic ?? '')
  }, [isOpen, members])

  const setAll = (status: AttendanceStatus) => {
    const next: StatusMap = {}; members.forEach(m => { next[m.userId] = status }); setStatuses(next)
  }
  const pick = (uid: string, s: AttendanceStatus) => setStatuses(prev => ({ ...prev, [uid]: s }))
  const filtered = members.filter(m => {
    const q = search.toLowerCase()
    return m.fullName.toLowerCase().includes(q) || (m.studentId?.toLowerCase().includes(q) ?? false)
  })
  const counts = members.reduce((acc, m) => {
    const s = statuses[m.userId] ?? 'Unmarked'; acc[s] = (acc[s] ?? 0) + 1; return acc
  }, {} as Record<AttendanceStatus, number>)

  const presentCount  = counts['Present']  ?? 0
  const absentCount   = counts['Absent']   ?? 0
  const unmarkedCount = counts['Unmarked'] ?? 0
  const total = members.length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialStatuses ? 'Edit Attendance' : 'Take Attendance'} size="xl">
      <div className="space-y-4">

        {/* Date & Topic */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'date', value: date, setter: setDate, icon: Calendar, placeholder: 'Date' },
            { type: 'text', value: topic, setter: setTopic, icon: BookOpen, placeholder: 'Topic (optional)' },
          ].map((f, i) => (
            <div key={i} className="relative">
              <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#475569' }} />
              <input type={f.type} value={f.value} placeholder={f.placeholder}
                onChange={e => f.setter(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
                style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0', caretColor: '#818cf8' }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.2)'} />
            </div>
          ))}
        </div>

        {/* Live count bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <motion.div className="absolute left-0 top-0 h-full rounded-full"
            animate={{ width: total ? `${(presentCount / total) * 100}%` : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg,#34d399,#818cf8)' }} />
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            {STATUS_CFG.map(s => (
              <div key={s.value} className="flex items-center gap-1.5 text-[12px] font-bold"
                style={{ color: s.color }}>
                <s.icon className="w-3.5 h-3.5" />
                {counts[s.value] ?? 0}
              </div>
            ))}
            <span className="text-[11px]" style={{ color: '#334155' }}>/ {total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold mr-1" style={{ color: '#475569' }}>Set all:</span>
            {STATUS_CFG.map(s => (
              <motion.button key={s.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setAll(s.value)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
                style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
                <s.icon className="w-3 h-3" />{s.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#475569' }} />
          <input placeholder="Search student..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-all"
            style={{ background: 'rgba(6,13,31,0.5)', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }}
            onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.4)'}
            onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.15)'} />
        </div>

        {/* Student list */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 no-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10" style={{ color: '#334155' }}>
              <Users className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">{members.length === 0 ? 'No students enrolled yet.' : 'No students match search.'}</p>
            </div>
          ) : filtered.map((m, i) => {
            const status = statuses[m.userId] ?? 'Unmarked'
            const cfg = STATUS_CFG.find(s => s.value === status)!
            return (
              <motion.div key={m.userId}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all"
                style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.border}55` }}>
                <div className="rounded-xl overflow-hidden shrink-0"
                  style={{ border: `1.5px solid ${cfg.border}`, width: 34, height: 34 }}>
                  <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" className="w-full h-full rounded-none" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{m.fullName}</p>
                  {m.studentId && <p className="text-[11px] font-mono" style={{ color: '#475569' }}>{m.studentId}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {STATUS_CFG.map(s => (
                    <motion.button key={s.value} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                      onClick={() => pick(m.userId, s.value)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                      style={{
                        background: status === s.value ? s.bg : 'rgba(255,255,255,0.03)',
                        border: status === s.value ? `1px solid ${s.border}` : '1px solid rgba(255,255,255,0.06)',
                        color: status === s.value ? s.color : '#334155',
                        boxShadow: status === s.value ? `0 0 10px ${s.bg}` : 'none',
                      }}>
                      <s.icon className="w-3 h-3" />{s.label}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {unmarkedCount > 0 && (
          <p className="text-center text-[11.5px] font-semibold" style={{ color: '#fbbf24' }}>
            âš  {unmarkedCount} student{unmarkedCount > 1 ? 's' : ''} still unmarked
          </p>
        )}

        <div className="flex gap-3 pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button
            whileHover={members.length ? { scale: 1.02, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' } : {}}
            whileTap={members.length ? { scale: 0.97 } : {}}
            onClick={() => onSubmit({ courseId, date, topic: topic || undefined, records: members.map(m => ({ studentId: m.userId, status: statuses[m.userId] ?? 'Unmarked' })) })}
            disabled={members.length === 0 || !!isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', opacity: members.length ? 1 : 0.5 }}>
            {isLoading ? 'Saving...' : initialStatuses ? 'Update Attendance' : 'Save Attendance'}
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}
