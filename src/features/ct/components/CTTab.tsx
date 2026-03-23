import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, ClipboardList } from 'lucide-react'
import CTEventsList from './CTEventsList'
import CTEventDetailModal from './CTEventDetailModal'
import CreateCTEventModal from './CreateCTEventModal'
import CTMarkEntryModal from './CTMarkEntryModal'
import UploadKhataModal from './UploadKhataModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useCTEvents } from '../hooks/useCTEvents'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CTEventDto, CreateCTEventRequest } from '@/types/ct.types'

interface Member { userId: string; fullName: string; studentId?: string; profilePhotoUrl?: string }
interface Props { courseId: string; members?: Member[] }
type FilterTab = 'all' | 'draft' | 'published'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'draft',     label: 'Draft'     },
  { key: 'published', label: 'Published' },
]

export default function CTTab({ courseId, members = [] }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? 'Student')

  const { ctEvents, isLoading, createCT, isCreating, deleteCT, isDeleting, publishCT, unpublishCT } = useCTEvents(courseId)

  const [createOpen,  setCreateOpen]  = useState(false)
  const [selected,    setSelected]    = useState<CTEventDto | null>(null)
  const [detailOpen,  setDetailOpen]  = useState(false)
  const [marksTarget, setMarksTarget] = useState<CTEventDto | null>(null)
  const [khataTarget, setKhataTarget] = useState<CTEventDto | null>(null)
  const [deleteTarget,setDeleteTarget]= useState<CTEventDto | null>(null)
  const [filter,      setFilter]      = useState<FilterTab>('all')

  const draftCount     = ctEvents.filter(c => c.status === 'Draft').length
  const publishedCount = ctEvents.filter(c => c.status === 'Published').length

  const filtered = ctEvents.filter(c => {
    if (filter === 'draft')     return c.status === 'Draft'
    if (filter === 'published') return c.status === 'Published'
    return true
  })

  const counts: Record<FilterTab, number | undefined> = {
    all:       ctEvents.length,
    draft:     draftCount     || undefined,
    published: publishedCount || undefined,
  }

  const handleView = (ct: CTEventDto) => { setSelected(ct); setDetailOpen(true) }

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
            <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Class Tests</h2>
            <p className="text-[11px]" style={{ color: '#475569' }}>
              {publishedCount > 0
                ? <span style={{ color: '#34d399' }}>{publishedCount} published</span>
                : <span>No published CTs</span>
              }
              {draftCount > 0 && <span> · {draftCount} draft</span>}
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
              <Plus className="w-3.5 h-3.5" /> Create CT
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
        <CTEventsList
          ctEvents={filtered}
          onView={handleView}
          onDelete={teacher ? ct => setDeleteTarget(ct) : undefined}
          onPublish={teacher ? id => publishCT(id) : undefined}
          onUnpublish={teacher ? id => unpublishCT(id) : undefined}
          onUploadKhata={teacher ? ct => setKhataTarget(ct) : undefined}
          onEnterMarks={teacher ? ct => setMarksTarget(ct) : undefined}
          emptyTitle={filter === 'all' ? 'No CT events yet' : `No ${filter} CTs`}
          emptyDescription={teacher ? 'Create your first CT to get started' : 'No class tests have been posted yet'}
          emptyAction={teacher
            ? <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff' }}>
                <Plus className="w-4 h-4" /> Create CT
              </motion.button>
            : undefined
          }
        />
      )}

      {/* ── Modals ── */}
      <CreateCTEventModal isOpen={createOpen} onClose={() => setCreateOpen(false)} courseId={courseId}
        onSubmit={(d: CreateCTEventRequest) => createCT(d, { onSuccess: () => setCreateOpen(false) })}
        isLoading={isCreating} />

      <CTEventDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} ct={selected}
        onEnterMarks={teacher ? ct => { setDetailOpen(false); setMarksTarget(ct) } : undefined}
        onUploadKhata={teacher ? ct => { setDetailOpen(false); setKhataTarget(ct) } : undefined}
        onPublish={teacher ? id => { setDetailOpen(false); publishCT(id) } : undefined} />

      {marksTarget && (
        <CTMarkEntryModal isOpen={!!marksTarget} onClose={() => setMarksTarget(null)}
          ct={marksTarget} members={members} />
      )}

      {khataTarget && (
        <UploadKhataModal isOpen={!!khataTarget} onClose={() => setKhataTarget(null)}
          ct={khataTarget} members={members} />
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) deleteCT(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) }) }}
        title="Delete CT" description="This will permanently delete this CT event and all its marks."
        confirmLabel="Delete" isLoading={isDeleting} />
    </div>
  )
}