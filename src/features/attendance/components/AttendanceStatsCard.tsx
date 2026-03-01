import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Users, Calendar, CheckCircle2 } from 'lucide-react'
import { cn } from '@/utils/cn'

interface Props {
    totalSessions: number
    averageAttendance: number
    totalStudents?: number
    lastSessionDate?: string
}

export default function AttendanceStatsCard({ totalSessions, averageAttendance, totalStudents, lastSessionDate }: Props) {
    const isGood = averageAttendance >= 75

    const stats = [
        {
            label: 'Total Sessions',
            value: totalSessions,
            icon: <Calendar className="w-5 h-5" />,
            color: 'indigo',
        },
        {
            label: 'Avg. Attendance',
            value: `${averageAttendance.toFixed(1)}%`,
            icon: isGood ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />,
            color: averageAttendance >= 75 ? 'emerald' : averageAttendance >= 60 ? 'amber' : 'rose',
        },
        ...(totalStudents !== undefined ? [{
            label: 'Total Students',
            value: totalStudents,
            icon: <Users className="w-5 h-5" />,
            color: 'cyan',
        }] : []),
    ]

    const colorMap: Record<string, string> = {
        indigo: 'bg-indigo-500/10 text-indigo-500',
        emerald: 'bg-emerald-500/10 text-emerald-500',
        amber: 'bg-amber-500/10 text-amber-500',
        rose: 'bg-rose-500/10 text-rose-500',
        cyan: 'bg-cyan-500/10 text-cyan-500',
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass-card rounded-2xl p-4 space-y-2"
                >
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', colorMap[stat.color])}>
                        {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
            ))}
        </div>
    )
}
