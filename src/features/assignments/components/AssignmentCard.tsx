import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Clock, AlertCircle, FileText,
    MoreVertical, Trash2, Users, Pencil,
} from 'lucide-react'
import { formatRelative } from '@/utils/dateUtils'
import Badge from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { cn } from '@/utils/cn'
import { isPast, parseISO } from 'date-fns'
import type { AssignmentDto } from '@/types/assignment.types'

interface Props {
    assignment: AssignmentDto
    index?: number
    onView: (a: AssignmentDto) => void
    onEdit?: (a: AssignmentDto) => void
    onDelete?: (id: string) => void
}

function StatusBadge({ isOpen }: { isOpen: boolean }) {
    return isOpen
        ? <Badge variant="success" dot>Active</Badge>
        : <Badge variant="danger">Closed</Badge>
}

function DueBadge({ deadline }: { deadline: string }) {
    if (!deadline) return null
    const past = isPast(parseISO(deadline))
    if (past) return (
        <span className="text-xs text-destructive font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Overdue
        </span>
    )
    return (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Due {formatRelative(deadline)}
        </span>
    )
}

export default function AssignmentCard({ assignment, index = 0, onView, onEdit, onDelete }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className="group glass-card rounded-2xl p-5 hover:border-primary/20 hover:shadow-card-hover transition-all cursor-pointer"
            onClick={() => onView(assignment)}
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {assignment.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge isOpen={assignment.isOpen} />
                            {teacher && (onEdit || onDelete) && (
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
                                            className="absolute right-0 top-full mt-1 w-44 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                                        >
                                            {onEdit && (
                                                <button
                                                    onClick={() => { onEdit(assignment); setMenuOpen(false) }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <Pencil className="w-4 h-4 text-primary" /> Edit
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => { onDelete(assignment.id); setMenuOpen(false) }}
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

                    {assignment.instructions && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{assignment.instructions}</p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap">
                        <DueBadge deadline={assignment.deadline} />
                        <span className="text-xs text-muted-foreground">{assignment.maxMarks} marks</span>
                        {teacher && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" /> {assignment.submissionCount ?? 0} submitted
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
