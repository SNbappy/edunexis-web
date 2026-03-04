import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import ProgressBar from '@/components/ui/ProgressBar'
import { useCTMarks } from '../hooks/useCTEvents'
import { cn } from '@/utils/cn'
import type { CTEventDto, CTMarkEntry } from '@/types/ct.types'

interface Member {
    userId: string
    fullName: string
    studentId?: string
    profilePhotoUrl?: string
}

interface Props {
    isOpen: boolean
    onClose: () => void
    ct: CTEventDto | null
    members: Member[]
}

export default function CTMarkEntryModal({ isOpen, onClose, ct, members }: Props) {
    const ctId = ct?.id ?? ''
    const { marksData, isLoading, gradeStudents, isSaving } = useCTMarks(ctId)
    const [entries, setEntries] = useState<Record<string, { marks: string; absent: boolean; remarks: string }>>({})

    useEffect(() => {
        if (!isOpen || !ct) return
        const existingMarks = marksData?.marks ?? []
        const init: typeof entries = {}
        members.forEach(m => {
            const existing = existingMarks.find(r => r.studentId === m.userId)
            init[m.userId] = {
                marks:   existing?.obtainedMarks?.toString() ?? '',
                absent:  existing?.isAbsent ?? false,
                remarks: existing?.remarks ?? '',
            }
        })
        setEntries(init)
    }, [isOpen, members, marksData, ct])

    const maxMarks = ct?.maxMarks ?? 0

    const setField = (userId: string, field: 'marks' | 'absent' | 'remarks', value: string | boolean) =>
        setEntries(prev => ({ ...prev, [userId]: { ...prev[userId], [field]: value } }))

    const setAllAbsent = (absent: boolean) =>
        setEntries(prev => {
            const next = { ...prev }
            members.forEach(m => {
                next[m.userId] = { ...next[m.userId], absent, marks: absent ? '' : next[m.userId]?.marks ?? '' }
            })
            return next
        })

    const handleSave = () => {
        const data: CTMarkEntry[] = members.map(m => {
            const e = entries[m.userId] ?? { marks: '', absent: false, remarks: '' }
            return {
                studentId:     m.userId,
                obtainedMarks: e.absent || e.marks === '' ? null : parseFloat(e.marks),
                isAbsent:      e.absent,
                remarks:       e.remarks || undefined,
            }
        })
        gradeStudents({ marks: data }, { onSuccess: onClose })
    }

    const gradedCount = Object.values(entries).filter(e => !e.absent && e.marks !== '').length
    const absentCount = Object.values(entries).filter(e => e.absent).length

    if (!ct) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={"Enter Marks — CT " + ct.ctNumber}
            description={ct.title + " - Total marks: " + ct.maxMarks}
            size="xl"
        >
            <div className="space-y-5">
                {/* Khata Warning */}
                {!ct.khataUploaded && (
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            All 3 khata scripts must be uploaded before saving marks. The server will reject the request otherwise.
                        </p>
                    </div>
                )}

                {/* Summary Bar */}
                <div className="flex items-center gap-4 flex-wrap text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {gradedCount} graded
                    </span>
                    <span className="flex items-center gap-1.5 text-destructive font-medium">
                        <XCircle className="w-4 h-4" /> {absentCount} absent
                    </span>
                    <span className="text-muted-foreground">
                        {members.length - gradedCount - absentCount} pending
                    </span>
                    <div className="ml-auto flex gap-2">
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
                    </div>
                </div>

                {/* Student List */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                        {members.map((member, i) => {
                            const e = entries[member.userId] ?? { marks: '', absent: false, remarks: '' }
                            const marksNum = parseFloat(e.marks)
                            const pct = !isNaN(marksNum) && maxMarks > 0 ? (marksNum / maxMarks) * 100 : 0

                            return (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-xl border transition-all',
                                        e.absent
                                            ? 'border-destructive/30 bg-destructive/5'
                                            : 'border-border bg-card hover:border-primary/20'
                                    )}
                                >
                                    <Avatar src={member.profilePhotoUrl} name={member.fullName} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{member.fullName}</p>
                                        {member.studentId && (
                                            <p className="text-xs text-muted-foreground font-mono">{member.studentId}</p>
                                        )}
                                        {!e.absent && e.marks !== '' && !isNaN(marksNum) && (
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
                                        onClick={() => setField(member.userId, 'absent', !e.absent)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shrink-0',
                                            e.absent
                                                ? 'bg-destructive/10 text-destructive border-destructive/30'
                                                : 'border-border text-muted-foreground hover:border-destructive/30 hover:text-destructive'
                                        )}
                                    >
                                        <XCircle className="w-3.5 h-3.5" /> Absent
                                    </button>

                                    {!e.absent ? (
                                        <input
                                            type="number"
                                            value={e.marks}
                                            onChange={ev => setField(member.userId, 'marks', ev.target.value)}
                                            min={0}
                                            max={maxMarks}
                                            step={0.5}
                                            placeholder="—"
                                            className="w-16 h-9 text-center rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    ) : (
                                        <div className="w-16 h-9 flex items-center justify-center text-destructive text-sm font-bold">
                                            ABS
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </div>
                )}

                {members.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No students enrolled yet.
                    </div>
                )}

                <div className="flex gap-3 pt-2 border-t border-border">
                    <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button
                        className="flex-1"
                        loading={isSaving}
                        onClick={handleSave}
                        disabled={members.length === 0}
                        leftIcon={!isSaving ? <Save className="w-4 h-4" /> : undefined}
                    >
                        Save Marks
                    </Button>
                </div>
            </div>
        </Modal>
    )
}



