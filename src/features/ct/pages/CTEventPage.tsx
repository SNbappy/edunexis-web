import { useState, useRef, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Upload, CheckCircle2, FileText, X, XCircle,
    Save, Send, Calendar, BookOpen, Star, Trophy, TrendingDown, BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import BrandLoader from '@/components/ui/BrandLoader'
import { formatDate } from '@/utils/dateUtils'
import { sortByRoll } from '@/utils/roster'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { UserRole } from '@/types/auth.types'
import { useCTEvents, useCTMarks } from '../hooks/useCTEvents'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'

interface MarkInput { obtainedMarks: string; isAbsent: boolean; remarks: string }

/**
 * A class test used to live behind three stacked modals — a detail modal that
 * opened a marks modal, and a separate upload modal — so entering marks meant
 * a dialog on top of a dialog, nothing could be linked to or refreshed, and
 * closing by accident lost the whole grid. It is now one page with its own URL,
 * exactly like an assignment: the scripts, the roster and the publish decision
 * all in one place.
 */

interface KhataSlot {
    key: 'best' | 'worst' | 'avg'
    label: string
    description: string
    icon: LucideIcon
    formKey: 'bestCopy' | 'worstCopy' | 'avgCopy'
    studentKey: 'bestStudentId' | 'worstStudentId' | 'avgStudentId'
    urlKey: 'bestScriptUrl' | 'worstScriptUrl' | 'averageScriptUrl'
}

const KHATA_SLOTS: KhataSlot[] = [
    { key: 'best', label: 'Best script', description: 'Highest scorer', icon: Trophy, formKey: 'bestCopy', studentKey: 'bestStudentId', urlKey: 'bestScriptUrl' },
    { key: 'worst', label: 'Worst script', description: 'Lowest scorer', icon: TrendingDown, formKey: 'worstCopy', studentKey: 'worstStudentId', urlKey: 'worstScriptUrl' },
    { key: 'avg', label: 'Average script', description: 'Mid-range scorer', icon: BarChart3, formKey: 'avgCopy', studentKey: 'avgStudentId', urlKey: 'averageScriptUrl' },
]

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // matches the Cloudinary raw-upload cap

export default function CTEventPage() {
    const { courseId, ctId } = useParams<{ courseId: string; ctId: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const { ctEvents, isLoading: eventsLoading, publishCT, unpublishCT } = useCTEvents(courseId!)
    const { marksData, isLoading: marksLoading, uploadKhata, isUploading, gradeStudents, isSaving } = useCTMarks(ctId!)
    const { members } = useAttendance(courseId!)

    const ct = ctEvents.find(e => e.id === ctId)

    /* Roll order, not join order. The teacher marks from a printed script pile
       that is itself in roll order, so any other ordering means hunting for
       each row. `role` is a plain string on a course member, so it is defaulted
       to a real role — isTeacher takes a UserRole. */
    const students = useMemo(
        () => sortByRoll(members.filter(m => !isTeacher((m.role as UserRole) ?? 'Student'))),
        [members],
    )

    const [files, setFiles] = useState<Partial<Record<KhataSlot['key'], File>>>({})
    const [scriptOwners, setScriptOwners] = useState<Partial<Record<KhataSlot['studentKey'], string>>>({})
    const [sizeError, setSizeError] = useState<string | null>(null)
    const [markInputs, setMarkInputs] = useState<Record<string, MarkInput>>({})
    const [initialized, setInit] = useState(false)

    const bestRef = useRef<HTMLInputElement>(null)
    const worstRef = useRef<HTMLInputElement>(null)
    const avgRef = useRef<HTMLInputElement>(null)
    const fileRefs = { best: bestRef, worst: worstRef, avg: avgRef }

    useEffect(() => {
        if (initialized || students.length === 0) return
        const inputs: Record<string, MarkInput> = {}
        students.forEach(m => {
            const ex = (marksData?.marks ?? []).find((mk: any) => mk.studentId === m.userId)
            inputs[m.userId] = {
                obtainedMarks: ex?.obtainedMarks != null ? String(ex.obtainedMarks) : '',
                isAbsent: ex?.isAbsent ?? false,
                remarks: ex?.remarks ?? '',
            }
        })
        setMarkInputs(inputs)
        if (marksData !== undefined) setInit(true)
    }, [marksData, students, initialized])

    const updateMark = (uid: string, field: keyof MarkInput, val: string | boolean) =>
        setMarkInputs(prev => ({ ...prev, [uid]: { ...prev[uid], [field]: val } }))

    const toggleAbsent = (userId: string) => {
        setMarkInputs(prev => {
            const cur = prev[userId] ?? { obtainedMarks: '', isAbsent: false, remarks: '' }
            const nextAbsent = !cur.isAbsent
            return {
                ...prev,
                [userId]: {
                    ...cur,
                    isAbsent: nextAbsent,
                    obtainedMarks: nextAbsent ? '0' : '',
                }
            }
        })
    }

    const setAllAbsent = (absent: boolean) =>
        setMarkInputs(prev => {
            const next = { ...prev }
            students.forEach(m => {
                next[m.userId] = {
                    ...(next[m.userId] ?? { obtainedMarks: '', isAbsent: false, remarks: '' }),
                    isAbsent: absent,
                    obtainedMarks: absent ? '0' : '',
                }
            })
            return next
        })

    const pickFile = (key: KhataSlot['key'], file: File | undefined) => {
        if (file && file.size > MAX_SIZE_BYTES) {
            setSizeError(`"${file.name}" is ${(file.size / (1024 * 1024)).toFixed(1)}MB, which exceeds the 10MB limit.`)
            return
        }
        setSizeError(null)
        setFiles(prev => {
            const n = { ...prev }
            if (file) n[key] = file
            else delete n[key]
            return n
        })
    }

    const handleUpload = () => {
        const hasFiles = !!files.best || !!files.worst || !!files.avg
        if (!hasFiles) return
        const fd = new FormData()
        if (files.best) fd.append('bestCopy', files.best)
        if (files.worst) fd.append('worstCopy', files.worst)
        if (files.avg) fd.append('avgCopy', files.avg)
        KHATA_SLOTS.forEach(s => {
            const owner = scriptOwners[s.studentKey]
            if (owner) fd.append(s.studentKey, owner)
        })
        uploadKhata(fd, {
            onSuccess: () => {
                setFiles({})
                Object.values(fileRefs).forEach(r => {
                    if (r.current) r.current.value = ''
                })
            }
        })
    }

    const handleSave = () => {
        const entries = students.map(m => {
            const inp = markInputs[m.userId] ?? { obtainedMarks: '', isAbsent: false, remarks: '' }
            return {
                studentId: m.userId,
                obtainedMarks: inp.isAbsent
                    ? 0
                    : inp.obtainedMarks === ''
                    ? null
                    : parseFloat(inp.obtainedMarks),
                isAbsent: inp.isAbsent,
                remarks: inp.remarks || undefined,
            }
        })
        gradeStudents({ marks: entries })
    }

    const backUrl = '/courses/' + courseId + '/ct'

    if (eventsLoading) return <BrandLoader variant="page" />

    /* `!ct` alone, not `!eventsLoading && !ct`. The loading branch above has
       already returned, so TypeScript knows eventsLoading is false here. */
    if (!ct) {
        return (
            <div className="text-center py-12 space-y-3">
                <p className="text-muted-foreground">Class test not found.</p>
                <Button variant="secondary" onClick={() => navigate(backUrl)}>Back to CTs</Button>
            </div>
        )
    }

    const isDraft = ct.status === 'Draft'
    const isPublished = ct.status === 'Published'
    const pageTitle = `CT ${ct.ctNumber}: ${ct.title}`
    const selectedFilesCount = (files.best ? 1 : 0) + (files.worst ? 1 : 0) + (files.avg ? 1 : 0)

    /* --- Student View --- */
    if (!teacher) {
        const myMark = marksData?.marks?.find(m => m.studentId === user?.id)
        return (
            <div className="max-w-3xl mx-auto space-y-6 pt-5 sm:pt-7 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(backUrl)}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
                        <p className="text-sm text-muted-foreground">
                            {ct.heldOn ? formatDate(ct.heldOn, 'dd MMM yyyy') : 'Date not set'} · Max marks: {ct.maxMarks}
                        </p>
                    </div>
                    <Badge className="ml-auto" variant={isPublished ? 'success' : 'default'}>{ct.status}</Badge>
                </div>

                {!isPublished ? (
                    <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2">
                        <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
                        <p className="font-semibold text-foreground">Results Not Published Yet</p>
                        <p className="text-sm text-muted-foreground">
                            Results will be visible once the teacher publishes this CT.
                        </p>
                    </div>
                ) : !myMark ? (
                    <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-2">
                        <p className="font-semibold text-foreground">No Result Record</p>
                        <p className="text-sm text-muted-foreground">No marks recorded for your account.</p>
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="p-6 rounded-2xl bg-card border border-border space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your CT Score</span>
                            <Badge variant={myMark.isAbsent ? 'destructive' : 'success'}>
                                {myMark.isAbsent ? 'Absent' : 'Graded'}
                            </Badge>
                        </div>
                        {myMark.isAbsent ? (
                            <div className="flex items-center gap-3.5 text-destructive">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive-soft text-destructive shrink-0">
                                    <XCircle className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-3xl font-extrabold text-destructive tabular-nums">
                                        0 <span className="text-base text-muted-foreground font-normal">/ {ct.maxMarks}</span>
                                    </p>
                                    <p className="text-xs text-destructive/80 font-semibold">Marked Absent (0 Marks)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-200 dark:border-emerald-800">
                                        <Star className="w-7 h-7 fill-emerald-500 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {myMark.obtainedMarks} <span className="text-base text-muted-foreground font-normal">/ {ct.maxMarks}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {ct.maxMarks > 0 ? `${Math.round(((myMark.obtainedMarks ?? 0) / ct.maxMarks) * 100)}% Score` : 'Obtained marks'}
                                        </p>
                                    </div>
                                </div>
                                {ct.maxMarks > 0 && (
                                    <ProgressBar
                                        value={((myMark.obtainedMarks ?? 0) / ct.maxMarks) * 100}
                                        size="md"
                                        color={((myMark.obtainedMarks ?? 0) / ct.maxMarks) >= 0.75 ? 'success' : ((myMark.obtainedMarks ?? 0) / ct.maxMarks) >= 0.5 ? 'warning' : 'danger'}
                                        animated={false}
                                    />
                                )}
                            </div>
                        )}
                        {myMark.remarks && (
                            <p className="text-sm text-muted-foreground border-t border-border/50 pt-3">Remarks: {myMark.remarks}</p>
                        )}
                    </motion.div>
                )}
            </div>
        )
    }

    /* --- Teacher View --- */
    const gradedCount = students.filter(m => {
        const e = markInputs[m.userId]
        return e && !e.isAbsent && e.obtainedMarks !== ''
    }).length
    const absentCount = students.filter(m => markInputs[m.userId]?.isAbsent).length
    const pendingCount = students.length - gradedCount - absentCount

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-5 sm:pt-7 pb-10">

            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => navigate(backUrl)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-foreground truncate">{pageTitle}</h1>
                    <p className="text-sm text-muted-foreground">Class Test Management</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={isPublished ? 'success' : 'default'}>{ct.status}</Badge>
                    {isDraft && ct.khataUploaded && (
                        <Button
                            size="sm"
                            leftIcon={<Send className="w-4 h-4" />}
                            onClick={() => publishCT(ct.id)}
                            disabled={pendingCount > 0}
                            title={pendingCount > 0 ? `All ${students.length} students must be marked before publishing (${pendingCount} pending)` : undefined}
                        >
                            Publish Results
                        </Button>
                    )}
                    {isPublished && (
                        <Button size="sm" variant="secondary" onClick={() => unpublishCT(ct.id)}>
                            Unpublish
                        </Button>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> Date Held
                    </div>
                    <p className="font-semibold text-foreground">
                        {ct.heldOn ? formatDate(ct.heldOn, 'dd MMM yyyy') : 'Not set'}
                    </p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BookOpen className="w-3.5 h-3.5" /> Total Marks
                    </div>
                    <p className="font-semibold text-foreground">{ct.maxMarks}</p>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" /> Khata Scripts
                    </div>
                    <p className={ct.khataUploaded ? 'font-semibold text-emerald-500' : 'font-semibold text-amber-500'}>
                        {ct.khataUploaded ? 'Uploaded' : 'Pending'}
                    </p>
                </div>
            </div>

            {/* -- Khata Section -- */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h2 className="font-semibold text-foreground">Khata Scripts</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {ct.khataUploaded
                                ? 'Sample scripts are uploaded. You can re-upload any script to replace it.'
                                : 'Upload all 3 sample scripts to proceed with class test grading.'}
                        </p>
                    </div>
                    {ct.khataUploaded && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" /> All 3 Scripts Active
                        </div>
                    )}
                </div>

                {sizeError && (
                    <div className="flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive-soft px-3 py-2.5 text-[11.5px] font-semibold text-destructive">
                        <span className="flex-1">{sizeError}</span>
                        <button type="button" onClick={() => setSizeError(null)} aria-label="Dismiss"
                            className="shrink-0 rounded-full p-0.5 text-destructive hover:bg-destructive/10">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                {/* 3 Slot Cards */}
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                    {KHATA_SLOTS.map(slot => {
                        const file = files[slot.key]
                        const currentUrl = ct[slot.urlKey]
                        const ref = fileRefs[slot.key]

                        return (
                            <div
                                key={slot.key}
                                className={cn(
                                    "p-4 rounded-xl border space-y-3 transition-all",
                                    file
                                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                                        : currentUrl
                                        ? "border-border bg-card"
                                        : "border-dashed border-border bg-muted/20"
                                )}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <slot.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-foreground leading-tight">{slot.label}</p>
                                            <p className="text-[11px] text-muted-foreground">{slot.description}</p>
                                        </div>
                                    </div>
                                    {file && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                pickFile(slot.key, undefined)
                                                if (ref.current) ref.current.value = ''
                                            }}
                                            title="Remove replacement"
                                            className="p-1 rounded-md text-muted-foreground hover:bg-destructive-soft hover:text-destructive transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Current Uploaded File link */}
                                {currentUrl && !file && (
                                    <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-2.5 py-1.5 text-xs">
                                        <span className="flex items-center gap-1.5 text-muted-foreground truncate">
                                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                            <span className="truncate">Active script</span>
                                        </span>
                                        <a
                                            href={currentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-medium text-primary hover:underline shrink-0 ml-2"
                                        >
                                            View ↗
                                        </a>
                                    </div>
                                )}

                                {/* Selected replacement file preview */}
                                {file ? (
                                    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-primary font-medium">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </span>
                                        <span className="text-[10.5px] text-primary/70 shrink-0 ml-1.5 tabular-nums">
                                            {(file.size / 1024).toFixed(0)} KB
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => ref.current?.click()}
                                        className="w-full text-xs py-2 rounded-lg text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/40 font-medium flex items-center justify-center gap-1.5"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        {currentUrl ? 'Replace File' : 'Choose File'}
                                    </button>
                                )}

                                <input
                                    ref={ref}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    className="hidden"
                                    onChange={e => pickFile(slot.key, e.target.files?.[0])}
                                />

                                {/* Student Selector */}
                                {students.length > 0 && (
                                    <select
                                        value={scriptOwners[slot.studentKey] ?? ''}
                                        onChange={e => setScriptOwners(prev => ({
                                            ...prev,
                                            [slot.studentKey]: e.target.value || undefined,
                                        }))}
                                        aria-label={slot.label + ' student'}
                                        className="h-8 w-full rounded-lg border border-border bg-card px-2 text-[12px] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Select Student (optional)</option>
                                        {students.map(m => (
                                            <option key={m.userId} value={m.userId}>
                                                {m.studentId ? m.studentId + ' — ' : ''}{m.fullName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Upload / Re-upload Action Button */}
                {selectedFilesCount > 0 && (
                    <Button
                        leftIcon={<Upload className="w-4 h-4" />}
                        loading={isUploading}
                        onClick={handleUpload}
                        className="w-full"
                    >
                        {ct.khataUploaded
                            ? `Re-upload / Replace Selected ${selectedFilesCount === 1 ? 'Script' : `${selectedFilesCount} Scripts`}`
                            : `Upload All 3 Khata Scripts (${selectedFilesCount}/3 selected)`}
                    </Button>
                )}
            </div>

            {/* -- Mark Entry --
                Shown once the scripts exist, published or not. Marks were
                previously editable only while the CT was a draft, so a single
                typo found after publishing could not be corrected at all. */}
            {ct.khataUploaded && (
                <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="font-semibold text-foreground">Mark Entry</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {students.length} students · Max: {ct.maxMarks} marks
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setAllAbsent(false)}
                                className="rounded-lg border border-border bg-card px-3 py-1.5 text-[11.5px] font-bold text-foreground transition-colors hover:bg-muted"
                            >
                                Clear absent
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllAbsent(true)}
                                className="rounded-lg border border-destructive/25 bg-destructive-soft px-3 py-1.5 text-[11.5px] font-bold text-destructive transition-colors hover:opacity-90"
                            >
                                Mark all absent
                            </button>
                            <Button
                                size="sm"
                                leftIcon={<Save className="w-4 h-4" />}
                                loading={isSaving}
                                onClick={handleSave}
                                disabled={students.length === 0}
                            >
                                Save Marks
                            </Button>
                        </div>
                    </div>

                    {/* Progress, so the teacher can stop and come back */}
                    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-muted/30 p-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span><span className="font-display text-base text-success">{gradedCount}</span> Graded</span>
                        <span><span className="font-display text-base text-destructive">{absentCount}</span> Absent</span>
                        <span><span className="font-display text-base text-foreground">{pendingCount}</span> Pending</span>
                    </div>

                    {isDraft && pendingCount > 0 && (
                        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300">
                            <strong>Publish Requirement:</strong> All {students.length} students must be graded or marked absent before results can be published ({pendingCount} pending).
                        </div>
                    )}

                    {marksLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground text-center">
                            No students enrolled yet.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {students.map(m => {
                                const inp = markInputs[m.userId] ?? { obtainedMarks: '', isAbsent: false, remarks: '' }
                                const marksN = parseFloat(inp.obtainedMarks)
                                const hasMarks = !inp.isAbsent && inp.obtainedMarks !== '' && !isNaN(marksN)
                                const pct = hasMarks && ct.maxMarks > 0 ? (marksN / ct.maxMarks) * 100 : 0
                                const rowCls = inp.isAbsent
                                    ? 'flex flex-wrap items-center gap-3 rounded-xl border border-destructive/25 bg-destructive-soft/60 p-3'
                                    : hasMarks
                                        ? 'flex flex-wrap items-center gap-3 rounded-xl border border-success/25 bg-success-soft/40 p-3'
                                        : 'flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3'
                                return (
                                    <div key={m.userId} className={rowCls}>
                                        <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" />

                                        <div className="min-w-0 flex-1">
                                            {m.studentId && (
                                                <p className="font-mono text-[12px] font-bold leading-tight text-foreground">
                                                    {m.studentId}
                                                </p>
                                            )}
                                            <p className="truncate text-[12.5px] text-muted-foreground">{m.fullName}</p>
                                            {hasMarks && (
                                                <ProgressBar
                                                    value={pct}
                                                    size="sm"
                                                    color={pct >= 80 ? 'success' : pct >= 60 ? 'primary' : pct >= 40 ? 'warning' : 'danger'}
                                                    className="mt-1 w-24"
                                                    animated={false}
                                                />
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleAbsent(m.userId)}
                                            aria-pressed={inp.isAbsent}
                                            className={
                                                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11.5px] font-bold transition-colors ' +
                                                (inp.isAbsent
                                                    ? 'border-destructive/25 bg-destructive-soft text-destructive'
                                                    : 'border-border bg-card text-muted-foreground hover:border-destructive/25 hover:text-destructive')
                                            }
                                        >
                                            <XCircle className="h-3 w-3" />
                                            Absent
                                        </button>

                                        {inp.isAbsent ? (
                                            <div className="flex h-9 w-16 shrink-0 items-center justify-center rounded-xl bg-destructive-soft text-[12px] font-extrabold text-destructive">
                                                ABS
                                            </div>
                                        ) : (
                                            <input
                                                type="number"
                                                min={0}
                                                max={ct.maxMarks}
                                                step={0.5}
                                                value={inp.obtainedMarks}
                                                onChange={e => updateMark(m.userId, 'obtainedMarks', e.target.value)}
                                                placeholder="—"
                                                aria-label={'Marks for ' + m.fullName}
                                                className="h-9 w-16 shrink-0 rounded-xl border border-border bg-background text-center text-[13px] font-semibold tabular-nums text-foreground outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            />
                                        )}

                                        <input
                                            type="text"
                                            value={inp.remarks}
                                            onChange={e => updateMark(m.userId, 'remarks', e.target.value)}
                                            placeholder="Remarks (optional)"
                                            aria-label={'Remarks for ' + m.fullName}
                                            className="h-9 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-[12.5px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-44"
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* -- Published State -- */}
            {isPublished && (
                <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold text-emerald-600">Results Published</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            All enrolled students can now view their marks for this CT.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
