import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckSquare, ClipboardList, AlertCircle } from 'lucide-react'
import { formatRelative } from '@/utils/dateUtils'
import { isPast, parseISO } from 'date-fns'
import { COURSE_TABS } from '@/config/constants'
import type { UpcomingEventDto } from '../services/dashboardService'
import { cn } from '@/utils/cn'

interface Props { events: UpcomingEventDto[] }

export default function PendingTasksWidget({ events }: Props) {
    const assignments = events.filter((e) => e.type === 'assignment')

    return (
        <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" /> Pending Assignments
                {assignments.length > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-500 font-bold">
                        {assignments.length}
                    </span>
                )}
            </h3>

            {assignments.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                    <CheckSquare className="w-7 h-7 text-emerald-500 mx-auto" />
                    <p className="text-sm text-muted-foreground">No pending assignments 🎉</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {assignments.map((a, i) => {
                        const overdue = isPast(parseISO(a.dueDate))
                        return (
                            <motion.div
                                key={a.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/courses/${a.courseId}/${COURSE_TABS.ASSIGNMENTS}`}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                                        overdue ? 'bg-destructive/10' : 'bg-violet-500/10'
                                    )}>
                                        {overdue
                                            ? <AlertCircle className="w-4 h-4 text-destructive" />
                                            : <ClipboardList className="w-4 h-4 text-violet-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                            {a.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{a.courseName}</p>
                                    </div>
                                    <p className={cn('text-xs font-medium shrink-0', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                                        {overdue ? '⚠ Overdue' : formatRelative(a.dueDate)}
                                    </p>
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
