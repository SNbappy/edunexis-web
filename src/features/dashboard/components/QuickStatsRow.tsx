import { motion } from 'framer-motion'
import { BookOpen, Users, Clock, AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { cn } from '@/utils/cn'
import { isTeacher } from '@/utils/roleGuard'
import { useAuthStore } from '@/store/authStore'
import type { DashboardStatsDto } from '../services/dashboardService'

interface Props { stats: DashboardStatsDto }

export default function QuickStatsRow({ stats }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const cards = teacher ? [
        {
            label: 'Active Courses',
            value: stats.totalCourses,
            icon: <BookOpen className="w-5 h-5" />,
            bg: 'bg-indigo-500/10', color: 'text-indigo-500',
            sub: 'courses created',
        },
        {
            label: 'Total Students',
            value: stats.totalStudents ?? 0,
            icon: <Users className="w-5 h-5" />,
            bg: 'bg-cyan-500/10', color: 'text-cyan-500',
            sub: 'enrolled across courses',
        },
        {
            label: 'Pending Requests',
            value: stats.pendingJoinRequests ?? 0,
            icon: <AlertCircle className="w-5 h-5" />,
            bg: stats.pendingJoinRequests ? 'bg-amber-500/10' : 'bg-muted',
            color: stats.pendingJoinRequests ? 'text-amber-500' : 'text-muted-foreground',
            sub: 'join requests',
        },
        {
            label: 'Upcoming Events',
            value: stats.upcomingEvents,
            icon: <Calendar className="w-5 h-5" />,
            bg: 'bg-violet-500/10', color: 'text-violet-500',
            sub: 'this week',
        },
    ] : [
        {
            label: 'My Courses',
            value: stats.totalCourses,
            icon: <BookOpen className="w-5 h-5" />,
            bg: 'bg-indigo-500/10', color: 'text-indigo-500',
            sub: 'enrolled',
        },
        {
            label: 'Pending Tasks',
            value: stats.pendingAssignments ?? 0,
            icon: <Clock className="w-5 h-5" />,
            bg: stats.pendingAssignments ? 'bg-amber-500/10' : 'bg-muted',
            color: stats.pendingAssignments ? 'text-amber-500' : 'text-muted-foreground',
            sub: 'assignments due',
        },
        {
            label: 'Avg. Attendance',
            value: `${(stats.averageAttendance ?? 0).toFixed(0)}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            bg: (stats.averageAttendance ?? 0) >= 75 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
            color: (stats.averageAttendance ?? 0) >= 75 ? 'text-emerald-500' : 'text-amber-500',
            sub: 'across all courses',
        },
        {
            label: 'Upcoming',
            value: stats.upcomingEvents,
            icon: <Calendar className="w-5 h-5" />,
            bg: 'bg-violet-500/10', color: 'text-violet-500',
            sub: 'events & deadlines',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                    className="glass-card rounded-2xl p-4 space-y-3 hover:border-primary/20 hover:shadow-card-hover transition-all"
                >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.bg)}>
                        <span className={card.color}>{card.icon}</span>
                    </div>
                    <div>
                        <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
                        <p className="text-xs font-medium text-foreground">{card.label}</p>
                        <p className="text-xs text-muted-foreground">{card.sub}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
