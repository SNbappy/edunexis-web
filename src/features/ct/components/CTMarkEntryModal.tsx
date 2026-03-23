import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { useCTMarks } from '../hooks/useCTEvents'
import type { CTEventDto, CTMarkEntry } from '@/types/ct.types'

interface Member { userId: string; fullName: string; studentId?: string; profilePhotoUrl?: string }
interface Props { isOpen: boolean; onClose: () => void; ct: CTEventDto | null; members: Member[] }

export default function CTMarkEntryModal({ isOpen, onClose, ct, members }: Props) {
  const ctId = ct?.id ?? ''
  const { marksData, isLoading, gradeStudents, isSaving } = useCTMarks(ctId)
  const [entries, setEntries] = useState<Record<string, { marks: string; absent: boolean; remarks: string }>>({})

  useEffect(() => {
    if (!isOpen || !ct) return
    const existingMarks = marksData?.marks ?? []
    const init: typeof entries = {}
    members.forEach(m => {
      const ex = existingMarks.find(r => r.studentId === m.userId)
      init[m.userId] = { marks: ex?.obtainedMarks?.toString() ?? '', absent: ex?.isAbsent ?? false, remarks: ex?.remarks ?? '' }
    })
    setEntries(init)
  }, [isOpen, members, marksData, ct])

  const maxMarks  = ct?.maxMarks ?? 0
  const setField  = (uid: string, field: 'marks' | 'absent' | 'remarks', val: string | boolean) =>
    setEntries(prev => ({ ...prev, [uid]: { ...prev[uid], [field]: val } }))
  const setAllAbsent = (absent: boolean) =>
    setEntries(prev => {
      const next = { ...prev }
      members.forEach(m => { next[m.userId] = { ...next[m.userId], absent, marks: absent ? '' : next[m.userId]?.marks ?? '' } })
      return next
    })
  const handleSave = () => {
    const data: CTMarkEntry[] = members.map(m => {
      const e = entries[m.userId] ?? { marks: '', absent: false, remarks: '' }
      return { studentId: m.userId, obtainedMarks: e.absent || e.marks === '' ? null : parseFloat(e.marks), isAbsent: e.absent, remarks: e.remarks || undefined }
    })
    gradeStudents({ marks: data }, { onSuccess: onClose })
  }

  const gradedCount = Object.values(entries).filter(e => !e.absent && e.marks !== '').length
  const absentCount = Object.values(entries).filter(e => e.absent).length
  const pending     = members.length - gradedCount - absentCount

  if (!ct) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Enter Marks — CT ${ct.ctNumber}`} description={`${ct.title} · Total: ${ct.maxMarks} marks`} size="xl">
      <div className="space-y-5">

        {/* Khata warning */}
        {!ct.khataUploaded && (
          <div className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
            <p className="text-[11.5px] leading-relaxed" style={{ color: '#b45309' }}>
              All 3 khata scripts must be uploaded before saving marks.
            </p>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 p-3 rounded-xl flex-wrap"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
          <Stat label="Graded"  value={gradedCount} color="#34d399" icon={CheckCircle2} />
          <div className="w-[1px] h-8 shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }} />
          <Stat label="Absent"  value={absentCount} color="#f87171" icon={XCircle} />
          <div className="w-[1px] h-8 shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }} />
          <Stat label="Pending" value={pending}     color="#475569" />
          <div className="ml-auto flex gap-2">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAllAbsent(false)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
              Clear Absent
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAllAbsent(true)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
              All Absent
            </motion.button>
          </div>
        </div>

        {/* Student list */}
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(99,102,241,0.06)' }} />)}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
            {members.map((member, i) => {
              const e       = entries[member.userId] ?? { marks: '', absent: false, remarks: '' }
              const marksN  = parseFloat(e.marks)
              const pct     = !isNaN(marksN) && maxMarks > 0 ? (marksN / maxMarks) * 100 : 0
              return (
                <motion.div key={member.userId}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={e.absent
                    ? { background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }
                    : { background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.1)' }}>
                  <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: '#e2e8f0' }}>{member.fullName}</p>
                    {member.studentId && <p className="text-[11px] font-mono" style={{ color: '#475569' }}>{member.studentId}</p>}
                    {!e.absent && e.marks !== '' && !isNaN(marksN) && (
                      <ProgressBar value={pct} size="sm"
                        color={pct >= 80 ? 'success' : pct >= 60 ? 'primary' : pct >= 40 ? 'warning' : 'danger'}
                        className="mt-1 w-24" animated={false} />
                    )}
                  </div>
                  {/* Absent toggle */}
                  <motion.button whileTap={{ scale: 0.9 }}
                    onClick={() => setField(member.userId, 'absent', !e.absent)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-bold shrink-0 transition-all"
                    style={e.absent
                      ? { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
                      : { background: 'transparent', color: '#334155', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <XCircle className="w-3.5 h-3.5" /> Absent
                  </motion.button>
                  {/* Marks input */}
                  {!e.absent ? (
                    <input type="number" value={e.marks}
                      onChange={ev => setField(member.userId, 'marks', ev.target.value)}
                      min={0} max={maxMarks} step={0.5} placeholder="—"
                      className="w-16 h-9 text-center rounded-xl text-sm focus:outline-none transition-all"
                      style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                      onBlur={e  => (e.target.style.borderColor = 'rgba(99,102,241,0.2)')} />
                  ) : (
                    <div className="w-16 h-9 flex items-center justify-center rounded-xl text-sm font-extrabold"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>ABS</div>
                  )}
                </motion.div>
              )
            })}
            {members.length === 0 && (
              <div className="text-center py-10 text-sm" style={{ color: '#334155' }}>No students enrolled yet.</div>
            )}
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#818cf8' }}>
            Cancel
          </motion.button>
          <motion.button
            whileHover={members.length > 0 ? { scale: 1.02, boxShadow: '0 6px 24px rgba(52,211,153,0.35)' } : {}}
            whileTap={members.length > 0 ? { scale: 0.97 } : {}}
            onClick={handleSave} disabled={members.length === 0 || isSaving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,rgba(52,211,153,0.9),rgba(16,185,129,0.9))', color: '#fff', opacity: isSaving ? 0.7 : 1 }}>
            {isSaving
              ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Saving...</>
              : <><Save className="w-4 h-4" /> Save Marks</>
            }
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}

function Stat({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon?: any }) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color }} />}
      <div>
        <p className="text-base font-extrabold leading-none" style={{ color }}>{value}</p>
        <p className="text-[10px] font-bold" style={{ color: '#475569' }}>{label}</p>
      </div>
    </div>
  )
}