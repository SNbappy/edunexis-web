import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react'
import { useMyAttendance } from '../hooks/useAttendanceStats'
import { cn } from '@/utils/cn'

interface Props { courseId: string }

export default function StudentAttendanceView({ courseId }: Props) {
    const { data: summary, isLoading } = useMyAttendance(courseId)

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
            </div>
        )
    }

    if (!summary) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-40" />
                <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            </div>
        )
    }

    const pct = summary.attendancePercent
    const pctColor = pct >= 75 ? 'text-emerald-500' : pct >= 50 ? 'text-amber-500' : 'text-destructive'
    const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-destructive'

    const stats = [
        { label: 'Present',   value: summary.presentCount,   icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
        { label: 'Absent',    value: summary.absentCount,    icon: <XCircle className="w-4 h-4" />,      color: 'text-destructive'  },
        { label: 'Unmarked',  value: summary.unmarkedCount,  icon: <Clock className="w-4 h-4" />,        color: 'text-amber-500'    },
        { label: 'Total',     value: summary.totalSessions,  icon: <TrendingUp className="w-4 h-4" />,   color: 'text-foreground'   },
    ]

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Percentage Bar */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Attendance Rate</p>
                    <p className={cn('text-2xl font-bold', pctColor)}>{pct}%</p>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={cn('h-full rounded-full', barColor)}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    {pct >= 75 ? '✅ Good standing' : pct >= 50 ? '⚠️ At risk — attendance below 75%' : '🚨 Critical — attendance below 50%'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {stats.map(s => (
                    <div key={s.label} className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <div className={cn('flex items-center gap-1.5 text-xs', s.color)}>
                            {s.icon}
                            <span className="font-medium">{s.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{s.value}</p>
                    </div>
                ))}
            </div>

        </motion.div>
    )
}
