import { useState } from 'react'
import { Download, FileText, FileImage, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import type { FinalMarkDto, FormulaDto } from '@/types/marks.types'
import {
    getCsvLetterheadRows,
    getHtmlLetterhead,
    type LetterheadOpts,
} from '@/utils/exportLetterhead'

interface Props {
    marks: FinalMarkDto[]
    formula: FormulaDto
    courseTitle?: string
    courseCode?: string | null
    semester?: string | null
    department?: string | null
    members?: Array<{ userId: string; studentId?: string; fullName: string }>
}

export default function ExportFinalMarksButton({
    marks, formula, courseTitle, courseCode, semester, department, members = [],
}: Props) {
    const [open, setOpen] = useState(false)
    const title = courseTitle ?? 'Course'
    const date = new Date().toISOString().split('T')[0]

    const getBreakdown = (json: string) => {
        try { return JSON.parse(json) as Record<string, { earned: number }> }
        catch { return {} }
    }

    // Marks DTO uses studentId = user GUID. Real roll numbers live on members[].studentId.
    const rollByUserId = new Map(members.map(m => [m.userId, m.studentId ?? '']))
    const enriched = marks.map(m => ({ ...m, rollNumber: rollByUserId.get(m.studentId) ?? '' }))
    const sorted = [...enriched].sort((a, b) =>
        (a.rollNumber ?? '').localeCompare(b.rollNumber ?? '', undefined, { numeric: true }) ||
        a.studentName.localeCompare(b.studentName)
    )

    const letterhead: LetterheadOpts = {
        reportTitle: 'Final Marks',
        courseCode, courseTitle: title, semester, department,
        studentCount: sorted.length,
    }

    // ── CSV ──────────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const compHeaders = formula.components.map(c => `"${c.componentType} (/${c.maxMarks})"`)
        const headers = ['Student ID', 'Name', ...compHeaders, `"Total (/${formula.totalMarks})"`].join(',')

        const rows = sorted.map(m => {
            const bd = getBreakdown(m.breakdownJson)
            const cols = formula.components.map(c =>
                bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(2) : '\u2014'
            )
            return [`"${m.rollNumber}"`, `"${m.studentName}"`, ...cols, m.finalMark.toFixed(2)].join(',')
        })

        const headerRows = getCsvLetterheadRows(letterhead)
            .map(r => r.map(c => '"' + c.replace(/"/g, '""') + '"').join(','))

        const csv = [...headerRows, headers, ...rows].join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `marks-${title}-${date}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setOpen(false)
    }

    // Shared HTML body (used by PDF and Print)
    const buildBodyHtml = () => {
        const compCols = formula.components.map(c =>
            `<th style="padding:6px 10px;text-align:center;font-size:11px;border:1px solid #e2e8f0;background:#f1f5f9;white-space:nowrap">
                ${c.componentType}<br/><span style="font-weight:400;color:#64748b">/${c.maxMarks}</span>
             </th>`
        ).join('')

        const dataRows = sorted.map((m, i) => {
            const bd = getBreakdown(m.breakdownJson)
            const cols = formula.components.map(c =>
                `<td style="padding:6px 10px;text-align:center;font-size:12px;border:1px solid #e2e8f0">${
                    bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(2) : '\u2014'
                }</td>`
            ).join('')
            const bg = i % 2 === 0 ? '#f8fafc' : '#fff'
            return `<tr style="background:${bg}">
                <td style="padding:6px 12px;font-size:12px;font-weight:700;font-family:ui-monospace,monospace;border:1px solid #e2e8f0">${m.rollNumber}</td>
                <td style="padding:6px 12px;font-size:12px;border:1px solid #e2e8f0">${m.studentName}</td>
                ${cols}
                <td style="padding:6px 10px;text-align:center;font-weight:700;font-size:12px;border:1px solid #e2e8f0">${m.finalMark.toFixed(2)}</td>
            </tr>`
        }).join('')

        return `
            <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
                <thead>
                    <tr>
                        <th style="padding:8px 12px;text-align:left;font-size:11px;background:#f1f5f9;border:1px solid #e2e8f0">Student ID</th>
                        <th style="padding:8px 12px;text-align:left;font-size:11px;background:#f1f5f9;border:1px solid #e2e8f0">Name</th>
                        ${compCols}
                        <th style="padding:6px 10px;text-align:center;font-size:11px;background:#f1f5f9;border:1px solid #e2e8f0">
                            Total<br/><span style="font-weight:400;color:#64748b">/${formula.totalMarks}</span>
                        </th>
                    </tr>
                </thead>
                <tbody>${dataRows}</tbody>
            </table>`
    }

    // ── PDF (jsPDF + autoTable; reliable, no html2canvas image issues) ──────
    const exportPDF = async () => {
        setOpen(false)
        try {
            const [{ default: jsPDF }, { default: autoTable }, { addPdfLetterhead }] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable'),
                import('@/utils/exportLetterhead'),
            ])

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
            const startY = await addPdfLetterhead(doc, letterhead, 297)

            const head = [[
                'Student ID',
                'Name',
                ...formula.components.map(c => `${c.componentType}\n/${c.maxMarks}`),
                `Total\n/${formula.totalMarks}`,
            ]]
            const body = sorted.map(m => {
                const bd = getBreakdown(m.breakdownJson)
                const cols = formula.components.map(c =>
                    bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(2) : '\u2014'
                )
                return [m.rollNumber, m.studentName, ...cols, m.finalMark.toFixed(2)]
            })

            autoTable(doc, {
                head, body, startY,
                theme: 'grid',
                headStyles: { fillColor: [13, 148, 136], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'center' },
                bodyStyles: { fontSize: 9, cellPadding: 2.2 },
                columnStyles: {
                    0: { halign: 'left', fontStyle: 'bold', cellWidth: 28 },
                    1: { halign: 'left', cellWidth: 60 },
                },
                didParseCell: (data) => {
                    if (data.section === 'body' && data.column.index >= 2) {
                        data.cell.styles.halign = 'center'
                        if (data.column.index === head[0].length - 1) {
                            data.cell.styles.fontStyle = 'bold'
                        }
                    }
                },
                alternateRowStyles: { fillColor: [248, 250, 252] },
                margin: { left: 14, right: 14 },
            })

            doc.save(`marks-${title}-${date}.pdf`)
        } catch (e) {
            console.error('PDF export failed:', e)
            alert('PDF export failed. Try the Print option instead.')
        }
    }

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = () => {
        setOpen(false)
        const win = window.open('', '_blank')
        if (!win) return
        win.document.write(`<!DOCTYPE html><html><head><title>${title} - Marks</title>
        <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:Inter,system-ui,sans-serif;padding:24px;color:#0f172a}
            @media print { body{padding:0} @page { size: A4 landscape; margin: 12mm } }
        </style></head><body>
            ${getHtmlLetterhead(letterhead)}
            ${buildBodyHtml()}
        </body></html>`)
        win.document.close()
        win.focus()
        setTimeout(() => { win.print() }, 600)
    }

    return (
        <div className="relative">
            <Button size="sm" variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => setOpen(o => !o)}>
                Export
            </Button>
            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                        >
                            <button onClick={exportCSV}
                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors">
                                <FileText className="w-4 h-4 text-emerald-500" /> Export as CSV
                            </button>
                            <button onClick={exportPDF}
                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors">
                                <FileImage className="w-4 h-4 text-rose-500" /> Export as PDF
                            </button>
                            <button onClick={handlePrint}
                                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors">
                                <Printer className="w-4 h-4 text-blue-500" /> Print
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}