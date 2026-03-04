import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Download, Trash2, ExternalLink, ChevronRight, Loader2 } from 'lucide-react'
import FileIcon from './FileIcon'
import Badge from '@/components/ui/Badge'
import { formatRelative } from '@/utils/dateUtils'
import { formatFileSize } from '@/utils/fileUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { MaterialDto } from '@/types/material.types'
import { cn } from '@/utils/cn'

interface Props {
    material: MaterialDto
    index?: number
    courseId: string
    onDelete?: (id: string) => void
    onOpenFolder?: (id: string, label: string) => void
}

export default function MaterialCard({
    material, index = 0, courseId, onDelete, onOpenFolder,
}: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const isFolder = material.type === 'Folder'
    const isLink = material.type === 'Link' || material.type === 'YouTube' || material.type === 'GoogleDrive'

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const handleDownload = async () => {
        if (!material.fileUrl) return
        setDownloading(true)
        try {
            const response = await fetch(material.fileUrl)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = blobUrl
            a.download = material.fileName ?? material.title
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(blobUrl)
        } catch {
            window.open(material.fileUrl, '_blank')
        } finally {
            setDownloading(false)
        }
    }

    const handlePrimaryAction = () => {
        if (isFolder) {
            onOpenFolder?.(material.id, material.title)
        } else if (isLink) {
            if (material.embedUrl) window.open(material.embedUrl, '_blank')
        } else {
            handleDownload()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={isFolder ? handlePrimaryAction : undefined}
            className={cn(
                'group glass-card rounded-2xl p-4 hover:border-primary/20 hover:shadow-card-hover transition-all',
                isFolder && 'cursor-pointer'
            )}
        >
            <div className="flex items-start gap-4">
                <div className="shrink-0">
                    <FileIcon fileName={material.fileName} type={material.type} size="md" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className={cn(
                                'text-sm font-semibold text-foreground truncate max-w-xs',
                                !isFolder && 'cursor-pointer hover:text-primary transition-colors'
                            )}
                            onClick={!isFolder ? handlePrimaryAction : undefined}
                        >
                            {material.title}
                        </span>
                        {isFolder && material.childCount !== undefined && material.childCount > 0 && (
                            <Badge variant="muted">{material.childCount} items</Badge>
                        )}
                    </div>

                    {material.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{material.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{material.uploadedByName}</span>
                        <span>&middot;</span>
                        <span>{formatRelative(material.uploadedAt)}</span>
                        {material.fileSizeBytes && (
                            <>
                                <span>&middot;</span>
                                <span>{formatFileSize(material.fileSizeBytes)}</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!isFolder && (
                        <button
                            onClick={handlePrimaryAction}
                            disabled={downloading}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            title={isLink ? 'Open link' : 'Download'}
                        >
                            {downloading
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : isLink
                                    ? <ExternalLink className="w-4 h-4" />
                                    : <Download className="w-4 h-4" />}
                        </button>
                    )}
                    {isFolder && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                    )}

                    {teacher && onDelete && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                                >
                                    <button
                                        onClick={() => { onDelete(material.id); setMenuOpen(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
