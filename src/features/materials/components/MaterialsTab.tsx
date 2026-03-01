import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderPlus, Upload, Search } from 'lucide-react'
import Button from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import MaterialsList from './MaterialsList'
import MaterialsBreadcrumb from './MaterialsBreadcrumb'
import UploadMaterialModal from './UploadMaterialModal'
import CreateFolderModal from './CreateFolderModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useMaterials } from '../hooks/useMaterials'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

interface Props { courseId: string }

export default function MaterialsTab({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const {
        materials, isLoading, breadcrumb, openFolder, navigateTo,
        createFolder, isCreatingFolder,
        uploadFile, isUploading,
        addLink, isAddingLink,
        deleteMaterial, isDeleting,
        toggleVisibility,
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
                <MaterialsBreadcrumb items={breadcrumb} onNavigate={navigateTo} />
                {teacher && (
                    <div className="flex items-center gap-2 ml-auto">
                        <Button size="sm" variant="secondary" leftIcon={<FolderPlus className="w-4 h-4" />}
                            onClick={() => setFolderOpen(true)}>
                            New Folder
                        </Button>
                        <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}
                            onClick={() => setUploadOpen(true)}>
                            Add Material
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search materials..."
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} className="h-20 p-0" />)}
                </div>
            ) : (
                <MaterialsList
                    materials={filtered}
                    courseId={courseId}
                    onDelete={teacher ? (id) => setDeleteId(id) : undefined}
                    onToggleVisibility={teacher ? toggleVisibility : undefined}
                    onOpenFolder={openFolder}
                />
            )}

            {/* Modals */}
            <UploadMaterialModal
                isOpen={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onUploadFile={(payload) => uploadFile(payload, { onSuccess: () => setUploadOpen(false) })}
                onAddLink={(data) => addLink(data, { onSuccess: () => setUploadOpen(false) })}
                isUploading={isUploading}
                isAddingLink={isAddingLink}
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
                description="This will permanently delete the file or folder and all its contents."
                confirmLabel="Delete"
                isLoading={isDeleting}
            />
        </div>
    )
}
