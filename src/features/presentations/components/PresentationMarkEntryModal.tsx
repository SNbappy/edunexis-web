import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, XCircle, CheckCircle2, Mic } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { usePresentationResults } from '../hooks/usePresentations'
import { cn } from '@/utils/cn'
import type { PresentationDto, PresentationMarkEntry } from '@/types/presentation.types'

interface Member {
    userId: string
    fullName: string
    studentId?: string
    profilePhotoUrl?: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    presentation: PresentationDto | null
    courseId: string
    members: Member[]
}

export default function PresentationMarkEntryModal({ isOpen, onClose, presentation, courseId, members }: Props) {
    const presentationId = presentation?.id ?? ''
    const { results, isLoading, saveMarks, isSaving } = usePresentationResults(courseId, presentationId)
    const [entries, setEntries] = useState<Record<string, { marks: string; absent: boolean; topic: string; feedback: string }>>({})

    useEffect(() => {
        if (!isOpen || !presentation) return
        const init: typeof entries = {}
        members.forEach((m) => {
            const existing = results.find((r) => r.studentId === m.userId)
            init[m.userId] = {
                marks: existing?.obtainedMarks?.toString() ?? '',
                absent: existing?.isAbsent ?? false,
                topic: existing?.topic ?? '',
                feedback: existing?.feedback ?? '',
            }
        })
        setEntries(init)
    }, [isOpen, members, results, presentation])

    const totalMarks = presentation?.totalMarks ?? 0
    const topicsAllowed = presentation?.topicsAllowed ?? false

    const setField = (userId: string, field: keyof typeof entries[string], value: string | boolean) => {
        setEntries((prev) => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }))
    }

    const handleSave = () => {
        const data: PresentationMarkEntry[] = members.map((m) => {
            const e = entries[m.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
            return {
                studentId: m.userId,
                obtainedMarks: e.absent || e.marks === '' ? null : parseFloat(e.marks),
                isAbsent: e.absent,
                topic: e.topic || undefined,
                feedback: e.feedback || undefined,
            }
        })
        saveMarks({ entries: data }, { onSuccess: onClose })
    }

    const gradedCount = Object.values(entries).filter((e) => !e.absent && e.marks !== '').length
    const absentCount = Object.values(entries).filter((e) => e.absent).length

    if (!presentation) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Enter Marks — ${presentation.title}`} description={`Total marks: ${totalMarks}`} size="xl">
            <div className="space-y-5">
                {/* Summary */}
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {gradedCount} graded
                    </span>
                    <span className="flex items-center gap-1.5 text-destructive font-medium">
                        <XCircle className="w-4 h-4" /> {absentCount} absent
                    </span>
                    <span className="text-muted-foreground">{members.length - gradedCount - absentCount} pending</span>
                </div>

                {/* Student list */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                    {members.map((member, i) => {
                        const e = entries[member.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
                        const marksNum = parseFloat(e.marks)
                        const pct = !isNaN(marksNum) && totalMarks > 0 ? (marksNum / totalMarks) * 100 : 0

                        return (
                            <motion.div
                                key={member.userId}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.02 }}
                                className={cn(
                                    'p-3 rounded-xl border transition-all',
                                    e.absent ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card hover:border-primary/20'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{member.fullName}</p>
                                        {member.studentId && (
                                            <p className="text-xs text-muted-foreground font-mono">{member.studentId}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setField(member.userId, 'absent', !e.absent)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shrink-0',
                                            e.absent
                                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                : 'border-border text-muted-foreground hover:text-destructive hover:border-destructive/30'
                                        )}
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Absent
                                    </button>
                                    {!e.absent ? (
                                        <input
                                            type="number"
                                            value={e.marks}
                                            onChange={(ev) => setField(member.userId, 'marks', ev.target.value)}
                                            min={0} max={totalMarks} step={0.5}
                                            placeholder="—"
                                            className="w-16 h-9 text-center rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    ) : (
                                        <div className="w-16 h-9 flex items-center justify-center text-destructive text-sm font-bold">ABS</div>
                                    )}
                                </div>

                                {!e.absent && (
                                    <div className="mt-2 pl-11 space-y-2">
                                        {!isNaN(marksNum) && e.marks !== '' && (
                                            <ProgressBar value={pct} size="sm"
                                                color={pct >= 80 ? 'success' : pct >= 60 ? 'primary' : pct >= 40 ? 'warning' : 'danger'}
                                                animated={false} className="w-32"
                                            />
                                        )}
                                        {topicsAllowed && (
                                            <input
                                                type="text"
                                                value={e.topic}
                                                onChange={(ev) => setField(member.userId, 'topic', ev.target.value)}
                                                placeholder="Topic..."
                                                className="w-full h-8 px-3 rounded-lg border border-border bg-muted text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            value={e.feedback}
                                            onChange={(ev) => setField(member.userId, 'feedback', ev.target.value)}
                                            placeholder="Feedback (optional)..."
                                            className="w-full h-8 px-3 rounded-lg border border-border bg-muted text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">No students enrolled.</div>
                )}

                <div className="flex gap-3 pt-2 border-t border-border">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" loading={isSaving} onClick={handleSave}
                        disabled={members.length === 0}
                        leftIcon={!isSaving ? <Save className="w-4 h-4" /> : undefined}>
                        Save Marks
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
