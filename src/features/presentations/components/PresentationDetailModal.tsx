import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Award, ClipboardList, Send, Star, XCircle, FileCheck2 } from "lucide-react"
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
    onUpdateStatus?: (id: string, status: string) => void
}

export default function PresentationDetailModal({
    isOpen, onClose, presentation: p, onEnterMarks, onUpdateStatus,
}: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    if (!p) return null

    const isScheduled = p.status === 'Scheduled'
    const isOngoing   = p.status === 'Ongoing'
    const isCompleted = p.status === 'Completed'
    const isCancelled = p.status === 'Cancelled'
    const result      = p.myResult

    const statusVariant =
        isCompleted ? 'success' :
        isOngoing   ? 'warning' :
        isCancelled ? 'danger'  : 'default'

    const infoCards = [
        { icon: <Calendar className="w-3.5 h-3.5" />, label: "Date & time",    value: p.scheduledDate ? formatDateTime(p.scheduledDate) : 'Not set' },
        { icon: <Award className="w-3.5 h-3.5" />, label: "Total marks",   value: `${p.totalMarks} marks` },
        ...(p.venue                   ? [{ icon: <MapPin className="w-3.5 h-3.5" />, label: "Venue",          value: p.venue }] : []),
        ...(p.durationPerGroupMinutes ? [{ icon: <Clock  className="w-3.5 h-3.5" />, label: "Duration / group", value: `${p.durationPerGroupMinutes} min` }] : []),
    ]

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={p.title} size="lg">
            <div className="space-y-5">
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={statusVariant} dot={isScheduled || isOngoing}>{p.status}</Badge>
                    {p.format && <Badge variant="muted">{p.format}</Badge>}
                    {p.topicsAllowed && <Badge variant="muted"><FileCheck2 className="w-3 h-3 mr-1 inline" />Topic submission enabled</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {infoCards.map((card) => (
                        <div key={card.label} className="p-3 rounded-xl bg-muted/50 border border-border space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                {card.icon} {card.label}
                            </div>
                            <p className="text-sm font-semibold text-foreground">{card.value}</p>
                        </div>
                    ))}
                </div>

                {p.description && (
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details and guidelines</p>
                        <div className="p-4 rounded-xl bg-muted/50 border border-border">
                            <p className="text-sm text-foreground whitespace-pre-wrap">{p.description}</p>
                        </div>
                    </div>
                )}

                {!teacher && isCompleted && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border space-y-2 ${
                            result?.isAbsent
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-emerald-500/5 border-emerald-500/20'
                        }`}
                    >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your result</p>
                        {result?.isAbsent ? (
                            <div className="flex items-center gap-2 text-destructive">
                                <XCircle className="w-5 h-5" /><span className="font-semibold">Absent</span>
                            </div>
                        ) : result?.obtainedMarks != null ? (
                            <div className="flex items-center gap-2 text-emerald-500">
                                <Star className="w-5 h-5" />
                                <span className="text-2xl font-bold">{result.obtainedMarks}</span>
                                <span className="text-muted-foreground text-sm">/ {p.totalMarks}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Marks not entered yet.</p>
                        )}
                        {result?.topic    && <p className="text-xs text-violet-500 flex items-center gap-1"><FileCheck2 className="w-3.5 h-3.5" /> {result.topic}</p>}
                        {result?.feedback && <p className="text-xs text-muted-foreground">Feedback: {result.feedback}</p>}
                    </motion.div>
                )}

                {!teacher && !isCompleted && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground text-center">
                        Results will be visible once the test is completed.
                    </div>
                )}

                {teacher && (
                    <div className="space-y-2 pt-1">
                        {(isCompleted || isOngoing) && onEnterMarks && (
                            <Button
                                variant={isCompleted ? 'primary' : 'secondary'}
                                className="w-full"
                                leftIcon={<ClipboardList className="w-4 h-4" />}
                                onClick={() => { onClose(); onEnterMarks(p) }}
                            >
                                {isCompleted ? 'Enter / edit marks' : 'Enter marks'}
                            </Button>
                        )}
                        {isScheduled && onUpdateStatus && (
                            <Button variant="secondary" className="w-full"
                                leftIcon={<Send className="w-4 h-4" />}
                                onClick={() => { onClose(); onUpdateStatus(p.id, 'Ongoing') }}>
                                Start — mark as ongoing
                            </Button>
                        )}
                        {isOngoing && onUpdateStatus && (
                            <Button className="w-full"
                                leftIcon={<Send className="w-4 h-4" />}
                                onClick={() => { onClose(); onUpdateStatus(p.id, 'Completed') }}>
                                Complete — mark as completed
                            </Button>
                        )}
                        {isCompleted && (
                            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground text-center">
                                Test completed. Students can view their results.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    )
}

