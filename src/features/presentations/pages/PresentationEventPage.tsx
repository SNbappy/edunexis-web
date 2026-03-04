import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Send, CheckCircle2, XCircle, Calendar, BookOpen, MapPin, Clock, Mic } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { usePresentations, usePresentationResults } from '../hooks/usePresentations'
import { cn } from '@/utils/cn'

export default function PresentationEventPage() {
    const { courseId, presentationId } = useParams<{ courseId: string; presentationId: string }>()
    const navigate  = useNavigate()
    const { user }  = useAuthStore()
    const teacher   = isTeacher(user?.role ?? 'Student')

    const { presentations, isLoading: eventsLoading } = usePresentations(courseId!)
    const { members } = useAttendance(courseId!)
    const { results, isLoading: resultsLoading, saveMarks, isSaving } = usePresentationResults(courseId!, presentationId!)

    const presentation = presentations.find(p => p.id === presentationId)
    const students     = members.filter(m => !isTeacher(m.role ?? ''))

    const [entries, setEntries]     = useState<Record<string, { marks: string; absent: boolean; topic: string; feedback: string }>>({})
    const [initialized, setInit]    = useState(false)

    useEffect(() => {
        if (initialized || resultsLoading || students.length === 0) return
        const init: typeof entries = {}
        students.forEach(m => {
            const ex = results.find(r => r.studentId === m.userId)
            init[m.userId] = {
                marks:    ex?.obtainedMarks?.toString() ?? '',
                absent:   ex?.isAbsent ?? false,
                topic:    ex?.topic ?? '',
                feedback: ex?.feedback ?? '',
            }
        })
        setEntries(init)
        setInit(true)
    }, [results, students, resultsLoading, initialized])

    const setField = (uid: string, field: string, val: string | boolean) =>
        setEntries(prev => ({ ...prev, [uid]: { ...prev[uid], [field]: val } }))

    const handleSave = () => {
        saveMarks({
            entries: students.map(m => {
                const e = entries[m.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
                return {
                    studentId:     m.userId,
                    obtainedMarks: e.absent || e.marks === '' ? null : parseFloat(e.marks),
                    isAbsent:      e.absent,
                    topic:         e.topic || undefined,
                    feedback:      e.feedback || undefined,
                }
            }),
        })
    }

    const gradedCount = Object.values(entries).filter(e => !e.absent && e.marks !== '').length
    const absentCount = Object.values(entries).filter(e => e.absent).length
    const backUrl     = `/courses/${courseId}/presentations`

    if (eventsLoading) return (
        <div className="max-w-3xl mx-auto space-y-4 p-6">
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-96" />
        </div>
    )

    if (!presentation) return (
        <div className="p-6 text-center text-muted-foreground">Presentation not found.</div>
    )

    const statusVariant =
        presentation.status === 'Completed' ? 'success' :
        presentation.status === 'Ongoing'   ? 'warning' :
        presentation.status === 'Cancelled' ? 'danger'  : 'default'

    // ── Student view ──
    if (!teacher) {
        const myMark = results.find(r => r.studentId === user?.id)
        return (
            <div className="max-w-2xl mx-auto space-y-5 pb-10 p-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(backUrl)}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{presentation.title}</h1>
                        <p className="text-sm text-muted-foreground">Presentation</p>
                    </div>
                    <Badge variant={statusVariant}>{presentation.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {presentation.scheduledDate && (
                        <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Date</div>
                            <p className="font-semibold text-foreground">{formatDate(presentation.scheduledDate, 'dd MMM yyyy')}</p>
                        </div>
                    )}
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Total Marks</div>
                        <p className="font-semibold text-foreground">{presentation.totalMarks}</p>
                    </div>
                </div>

                {presentation.status === 'Scheduled' || presentation.status === 'Ongoing' ? (
                    <div className="p-5 rounded-2xl bg-muted/50 border border-border text-center text-sm text-muted-foreground">
                        Results will be visible once the presentation is completed.
                    </div>
                ) : resultsLoading ? (
                    <SkeletonCard className="h-24" />
                ) : !myMark ? (
                    <div className="p-5 rounded-2xl bg-muted/50 border border-border text-center text-sm text-muted-foreground">
                        Your marks have not been entered yet.
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className={cn('p-5 rounded-2xl border space-y-3',
                            myMark.isAbsent
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-emerald-500/5 border-emerald-500/20')}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Result</p>
                        {myMark.isAbsent ? (
                            <div className="flex items-center gap-2 text-destructive">
                                <XCircle className="w-6 h-6" />
                                <span className="text-lg font-bold">Absent</span>
                            </div>
                        ) : (
                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-emerald-500">{myMark.obtainedMarks}</span>
                                <span className="text-lg text-muted-foreground mb-1">/ {presentation.totalMarks}</span>
                            </div>
                        )}
                        {myMark.topic && <p className="text-xs text-violet-500 flex items-center gap-1"><Mic className="w-3.5 h-3.5" />{myMark.topic}</p>}
                        {myMark.feedback && <p className="text-xs text-muted-foreground">Feedback: {myMark.feedback}</p>}
                    </motion.div>
                )}
            </div>
        )
    }

    // ── Teacher view ──
    return (
        <div className="max-w-3xl mx-auto space-y-5 pb-10 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => navigate(backUrl)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate">{presentation.title}</h1>
                    <p className="text-sm text-muted-foreground">Presentation Management</p>
                </div>
                <Badge variant={statusVariant}>{presentation.status}</Badge>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3">
                {presentation.scheduledDate && (
                    <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Date</div>
                        <p className="font-semibold text-foreground text-sm">{formatDate(presentation.scheduledDate, 'dd MMM yyyy')}</p>
                    </div>
                )}
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Total Marks</div>
                    <p className="font-semibold text-foreground text-sm">{presentation.totalMarks}</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5" /> Progress</div>
                    <p className="font-semibold text-foreground text-sm">{gradedCount} / {students.length} graded</p>
                </div>
            </div>

            {/* Mark entry table */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-foreground">Mark Entry</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {gradedCount} graded · {absentCount} absent · {students.length - gradedCount - absentCount} pending
                        </p>
                    </div>
                    <Button size="sm" leftIcon={<Save className="w-4 h-4" />}
                        loading={isSaving} onClick={handleSave}
                        disabled={students.length === 0}>
                        Save Marks
                    </Button>
                </div>

                {resultsLoading ? (
                    <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}</div>
                ) : students.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No students in this class.</div>
                ) : (
                    <>
                        {/* Column headers */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-4">Student</div>
                            <div className="col-span-2 text-center">Absent</div>
                            <div className="col-span-2">Marks</div>
                            {presentation.topicsAllowed
                                ? <><div className="col-span-2">Topic</div><div className="col-span-2">Feedback</div></>
                                : <div className="col-span-4">Feedback</div>
                            }
                        </div>

                        <div className="space-y-1.5">
                            {students.map((m, idx) => {
                                const e = entries[m.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
                                return (
                                    <div key={m.userId}
                                        className={cn(
                                            'grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl transition-all',
                                            e.absent
                                                ? 'bg-destructive/5 border border-destructive/20'
                                                : idx % 2 === 0 ? 'bg-muted/30' : ''
                                        )}>
                                        {/* Student */}
                                        <div className="col-span-4 flex items-center gap-2 min-w-0">
                                            <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{m.fullName}</p>
                                                {m.studentId && <p className="text-xs text-muted-foreground font-mono">{m.studentId}</p>}
                                            </div>
                                        </div>

                                        {/* Absent toggle */}
                                        <div className="col-span-2 flex justify-center">
                                            <button onClick={() => setField(m.userId, 'absent', !e.absent)}
                                                className={cn(
                                                    'w-9 h-5 rounded-full transition-colors relative',
                                                    e.absent ? 'bg-destructive' : 'bg-muted-foreground/30'
                                                )}>
                                                <span className={cn(
                                                    'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                                                    e.absent ? 'left-[18px]' : 'left-0.5'
                                                )} />
                                            </button>
                                        </div>

                                        {/* Marks */}
                                        <div className="col-span-2">
                                            <input type="number" min={0} max={presentation.totalMarks} step={0.5}
                                                disabled={e.absent} value={e.marks}
                                                onChange={ev => setField(m.userId, 'marks', ev.target.value)}
                                                placeholder="—"
                                                className="w-full h-9 text-center rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all" />
                                        </div>

                                        {/* Topic */}
                                        {presentation.topicsAllowed && (
                                            <div className="col-span-2">
                                                <input type="text" disabled={e.absent} value={e.topic}
                                                    onChange={ev => setField(m.userId, 'topic', ev.target.value)}
                                                    placeholder="Topic..."
                                                    className="w-full h-9 px-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-40 transition-all" />
                                            </div>
                                        )}

                                        {/* Feedback */}
                                        <div className={presentation.topicsAllowed ? 'col-span-2' : 'col-span-4'}>
                                            <input type="text" disabled={e.absent} value={e.feedback}
                                                onChange={ev => setField(m.userId, 'feedback', ev.target.value)}
                                                placeholder="Feedback..."
                                                className="w-full h-9 px-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-40 transition-all" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
