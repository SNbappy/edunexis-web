import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, BookOpen, MapPin, MoreVertical, Eye, Trash2, Send, ClipboardList, Star, XCircle, Mic, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { PresentationDto } from '@/types/presentation.types'

interface Props {
    presentation: PresentationDto
    index: number
    onView: (p: PresentationDto) => void
    onDelete?: (p: PresentationDto) => void
    onUpdateStatus?: (id: string, status: string) => void
    onEnterMarks?: (p: PresentationDto) => void
}

export default function PresentationCard({
    presentation: p, index,
    onView, onDelete, onUpdateStatus, onEnterMarks,
}: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)

    const isScheduled = p.status === 'Scheduled'
    const isOngoing   = p.status === 'Ongoing'
    const isCompleted = p.status === 'Completed'
    const isCancelled = p.status === 'Cancelled'

    const statusVariant =
        isCompleted ? 'success' :
        isOngoing   ? 'warning' :
        isCancelled ? 'danger'  : 'default'

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="group relative rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Mic className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={statusVariant} dot={isScheduled || isOngoing}>{p.status}</Badge>
                        {p.format && <Badge variant="muted">{p.format}</Badge>}
                        {p.topicsAllowed && <Badge variant="muted"><Mic className="w-3 h-3 mr-1 inline" />Topics</Badge>}
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-foreground truncate">{p.title}</h3>
                        {p.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.description}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        {p.scheduledDate ? (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(p.scheduledDate, 'dd MMM yyyy')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-500/80">
                                <Calendar className="w-3 h-3" /> Date not set
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {p.totalMarks} marks
                        </span>
                        {p.venue && (
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {p.venue}
                            </span>
                        )}
                        {p.durationPerGroupMinutes && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {p.durationPerGroupMinutes} min/group
                            </span>
                        )}
                        {teacher && p.submittedCount !== undefined && (
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> {p.submittedCount} graded
                            </span>
                        )}
                        {!teacher && p.myResult?.obtainedMarks != null && (
                            <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                                <Star className="w-3 h-3" /> {p.myResult.obtainedMarks}/{p.totalMarks}
                            </span>
                        )}
                        {!teacher && p.myResult?.isAbsent && (
                            <span className="flex items-center gap-1 text-destructive font-semibold">
                                <XCircle className="w-3 h-3" /> Absent
                            </span>
                        )}
                    </div>
                </div>

                <div className="relative shrink-0">
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    >
                        <MoreVertical className="w-4 h-4" />
                    </motion.button>

                    <AnimatePresence>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.92, y: 6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.92, y: 6 }}
                                    style={{ zIndex: 51 }}
                                    className="absolute right-0 top-full mt-1 w-52 glass-card rounded-xl shadow-xl border border-border overflow-hidden"
                                >
                                    <button onClick={() => { onView(p); setMenuOpen(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                        <Eye className="w-4 h-4 text-primary" /> View Details
                                    </button>

                                    {teacher && onEnterMarks && (
                                        <button onClick={() => { onEnterMarks(p); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                            <ClipboardList className="w-4 h-4 text-amber-500" />
                                            {isCompleted ? 'View / Edit Marks' : 'Enter Marks'}
                                        </button>
                                    )}

                                    {teacher && isScheduled && onUpdateStatus && (
                                        <button onClick={() => { onUpdateStatus(p.id, 'Ongoing'); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors">
                                            <Send className="w-4 h-4" /> Mark as Ongoing
                                        </button>
                                    )}

                                    {teacher && isOngoing && onUpdateStatus && (
                                        <button onClick={() => { onUpdateStatus(p.id, 'Completed'); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                                            <Send className="w-4 h-4" /> Mark as Completed
                                        </button>
                                    )}

                                    <div className="border-t border-border mx-2" />

                                    {onDelete && (
                                        <button onClick={() => { onDelete(p); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                            <Trash2 className="w-4 h-4" /> Delete
                                        </button>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}
