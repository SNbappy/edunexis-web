import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, Upload, CheckCircle2, FileText, X,
    Save, Send, Calendar, BookOpen, Star, XCircle
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import BrandLoader from '@/components/ui/BrandLoader'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { useCTEvents, useCTMarks } from '../hooks/useCTEvents'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'

interface MarkInput { obtainedMarks: string; isAbsent: boolean; remarks: string }

const KHATA_SLOTS = [
    { key: 'best'  as const, label: 'Best Script',    description: 'Highest scorer answer sheet', formKey: 'bestCopy'  },
    { key: 'worst' as const, label: 'Worst Script',   description: 'Lowest scorer answer sheet',  formKey: 'worstCopy' },
    { key: 'avg'   as const, label: 'Average Script', description: 'Mid-range answer sheet',       formKey: 'avgCopy'   },
]

const KHATA_VIEW = [
    { label: 'Best Script',    urlKey: 'bestScriptUrl'    as const },
    { label: 'Worst Script',   urlKey: 'worstScriptUrl'   as const },
    { label: 'Average Script', urlKey: 'averageScriptUrl' as const },
]

export default function CTEventPage() {
    const { courseId, ctId } = useParams<{ courseId: string; ctId: string }>()
    const navigate  = useNavigate()
    const { user }  = useAuthStore()
    const teacher   = isTeacher(user?.role ?? 'Student')

    const { ctEvents, isLoading: eventsLoading, publishCT, unpublishCT } = useCTEvents(courseId!)
    const { marksData, isLoading: marksLoading, uploadKhata, isUploading, gradeStudents, isSaving } = useCTMarks(ctId!)
    const { members } = useAttendance(courseId!)

    const ct       = ctEvents.find(e => e.id === ctId)
    const students = members.filter(m => !isTeacher(m.role ?? ''))

    const [files, setFiles]           = useState<{ best?: File; worst?: File; avg?: File }>({})
    const [markInputs, setMarkInputs] = useState<Record<string, MarkInput>>({})
    const [initialized, setInit]      = useState(false)

    const bestRef  = useRef<HTMLInputElement>(null)
    const worstRef = useRef<HTMLInputElement>(null)
    const avgRef   = useRef<HTMLInputElement>(null)
    const fileRefs = { best: bestRef, worst: worstRef, avg: avgRef }

    useEffect(() => {
        if (initialized || students.length === 0) return
        const inputs: Record<string, MarkInput> = {}
        students.forEach(m => {
            const ex = (marksData?.marks ?? []).find((mk: any) => mk.studentId === m.userId)
            inputs[m.userId] = {
                obtainedMarks: ex ? String(ex.obtainedMarks ?? '') : '',
                isAbsent:      ex?.isAbsent ?? false,
                remarks:       ex?.remarks  ?? '',
            }
        })
        setMarkInputs(inputs)
        if (marksData !== undefined) setInit(true)
    }, [marksData, students, initialized])

    const updateMark = (uid: string, field: keyof MarkInput, val: string | boolean) =>
        setMarkInputs(prev => ({ ...prev, [uid]: { ...prev[uid], [field]: val } }))

    const handleUpload = () => {
        if (!files.best && !files.worst && !files.avg) return
        const fd = new FormData()
        if (files.best)  fd.append('bestCopy',  files.best)
        if (files.worst) fd.append('worstCopy', files.worst)
        if (files.avg)   fd.append('avgCopy',   files.avg)
        uploadKhata(fd, { onSuccess: () => setFiles({}) })
    }

    const handleSave = () => {
        const entries = Object.entries(markInputs).map(([studentId, inp]) => ({
            studentId,
            obtainedMarks: inp.isAbsent ? null : (parseFloat(inp.obtainedMarks) || 0),
            isAbsent:      inp.isAbsent,
            remarks: inp.remarks || undefined,
        }))
        gradeStudents({ marks: entries })
    }

    const backUrl = '/courses/' + courseId + '/ct'

    if (eventsLoading) return (
        <BrandLoader variant="page" />

    )

    if (!ct) return (
        <div className="p-6 text-center text-muted-foreground">CT event not found.</div>
    )

    const isDraft      = ct.status === 'Draft'
    const isPublished  = ct.status === 'Published'
    const allFiles = !!files.best || !!files.worst || !!files.avg
    const pageTitle    = 'CT ' + ct.ctNumber + ' - ' + ct.title
    const khataColor   = ct.khataUploaded ? 'font-semibold text-emerald-500' : 'font-semibold text-amber-500'
    const khataLabel   = ct.khataUploaded ? 'Uploaded' : 'Pending'
    const studentCount = students.length + ' students - Max: ' + ct.maxMarks + ' marks'

    /* --- Student View --- */
    if (!teacher) {
        const myMark = (marksData?.marks ?? []).find((m: any) => m.studentId === user?.id)
        const resultClass = myMark?.isAbsent
            ? 'p-6 rounded-2xl border bg-destructive/5 border-destructive/20 space-y-3'
            : 'p-6 rounded-2xl border bg-emerald-500/5 border-emerald-500/20 space-y-3'

        return (
            <div className="max-w-2xl mx-auto space-y-6 pb-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(backUrl)}
                        className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-foreground truncate">{pageTitle}</h1>
                        <p className="text-sm text-muted-foreground">Class Test Result</p>
                    </div>
                    <Badge variant={isPublished ? 'success' : 'default'}>{ct.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                {isDraft ? (
                    <div className="p-6 rounded-2xl bg-muted/50 border border-border text-center text-sm text-muted-foreground">
                        Results will be visible once the teacher publishes this CT.
                    </div>
                ) : marksLoading ? (
                    <div className="h-24 rounded-2xl bg-muted animate-pulse" />
                ) : !myMark ? (
                    <div className="p-6 rounded-2xl bg-muted/50 border border-border text-center text-sm text-muted-foreground">
                        Your marks have not been entered yet.
                    </div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={resultClass}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Result</p>
                        {myMark.isAbsent ? (
                            <div className="flex items-center gap-3 text-destructive">
                                <XCircle className="w-8 h-8" />
                                <div>
                                    <p className="text-lg font-bold">Absent</p>
                                    <p className="text-sm text-muted-foreground">You were marked absent for this CT</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Star className="w-8 h-8 text-emerald-500" />
                                <div>
                                    <p className="text-3xl font-bold text-emerald-500">
                                        {myMark.obtainedMarks}
                                        <span className="text-base text-muted-foreground font-normal"> / {ct.maxMarks}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">Obtained marks</p>
                                </div>
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
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-10">

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
                        <Button size="sm" leftIcon={<Send className="w-4 h-4" />} onClick={() => publishCT(ct.id)}>
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
                    <p className={khataColor}>{khataLabel}</p>
                </div>
            </div>

            {/* -- Khata Section -- */}
            {isDraft && (
                <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-foreground">Khata Scripts</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {ct.khataUploaded ? 'Scripts uploaded \u2014 re-upload to replace' : 'Upload all 3 scripts to enable mark entry'}
                            </p>
                        </div>
                        {ct.khataUploaded && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                                <CheckCircle2 className="w-4 h-4" /> All uploaded
                            </div>
                        )}
                    </div>

                    {/* View uploaded files */}
                    {ct.khataUploaded && (
                        <div className="grid grid-cols-3 gap-3">
                            {KHATA_VIEW.map(s => (
                                <a key={s.label} href={ct[s.urlKey] ?? '#'} target="_blank" rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <p className="text-xs font-medium text-foreground">{s.label}</p>
                                    <p className="text-xs text-primary underline group-hover:opacity-80">View File</p>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Upload new files */}
                    <div className="grid grid-cols-3 gap-3">
                        {KHATA_SLOTS.map(slot => {
                            const file = files[slot.key]
                            const ref  = fileRefs[slot.key]
                            const cardCls = file
                                ? 'p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2 transition-all'
                                : 'p-4 rounded-xl border border-dashed border-border space-y-2 transition-all hover:border-primary/40 hover:bg-muted/30'
                            return (
                                <div key={slot.key} className={cardCls}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{slot.label}</p>
                                            <p className="text-xs text-muted-foreground">{slot.description}</p>
                                        </div>
                                        {file && (
                                            <button
                                                onClick={() => {
                                                    setFiles(prev => { const n = {...prev}; delete n[slot.key]; return n })
                                                    if (ref.current) ref.current.value = ''
                                                }}
                                                className="p-0.5 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    {file ? (
                                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{file.name}</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => ref.current?.click()}
                                            className="w-full text-xs py-2 rounded-lg text-primary hover:bg-primary/10 transition-colors border border-dashed border-primary/30 font-medium"
                                        >
                                            Choose File
                                        </button>
                                    )}
                                    <input
                                        ref={ref}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        className="hidden"
                                        onChange={e => {
                                            const f = e.target.files?.[0]
                                            if (f) setFiles(prev => ({ ...prev, [slot.key]: f }))
                                        }}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {allFiles && (
                        <Button
                            leftIcon={<Upload className="w-4 h-4" />}
                            loading={isUploading}
                            onClick={handleUpload}
                            className="w-full"
                        >
                            Upload Selected Khata Scripts
                        </Button>
                    )}
                </div>
            )}

            {/* -- Mark Entry -- */}
            {isDraft && ct.khataUploaded && (
                <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-foreground">Mark Entry</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">{studentCount}</p>
                        </div>
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

                    {marksLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
                        </div>
                    ) : students.length === 0 ? (
                        <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground text-center">
                            No students enrolled yet.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <div className="col-span-4">Student</div>
                                <div className="col-span-2 text-center">Absent</div>
                                <div className="col-span-3">Marks</div>
                                <div className="col-span-3">Remarks</div>
                            </div>
                            {students.map((m, idx) => {
                                const inp    = markInputs[m.userId] ?? { obtainedMarks: '', isAbsent: false, remarks: '' }
                                const rowCls = idx % 2 === 0
                                    ? 'grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-muted/30'
                                    : 'grid grid-cols-12 gap-2 items-center p-3 rounded-xl'
                                return (
                                    <div key={m.userId} className={rowCls}>
                                        <div className="col-span-4 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{m.fullName}</p>
                                            {m.studentId && <p className="text-xs text-muted-foreground">{m.studentId}</p>}
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={inp.isAbsent}
                                                onChange={e => updateMark(m.userId, 'isAbsent', e.target.checked)}
                                                className="w-4 h-4 accent-destructive cursor-pointer"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max={ct.maxMarks}
                                                disabled={inp.isAbsent}
                                                value={inp.obtainedMarks}
                                                onChange={e => updateMark(m.userId, 'obtainedMarks', e.target.value)}
                                                placeholder="0"
                                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                value={inp.remarks}
                                                onChange={e => updateMark(m.userId, 'remarks', e.target.value)}
                                                placeholder="Optional"
                                                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
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






