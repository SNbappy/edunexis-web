import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pin, MoreVertical, Trash2, PinOff, Edit2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { formatRelative } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { AnnouncementDto } from '@/types/announcement.types'
import { cn } from '@/utils/cn'

interface Props {
    announcement: AnnouncementDto
    index?: number
    onDelete?: (id: string) => void
    onPin?: (id: string) => void
}

export default function AnnouncementCard({ announcement, index = 0, onDelete, onPin }: Props) {
    const { user } = useAuthStore()
    const canManage = isTeacher(user?.role ?? 'Student') || user?.id === announcement.authorId
    const [menuOpen, setMenuOpen] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const isLong = announcement.content.length > 280

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35 }}
            className={cn(
                'glass-card rounded-2xl p-5 space-y-3 transition-all',
                announcement.isPinned && 'border-amber-500/30 bg-amber-500/5'
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <Avatar
                        src={announcement.authorPhotoUrl}
                        name={announcement.authorName}
                        size="sm"
                    />
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">
                                {announcement.authorName}
                            </span>
                            <Badge variant={announcement.authorRole === 'Teacher' ? 'teacher' : 'student'}>
                                {announcement.authorRole}
                            </Badge>
                            {announcement.isPinned && (
                                <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                                    <Pin className="w-3 h-3" /> Pinned
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">{formatRelative(announcement.createdAt)}</p>
                    </div>
                </div>

                {canManage && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="absolute right-0 top-full mt-1 w-44 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                            >
                                {onPin && (
                                    <button
                                        onClick={() => { onPin(announcement.id); setMenuOpen(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                        {announcement.isPinned
                                            ? <><PinOff className="w-4 h-4" /> Unpin</>
                                            : <><Pin className="w-4 h-4" /> Pin to top</>
                                        }
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        onClick={() => { onDelete(announcement.id); setMenuOpen(false) }}
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

            {/* Content */}
            <div className="space-y-1.5 pl-11">
                {announcement.title && (
                    <h3 className="font-semibold text-foreground">{announcement.title}</h3>
                )}
                <p className={cn('text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap', !expanded && isLong && 'line-clamp-4')}>
                    {announcement.content}
                </p>
                {isLong && (
                    <button
                        onClick={() => setExpanded((e) => !e)}
                        className="text-xs text-primary font-medium hover:underline"
                    >
                        {expanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>
        </motion.div>
    )
}
