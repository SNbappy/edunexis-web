import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderPlus, Upload, Search, BookOpen, Filter } from 'lucide-react'
import MaterialsList from './MaterialsList'
import MaterialsBreadcrumb from './MaterialsBreadcrumb'
import UploadMaterialModal from './UploadMaterialModal'
import CreateFolderModal from './CreateFolderModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useMaterials } from '../hooks/useMaterials'
import type { FileTypeFilter } from '../hooks/useMaterials'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

interface Props { courseId: string }

const SORT_TABS = [
  { label: 'All',     value: 'all'    },
  { label: 'Folders', value: 'Folder' },
  { label: 'Files',   value: 'File'   },
] as const

const FILE_FILTERS: { label: string; value: FileTypeFilter }[] = [
  { label: 'All Files',     value: 'all'          },
  { label: 'PDF',           value: 'pdf'          },
  { label: 'Presentation',  value: 'presentation' },
  { label: 'Document',      value: 'document'     },
  { label: 'Image',         value: 'image'        },
  { label: 'Links',         value: 'link'         },
  { label: 'Other',         value: 'other'        },
]

const FILTER_COLORS: Record<FileTypeFilter, { color: string; border: string; bg: string }> = {
  all:          { color: '#818cf8', border: 'rgba(129,140,248,0.4)', bg: 'rgba(99,102,241,0.15)'  },
  pdf:          { color: '#f87171', border: 'rgba(248,113,113,0.4)', bg: 'rgba(248,113,113,0.12)' },
  presentation: { color: '#fb923c', border: 'rgba(251,146,60,0.4)',  bg: 'rgba(251,146,60,0.12)'  },
  document:     { color: '#60a5fa', border: 'rgba(96,165,250,0.4)',  bg: 'rgba(96,165,250,0.12)'  },
  image:        { color: '#c084fc', border: 'rgba(192,132,252,0.4)', bg: 'rgba(192,132,252,0.12)' },
  link:         { color: '#34d399', border: 'rgba(52,211,153,0.4)',  bg: 'rgba(52,211,153,0.12)'  },
  other:        { color: '#94a3b8', border: 'rgba(148,163,184,0.3)', bg: 'rgba(148,163,184,0.1)'  },
}

export default function MaterialsTab({ courseId }: Props) {
  const { user } = useAuthStore()
  const teacher  = isTeacher(user?.role ?? 'Student')

  const {
    materials, isLoading, breadcrumb, openFolder, navigateTo,
    createFolder, isCreatingFolder,
    uploadFile, isUploading,
    deleteMaterial, isDeleting,
    sortMode, setSortMode,
    isFlattenMode, fileTypeFilter, setFileTypeFilter,
  } = useMaterials(courseId)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [folderOpen, setFolderOpen] = useState(false)
  const [deleteId,   setDeleteId]   = useState<string | null>(null)
  const [search,     setSearch]     = useState('')

  const filtered = materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* ── Premium Toolbar ── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4"
        style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>

        {/* Top row: title + actions */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
              <BookOpen className="w-4 h-4" style={{ color: '#818cf8' }} />
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Materials</h2>
              {!isFlattenMode
                ? <MaterialsBreadcrumb items={breadcrumb} onNavigate={navigateTo} />
                : <p className="text-[11px]" style={{ color: '#475569' }}>Showing all files across folders</p>
              }
            </div>
          </div>
          {teacher && (
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => setFolderOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                <FolderPlus className="w-3.5 h-3.5" /> New Folder
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setUploadOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
                <Upload className="w-3.5 h-3.5" /> Upload
              </motion.button>
            </div>
          )}
        </div>

        {/* Bottom row: search + sort toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#334155' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search materials..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none"
              style={{ background: 'rgba(6,13,31,0.6)', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }}
              onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.4)'}
              onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.15)'}
            />
          </div>
          {/* Sort toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl shrink-0"
            style={{ background: 'rgba(6,13,31,0.6)', border: '1px solid rgba(99,102,241,0.15)' }}>
            {SORT_TABS.map(tab => (
              <motion.button key={tab.value} whileTap={{ scale: 0.95 }}
                onClick={() => setSortMode(tab.value as any)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{
                  background:   sortMode === tab.value ? 'rgba(99,102,241,0.25)' : 'transparent',
                  color:        sortMode === tab.value ? '#818cf8' : '#475569',
                  border:       sortMode === tab.value ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                  boxShadow:    sortMode === tab.value ? '0 2px 12px rgba(99,102,241,0.2)' : 'none',
                }}>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── File type filter chips (Files mode only) ── */}
      <AnimatePresence>
        {isFlattenMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}
            className="overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap pb-1">
              <Filter className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(129,140,248,0.4)' }} />
              {FILE_FILTERS.map(opt => {
                const active = fileTypeFilter === opt.value
                const cfg    = FILTER_COLORS[opt.value]
                return (
                  <motion.button key={opt.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setFileTypeFilter(opt.value)}
                    className="px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all"
                    style={{
                      background: active ? cfg.bg : 'rgba(6,13,31,0.5)',
                      border:     active ? `1px solid ${cfg.border}` : '1px solid rgba(99,102,241,0.1)',
                      color:      active ? cfg.color : '#334155',
                      boxShadow:  active ? `0 2px 12px ${cfg.bg}` : 'none',
                    }}>
                    {opt.label}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[62px] rounded-2xl animate-pulse"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }} />
          ))}
        </div>
      ) : (
        <MaterialsList
          materials={filtered}
          courseId={courseId}
          isFlattenMode={isFlattenMode}
          onDelete={teacher ? id => setDeleteId(id) : undefined}
          onOpenFolder={openFolder}
        />
      )}

      {/* ── Modals ── */}
      <UploadMaterialModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadFile={payload => uploadFile(payload, { onSuccess: () => setUploadOpen(false) })}
        isUploading={isUploading}
      />
      <CreateFolderModal
        isOpen={folderOpen}
        onClose={() => setFolderOpen(false)}
        onSubmit={data => createFolder(data, { onSuccess: () => setFolderOpen(false) })}
        isLoading={isCreatingFolder}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMaterial(deleteId, { onSuccess: () => setDeleteId(null) }) }}
        title="Delete Material"
        description="This will permanently delete this item and cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}