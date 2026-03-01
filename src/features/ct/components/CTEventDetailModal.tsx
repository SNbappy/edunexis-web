import { motion } from 'framer-motion'
import {
    Clock, MapPin, BookOpen, Calendar,
    ClipboardCheck, Star, XCircle,
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDateTime } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CTEventDto } from '@/types/ct.types'

interface Props {
    isOpen: boolean
    onClose: () => void
    ct: CTEventDto | null
    onEnterMarks?: (ct: CTEventDto) => void
}

export default function CTEventDetailModal({ isOpen, onClose, ct, onEnterMarks }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    if (!ct) return null

    const result = ct.myResult

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={ct.title} size="lg">
            <div className="space-y-5">
                {/* Status */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant={
                        ct.status === 'Completed' ? 'success' :
                            ct.status === 'Ongoing' ? 'warning' :
                                ct.status === 'Cancelled' ? 'danger' : 'default'
                    } dot={ct.status === 'Scheduled' || ct.status === 'Ongoing'}>
                        {ct.status}
                    </Badge>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: <Calendar className="w-4 h-4" />, label: 'Date & Time', value: formatDateTime(ct.scheduledDate) },
                        { icon: <Clock className="w-4 h-4" />, label: 'Duration', value: `${ct.durationMinutes} minutes` },
                        { icon: <BookOpen className="w-4 h-4" />, label: 'Total Marks', value: `${ct.totalMarks} marks` },
                        ...(ct.venue ? [{ icon: <MapPin className="w-4 h-4" />, label: 'Venue', value: ct.venue }] : []),
                    ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                {item.icon} {item.label}
                            </div>
                            <p className="text-sm font-semibold text-foreground">{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Syllabus */}
                {ct.syllabus && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Syllabus</p>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{ct.syllabus}</p>
                        </div>
                    </div>
                )}

                {ct.description && (
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</p>
                        <p className="text-sm text-foreground">{ct.description}</p>
                    </div>
                )}

                {/* Student result */}
                {!teacher && ct.status === 'Completed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border space-y-2 ${result?.isAbsent
                                ? 'bg-destructive/5 border-destructive/20'
                                : result?.obtainedMarks !== null
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-muted/50 border-border'
                            }`}
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Result</p>
                        {result?.isAbsent ? (
                            <div className="flex items-center gap-2 text-destructive">
                                <XCircle className="w-5 h-5" />
                                <span className="font-semibold">Absent</span>
                            </div>
                        ) : result?.obtainedMarks !== null && result?.obtainedMarks !== undefined ? (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Star className="w-5 h-5" />
                                <span className="text-2xl font-bold">{result.obtainedMarks}</span>
                                <span className="text-muted-foreground">/ {ct.totalMarks}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Marks not entered yet</p>
                        )}
                        {result?.remarks && (
                            <p className="text-xs text-muted-foreground">Remarks: {result.remarks}</p>
                        )}
                    </motion.div>
                )}

                {/* Teacher action */}
                {teacher && ct.status === 'Completed' && onEnterMarks && (
                    <Button
                        className="w-full"
                        leftIcon={<ClipboardCheck className="w-4 h-4" />}
                        onClick={() => { onClose(); onEnterMarks(ct) }}
                    >
                        Enter / Edit Marks
                    </Button>
                )}
            </div>
        </Modal>
    )
}
