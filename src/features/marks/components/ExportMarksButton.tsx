import { useState } from 'react'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import type { GradebookDto } from '@/types/marks.types'

interface Props {
    gradebook: GradebookDto
    onExportExcel?: () => void
    courseTitle?: string
}

export default function ExportMarksButton({ gradebook, onExportExcel, courseTitle }: Props) {
    const [open, setOpen] = useState(false)

    const exportCSV = () => {
        const { rows, summary } = gradebook
        const aHeaders = summary.columnTotals.assignments.map((a) => `"${a.title} (/${a.totalMarks})"`)
        const ctHeaders = summary.columnTotals.ctEvents.map((ct) => `"${ct.title} (/${ct.totalMarks})"`)
        const pHeaders = summary.columnTotals.presentations.map((p) => `"${p.title} (/${p.totalMarks})"`)

        const headers = [
            'Name', 'Roll No', 'Email',
            ...aHeaders, ...ctHeaders, ...pHeaders,
            'Attendance %', 'Total Obtained', 'Total Possible', 'Percentage', 'Grade',
        ].join(',')

        const dataRows = rows.map((r) => {
            const aCols = summary.columnTotals.assignments.map((a) => {
                const f = r.assignments.find((x) => x.id === a.id)
                return f ? (f.obtainedMarks ?? 'NS') : '—'
            })
            const ctCols = summary.columnTotals.ctEvents.map((ct) => {
                const f = r.ctEvents.find((x) => x.id === ct.id)
                if (!f) return '—'
                return f.isAbsent ? 'ABS' : (f.obtainedMarks ?? '—')
            })
            const pCols = summary.columnTotals.presentations.map((p) => {
                const f = r.presentations.find((x) => x.id === p.id)
                if (!f) return '—'
                return f.isAbsent ? 'ABS' : (f.obtainedMarks ?? '—')
            })
            return [
                `"${r.studentName}"`, `"${r.rollNumber ?? ''}"`, `"${r.studentEmail}"`,
                ...aCols, ...ctCols, ...pCols,
                r.attendancePercent.toFixed(1), r.totalObtained, r.totalPossible, r.percentage.toFixed(2), r.grade,
            ].join(',')
        })

        const csv = [headers, ...dataRows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gradebook-${courseTitle ?? 'course'}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setOpen(false)
    }

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setOpen((o) => !o)}
            >
                Export
            </Button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                    >
                        <button
                            onClick={exportCSV}
                            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                            <FileText className="w-4 h-4 text-emerald-500" /> Export as CSV
                        </button>
                        {onExportExcel && (
                            <button
                                onClick={() => { onExportExcel(); setOpen(false) }}
                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export as Excel
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
