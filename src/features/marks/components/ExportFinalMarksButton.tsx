import { useRef, useState } from 'react'
import { Download, FileText, FileImage, Printer } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'
import type { FinalMarkDto, FormulaDto } from '@/types/marks.types'

interface Props {
    marks: FinalMarkDto[]
    formula: FormulaDto
    courseTitle?: string
}

export default function ExportFinalMarksButton({ marks, formula, courseTitle }: Props) {
    const [open, setOpen] = useState(false)
    const title = courseTitle ?? 'Course'
    const date  = new Date().toISOString().split('T')[0]

    const getBreakdown = (json: string) => {
        try { return JSON.parse(json) as Record<string, { earned: number }> }
        catch { return {} }
    }

    // ── CSV ──────────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const compHeaders = formula.components.map(c => `"${c.componentType} (/${c.maxMarks})"`)
        const headers = ['Student', ...compHeaders, `"Total (/${formula.totalMarks})"`].join(',')

        const rows = marks.map(m => {
            const bd = getBreakdown(m.breakdownJson)
            const cols = formula.components.map(c =>
                bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(2) : '—'
            )
            return [`"${m.studentName}"`, ...cols, m.finalMark.toFixed(2)].join(',')
        })

        const csv  = [headers, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href     = url
        a.download = `marks-${title}-${date}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setOpen(false)
    }

    // ── PDF ──────────────────────────────────────────────────────────────────
    const exportPDF = async () => {
        setOpen(false)
        const html2pdf = (await import('html2pdf.js')).default

        const compCols = formula.components.map(c =>
            `<th style="padding:6px 10px;text-align:center;font-size:11px;border-bottom:1px solid #e2e8f0;white-space:nowrap">
                ${c.componentType}<br/><span style="font-weight:400;color:#64748b">/${c.maxMarks}</span>
             </th>`
        ).join('')

        const dataRows = marks.map((m, i) => {
            const bd   = getBreakdown(m.breakdownJson)
            const cols = formula.components.map(c =>
                `<td style="padding:6px 10px;text-align:center;font-size:12px">${
                    bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(2) : '—'
                }</td>`
            ).join('')
            const bg = i % 2 === 0 ? '#f8fafc' : '#fff'
            return `<tr style="background:${bg}">
                <td style="padding:6px 12px;font-size:12px;font-weight:500">${m.studentName}</td>
                ${cols}
                <td style="padding:6px 10px;text-align:center;font-weight:700;font-size:12px">${m.finalMark.toFixed(2)}</td>
            </tr>`
        }).join('')

        const el = document.createElement('div')
        el.innerHTML = `
            <div style="font-family:Inter,sans-serif;padding:32px;color:#0f172a">
                <h2 style="margin:0 0 4px;font-size:18px;font-weight:700">${title} — Final Marks</h2>
                <p style="margin:0 0 20px;font-size:12px;color:#64748b">Generated on ${new Date().toLocaleDateString()}</p>
                <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
                    <thead style="background:#f1f5f9">
                        <tr>
                            <th style="padding:8px 12px;text-align:left;font-size:11px;border-bottom:1px solid #e2e8f0">Student</th>
                            ${compCols}
                            <th style="padding:6px 10px;text-align:center;font-size:11px;border-bottom:1px solid #e2e8f0">
                                Total<br/><span style="font-weight:400;color:#64748b">/${formula.totalMarks}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>${dataRows}</tbody>
                </table>
                <p style="margin-top:16px;font-size:10px;color:#94a3b8;text-align:right">EduNexis · ${date}</p>
            </div>`

        document.body.appendChild(el)
        await html2pdf().set({
            margin:      [8, 8, 8, 8],
            filename:    `marks-${title}-${date}.pdf`,
            image:       { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF:       { unit: 'mm', format: 'a4', orientation: 'landscape' },
        }).from(el).save()
        document.body.removeChild(el)
    }

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = () => {
        setOpen(false)
        const compCols = formula.components.map(c =>
            `<th>${c.componentType} (/${c.maxMarks})</th>`
        ).join('')

        const dataRows = marks.map((m, i) => {
            const bd   = getBreakdown(m.breakdownJson)
            const cols = formula.components.map(c =>
                `<td>${bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(2) : '—'}</td>`
            ).join('')
            return `<tr class="${i % 2 === 0 ? 'alt' : ''}">
                <td><strong>${m.studentName}</strong></td>
                ${cols}
                <td><strong>${m.finalMark.toFixed(2)}</strong></td>
            </tr>`
        }).join('')

        const win = window.open('', '_blank')!
        win.document.write(`<!DOCTYPE html><html><head><title>${title} — Marks</title>
        <style>
            body { font-family: Inter, sans-serif; padding: 24px; color: #0f172a; }
            h2   { margin: 0 0 4px; font-size: 18px; }
            p.sub{ margin: 0 0 16px; font-size: 12px; color: #64748b; }
            table{ width: 100%; border-collapse: collapse; font-size: 12px; }
            th   { background: #f1f5f9; padding: 7px 10px; text-align: center; border: 1px solid #e2e8f0; font-size: 11px; }
            th:first-child { text-align: left; }
            td   { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: center; }
            td:first-child { text-align: left; }
            tr.alt td { background: #f8fafc; }
            .footer { margin-top: 16px; font-size: 10px; color: #94a3b8; text-align: right; }
            @media print { body { padding: 0; } }
        </style></head><body>
            <h2>${title} — Final Marks</h2>
            <p class="sub">Generated on ${new Date().toLocaleDateString()} · Total: ${formula.totalMarks} marks</p>
            <table>
                <thead><tr><th>Student</th>${compCols}<th>Total (/${formula.totalMarks})</th></tr></thead>
                <tbody>${dataRows}</tbody>
            </table>
            <div class="footer">EduNexis · ${date}</div>
        </body></html>`)
        win.document.close()
        win.focus()
        setTimeout(() => { win.print(); win.close() }, 400)
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
