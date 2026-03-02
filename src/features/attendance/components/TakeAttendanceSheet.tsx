import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, HelpCircle, Calendar, BookOpen, Search } from 'lucide-react'
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
        records: { studentId: string; status: AttendanceStatus }[]
    }) => void
    isLoading?: boolean
    initialDate?: string
    initialTopic?: string
    initialStatuses?: Record<string, AttendanceStatus>
}

type StatusMap = Record<string, AttendanceStatus>

const STATUS_OPTIONS: {
    value: AttendanceStatus
    label: string
    icon: React.ReactNode
    color: string
    activeColor: string
}[] = [
    {
        value: 'Present',
        label: 'Present',
        icon: <CheckCircle2 className="w-4 h-4" />,
        color: 'border-border text-muted-foreground hover:border-emerald-500/40 hover:text-emerald-500',
        activeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/40',
    },
    {
        value: 'Absent',
        label: 'Absent',
        icon: <XCircle className="w-4 h-4" />,
        color: 'border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive',
        activeColor: 'bg-destructive/10 text-destructive border-destructive/40',
    },
    {
        value: 'Unmarked',
        label: 'Unmarked',
        icon: <HelpCircle className="w-4 h-4" />,
        color: 'border-border text-muted-foreground hover:border-muted-foreground/40',
        activeColor: 'bg-muted text-muted-foreground border-muted-foreground/40',
    },
]

export default function TakeAttendanceSheet({
    isOpen, onClose, members, courseId, onSubmit, isLoading,
    initialDate, initialTopic, initialStatuses,
}: Props) {
    const [date, setDate] = useState(initialDate ?? todayISO())
    const [topic, setTopic] = useState(initialTopic ?? '')
    const [statuses, setStatuses] = useState<StatusMap>({})
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (isOpen && members.length > 0) {
            const init: StatusMap = {}
            members.forEach((m) => {
                init[m.userId] = initialStatuses?.[m.userId] ?? 'Unmarked'
            })
            setStatuses(init)
            setSearch('')
            setDate(initialDate ?? todayISO())
            setTopic(initialTopic ?? '')
        }
    }, [isOpen, members])

    const setAll = (status: AttendanceStatus) => {
        const next: StatusMap = {}
        members.forEach((m) => { next[m.userId] = status })
        setStatuses(next)
    }

    const pick = (userId: string, status: AttendanceStatus) =>
        setStatuses((s) => ({ ...s, [userId]: status }))

    const filteredMembers = members.filter((m) => {
        const q = search.toLowerCase()
        return (
            m.fullName.toLowerCase().includes(q) ||
            (m.studentId?.toLowerCase().includes(q) ?? false)
        )
    })

    const counts = members.reduce((acc, m) => {
        const s = statuses[m.userId] ?? 'Unmarked'
        acc[s] = (acc[s] ?? 0) + 1
        return acc
    }, {} as Record<AttendanceStatus, number>)

    const unmarkedCount = counts['Unmarked'] ?? 0

    const handleSubmit = () => {
        onSubmit({
            courseId,
            date,
            topic: topic || undefined,
            records: members.map((m) => ({
                studentId: m.userId,
                status: statuses[m.userId] ?? 'Unmarked',
            })),
        })
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialStatuses ? 'Edit Attendance' : 'Take Attendance'} size="xl">
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        leftIcon={<Calendar className="w-4 h-4" />}
                    />
                    <Input
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Topic (optional)"
                        leftIcon={<BookOpen className="w-4 h-4" />}
                    />
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        {STATUS_OPTIONS.map((s) => (
                            <div key={s.value} className={cn(
                                'flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold',
                                s.activeColor
                            )}>
                                {s.icon}
                                <span>{counts[s.value] ?? 0}</span>
                            </div>
                        ))}
                        <div className="w-px h-4 bg-border mx-1" />
                        <span className="text-xs text-muted-foreground font-medium">Set all:</span>
                        {STATUS_OPTIONS.map((s) => (
                            <button
                                key={s.value}
                                onClick={() => setAll(s.value)}
                                className={cn('px-2.5 py-1 rounded-lg border text-xs font-medium transition-all', s.activeColor)}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                    <div className="w-44">
                        <Input
                            placeholder="Search student..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search className="w-3.5 h-3.5" />}
                        />
                    </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                    {filteredMembers.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-6">No students match your search.</p>
                    ) : (
                        filteredMembers.map((member, i) => {
                            const status = statuses[member.userId] ?? 'Unmarked'
                            return (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-xl border bg-card transition-all',
                                        status === 'Unmarked' ? 'border-muted-foreground/20' : 'border-border'
                                    )}
                                >
                                    <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{member.fullName}</p>
                                        {member.studentId && (
                                            <p className="text-xs text-muted-foreground font-mono">{member.studentId}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {STATUS_OPTIONS.map((s) => (
                                            <button
                                                key={s.value}
                                                onClick={() => pick(member.userId, s.value)}
                                                className={cn(
                                                    'flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                                                    status === s.value ? s.activeColor : s.color
                                                )}
                                            >
                                                {s.icon} {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">No students enrolled yet.</div>
                )}

                {unmarkedCount > 0 && (
                    <p className="text-xs text-amber-500 font-medium text-center">
                        {unmarkedCount} student{unmarkedCount > 1 ? 's' : ''} still unmarked - they will be saved as Unmarked
                    </p>
                )}

                <div className="flex gap-3 pt-2 border-t border-border">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        loading={isLoading}
                        onClick={handleSubmit}
                        disabled={members.length === 0}
                    >
                        {initialStatuses ? 'Update Attendance' : 'Save Attendance'}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}