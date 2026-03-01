import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, FileCheck, TrendingUp } from 'lucide-react'
import { formatDate } from '@/utils/dateUtils'
import EmptyState from '@/components/ui/EmptyState'
import { cn } from '@/utils/cn'
import type { MyAttendanceDto } from '@/types/attendance.types'
import { useMyAttendance } from '../hooks/useAttendanceStats'

interface Props { courseId: string }

const STATUS_ICONS = {
    Present: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
    Absent: { icon: <XCircle className="w-4 h-4" />, color: 'text-destructive' },
    Late: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-500' },
    Excused: { icon: <FileCheck className="w-4 h-4" />, color: 'text-blue-500' },
}

export default function StudentAttendanceView({ courseId }: Props) {
    const { data: records = [], isLoading } = useMyAttendance(courseId)

    const present = records.filter((r) => r.status === 'Present' || r.status === 'Late').length
    const pct = records.length > 0 ? ((present / records.length) * 100).toFixed(1) : '0'
    const pctNum = parseFloat(pct)

    if (isLoading) {
        return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
    }

    return (
        <div className="space-y-5">
            {/* My summary */}
            <div className="glass-card rounded-2xl p-5 flex items-center gap-5">
                <div className="relative w-20 h-20 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
                        <circle
                            cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3"
                            strokeDasharray={`${pctNum} ${100 - pctNum}`}
                            strokeLinecap="round"
                            className={pctNum >= 75 ? 'text-emerald-500' : pctNum >= 60 ? 'text-amber-500' : 'text-rose-500'}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={cn('text-lg font-bold', pctNum >= 75 ? 'text-emerald-500' : pctNum >= 60 ? 'text-amber-500' : 'text-rose-500')}>
                            {pct}%
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="font-semibold text-foreground">My Attendance</p>
                    <p className="text-sm text-muted-foreground">{present} of {records.length} classes attended</p>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                        {(['Present', 'Absent', 'Late', 'Excused'] as const).map((s) => {
                            const count = records.filter((r) => r.status === s).length
                            if (count === 0) return null
                            return (
                                <span key={s} className={cn('flex items-center gap-1', STATUS_ICONS[s].color)}>
                                    {STATUS_ICONS[s].icon} {count} {s}
                                </span>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Records list */}
            {records.length === 0 ? (
                <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="No attendance records yet" description="Your attendance will appear here once your teacher takes attendance" />
            ) : (
                <div className="space-y-2">
                    {[...records].reverse().map((r, i) => {
                        const s = STATUS_ICONS[r.status]
                        return (
                            <motion.div
                                key={r.sessionId}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                            >
                                <div>
                                    <p className="text-sm font-medium text-foreground">{r.topic || formatDate(r.date)}</p>
                                    {r.topic && <p className="text-xs text-muted-foreground">{formatDate(r.date)}</p>}
                                </div>
                                <div className={cn('flex items-center gap-1.5 text-sm font-semibold', s.color)}>
                                    {s.icon} {r.status}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
