import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import AssignmentCard from './AssignmentCard'
import type { AssignmentDto } from '@/types/assignment.types'

interface Props {
  assignments: AssignmentDto[]
  onView: (a: AssignmentDto) => void
  onEdit?: (a: AssignmentDto) => void
  onDelete?: (id: string) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

export default function AssignmentsList({ assignments, onView, onEdit, onDelete, emptyTitle, emptyDescription, emptyAction }: Props) {
  if (assignments.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 rounded-3xl text-center"
        style={{ background: 'linear-gradient(135deg,rgba(10,22,40,0.6),rgba(6,13,31,0.8))', border: '1px dashed rgba(99,102,241,0.15)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.2),rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.25)' }}>
          <ClipboardList className="w-8 h-8" style={{ color: '#818cf8' }} strokeWidth={1.5} />
        </div>
        <p className="text-base font-bold mb-1" style={{ color: '#e2e8f0' }}>{emptyTitle ?? 'No assignments yet'}</p>
        {emptyDescription && <p className="text-sm mb-4" style={{ color: '#475569' }}>{emptyDescription}</p>}
        {emptyAction}
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {assignments.map((a, i) => (
        <AssignmentCard key={a.id} assignment={a} index={i} onView={onView} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}