import { motion } from 'framer-motion'
import { Calendar, Users, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { formatDate, getDayName } from '@/utils/dateUtils'
import type { AttendanceSessionDto } from '@/types/attendance.types'
import { cn } from '@/utils/cn'

interface Props {
    sessions: AttendanceSessionDto[]
    onDelete?: (sessionId: string) => void
    onView?: (sessionId: string) => void
}

function AttendanceBadge({ pct }: { pct: number }) {
    if (pct >= 90) return <Badge variant="success">{pct.toFixed(0)}%</Badge>
    if (pct >= 75) return <Badge variant="default">{pct.toFixed(0)}%</Badge>
    if (pct >= 60) return <Badge variant="warning">{pct.toFixed(0)}%</Badge>
    return <Badge variant="danger">{pct.toFixed(0)}%</Badge>
}

export default function AttendanceRecordsList({ sessions, onDelete, onView }: Props) {
    if (sessions.length === 0) {
        return (
            <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No attendance records yet"
                description="Take attendance for today's class to get started"
            />
        )
    }

    return (
        <div className="space-y-3">
            {sessions.map((session, i) => (
                <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card rounded-2xl p-4 hover:border-primary/20 transition-all"
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                            {/* Date */}
                            <div className="text-center bg-primary/10 rounded-xl px-3 py-2 shrink-0 w-16">
                                <p className="text-xs text-primary font-medium">{getDayName(session.date).slice(0, 3)}</p>
                                <p className="text-lg font-bold text-primary leading-tight">
                                    {formatDate(session.date, 'dd')}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatDate(session.date, 'MMM')}</p>
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-semibold text-foreground">
                                        {session.topic || `Class — ${formatDate(session.date)}`}
                                    </p>
                                    <AttendanceBadge pct={session.attendancePercent} />
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1 text-emerald-500">
                                        <CheckCircle2 className="w-3 h-3" /> {session.presentCount} Present
                                    </span>
                                    <span className="flex items-center gap-1 text-destructive">
                                        <XCircle className="w-3 h-3" /> {session.absentCount} Absent
                                    </span>
                                    {session.lateCount > 0 && (
                                        <span className="flex items-center gap-1 text-amber-500">
                                            <Clock className="w-3 h-3" /> {session.lateCount} Late
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {session.totalStudents} Total
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {onView && (
                                <Button size="sm" variant="secondary" onClick={() => onView(session.id)}>
                                    View
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => onDelete(session.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
