import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, ClipboardList, Calendar, Mic, ArrowRight, PartyPopper } from 'lucide-react'
import { formatRelative, formatDateTime } from '@/utils/dateUtils'
import { isPast, parseISO } from 'date-fns'
import { cn } from '@/utils/cn'
import { COURSE_TABS } from '@/config/constants'
import type { UpcomingEventDto } from '../services/dashboardService'

interface Props { events: UpcomingEventDto[] }

const eventConfig = {
    assignment: {
        icon: <ClipboardList className="w-4 h-4" />,
        bg: 'bg-violet-500/10', color: 'text-violet-500',
        tab: COURSE_TABS.ASSIGNMENTS,
    },
    ct: {
        icon: <Calendar className="w-4 h-4" />,
        bg: 'bg-indigo-500/10', color: 'text-indigo-500',
        tab: COURSE_TABS.CT,
    },
    presentation: {
        icon: <Mic className="w-4 h-4" />,
        bg: 'bg-amber-500/10', color: 'text-amber-500',
        tab: COURSE_TABS.PRESENTATIONS,
    },
}

export default function UpcomingEventsWidget({ events }: Props) {
    if (events.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Upcoming Events
                </h3>
                <div className="flex flex-col items-center py-8 gap-2">
                    <PartyPopper className="w-8 h-8 text-emerald-500" />
                    <p className="text-sm text-muted-foreground">You're all caught up! 🎉</p>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Upcoming Events
                <span className="ml-auto text-xs text-muted-foreground">{events.length} total</span>
            </h3>

            <div className="space-y-2">
                {events.slice(0, 6).map((ev, i) => {
                    const conf = eventConfig[ev.type]
                    const overdue = isPast(parseISO(ev.dueDate))

                    return (
                        <motion.div
                            key={ev.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                to={`/courses/${ev.courseId}/${conf.tab}`}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group"
                            >
                                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', conf.bg)}>
                                    <span className={conf.color}>{conf.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                        {ev.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{ev.courseName}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className={cn(
                                        'text-xs font-medium',
                                        overdue ? 'text-destructive' : 'text-muted-foreground'
                                    )}>
                                        {overdue ? 'Overdue' : formatRelative(ev.dueDate)}
                                    </p>
                                    {ev.totalMarks && (
                                        <p className="text-xs text-muted-foreground">{ev.totalMarks} marks</p>
                                    )}
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
