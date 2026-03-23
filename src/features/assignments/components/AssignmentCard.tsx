import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, FileText, MoreVertical, Trash2, Users, Pencil, CheckCircle2, Lock } from 'lucide-react'
import { formatRelative } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { isPast, parseISO, formatDistanceToNow } from 'date-fns'
import type { AssignmentDto } from '@/types/assignment.types'

interface Props {
  assignment: AssignmentDto
  index?: number
  onView: (a: AssignmentDto) => void
  onEdit?: (a: AssignmentDto) => void
  onDelete?: (id: string) => void
}

export default function AssignmentCard({ assignment, index = 0, onView, onEdit, onDelete }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? 'Student')
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered,  setHovered]  = useState(false)

  const isPastDue = assignment.deadline ? isPast(parseISO(assignment.deadline)) : false
  const isActive  = assignment.isOpen && !isPastDue

  const timeLeft = assignment.deadline && !isPastDue
    ? formatDistanceToNow(parseISO(assignment.deadline), { addSuffix: true })
    : null

  const statusColor = isActive ? '#34d399' : '#f87171'
  const statusBg    = isActive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)'
  const statusBorder = isActive ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.28 }}
      onClick={() => onView(assignment)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-2xl cursor-pointer"
      style={{
        background: 'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,rgba(6,13,31,0.97) 100%)',
        border: hovered ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.12)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Status stripe */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: isActive
          ? 'linear-gradient(180deg,#34d399,#34d39950)'
          : 'linear-gradient(180deg,#f87171,#f8717150)' }} />

      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)', boxShadow: '0 2px 12px rgba(99,102,241,0.15)' }}>
          <FileText className="w-5 h-5" style={{ color: '#818cf8' }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-[13.5px] leading-snug line-clamp-1 transition-colors"
              style={{ color: hovered ? '#818cf8' : '#e2e8f0' }}>
              {assignment.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
              {/* Status pill */}
              <span className="text-[10.5px] font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                style={{ background: statusBg, border: `1px solid ${statusBorder}`, color: statusColor }}>
                {isActive
                  ? <><CheckCircle2 className="w-3 h-3" /> Active</>
                  : <><Lock className="w-3 h-3" /> Closed</>
                }
              </span>
              {teacher && (onEdit || onDelete) && (
                <div className="relative">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                    onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                    style={{
                      background: menuOpen ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.08)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      color: '#818cf8',
                      opacity: hovered || menuOpen ? 1 : 0,
                    }}>
                    <MoreVertical className="w-3.5 h-3.5" />
                  </motion.button>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-2 z-[100] w-44 rounded-xl overflow-hidden"
                      style={{ background: 'rgba(7,14,33,0.98)', border: '1px solid rgba(99,102,241,0.22)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}>
                      <div className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.4),transparent)' }} />
                      <div className="p-1">
                        {onEdit && (
                          <button onClick={e => { e.stopPropagation(); onEdit(assignment); setMenuOpen(false) }}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                            style={{ color: '#818cf8' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={e => { e.stopPropagation(); onDelete(assignment.id); setMenuOpen(false) }}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors"
                            style={{ color: '#f87171' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>

          {assignment.instructions && (
            <p className="text-[11.5px] line-clamp-1" style={{ color: '#475569' }}>{assignment.instructions}</p>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            {assignment.deadline && (
              isPastDue
                ? <span className="flex items-center gap-1 text-[11.5px] font-semibold" style={{ color: '#f87171' }}>
                    <AlertCircle className="w-3.5 h-3.5" /> Overdue
                  </span>
                : <span className="flex items-center gap-1 text-[11.5px] font-medium" style={{ color: '#fbbf24' }}>
                    <Clock className="w-3.5 h-3.5" /> Due {timeLeft}
                  </span>
            )}
            <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.15)', color: '#818cf8' }}>
              {assignment.maxMarks} marks
            </span>
            {teacher && (
              <span className="flex items-center gap-1 text-[11.5px]" style={{ color: '#475569' }}>
                <Users className="w-3.5 h-3.5" /> {assignment.submissionCount ?? 0} submitted
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}