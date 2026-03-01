import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar, Clock, MapPin, BookOpen,
    MoreVertical, Trash2, CheckSquare,
    PlayCircle, XCircle, Users, Star,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate, formatDateTime, formatRelative } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { isPast, parseISO } from 'date-fns'
import { cn } from '@/utils/cn'
import type { CTEventDto } from '@/types/ct.types'

interface Props {
    ct: CTEventDto
    index?: number
    onView: (ct: CTEventDto) => void
    onDelete?: (id: string) => void
    onUpdateStatus?: (ctId: string, status: string) => void
}

const statusConfig = {
    Scheduled: { variant: 'default' as const, color: 'text-blue-500', dot: true },
    Ongoing: { variant: 'warning' as const, color: 'text-amber-500', dot: true },
    Completed: { variant: 'success' as const, color: 'text-emerald-500', dot: false },
    Cancelled: { variant: 'danger' as const, color: 'text-destructive', dot: false },
}

export default function CTEventCard({ ct, index = 0, onView, onDelete, onUpdateStatus }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)
    const sc = statusConfig[ct.status]
    const isPastDue = isPast(parseISO(ct.scheduledDate))

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="group glass-card rounded-2xl p-5 hover:border-primary/20 hover:shadow-card-hover transition-all cursor-pointer"
            onClick={() => onView(ct)}
        >
            <div className="flex items-start gap-4">
                {/* Date block */}
                <div className="shrink-0 text-center bg-primary/10 rounded-xl px-3 py-2 w-16">
                    <p className="text-xs text-primary font-medium">{formatDate(ct.scheduledDate, 'MMM')}</p>
                    <p className="text-2xl font-bold text-primary leading-tight">{formatDate(ct.scheduledDate, 'dd')}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(ct.scheduledDate, 'EEE')}</p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {ct.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={sc.variant} dot={sc.dot}>{ct.status}</Badge>
                            {teacher && (
                                <div className="relative" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => setMenuOpen((o) => !o)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {menuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                                        >
                                            {ct.status === 'Scheduled' && onUpdateStatus && (
                                                <button onClick={() => { onUpdateStatus(ct.id, 'Ongoing'); setMenuOpen(false) }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                    <PlayCircle className="w-4 h-4 text-amber-500" /> Mark Ongoing
                                                </button>
                                            )}
                                            {ct.status === 'Ongoing' && onUpdateStatus && (
                                                <button onClick={() => { onUpdateStatus(ct.id, 'Completed'); setMenuOpen(false) }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                    <CheckSquare className="w-4 h-4 text-emerald-500" /> Mark Completed
                                                </button>
                                            )}
                                            {ct.status !== 'Cancelled' && ct.status !== 'Completed' && onUpdateStatus && (
                                                <button onClick={() => { onUpdateStatus(ct.id, 'Cancelled'); setMenuOpen(false) }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors">
                                                    <XCircle className="w-4 h-4" /> Cancel
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => { onDelete(ct.id); setMenuOpen(false) }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                                    <Trash2 className="w-4 h-4" /> Delete
                                                </button>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {ct.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{ct.description}</p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {ct.durationMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {ct.totalMarks} marks
                        </span>
                        {ct.venue && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {ct.venue}
                            </span>
                        )}
                        {teacher && ct.submittedCount !== undefined && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {ct.submittedCount} graded
                            </span>
                        )}
                        {!teacher && ct.myResult && ct.myResult.obtainedMarks !== null && (
                            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <Star className="w-3 h-3" /> {ct.myResult.obtainedMarks}/{ct.totalMarks} marks
                            </span>
                        )}
                        {!teacher && ct.myResult?.isAbsent && (
                            <span className="text-destructive font-medium">Absent</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
