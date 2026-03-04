import { motion } from 'framer-motion'
import { Calendar, BookOpen, Upload, CheckCircle2, ClipboardList, Send, Star, XCircle, FileText } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { useCTMarks } from '../hooks/useCTEvents'
import type { CTEventDto } from '@/types/ct.types'

function StudentMarkSection({ ctEventId, maxMarks }: { ctEventId: string; maxMarks: number }) {
    const { marksData, isLoading } = useCTMarks(ctEventId)
    const myMark = marksData?.marks?.[0]

    if (isLoading) return <div className="h-16 rounded-xl bg-muted animate-pulse" />
    if (!myMark) return (
        <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground text-center">
            Your marks have not been entered yet.
        </div>
    )

    const resultClass = myMark.isAbsent
        ? 'p-4 rounded-xl border space-y-1 bg-destructive/5 border-destructive/20'
        : 'p-4 rounded-xl border space-y-1 bg-emerald-500/5 border-emerald-500/20'

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={resultClass}
        >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Result</p>
            {myMark.isAbsent ? (
                <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Absent</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 text-emerald-500">
                    <Star className="w-5 h-5" />
                    <span className="text-2xl font-bold">{myMark.obtainedMarks}</span>
                    <span className="text-muted-foreground text-sm">/ {maxMarks}</span>
                </div>
            )}
            {myMark.remarks && (
                <p className="text-xs text-muted-foreground pt-1">Remarks: {myMark.remarks}</p>
            )}
        </motion.div>
    )
}

interface Props {
    isOpen: boolean
    onClose: () => void
    ct: CTEventDto | null
    onEnterMarks?: (ct: CTEventDto) => void
    onUploadKhata?: (ct: CTEventDto) => void
    onPublish?: (id: string) => void
}

export default function CTEventDetailModal({ isOpen, onClose, ct, onEnterMarks, onUploadKhata, onPublish }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    if (!ct) return null

    const isDraft     = ct.status === 'Draft'
    const isPublished = ct.status === 'Published'

    const khataSlots = [
        { key: "best",  label: "Best Script",    url: ct.bestScriptUrl    },
        { key: "worst", label: "Worst Script",   url: ct.worstScriptUrl   },
        { key: "avg",   label: "Average Script", url: ct.averageScriptUrl },
    ]

    const khataSlotClass = ct.khataUploaded
        ? 'p-3 rounded-xl border text-center space-y-1.5 border-emerald-500/30 bg-emerald-500/5'
        : 'p-3 rounded-xl border text-center space-y-1.5 border-border bg-muted/30'

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={'CT ' + ct.ctNumber + ' - ' + ct.title}
            size="lg"
        >
            <div className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={isPublished ? 'success' : 'default'}>{ct.status}</Badge>
                    {isDraft && !ct.khataUploaded && <Badge variant="warning">Khata Pending</Badge>}
                    {isDraft && ct.khataUploaded  && <Badge variant="success">Khata Uploaded</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" /> Date Held
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                            {ct.heldOn ? formatDate(ct.heldOn, 'dd MMM yyyy') : 'Not set'}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpen className="w-3.5 h-3.5" /> Total Marks
                        </div>
                        <p className="text-sm font-semibold text-foreground">{ct.maxMarks}</p>
                    </div>
                </div>

                {teacher && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khata Scripts</p>
                        <div className="grid grid-cols-3 gap-2">
                            {khataSlots.map(slot => (
                                <div key={slot.key} className={slot.url ? "p-3 rounded-xl border text-center space-y-1.5 border-emerald-500/30 bg-emerald-500/5" : "p-3 rounded-xl border text-center space-y-1.5 border-border bg-muted/30"}>
                                    {slot.url
                                        ? <a href={slot.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 group">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                                            <p className="text-xs text-muted-foreground">{slot.label}</p>
                                            <p className="text-xs text-primary underline group-hover:opacity-80">View File</p>
                                          </a>
                                        : <>
                                            <FileText className="w-4 h-4 text-muted-foreground mx-auto" />
                                            <p className="text-xs text-muted-foreground">{slot.label}</p>
                                          </>
                                    }
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!teacher && isPublished && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Result</p>
                        <StudentMarkSection ctEventId={ct.id} maxMarks={ct.maxMarks} />
                    </div>
                )}

                {!teacher && isDraft && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground text-center">
                        Results will be visible once the teacher publishes this CT.
                    </div>
                )}

                {teacher && (
                    <div className="space-y-2 pt-1">
                        {isDraft && onUploadKhata && (
                            <Button
                                variant={ct.khataUploaded ? 'secondary' : 'primary'}
                                className="w-full"
                                leftIcon={<Upload className="w-4 h-4" />}
                                onClick={() => { onClose(); onUploadKhata(ct) }}
                            >
                                {ct.khataUploaded ? 'Re-upload Khata' : 'Upload Khata Scripts'}
                            </Button>
                        )}
                        {isDraft && ct.khataUploaded && onEnterMarks && (
                            <Button
                                variant="secondary"
                                className="w-full"
                                leftIcon={<ClipboardList className="w-4 h-4" />}
                                onClick={() => { onClose(); onEnterMarks(ct) }}
                            >
                                Enter / Edit Marks
                            </Button>
                        )}
                        {isDraft && ct.khataUploaded && onPublish && (
                            <Button
                                className="w-full"
                                leftIcon={<Send className="w-4 h-4" />}
                                onClick={() => { onClose(); onPublish(ct.id) }}
                            >
                                Publish Results to Students
                            </Button>
                        )}
                        {isPublished && (
                            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground text-center">
                                This CT is published. Students can view their marks.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    )
}


