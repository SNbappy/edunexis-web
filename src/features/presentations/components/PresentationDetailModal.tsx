import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, BookOpen, Users, Star, Mic, XCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDateTime } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { PresentationDto } from '@/types/presentation.types'

interface Props {
    isOpen: boolean
    onClose: () => void
    presentation: PresentationDto | null
    onEnterMarks?: (p: PresentationDto) => void
}

export default function PresentationDetailModal({ isOpen, onClose, presentation: p, onEnterMarks }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    if (!p) return null
    const result = p.myResult

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={p.title} size="lg">
            <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={p.status === 'Completed' ? 'success' : p.status === 'Ongoing' ? 'warning' : p.status === 'Cancelled' ? 'danger' : 'default'} dot={p.status === 'Scheduled' || p.status === 'Ongoing'}>
                        {p.status}
                    </Badge>
                    <Badge variant="muted">{p.format}</Badge>
                    {p.topicsAllowed && <Badge variant="muted"><Mic className="w-3 h-3 mr-1 inline" />Topics enabled</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: <Calendar className="w-4 h-4" />, label: 'Date & Time', value: formatDateTime(p.scheduledDate) },
                        { icon: <BookOpen className="w-4 h-4" />, label: 'Total Marks', value: `${p.totalMarks} marks` },
                        ...(p.venue ? [{ icon: <MapPin className="w-4 h-4" />, label: 'Venue', value: p.venue }] : []),
                        ...(p.durationPerGroupMinutes ? [{ icon: <Clock className="w-4 h-4" />, label: 'Duration/Group', value: `${p.durationPerGroupMinutes} min` }] : []),
                    ].map((item) => (
                        <div key={item.label} className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">{item.icon} {item.label}</div>
                            <p className="text-sm font-semibold text-foreground">{item.value}</p>
                        </div>
                    ))}
                </div>

                {p.description && (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details & Guidelines</p>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{p.description}</p>
                        </div>
                    </div>
                )}

                {/* Student result */}
                {!teacher && p.status === 'Completed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border space-y-2 ${result?.isAbsent ? 'bg-destructive/5 border-destructive/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Result</p>
                        {result?.isAbsent ? (
                            <div className="flex items-center gap-2 text-destructive"><XCircle className="w-5 h-5" /><span className="font-semibold">Absent</span></div>
                        ) : result?.obtainedMarks !== null && result?.obtainedMarks !== undefined ? (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Star className="w-5 h-5" />
                                <span className="text-2xl font-bold">{result.obtainedMarks}</span>
                                <span className="text-muted-foreground">/ {p.totalMarks}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Marks not entered yet</p>
                        )}
                        {result?.topic && <p className="text-xs text-violet-500 flex items-center gap-1"><Mic className="w-3.5 h-3.5" /> {result.topic}</p>}
                        {result?.feedback && <p className="text-xs text-muted-foreground">Feedback: {result.feedback}</p>}
                    </motion.div>
                )}

                {teacher && p.status === 'Completed' && onEnterMarks && (
                    <Button className="w-full" onClick={() => { onClose(); onEnterMarks(p) }}>
                        Enter / Edit Marks
                    </Button>
                )}
            </div>
        </Modal>
    )
}
