import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ClipboardList } from 'lucide-react'
import AssignmentsList from './AssignmentsList'
import CreateAssignmentModal from './CreateAssignmentModal'
import EditAssignmentModal from './EditAssignmentModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useAssignments } from '../hooks/useAssignments'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { AssignmentDto, CreateAssignmentRequest, UpdateAssignmentRequest } from '@/types/assignment.types'

interface Props { courseId: string }
type FilterTab = 'all' | 'active' | 'closed'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
]

export default function AssignmentsTab({ courseId }: Props) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? 'Student')

  const { assignments, isLoading, createAssignment, isCreating, updateAssignment, isUpdating, deleteAssignment, isDeleting } = useAssignments(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing,    setEditing]    = useState<AssignmentDto | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [filter,     setFilter]     = useState<FilterTab>('all')

  const activeCount = assignments.filter(a => a.isOpen).length
  const closedCount = assignments.filter(a => !a.isOpen).length

  const filtered = assignments.filter(a => {
    if (filter === 'active') return a.isOpen
    if (filter === 'closed') return !a.isOpen
    return true
  })

  const counts: Record<FilterTab, number | undefined> = {
    all: assignments.length,
    active: activeCount || undefined,
    closed: closedCount || undefined,
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* ── Premium Toolbar ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
        style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <ClipboardList className="w-4 h-4" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Assignments</h2>
            <p className="text-[11px]" style={{ color: '#475569' }}>
              {activeCount > 0
                ? <span style={{ color: '#34d399' }}>{activeCount} active</span>
                : <span>No active assignments</span>
              }
              {closedCount > 0 && <span> · {closedCount} closed</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(6,13,31,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
            {FILTER_TABS.map(tab => (
              <motion.button key={tab.key} whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(tab.key)}
                className="relative px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{
                  background: filter === tab.key ? 'rgba(99,102,241,0.25)' : 'transparent',
                  color:      filter === tab.key ? '#818cf8' : '#475569',
                  border:     filter === tab.key ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                }}>
                {tab.label}
                {counts[tab.key] !== undefined && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-md font-extrabold"
                    style={{
                      background: filter === tab.key ? 'rgba(129,140,248,0.2)' : 'rgba(99,102,241,0.08)',
                      color: filter === tab.key ? '#818cf8' : '#334155',
                    }}>
                    {counts[tab.key]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          {teacher && (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
              <Plus className="w-3.5 h-3.5" /> Create
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-[82px] rounded-2xl animate-pulse"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
          ))}
        </div>
      ) : (
        <AssignmentsList
          assignments={filtered}
          onView={a => navigate(`/courses/${courseId}/assignments/${a.id}`)}
          onEdit={teacher ? a => setEditing(a) : undefined}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
          emptyTitle={filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}
          emptyDescription={teacher ? 'Create your first assignment to get started' : 'Your teacher has not posted any assignments yet'}
          emptyAction={teacher
            ? <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff' }}>
                <Plus className="w-4 h-4" /> Create Assignment
              </motion.button>
            : undefined
          }
        />
      )}

      <CreateAssignmentModal isOpen={createOpen} onClose={() => setCreateOpen(false)}
        onSubmit={(data: CreateAssignmentRequest) => createAssignment(data, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating} />

      {editing && (
        <EditAssignmentModal isOpen={!!editing} onClose={() => setEditing(null)} assignment={editing}
          onSubmit={(data: UpdateAssignmentRequest) => updateAssignment({ assignmentId: editing.id, data }, { onSuccess: () => setEditing(null) })}
          isLoading={isUpdating} />
      )}

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteAssignment(deleteId, { onSuccess: () => setDeleteId(null) }) }}
        title="Delete Assignment" description="This will permanently delete the assignment and all its submissions."
        confirmLabel="Delete" isLoading={isDeleting} />
    </div>
  )
}