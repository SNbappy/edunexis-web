import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Mic } from 'lucide-react'
import PresentationsList from './PresentationsList'
import CreatePresentationModal from './CreatePresentationModal'
import PresentationDetailModal from './PresentationDetailModal'
import PresentationMarkEntryModal from './PresentationMarkEntryModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { usePresentations } from '../hooks/usePresentations'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { PresentationDto } from '@/types/presentation.types'

interface Props { courseId: string }
type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'upcoming',  label: 'Upcoming'  },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function PresentationsTab({ courseId }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? 'Student')

  const { presentations, isLoading, createPresentation, isCreating, deletePresentation, isDeleting, updateStatus } = usePresentations(courseId)
  const { members } = useAttendance(courseId)

  const [createOpen, setCreateOpen] = useState(false)
  const [selected,   setSelected]   = useState<PresentationDto | null>(null)
  const [markEntry,  setMarkEntry]  = useState<PresentationDto | null>(null)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [filter,     setFilter]     = useState<FilterTab>('all')

  const upcomingCount  = presentations.filter(p => p.status === 'Scheduled' || p.status === 'Ongoing').length
  const completedCount = presentations.filter(p => p.status === 'Completed').length
  const cancelledCount = presentations.filter(p => p.status === 'Cancelled').length

  const filtered = presentations.filter(p => {
    if (filter === 'upcoming')  return p.status === 'Scheduled' || p.status === 'Ongoing'
    if (filter === 'completed') return p.status === 'Completed'
    if (filter === 'cancelled') return p.status === 'Cancelled'
    return true
  })

  const counts: Record<FilterTab, number | undefined> = {
    all:       presentations.length,
    upcoming:  upcomingCount  || undefined,
    completed: completedCount || undefined,
    cancelled: cancelledCount || undefined,
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
            <Mic className="w-4 h-4" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Presentations</h2>
            <p className="text-[11px]" style={{ color: '#475569' }}>
              {upcomingCount > 0
                ? <span style={{ color: '#34d399' }}>{upcomingCount} upcoming</span>
                : <span>No upcoming presentations</span>
              }
              {completedCount > 0 && <span> · {completedCount} completed</span>}
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
                      color:      filter === tab.key ? '#818cf8' : '#334155',
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
              <Plus className="w-3.5 h-3.5" /> Schedule
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* ── List ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[82px] rounded-2xl animate-pulse"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
          ))}
        </div>
      ) : (
        <PresentationsList
          presentations={filtered}
          onView={setSelected}
          onDelete={teacher ? (id) => setDeleteId(id) : undefined}
          onUpdateStatus={teacher ? (id, status) => updateStatus({ id, status }) : undefined}
          emptyTitle={filter === 'all' ? 'No presentations yet' : `No ${filter} presentations`}
          emptyDescription={teacher ? 'Schedule your first presentation to get started' : 'No presentations scheduled yet'}
          emptyAction={teacher
            ? <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff' }}>
                <Plus className="w-4 h-4" /> Schedule Presentation
              </motion.button>
            : undefined
          }
        />
      )}

      {/* ── Modals ── */}
      <CreatePresentationModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        courseId={courseId}
        onSubmit={(data) => createPresentation(data, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating}
      />

      <PresentationDetailModal
        isOpen={!!selected && !markEntry}
        onClose={() => setSelected(null)}
        presentation={selected}
        onEnterMarks={(p) => { setSelected(null); setMarkEntry(p) }}
      />

      <PresentationMarkEntryModal
        isOpen={!!markEntry}
        onClose={() => setMarkEntry(null)}
        presentation={markEntry}
        courseId={courseId}
        members={members}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deletePresentation(deleteId, { onSuccess: () => setDeleteId(null) }) }}
        title="Delete Presentation"
        description="This will permanently delete the presentation and all associated marks."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}
