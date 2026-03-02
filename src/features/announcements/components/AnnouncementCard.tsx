import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, ChevronDown, ChevronUp, MoreVertical, Pin, PinOff, Trash2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { formatRelative } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import type { AnnouncementDto } from '@/types/announcement.types'
import { cn } from '@/utils/cn'

interface Props {
    announcement: AnnouncementDto
    index?: number
    canPin?: boolean
    canDelete?: boolean
    onPin?: (id: string) => void
    onDelete?: (id: string) => void
}

function getFileNameFromUrl(url: string) {
    try { return decodeURIComponent(url.split('/').pop() ?? 'Attachment') }
    catch { return 'Attachment' }
}

export default function AnnouncementCard({
    announcement, index = 0,
    canPin = false, canDelete = false,
    onPin, onDelete,
}: Props) {
    const { user } = useAuthStore()
    const [expanded, setExpanded] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const isLong = announcement.content.length > 280
    const showMenu = canPin || canDelete

    const photoUrl = announcement.authorId === user?.id
        ? (user?.profile?.profilePhotoUrl ?? undefined)
        : undefined

    useEffect(() => {
        if (!menuOpen) return
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
                setMenuOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [menuOpen])

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className={cn(
                'glass-card rounded-2xl p-5 space-y-3 transition-all',
                announcement.isPinned && 'ring-1 ring-primary/30 bg-primary/5'
            )}
        >
            {/* Header */}
            <div className="flex items-start gap-3">
                <Avatar src={photoUrl} name={announcement.authorName} size="sm" />
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">
                        {announcement.authorName}
                    </span>
                    <p className="text-xs text-muted-foreground">{formatRelative(announcement.createdAt)}</p>
                </div>

                {announcement.isPinned && (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        <Pin className="w-3 h-3" /> Pinned
                    </span>
                )}

                {showMenu && (
                    <div className="relative shrink-0" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
                            >
                                {canPin && (
                                    <button
                                        onClick={() => { onPin?.(announcement.id); setMenuOpen(false) }}
                                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                        {announcement.isPinned
                                            ? <><PinOff className="w-4 h-4 text-muted-foreground" /> Unpin</>
                                            : <><Pin className="w-4 h-4 text-muted-foreground" /> Pin to top</>
                                        }
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => { onDelete?.(announcement.id); setMenuOpen(false) }}
                                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-1.5 pl-11">
                <p className={cn(
                    'text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap',
                    !expanded && isLong && 'line-clamp-4'
                )}>
                    {announcement.content}
                </p>
                {isLong && (
                    <button
                        onClick={() => setExpanded((e) => !e)}
                        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                        {expanded
                            ? <><ChevronUp className="w-3 h-3" /> Show less</>
                            : <><ChevronDown className="w-3 h-3" /> Read more</>
                        }
                    </button>
                )}

                {announcement.attachmentUrl && (
                    <a
                        href={announcement.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-muted/50 hover:bg-muted hover:border-primary/30 transition-all group mt-2"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                {getFileNameFromUrl(announcement.attachmentUrl)}
                            </p>
                            <p className="text-xs text-muted-foreground">Click to open</p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </a>
                )}
            </div>
        </motion.div>
    )
}
