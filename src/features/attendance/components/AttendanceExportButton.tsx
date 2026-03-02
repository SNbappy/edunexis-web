import { useState, useRef } from 'react'
import { Download, Printer, FileText } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useAttendanceStats } from '../hooks/useAttendanceStats'
import { formatDate } from '@/utils/dateUtils'
import type { AttendanceSessionDto } from '@/types/attendance.types'

interface Props {
    courseId: string
    courseName: string
}

function getStudentStatus(session: AttendanceSessionDto, studentId: string): string {
    return session.records.find((r) => r.studentId === studentId)?.status?.[0] ?? 'U'
}

function buildPrintHTML(courseName: string, sessions: AttendanceSessionDto[], studentSummaries: any[]) {
    const sessionHeaders = sessions.map((s, i) =>
        `<th>${s.topic ? `S${i + 1} - ${s.topic}` : `S${i + 1}<br/><small>${formatDate(s.date)}</small>`}</th>`
    ).join('')

    const rows = studentSummaries.map((s) => {
        const statusCells = sessions.map((session) => {
            const status = getStudentStatus(session, s.id)
            const color = status === 'P' ? '#10b981' : status === 'A' ? '#ef4444' : '#888'
            return `<td style="text-align:center;color:${color};font-weight:600">${status}</td>`
        }).join('')
        const pctColor = s.attendancePercent >= 75 ? '#10b981' : '#ef4444'
        return `<tr>
            <td>${s.studentName}</td>
            ${statusCells}
            <td style="text-align:center;color:#10b981;font-weight:600">${s.presentCount}</td>
            <td style="text-align:center;color:#ef4444;font-weight:600">${s.absentCount}</td>
            <td style="text-align:center;color:#888">${s.unmarkedCount}</td>
            <td style="text-align:center;color:${pctColor};font-weight:700">${s.attendancePercent}%</td>
        </tr>`
    }).join('')

    return `
        <h1 style="font-size:22px;font-weight:700;margin-bottom:6px">Attendance Report - ${courseName}</h1>
        <p style="color:#666;font-size:13px;margin-bottom:20px">
            Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp;
            Total Sessions: ${sessions.length} &nbsp;|&nbsp;
            Total Students: ${studentSummaries.length}
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
                <tr style="background:#f5f5f5">
                    <th style="text-align:left;padding:8px 12px;border:1px solid #ddd;min-width:160px">Student</th>
                    ${sessionHeaders}
                    <th style="padding:8px;border:1px solid #ddd">P</th>
                    <th style="padding:8px;border:1px solid #ddd">A</th>
                    <th style="padding:8px;border:1px solid #ddd">U</th>
                    <th style="padding:8px;border:1px solid #ddd">%</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `
}

export default function AttendanceExportButton({ courseId, courseName }: Props) {
    const { data: stats, isLoading } = useAttendanceStats(courseId)
    const [isExporting, setIsExporting] = useState(false)

    if (isLoading || !stats || !stats.sessions || !stats.studentSummaries || stats.studentSummaries.length === 0) {
        return null
    }

    const { sessions, studentSummaries } = stats

    const exportToCSV = () => {
        const headers = [
            'Student',
            ...sessions.map((s, i) => s.topic ? `S${i + 1}-${s.topic}` : `S${i + 1}-${formatDate(s.date)}`),
            'Present', 'Absent', 'Unmarked', 'Attendance%'
        ]
        const rows = studentSummaries.map((s) => [
            `"${s.studentName}"`,
            ...sessions.map((session) => getStudentStatus(session, s.id)),
            s.presentCount, s.absentCount, s.unmarkedCount, `${s.attendancePercent}%`
        ])
        const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Attendance-${courseName}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const exportToPDF = async () => {
        setIsExporting(true)
        try {
            const html2pdf = (await import('html2pdf.js')).default
            const el = document.createElement('div')
            el.style.padding = '20px'
            el.style.fontFamily = 'system-ui, sans-serif'
            el.innerHTML = buildPrintHTML(courseName, sessions, studentSummaries)
            document.body.appendChild(el)
            await html2pdf().set({
                margin: 0.5,
                filename: `Attendance-${courseName}-${new Date().toISOString().split('T')[0]}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' },
            }).from(el).save()
            document.body.removeChild(el)
        } finally {
            setIsExporting(false)
        }
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) return
        printWindow.document.write(`
            <html>
            <head>
                <title>Attendance - ${courseName}</title>
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
                    th, td { border: 1px solid #ddd; padding: 7px 10px; }
                    th { background: #f5f5f5; font-weight: 600; text-align: center; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>${buildPrintHTML(courseName, sessions, studentSummaries)}</body>
            </html>
        `)
        printWindow.document.close()
        setTimeout(() => printWindow.print(), 500)
    }

    return (
        <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={exportToCSV} title="Download CSV">
                <FileText className="w-4 h-4" />
                <span className="ml-1.5">CSV</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={exportToPDF} loading={isExporting} title="Download PDF">
                <Download className="w-4 h-4" />
                <span className="ml-1.5">PDF</span>
            </Button>
            <Button size="sm" variant="secondary" onClick={handlePrint} title="Print">
                <Printer className="w-4 h-4" />
                <span className="ml-1.5">Print</span>
            </Button>
        </div>
    )
}