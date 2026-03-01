import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, FileCheck, ChevronDown, Calendar, BookOpen } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Modal from '@/components/ui/Modal'
import { todayISO } from '@/utils/dateUtils'
import type { AttendanceStatus } from '@/types/attendance.types'
import { cn } from '@/utils/cn'

interface Member {
    userId: string
    fullName: string
    studentId?: string
    profilePhotoUrl?: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    members: Member[]
    courseId: string
    onSubmit: (data: {
        courseId: string
        date: string
        topic?: string
        records: { studentId: string; status: AttendanceStatus; remarks?: string }[]
    }) => void
    isLoading?: boolean
}

type StatusMap = Record<string, AttendanceStatus>

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'Present', label: 'P', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20' },
    { value: 'Absent', label: 'A', icon: <XCircle className="w-4 h-4" />, color: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20' },
    { value: 'Late', label: 'L', icon: <Clock className="w-4 h-4" />, color: 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20' },
    { value: 'Excused', label: 'E', icon: <FileCheck className="w-4 h-4" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500/20' },
]

export default function TakeAttendanceSheet({ isOpen, onClose, members, courseId, onSubmit, isLoading }: Props) {
    const [date, setDate] = useState(todayISO())
    const [topic, setTopic] = useState('')
    const [statuses, setStatuses] = useState<StatusMap>({})

    // Default all to Present
    useEffect(() => {
        if (isOpen && members.length > 0) {
            const init: StatusMap = {}
            members.forEach((m) => { init[m.userId] = 'Present' })
            setStatuses(init)
        }
    }, [isOpen, members])

    const setAll = (status: AttendanceStatus) => {
        const next: StatusMap = {}
        members.forEach((m) => { next[m.userId] = status })
        setStatuses(next)
    }

    const toggle = (userId: string) => {
        const cycle: AttendanceStatus[] = ['Present', 'Absent', 'Late', 'Excused']
        const current = statuses[userId] ?? 'Present'
        const next = cycle[(cycle.indexOf(current) + 1) % cycle.length]
        setStatuses((s) => ({ ...s, [userId]: next }))
    }

    const counts = members.reduce(
        (acc, m) => {
            const s = statuses[m.userId] ?? 'Present'
            acc[s] = (acc[s] ?? 0) + 1
            return acc
        },
        {} as Record<AttendanceStatus, number>
    )

    const handleSubmit = () => {
        onSubmit({
            courseId,
            date,
            topic: topic || undefined,
            records: members.map((m) => ({
                studentId: m.userId,
                status: statuses[m.userId] ?? 'Present',
            })),
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Take Attendance" size="xl">
            <div className="space-y-5">
                {/* Date + Topic */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        label="Date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        leftIcon={<Calendar className="w-4 h-4" />}
                    />
                    <Input
                        label="Topic (optional)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Lecture 5"
                        leftIcon={<BookOpen className="w-4 h-4" />}
                    />
                </div>

                {/* Summary counts */}
                <div className="flex items-center gap-3 flex-wrap">
                    {STATUS_OPTIONS.map((s) => (
                        <div key={s.value} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold', s.color)}>
                            {s.icon} {s.value}: {counts[s.value] ?? 0}
                        </div>
                    ))}
                </div>

                {/* Quick set all */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium">Set all:</span>
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => setAll(s.value)}
                            className={cn('px-3 py-1 rounded-lg border text-xs font-medium transition-all', s.color)}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Student list */}
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 no-scrollbar">
                    {members.map((member, i) => {
                        const status = statuses[member.userId] ?? 'Present'
                        const statusDef = STATUS_OPTIONS.find((s) => s.value === status)!
                        return (
                            <motion.div
                                key={member.userId}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 transition-all"
                            >
                                <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{member.fullName}</p>
                                    {member.studentId && (
                                        <p className="text-xs text-muted-foreground font-mono">{member.studentId}</p>
                                    )}
                                </div>
                                {/* Status toggle button */}
                                <button
                                    onClick={() => toggle(member.userId)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold min-w-[100px] justify-center transition-all',
                                        statusDef.color
                                    )}
                                >
                                    {statusDef.icon} {status}
                                </button>
                            </motion.div>
                        )
                    })}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No students enrolled yet.
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-border">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        loading={isLoading}
                        onClick={handleSubmit}
                        disabled={members.length === 0}
                    >
                        Save Attendance
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
