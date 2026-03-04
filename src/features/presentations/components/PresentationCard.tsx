import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, BookOpen, MapPin, Clock, Users, Star, Mic, MoreVertical, Trash2, CheckSquare, PlayCircle, XCircle } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { PresentationDto } from '@/types/presentation.types'

interface Props {
    presentation: PresentationDto
    index?: number
    onDelete?: (id: string) => void
    onUpdateStatus?: (id: string, status: string) => void
}

const statusConfig = {
    Scheduled: { variant: 'default'  as const, dot: true  },
    Ongoing:   { variant: 'warning'  as const, dot: true  },
    Completed: { variant: 'success'  as const, dot: false },
    Cancelled: { variant: 'danger'   as const, dot: false },
}

export default function PresentationCard({ presentation: p, index = 0, onDelete, onUpdateStatus }: Props) {
    const { user }    = useAuthStore()
    const teacher     = isTeacher(user?.role ?? 'Student')
    const navigate    = useNavigate()
    const sc          = statusConfig[p.status]
    const [menuOpen, setMenuOpen] = useState(false)

    const handleClick = () => navigate(`/courses/${p.courseId}/presentations/${p.id}`)

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            style={{ position: 'relative', zIndex: menuOpen ? 50 : 0 }}
            className="group glass-card rounded-2xl p-5 hover:border-primary/20 hover:shadow-card-hover transition-all cursor-pointer"
            onClick={handleClick}
        >
            <div className="flex items-start gap-4">
                {/* Date block */}
                <div className="shrink-0 text-center bg-violet-500/10 rounded-xl px-3 py-2 w-16">
                    <p className="text-xs text-violet-500 font-medium">
                        {p.scheduledDate ? formatDate(p.scheduledDate, 'MMM') : '—'}
                    </p>
                    <p className="text-2xl font-bold text-violet-500 leading-tight">
                        {p.scheduledDate ? formatDate(p.scheduledDate, 'dd') : '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {p.scheduledDate ? formatDate(p.scheduledDate, 'EEE') : ''}
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {p.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={sc.variant} dot={sc.dot}>{p.status}</Badge>
                            <Badge variant="muted">{p.format}</Badge>

                            {teacher && (
                                <div className="relative" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => setMenuOpen(o => !o)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {menuOpen && (
                                        <>
                                            <div className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                style={{ zIndex: 51 }}
                                                className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl shadow-xl border border-border overflow-hidden"
                                            >
                                                {p.status === 'Scheduled' && onUpdateStatus && (
                                                    <button onClick={() => { onUpdateStatus(p.id, 'Ongoing'); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                        <PlayCircle className="w-4 h-4 text-amber-500" /> Mark Ongoing
                                                    </button>
                                                )}
                                                {p.status === 'Ongoing' && onUpdateStatus && (
                                                    <button onClick={() => { onUpdateStatus(p.id, 'Completed'); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                        <CheckSquare className="w-4 h-4 text-emerald-500" /> Mark Completed
                                                    </button>
                                                )}
                                                {p.status !== 'Completed' && p.status !== 'Cancelled' && onUpdateStatus && (
                                                    <button onClick={() => { onUpdateStatus(p.id, 'Cancelled'); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors">
                                                        <XCircle className="w-4 h-4" /> Cancel
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button onClick={() => { onDelete(p.id); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {p.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {p.totalMarks} marks</span>
                        {p.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.venue}</span>}
                        {p.durationPerGroupMinutes && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.durationPerGroupMinutes} min/group</span>
                        )}
                        {teacher && p.submittedCount !== undefined && (
                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.submittedCount} graded</span>
                        )}
                        {!teacher && p.myResult?.obtainedMarks != null && (
                            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <Star className="w-3 h-3" /> {p.myResult.obtainedMarks}/{p.totalMarks}
                            </span>
                        )}
                        {!teacher && p.myResult?.topic && (
                            <span className="flex items-center gap-1 text-violet-500">
                                <Mic className="w-3 h-3" /> {p.myResult.topic}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
