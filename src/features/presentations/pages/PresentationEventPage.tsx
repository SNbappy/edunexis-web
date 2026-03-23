import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Send, CheckCircle2, XCircle, Calendar, BookOpen, MapPin, Clock, Mic, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { usePresentations, usePresentationResults } from '../hooks/usePresentations'
import { cn } from '@/utils/cn'

export default function PresentationEventPage() {
    const { courseId, presentationId } = useParams<{ courseId: string; presentationId: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const teacher  = isTeacher(user?.role ?? 'Student')

    const { presentations, isLoading: eventsLoading, updateStatus } = usePresentations(courseId!)
    const { members }                                                = useAttendance(courseId!)
    const { results, isLoading: resultsLoading, saveMarks, isSaving } = usePresentationResults(courseId!, presentationId!)

    const presentation = presentations.find(p => p.id === presentationId)
    const students     = members.filter(m => !isTeacher(m.role ?? ''))

    const [entries,     setEntries] = useState<Record<string, { marks: string; absent: boolean; topic: string; feedback: string }>>({})
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

    const setField = (uid: string, field: keyof typeof entries[string], val: string | boolean) =>
        setEntries(prev => ({ ...prev, [uid]: { ...prev[uid], [field]: val } }))

    const setAllAbsent = (absent: boolean) =>
        setEntries(prev => {
            const next = { ...prev }
            students.forEach(m => {
                next[m.userId] = { ...next[m.userId], absent, marks: absent ? '' : next[m.userId]?.marks ?? '' }
            })
            return next
        })

    const handleSave = () => {
        saveMarks({
            entries: students.map(m => {
                const e = entries[m.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
                return {
                    studentId:     m.userId,
                    obtainedMarks: e.absent || e.marks === '' ? null : parseFloat(e.marks),
                    isAbsent:      e.absent,
                    topic:         e.topic    || undefined,
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

    const isScheduled = presentation.status === 'Scheduled'
    const isOngoing   = presentation.status === 'Ongoing'
    const isCompleted = presentation.status === 'Completed'

    const statusVariant =
        isCompleted                         ? 'success' :
        isOngoing                           ? 'warning' :
        presentation.status === 'Cancelled' ? 'danger'  : 'default'

    // ── Student view ──
    if (!teacher) {
        const myMark = results.find(r => r.studentId === user?.id)
        return (
            <div className="max-w-2xl mx-auto space-y-5 pb-10 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(backUrl)}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{presentation.title}</h1>
                        <p className="text-sm text-muted-foreground">Presentation</p>
                    </div>
                    <Badge variant={statusVariant} dot={isScheduled || isOngoing}>{presentation.status}</Badge>
                </div>

                {/* Info cards */}
                <div className="grid grid-cols-2 gap-3">
                    {presentation.scheduledDate && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Date</div>
                            <p className="text-sm font-semibold text-foreground">{formatDate(presentation.scheduledDate, 'dd MMM yyyy')}</p>
                        </div>
                    )}
                    <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Total Marks</div>
                        <p className="text-sm font-semibold text-foreground">{presentation.totalMarks}</p>
                    </div>
                    {(presentation as any).venue && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> Venue</div>
                            <p className="text-sm font-semibold text-foreground">{(presentation as any).venue}</p>
                        </div>
                    )}
                    {(presentation as any).durationPerGroupMinutes && (
                        <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /> Duration/Group</div>
                            <p className="text-sm font-semibold text-foreground">{(presentation as any).durationPerGroupMinutes} min</p>
                        </div>
                    )}
                </div>

                {/* Description */}
                {(presentation as any).description && (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details & Guidelines</p>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{(presentation as any).description}</p>
                        </div>
                    </div>
                )}

                {/* Result */}
                {isScheduled || isOngoing ? (
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
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('p-4 rounded-xl border space-y-2',
                            myMark.isAbsent
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-emerald-500/5 border-emerald-500/20'
                        )}
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Result</p>
                        {myMark.isAbsent ? (
                            <div className="flex items-center gap-2 text-destructive">
                                <XCircle className="w-5 h-5" />
                                <span className="font-semibold">Absent</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Star className="w-5 h-5" />
                                <span className="text-2xl font-bold">{myMark.obtainedMarks}</span>
                                <span className="text-muted-foreground">/ {presentation.totalMarks}</span>
                            </div>
                        )}
                        {myMark.topic    && <p className="text-xs text-violet-500 flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> {myMark.topic}</p>}
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
                <Badge variant={statusVariant} dot={isScheduled || isOngoing}>{presentation.status}</Badge>
                {isScheduled && (
                    <Button size="sm" variant="secondary" leftIcon={<Send className="w-4 h-4" />}
                        onClick={() => updateStatus({ id: presentation.id, status: 'Ongoing' })}>
                        Mark as Ongoing
                    </Button>
                )}
                {isOngoing && (
                    <Button size="sm" leftIcon={<Send className="w-4 h-4" />}
                        onClick={() => updateStatus({ id: presentation.id, status: 'Completed' })}>
                        Mark as Completed
                    </Button>
                )}
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3">
                {presentation.scheduledDate && (
                    <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /> Date</div>
                        <p className="text-sm font-semibold text-foreground">{formatDate(presentation.scheduledDate, 'dd MMM yyyy')}</p>
                    </div>
                )}
                <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><BookOpen className="w-3.5 h-3.5" /> Total Marks</div>
                    <p className="text-sm font-semibold text-foreground">{presentation.totalMarks}</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5" /> Progress</div>
                    <p className="text-sm font-semibold text-foreground">{gradedCount} / {students.length} graded</p>
                </div>
            </div>

            {/* Mark Entry Panel */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">

                {/* Summary bar */}
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {gradedCount} graded
                    </span>
                    <span className="flex items-center gap-1.5 text-destructive font-medium">
                        <XCircle className="w-4 h-4" /> {absentCount} absent
                    </span>
                    <span className="text-muted-foreground">
                        {students.length - gradedCount - absentCount} pending
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setAllAbsent(false)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-all"
                        >
                            Clear Absent
                        </button>
                        <button
                            onClick={() => setAllAbsent(true)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                        >
                            All Absent
                        </button>
                        <Button size="sm" leftIcon={<Save className="w-4 h-4" />}
                            loading={isSaving} onClick={handleSave}
                            disabled={students.length === 0}>
                            Save Marks
                        </Button>
                    </div>
                </div>

                {/* Student list */}
                {resultsLoading ? (
                    <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}</div>
                ) : students.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No students in this class.</div>
                ) : (
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
                        {students.map((m, i) => {
                            const e        = entries[m.userId] ?? { marks: '', absent: false, topic: '', feedback: '' }
                            const marksNum = parseFloat(e.marks)
                            const pct      = !isNaN(marksNum) && presentation.totalMarks > 0
                                ? (marksNum / presentation.totalMarks) * 100 : 0

                            return (
                                <motion.div
                                    key={m.userId}
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
                                    {/* Main row */}
                                    <div className="flex items-center gap-3">
                                        <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{m.fullName}</p>
                                            {m.studentId && (
                                                <p className="text-xs text-muted-foreground font-mono">{m.studentId}</p>
                                            )}
                                        </div>

                                        {/* Absent pill button */}
                                        <button
                                            onClick={() => setField(m.userId, 'absent', !e.absent)}
                                            className={cn(
                                                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shrink-0',
                                                e.absent
                                                    ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                    : 'border-border text-muted-foreground hover:text-destructive hover:border-destructive/30'
                                            )}
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Absent
                                        </button>

                                        {/* Marks input or ABS */}
                                        {!e.absent ? (
                                            <input
                                                type="number"
                                                value={e.marks}
                                                onChange={ev => setField(m.userId, 'marks', ev.target.value)}
                                                min={0} max={presentation.totalMarks} step={0.5}
                                                placeholder="—"
                                                className="w-16 h-9 text-center rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                            />
                                        ) : (
                                            <div className="w-16 h-9 flex items-center justify-center text-destructive text-sm font-bold">
                                                ABS
                                            </div>
                                        )}
                                    </div>

                                    {/* Sub-row: progress + topic + feedback */}
                                    {!e.absent && (
                                        <div className="mt-2 pl-11 space-y-2">
                                            {!isNaN(marksNum) && e.marks !== '' && (
                                                <ProgressBar
                                                    value={pct} size="sm"
                                                    color={pct >= 80 ? 'success' : pct >= 60 ? 'primary' : pct >= 40 ? 'warning' : 'danger'}
                                                    animated={false} className="w-32"
                                                />
                                            )}
                                            {presentation.topicsAllowed && (
                                                <input
                                                    type="text"
                                                    value={e.topic}
                                                    onChange={ev => setField(m.userId, 'topic', ev.target.value)}
                                                    placeholder="Topic..."
                                                    className="w-full h-8 px-3 rounded-lg border border-border bg-muted text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                                />
                                            )}
                                            <input
                                                type="text"
                                                value={e.feedback}
                                                onChange={ev => setField(m.userId, 'feedback', ev.target.value)}
                                                placeholder="Feedback (optional)..."
                                                className="w-full h-8 px-3 rounded-lg border border-border bg-muted text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {/* Footer save */}
                <div className="flex gap-3 pt-2 border-t border-border">
                    <Button
                        className="flex-1"
                        loading={isSaving}
                        onClick={handleSave}
                        disabled={students.length === 0}
                        leftIcon={!isSaving ? <Save className="w-4 h-4" /> : undefined}
                    >
                        Save Marks
                    </Button>
                </div>
            </div>
        </div>
    )
}
