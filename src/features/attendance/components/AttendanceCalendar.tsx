import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
    format, startOfMonth, endOfMonth, eachDayOfInterval,
    isToday, getDay, addMonths, subMonths
} from 'date-fns'
import { cn } from '@/utils/cn'
import type { AttendanceSessionDto } from '@/types/attendance.types'

interface Props {
    sessions: AttendanceSessionDto[]
    onSelectDate?: (date: string) => void
}

function getSessionPct(session: AttendanceSessionDto) {
    const total = session.records.length
    if (total === 0) return 0
    const present = session.records.filter((r) => r.status === 'Present').length
    return Math.round((present / total) * 100)
}

export default function AttendanceCalendar({ sessions, onSelectDate }: Props) {
    const [current, setCurrent] = useState(new Date())
    const monthStart = startOfMonth(current)
    const monthEnd = endOfMonth(current)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
    const startPad = getDay(monthStart)

    const sessionMap = new Map<string, AttendanceSessionDto>()
    sessions.forEach((s) => sessionMap.set(s.date.split('T')[0], s))

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">{format(current, 'MMMM yyyy')}</h3>
                <div className="flex gap-1">
                    <button onClick={() => setCurrent(subMonths(current, 1))}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrent(new Date())}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        Today
                    </button>
                    <button onClick={() => setCurrent(addMonths(current, 1))}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
                {days.map((day) => {
                    const iso = format(day, 'yyyy-MM-dd')
                    const session = sessionMap.get(iso)
                    const pct = session ? getSessionPct(session) : 0
                    const hasSession = !!session

                    const dotColor = hasSession
                        ? pct >= 90 ? 'bg-emerald-500'
                            : pct >= 75 ? 'bg-blue-500'
                                : pct >= 60 ? 'bg-amber-500'
                                    : 'bg-rose-500'
                        : ''

                    return (
                        <motion.button
                            key={iso}
                            whileHover={hasSession ? { scale: 1.1 } : {}}
                            onClick={() => hasSession && onSelectDate?.(iso)}
                            className={cn(
                                'relative flex flex-col items-center justify-center h-10 w-full rounded-xl text-xs font-medium transition-all',
                                isToday(day) && 'ring-2 ring-primary',
                                hasSession ? 'cursor-pointer hover:bg-muted' : 'cursor-default',
                                isToday(day) ? 'bg-primary/10 text-primary' : 'text-foreground'
                            )}
                            title={hasSession ? `${session!.topic || 'Class'} — ${pct}% attendance` : undefined}
                        >
                            {day.getDate()}
                            {hasSession && (
                                <span className={cn('absolute bottom-1.5 w-1.5 h-1.5 rounded-full', dotColor)} />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border flex-wrap">
                {[
                    { color: 'bg-emerald-500', label: '=90%' },
                    { color: 'bg-blue-500',    label: '=75%' },
                    { color: 'bg-amber-500',   label: '=60%' },
                    { color: 'bg-rose-500',    label: '<60%' },
                ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn('w-2.5 h-2.5 rounded-full', l.color)} />
                        {l.label}
                    </div>
                ))}
            </div>
        </div>
    )
}
