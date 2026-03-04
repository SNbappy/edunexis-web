import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderPlus, Upload, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
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

const SORT_OPTIONS = [
    { label: 'All', value: 'all' },
    { label: 'Folders', value: 'Folder' },
    { label: 'Files', value: 'File' },
] as const

const FILE_TYPE_OPTIONS: { label: string; value: FileTypeFilter }[] = [
    { label: 'All Files', value: 'all' },
    { label: 'PDF', value: 'pdf' },
    { label: 'Presentation', value: 'presentation' },
    { label: 'Document', value: 'document' },
    { label: 'Image', value: 'image' },
    { label: 'Links', value: 'link' },
    { label: 'Other', value: 'other' },
]

export default function MaterialsTab({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

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
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [search, setSearch] = useState('')

    const filtered = materials.filter((m) =>
        m.title.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-5 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 flex-wrap">
                {isFlattenMode
                    ? <p className="text-sm font-semibold text-muted-foreground">Showing all files across all folders</p>
                    : <MaterialsBreadcrumb items={breadcrumb} onNavigate={navigateTo} />
                }
                {teacher && (
                    <div className="flex items-center gap-2 ml-auto">
                        <Button size="sm" variant="secondary" leftIcon={<FolderPlus className="w-4 h-4" />}
                            onClick={() => setFolderOpen(true)}>
                            New Folder
                        </Button>
                        <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}
                            onClick={() => setUploadOpen(true)}>
                            Upload
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search materials..."
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setSortMode(opt.value as any)}
                            className={'px-3 py-1.5 rounded-lg text-xs font-medium transition-all ' + (
                                sortMode === opt.value
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sub-filter (only in Files mode) */}
            <AnimatePresence>
                {isFlattenMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-2 flex-wrap pb-1">
                            {FILE_TYPE_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setFileTypeFilter(opt.value)}
                                    className={'px-3 py-1.5 rounded-full text-xs font-medium border transition-all ' + (
                                        fileTypeFilter === opt.value
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-20 p-0" />)}
                </div>
            ) : (
                <MaterialsList
                    materials={filtered}
                    courseId={courseId}
                    isFlattenMode={isFlattenMode}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    onOpenFolder={openFolder}
                />
            )}

            {/* Modals */}
            <UploadMaterialModal
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUploadFile={(payload) => uploadFile(payload, { onSuccess: () => setUploadOpen(false) })}
                isUploading={isUploading}
            />

            <CreateFolderModal
                isOpen={folderOpen}
                onClose={() => setFolderOpen(false)}
                onSubmit={(data) => createFolder(data, { onSuccess: () => setFolderOpen(false) })}
                isLoading={isCreatingFolder}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => { if (deleteId) deleteMaterial(deleteId, { onSuccess: () => setDeleteId(null) }) }}
                title="Delete Material"
                description="This will permanently delete this item."
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </div>
    )
}
