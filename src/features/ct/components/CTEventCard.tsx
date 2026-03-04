import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, BookOpen, Upload, CheckCircle2, Edit2, Trash2, Send, MoreVertical, Eye, EyeOff } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/utils/dateUtils'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import type { CTEventDto } from '@/types/ct.types'

interface Props {
    ct: CTEventDto
    index?: number
    onView: (ct: CTEventDto) => void
    onDelete?: (ct: CTEventDto) => void
    onPublish?: (id: string) => void
    onUnpublish?: (id: string) => void
    onUploadKhata?: (ct: CTEventDto) => void
    onEnterMarks?: (ct: CTEventDto) => void
}

export default function CTEventCard({ ct, index = 0, onView, onDelete, onPublish, onUnpublish, onUploadKhata, onEnterMarks }: Props) {
    const { user } = useAuthStore()
    const teacher     = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)
    const isDraft     = ct.status === 'Draft'
    const isPublished = ct.status === 'Published'

    const khataClass = ct.khataUploaded
        ? 'flex items-center gap-1 font-medium text-emerald-500'
        : 'flex items-center gap-1 font-medium text-amber-500'

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            style={{ position: 'relative', zIndex: menuOpen ? 50 : 0 }}
            className="group glass-card rounded-2xl p-5 hover:border-primary/20 hover:shadow-card-hover transition-all cursor-pointer"
            onClick={() => onView(ct)}
        >
            <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
                    <p className="text-[10px] text-primary font-semibold uppercase tracking-wider">CT</p>
                    <p className="text-2xl font-bold text-primary leading-tight">{ct.ctNumber}</p>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                            {ct.title}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={isPublished ? 'success' : 'default'}>{ct.status}</Badge>
                            {teacher && (
                                <div className="relative" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setMenuOpen(o => !o)}
                                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {menuOpen && (
                                        <>
                                            <div className="fixed inset-0" style={{ zIndex: 40 }} onClick={() => setMenuOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                style={{ zIndex: 51 }}
                                                className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl shadow-xl border border-border overflow-hidden"
                                            >
                                                <button onClick={() => { onView(ct); setMenuOpen(false) }}
                                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                    <Eye className="w-4 h-4 text-primary" /> View Details
                                                </button>

                                                {onUploadKhata && (
                                                    <button onClick={() => { onUploadKhata(ct); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                        <Upload className="w-4 h-4 text-primary" />
                                                        {ct.khataUploaded ? 'Re-upload Khata' : 'Upload Khata'}
                                                    </button>
                                                )}

                                                {ct.khataUploaded && onEnterMarks && (
                                                    <button onClick={() => { onEnterMarks(ct); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                                        <Edit2 className="w-4 h-4 text-amber-500" />
                                                        {isPublished ? 'View / Edit Marks' : 'Enter Marks'}
                                                    </button>
                                                )}

                                                {isDraft && ct.khataUploaded && onPublish && (
                                                    <button onClick={() => { onPublish(ct.id); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-500 hover:bg-emerald-500/10 transition-colors">
                                                        <Send className="w-4 h-4" /> Publish Results
                                                    </button>
                                                )}

                                                {isPublished && onUnpublish && (
                                                    <button onClick={() => { onUnpublish(ct.id); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-amber-500 hover:bg-amber-500/10 transition-colors">
                                                        <EyeOff className="w-4 h-4" /> Unpublish
                                                    </button>
                                                )}

                                                <div className="border-t border-border mx-2" />

                                                {onDelete && (
                                                    <button onClick={() => { onDelete(ct); setMenuOpen(false) }}
                                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                )}
                                            </motion.div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                        {ct.heldOn ? (
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(ct.heldOn, 'dd MMM yyyy')}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-amber-500/80">
                                <Calendar className="w-3 h-3" /> Date not set
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> {ct.maxMarks} marks
                        </span>
                        {teacher && (
                            <span className={khataClass}>
                                {ct.khataUploaded
                                    ? <><CheckCircle2 className="w-3 h-3" /> Khata uploaded</>
                                    : <><Upload className="w-3 h-3" /> Khata pending</>
                                }
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
