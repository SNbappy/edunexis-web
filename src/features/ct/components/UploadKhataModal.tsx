import { useState, useRef } from 'react'
import { FileText, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useCTMarks } from '../hooks/useCTEvents'
import { cn } from '@/utils/cn'
import type { CTEventDto } from '@/types/ct.types'

interface Member { userId: string; fullName: string; studentId?: string }

interface Props {
    isOpen: boolean
    onClose: () => void
    ct: CTEventDto | null
    members: Member[]
}

interface KhataSlot {
    key: 'best' | 'worst' | 'avg'
    label: string
    description: string
    fileKey: 'bestCopy' | 'worstCopy' | 'avgCopy'
    studentKey: 'bestStudentId' | 'worstStudentId' | 'avgStudentId'
}

const SLOTS: KhataSlot[] = [
    { key: 'best',  label: 'Best Script',    description: 'Highest scorer answer sheet',   fileKey: 'bestCopy',  studentKey: 'bestStudentId'  },
    { key: 'worst', label: 'Worst Script',   description: 'Lowest scorer answer sheet',    fileKey: 'worstCopy', studentKey: 'worstStudentId' },
    { key: 'avg',   label: 'Average Script', description: 'Mid-range scorer answer sheet', fileKey: 'avgCopy',   studentKey: 'avgStudentId'   },
]

export default function UploadKhataModal({ isOpen, onClose, ct, members }: Props) {
    const ctId = ct?.id ?? ''
    const { uploadKhata, isUploading } = useCTMarks(ctId)

    const [files, setFiles]       = useState<Partial<Record<KhataSlot['fileKey'], File>>>({})
    const [students, setStudents] = useState<Partial<Record<KhataSlot['studentKey'], string>>>({})

    const bestRef  = useRef<HTMLInputElement>(null)
    const worstRef = useRef<HTMLInputElement>(null)
    const avgRef   = useRef<HTMLInputElement>(null)

    const refMap = { bestCopy: bestRef, worstCopy: worstRef, avgCopy: avgRef }

    const handleClose = () => { setFiles({}); setStudents({}); onClose() }

    const handleFileChange = (fileKey: KhataSlot['fileKey'], file: File | undefined) => {
        setFiles(prev => {
            const next = { ...prev }
            if (file) next[fileKey] = file
            else delete next[fileKey]
            return next
        })
    }

    const handleSubmit = () => {
        if (!files.bestCopy || !files.worstCopy || !files.avgCopy) return
        const fd = new FormData()
        fd.append('bestCopy',  files.bestCopy)
        fd.append('worstCopy', files.worstCopy)
        fd.append('avgCopy',   files.avgCopy)
        if (students.bestStudentId)  fd.append('bestStudentId',  students.bestStudentId)
        if (students.worstStudentId) fd.append('worstStudentId', students.worstStudentId)
        if (students.avgStudentId)   fd.append('avgStudentId',   students.avgStudentId)
        uploadKhata(fd, { onSuccess: handleClose })
    }

    const fileCount      = Object.keys(files).length
    const allSelected    = fileCount === 3
    const remaining      = 3 - fileCount
    const btnLabel       = allSelected
        ? 'Upload All 3 Khata'
        : 'Select ' + remaining + (remaining === 1 ? ' More File' : ' More Files')

    if (!ct) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={'Upload Khata - CT ' + ct.ctNumber}
            description="Upload all 3 answer script copies before entering marks"
            size="lg"
        >
            <div className="space-y-4">
                {SLOTS.map(slot => {
                    const file     = files[slot.fileKey]
                    const inputRef = refMap[slot.fileKey]
                    return (
                        <div
                            key={slot.key}
                            className={cn(
                                'p-4 rounded-xl border space-y-3 transition-all',
                                file ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{slot.label}</p>
                                    <p className="text-xs text-muted-foreground">{slot.description}</p>
                                </div>
                                {file ? (
                                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                                        <FileText className="w-4 h-4 shrink-0" />
                                        <span className="max-w-[8rem] truncate">{file.name}</span>
                                        <button
                                            onClick={() => {
                                                handleFileChange(slot.fileKey, undefined)
                                                const ref = refMap[slot.fileKey]
                                                if (ref.current) ref.current.value = ''
                                            }}
                                            className="p-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => inputRef.current?.click()}
                                        className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-all font-medium"
                                    >
                                        Choose File
                                    </button>
                                )}
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    className="hidden"
                                    onChange={e => handleFileChange(slot.fileKey, e.target.files?.[0])}
                                />
                            </div>

                            {members.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-muted-foreground shrink-0">Student (optional):</p>
                                    <select
                                        value={students[slot.studentKey] ?? ''}
                                        onChange={e => setStudents(prev => ({ ...prev, [slot.studentKey]: e.target.value || undefined }))}
                                        className="flex-1 h-8 rounded-lg border border-border bg-card text-foreground text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    >
                                        <option value="">Select student (optional)</option>
                                        {members.map(m => (
                                            <option key={m.userId} value={m.userId}>
                                                {m.fullName}{m.studentId ? ' (' + m.studentId + ')' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )
                })}

                <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl px-4 py-3 border border-border">
                    Accepted formats: PDF, JPG, PNG, DOC, DOCX. Upload all 3 before entering marks.
                </p>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        className="flex-1"
                        loading={isUploading}
                        disabled={!allSelected}
                        onClick={handleSubmit}
                    >
                        {btnLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
