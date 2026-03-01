import MaterialCard from './MaterialCard'
import EmptyState from '@/components/ui/EmptyState'
import { FolderOpen } from 'lucide-react'
import type { MaterialDto } from '@/types/material.types'

interface Props {
    materials: MaterialDto[]
    courseId: string
    onDelete?: (id: string) => void
    onToggleVisibility?: (id: string) => void
    onOpenFolder?: (id: string, label: string) => void
}

export default function MaterialsList({ materials, courseId, onDelete, onToggleVisibility, onOpenFolder }: Props) {
    const folders = materials.filter((m) => m.type === 'Folder')
    const files = materials.filter((m) => m.type !== 'Folder')

    if (materials.length === 0) {
        return (
            <EmptyState
                icon={<FolderOpen className="w-8 h-8" />}
                title="No materials yet"
                description="Upload files, create folders, or add links to share with your students"
            />
        )
    }

    return (
        <div className="space-y-5">
            {/* Folders first */}
            {folders.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Folders</p>
                    <div className="space-y-2">
                        {folders.map((m, i) => (
                            <MaterialCard
                                key={m.id}
                                material={m}
                                index={i}
                                courseId={courseId}
                                onDelete={onDelete}
                                onToggleVisibility={onToggleVisibility}
                                onOpenFolder={onOpenFolder}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Files + Links */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {folders.length > 0 && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Files & Links</p>
                    )}
                    <div className="space-y-2">
                        {files.map((m, i) => (
                            <MaterialCard
                                key={m.id}
                                material={m}
                                index={i}
                                courseId={courseId}
                                onDelete={onDelete}
                                onToggleVisibility={onToggleVisibility}
                                onOpenFolder={onOpenFolder}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
