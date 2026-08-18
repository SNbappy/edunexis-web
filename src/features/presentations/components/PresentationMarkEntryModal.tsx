import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, XCircle, CheckCircle2 } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { usePresentationResults } from '../hooks/usePresentations'
import { sortByRoll } from '@/utils/roster'
import { cn } from '@/utils/cn'
import type { PresentationDto, PresentationMarkEntry } from '@/types/presentation.types'

interface Member {
    userId: string
    fullName: string
    studentId?: string | null
    profilePhotoUrl?: string | null
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

    const [entries, setEntries] = useState<Record<string, {
        marks: string; absent: boolean; topic: string; feedback: string
    }>>({})

    useEffect(() => {
        if (!isOpen || !presentation) return
        const init: typeof entries = {}
        members.forEach((m) => {
            const existing = results.find((r) => r.studentId === m.userId)
            init[m.userId] = {
                marks:    existing?.obtainedMarks?.toString() ?? '',
                absent:   existing?.isAbsent ?? false,
                topic:    existing?.topic ?? '',
                feedback: existing?.feedback ?? '',
            }
        })
        setEntries(init)
    }, [isOpen, members, results, presentation])

    const totalMarks    = presentation?.totalMarks ?? 0
    const topicsAllowed = presentation?.topicsAllowed ?? false

    const setField = (userId: string, field: keyof typeof entries[string], value: string | boolean) =>
        setEntries((prev) => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }))

    const setAllAbsent = (absent: boolean) =>
        setEntries((prev) => {
            const next = { ...prev }
            members.forEach((m) => {
                next[m.userId] = { ...next[m.userId], absent, marks: absent ? '' : next[m.userId]?.marks ?? '' }
            })
            return next
        })

    const handleSave = () => {
        const data: PresentationMarkEntry[] = members.map((m) => {
            const e = entries[m.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
            return {
                studentId:     m.userId,
                obtainedMarks: e.absent || e.marks === '' ? null : parseFloat(e.marks),
                isAbsent:      e.absent,
                topic:         e.topic    || undefined,
                feedback:      e.feedback || undefined,
            }
        })
        saveMarks({ entries: data }, { onSuccess: onClose })
    }

    const gradedCount = Object.values(entries).filter((e) => !e.absent && e.marks !== '').length
    const absentCount = Object.values(entries).filter((e) => e.absent).length

    if (!presentation) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Enter marks — ${presentation.title}`}
            description={`Type each student's score out of ${totalMarks}, or mark them absent.`}
            size="xl"
        >
            <div className="space-y-3">
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    <span className="flex items-center gap-1.5 text-success font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {gradedCount} graded
                    </span>
                    <span className="flex items-center gap-1.5 text-destructive font-medium">
                        <XCircle className="w-4 h-4" /> {absentCount} absent
                    </span>
                    <span className="text-muted-foreground">
                        {members.length - gradedCount - absentCount} pending
                    </span>
                    <div className="ml-auto flex gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={() => setAllAbsent(false)}>
                            Clear absent
                        </Button>
                        <Button type="button" size="sm" variant="secondary" onClick={() => setAllAbsent(true)}>
                            Mark all absent
                        </Button>
                    </div>
                </div>

                {/* Column headings.
                    Without these the marks box read as an anonymous 64px input
                    sitting next to an Absent button — nothing on first view said
                    it was where you type the score, or what it was out of. */}
                {members.length > 0 && !isLoading && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                        <span className="min-w-0 flex-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Student
                        </span>
                        <span className="w-[132px] shrink-0 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Marks out of {totalMarks}
                        </span>
                        <span className="w-[92px] shrink-0 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Absent
                        </span>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                        {sortByRoll(members).map((member, i) => {
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
                                        e.absent
                                            ? 'border-destructive/30 bg-destructive/5'
                                            : 'border-border bg-card hover:border-primary/20'
                                    )}
                                >
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                                            <div className="min-w-0">
                                                {member.studentId ? (
                                                    <>
                                                        <p className="font-mono text-[13px] font-bold text-foreground leading-tight">{member.studentId}</p>
                                                        <p className="text-[11.5px] text-muted-foreground truncate">{member.fullName}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm font-medium text-foreground truncate">{member.fullName}</p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Marks first, absent second: entering a
                                            score is the job, marking somebody
                                            absent is the exception. */}
                                        <div className="flex w-[132px] shrink-0 items-center justify-center">
                                            {!e.absent ? (
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        value={e.marks}
                                                        onChange={(ev) => setField(member.userId, 'marks', ev.target.value)}
                                                        min={0} max={totalMarks} step={0.5}
                                                        placeholder="0"
                                                        aria-label={`Marks for ${member.fullName} out of ${totalMarks}`}
                                                        className={cn(
                                                            'h-10 w-[74px] rounded-xl border-2 bg-card text-center font-display text-[15px] font-bold tabular-nums text-foreground transition-all',
                                                            'placeholder:font-normal placeholder:text-muted-foreground/50',
                                                            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
                                                            e.marks !== '' ? 'border-primary/40' : 'border-dashed border-border-strong',
                                                        )}
                                                    />
                                                    <span className="text-[13px] font-semibold tabular-nums text-muted-foreground">
                                                        / {totalMarks}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-display text-[13px] font-bold text-destructive">
                                                    ABSENT
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex w-[92px] shrink-0 justify-center">
                                            <button
                                                onClick={() => setField(member.userId, 'absent', !e.absent)}
                                                aria-pressed={e.absent}
                                                aria-label={`Mark ${member.fullName} absent`}
                                                className={cn(
                                                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                                                    e.absent
                                                        ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                                        : 'border-border text-muted-foreground hover:border-destructive/30 hover:text-destructive'
                                                )}
                                            >
                                                <XCircle className="h-3.5 w-3.5" />
                                                {/* Always "Absent".
                                                    It read "Mark" until pressed,
                                                    under a column headed Absent
                                                    and beside a marks box — so the
                                                    one control that does not enter
                                                    a mark was the one labelled
                                                    "Mark". Same behaviour; the
                                                    pressed state is carried by the
                                                    red fill and aria-pressed. */}
                                                Absent
                                            </button>
                                        </div>
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
                                                <input type="text" value={e.topic}
                                                    onChange={(ev) => setField(member.userId, 'topic', ev.target.value)}
                                                    placeholder="Topic…"
                                                    className="w-full h-8 px-3 rounded-lg border border-border bg-muted text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                                />
                                            )}
                                            <input type="text" value={e.feedback}
                                                onChange={(ev) => setField(member.userId, 'feedback', ev.target.value)}
                                                placeholder="Feedback (optional)…"
                                                className="w-full h-8 px-3 rounded-lg border border-border bg-muted text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">No students enrolled.</div>
                )}

                <div className="flex gap-3 pt-2 border-t border-border">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button className="flex-1" loading={isSaving} onClick={handleSave}
                        disabled={members.length === 0}
                        leftIcon={!isSaving ? <Save className="w-4 h-4" /> : undefined}>
                        Save marks
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

