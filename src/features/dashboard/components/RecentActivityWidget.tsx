import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Activity, Megaphone, BookOpen, ClipboardList, Calendar, Mic, FileText, Users, ArrowRight } from 'lucide-react'
import { formatRelative } from '@/utils/dateUtils'
import type { RecentActivityDto } from '../services/dashboardService'

interface Props { activities: RecentActivityDto[] }

function getActivityIcon(type: string) {
    const map: Record<string, { icon: React.ReactNode; color: string }> = {
        announcement: { icon: <Megaphone className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-500/10' },
        assignment: { icon: <ClipboardList className="w-3.5 h-3.5" />, color: 'text-violet-500 bg-violet-500/10' },
        ct: { icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-indigo-500 bg-indigo-500/10' },
        presentation: { icon: <Mic className="w-3.5 h-3.5" />, color: 'text-amber-500 bg-amber-500/10' },
        material: { icon: <FileText className="w-3.5 h-3.5" />, color: 'text-orange-500 bg-orange-500/10' },
        member: { icon: <Users className="w-3.5 h-3.5" />, color: 'text-cyan-500 bg-cyan-500/10' },
        course: { icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-emerald-500 bg-emerald-500/10' },
    }
    return map[type] ?? { icon: <Activity className="w-3.5 h-3.5" />, color: 'text-muted-foreground bg-muted' }
}

export default function RecentActivityWidget({ activities }: Props) {
    return (
        <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Recent Activity
            </h3>

            {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
                <div className="space-y-1">
                    {activities.slice(0, 8).map((act, i) => {
                        const { icon, color } = getActivityIcon(act.type)
                        const content = (
                            <motion.div
                                key={act.id}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all group cursor-pointer"
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate group-hover:text-primary transition-colors">{act.title}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                                        <span className="truncate max-w-[120px]">{act.courseName}</span>
                                        <span>·</span>
                                        <span>{formatRelative(act.createdAt)}</span>
                                    </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-1" />
                            </motion.div>
                        )

                        return act.link
                            ? <Link key={act.id} to={act.link}>{content}</Link>
                            : <div key={act.id}>{content}</div>
                    })}
                </div>
            )}
        </div>
    )
}
