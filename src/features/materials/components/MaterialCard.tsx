import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Download, Eye, EyeOff, Trash2, ExternalLink, ChevronRight } from 'lucide-react'
import FileIcon from './FileIcon'
import Badge from '@/components/ui/Badge'
import { formatRelative, formatDate } from '@/utils/dateUtils'
import { formatFileSize } from '@/utils/fileUtils'
import { materialService } from '../services/materialService'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { MaterialDto } from '@/types/material.types'
import { cn } from '@/utils/cn'
import toast from 'react-hot-toast'

interface Props {
    material: MaterialDto
    index?: number
    courseId: string
    onDelete?: (id: string) => void
    onToggleVisibility?: (id: string) => void
    onOpenFolder?: (id: string, label: string) => void
}

export default function MaterialCard({
    material, index = 0, courseId, onDelete, onToggleVisibility, onOpenFolder,
}: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', h)
        return () => document.removeEventListener('mousedown', h)
    }, [])

    const handleDownload = async () => {
        if (material.type === 'Link') {
            window.open(material.linkUrl, '_blank')
            return
        }
        if (!material.fileUrl) return
        try {
            const a = document.createElement('a')
            a.href = material.fileUrl
            a.download = material.fileName ?? material.title
            a.target = '_blank'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        } catch {
            toast.error('Download failed.')
        }
    }

    const isFolder = material.type === 'Folder'

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={cn(
                'group glass-card rounded-2xl p-4 hover:border-primary/20 hover:shadow-card-hover transition-all',
                !material.isVisible && teacher && 'opacity-60 border-dashed'
            )}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                    className={cn('shrink-0', isFolder && 'cursor-pointer')}
                    onClick={isFolder ? () => onOpenFolder?.(material.id, material.title) : undefined}
                >
                    <FileIcon fileName={material.fileName} type={material.type} size="md" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            className={cn(
                                'text-sm font-semibold text-foreground truncate max-w-xs text-left hover:text-primary transition-colors',
                                isFolder && 'hover:underline'
                            )}
                            onClick={isFolder
                                ? () => onOpenFolder?.(material.id, material.title)
                                : handleDownload}
                        >
                            {material.title}
                        </button>
                        {!material.isVisible && teacher && (
                            <Badge variant="muted"><EyeOff className="w-3 h-3 mr-1 inline" />Hidden</Badge>
                        )}
                        {isFolder && material.childCount !== undefined && (
                            <Badge variant="muted">{material.childCount} items</Badge>
                        )}
                    </div>

                    {material.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{material.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>{material.uploadedByName}</span>
                        <span>·</span>
                        <span>{formatRelative(material.uploadedAt)}</span>
                        {material.fileSizeBytes && (
                            <>
                                <span>·</span>
                                <span>{formatFileSize(material.fileSizeBytes)}</span>
                            </>
                        )}
                        {material.downloadCount > 0 && (
                            <>
                                <span>·</span>
                                <span>{material.downloadCount} downloads</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* Download / Open */}
                    {!isFolder && (
                        <button
                            onClick={handleDownload}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                            title={material.type === 'Link' ? 'Open link' : 'Download'}
                        >
                            {material.type === 'Link'
                                ? <ExternalLink className="w-4 h-4" />
                                : <Download className="w-4 h-4" />}
                        </button>
                    )}
                    {isFolder && (
                        <button
                            onClick={() => onOpenFolder?.(material.id, material.title)}
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}

                    {/* Teacher menu */}
                    {teacher && (
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
                                    {onToggleVisibility && (
                                        <button
                                            onClick={() => { onToggleVisibility(material.id); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                        >
                                            {material.isVisible
                                                ? <><EyeOff className="w-4 h-4" /> Hide from students</>
                                                : <><Eye className="w-4 h-4" /> Show to students</>}
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => { onDelete(material.id); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
