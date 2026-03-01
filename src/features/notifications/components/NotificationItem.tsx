import { motion } from 'framer-motion'
import { formatRelative } from '@/utils/dateUtils'
import { X, Bell, ClipboardList, Megaphone, Calendar, Users, FileText, Star, Mic } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import type { NotificationDto, NotificationType } from '@/types/notification.types'

interface Props {
    notification: NotificationDto
    onMarkRead: (id: string) => void
    onDelete: (id: string) => void
}

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
    announcement: { icon: <Megaphone className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-500' },
    assignment_created: { icon: <ClipboardList className="w-4 h-4" />, color: 'bg-violet-500/10 text-violet-500' },
    assignment_graded: { icon: <Star className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-500' },
    ct_scheduled: { icon: <Calendar className="w-4 h-4" />, color: 'bg-indigo-500/10 text-indigo-500' },
    ct_result: { icon: <Star className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-500' },
    presentation_scheduled: { icon: <Mic className="w-4 h-4" />, color: 'bg-violet-500/10 text-violet-500' },
    presentation_result: { icon: <Star className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-500' },
    join_request: { icon: <Users className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-500' },
    join_approved: { icon: <Users className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-500' },
    join_rejected: { icon: <Users className="w-4 h-4" />, color: 'bg-destructive/10 text-destructive' },
    attendance_taken: { icon: <Calendar className="w-4 h-4" />, color: 'bg-cyan-500/10 text-cyan-500' },
    material_uploaded: { icon: <FileText className="w-4 h-4" />, color: 'bg-orange-500/10 text-orange-500' },
    general: { icon: <Bell className="w-4 h-4" />, color: 'bg-muted text-muted-foreground' },
}

export default function NotificationItem({ notification: n, onMarkRead, onDelete }: Props) {
    const navigate = useNavigate()
    const config = typeConfig[n.type] ?? typeConfig.general

    const handleClick = () => {
        if (!n.isRead) onMarkRead(n.id)
        if (n.link) navigate(n.link)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            className={cn(
                'flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all group hover:bg-muted/50',
                !n.isRead && 'bg-primary/5 hover:bg-primary/8'
            )}
            onClick={handleClick}
        >
            {/* Icon */}
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', config.color)}>
                {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-0.5">
                <p className={cn('text-sm leading-snug', !n.isRead ? 'font-semibold text-foreground' : 'text-foreground/80')}>
                    {n.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                <div className="flex items-center gap-2 mt-1">
                    {n.courseName && (
                        <span className="text-xs text-primary font-medium">{n.courseName}</span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatRelative(n.createdAt)}</span>
                </div>
            </div>

            {/* Unread dot + delete */}
            <div className="flex flex-col items-center gap-2 shrink-0">
                {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(n.id) }}
                    className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                >
                    <X className="w-3 h-3" />
                </button>
            </div>
        </motion.div>
    )
}
