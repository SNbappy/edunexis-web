import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Printer, FileText, ChevronDown, FileSpreadsheet } from 'lucide-react'
import { useAttendanceStats } from '../hooks/useAttendanceStats'
import { formatDate } from '@/utils/dateUtils'
import type { AttendanceSessionDto } from '@/types/attendance.types'

interface Props { courseId: string; courseName: string }

function getStudentStatus(s: AttendanceSessionDto, studentId: string) {
  return s.records.find(r => r.studentId === studentId)?.status?.[0] ?? 'U'
}

function buildPrintHTML(courseName: string, sessions: AttendanceSessionDto[], studentSummaries: any[]) {
  const sessionHeaders = sessions.map((s, i) =>
    `<th style="padding:7px 8px;border:1px solid #ddd;font-size:11px;background:#f0f4ff;white-space:nowrap">
      ${s.topic ? `S${i+1} - ${s.topic}` : `S${i+1}<br/><small style="color:#888">${formatDate(s.date)}</small>`}
    </th>`
  ).join('')

  const rows = studentSummaries.map((s, ri) => {
    const statusCells = sessions.map(session => {
      const st = getStudentStatus(session, s.id)
      const color = st === 'P' ? '#059669' : st === 'A' ? '#dc2626' : '#9ca3af'
      const bg    = st === 'P' ? '#f0fdf4'  : st === 'A' ? '#fef2f2'  : '#f9fafb'
      return `<td style="text-align:center;color:${color};font-weight:700;font-size:12px;padding:7px 4px;border:1px solid #e5e7eb;background:${bg}">${st}</td>`
    }).join('')
    const pctColor = s.attendancePercent >= 75 ? '#059669' : s.attendancePercent >= 50 ? '#d97706' : '#dc2626'
    const rowBg = ri % 2 === 0 ? '#ffffff' : '#f9fafb'
    return `<tr style="background:${rowBg}">
      <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;white-space:nowrap">${s.studentName}</td>
      ${statusCells}
      <td style="text-align:center;color:#059669;font-weight:700;padding:7px;border:1px solid #e5e7eb;font-size:12px">${s.presentCount}</td>
      <td style="text-align:center;color:#dc2626;font-weight:700;padding:7px;border:1px solid #e5e7eb;font-size:12px">${s.absentCount}</td>
      <td style="text-align:center;color:#9ca3af;font-weight:600;padding:7px;border:1px solid #e5e7eb;font-size:12px">${s.unmarkedCount}</td>
      <td style="text-align:center;color:${pctColor};font-weight:800;padding:7px;border:1px solid #e5e7eb;font-size:13px">${s.attendancePercent}%</td>
    </tr>`
  }).join('')

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111;padding:24px">
      <div style="margin-bottom:20px;padding-bottom:16px;border-bottom:2px solid #e5e7eb">
        <h1 style="font-size:20px;font-weight:700;margin:0 0 4px 0;color:#111">Attendance Report</h1>
        <h2 style="font-size:15px;font-weight:600;margin:0 0 8px 0;color:#4f46e5">${courseName}</h2>
        <p style="font-size:12px;color:#6b7280;margin:0">
          Generated: ${new Date().toLocaleString()} &nbsp;·&nbsp;
          Total Sessions: ${sessions.length} &nbsp;·&nbsp;
          Total Students: ${studentSummaries.length}
        </p>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="text-align:left;padding:9px 12px;border:1px solid #ddd;font-size:12px;background:#f0f4ff;min-width:160px">Student</th>
            ${sessionHeaders}
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#dcfce7;color:#059669">P</th>
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#fee2e2;color:#dc2626">A</th>
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#f3f4f6;color:#6b7280">U</th>
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#ede9fe;color:#7c3aed">%</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

export default function AttendanceExportButton({ courseId, courseName }: Props) {
  const { data: stats, isLoading } = useAttendanceStats(courseId)
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (isLoading || !stats?.sessions?.length || !stats?.studentSummaries?.length) return null
  const { sessions, studentSummaries } = stats

  const exportCSV = () => {
    const headers = [
      'Student',
      ...sessions.map((s, i) => s.topic ? `S${i+1}-${s.topic}` : `S${i+1}-${formatDate(s.date)}`),
      'Present', 'Absent', 'Unmarked', 'Attendance%'
    ]
    const rows = studentSummaries.map(s => [
      `"${s.studentName}"`,
      ...sessions.map(session => getStudentStatus(session, s.id)),
      s.presentCount, s.absentCount, s.unmarkedCount, `${s.attendancePercent}%`
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Attendance-${courseName}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const exportPDF = async () => {
    setExporting(true)
    setOpen(false)
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // Header
      doc.setFontSize(16)
      doc.setTextColor(31, 31, 31)
      doc.text('Attendance Report', 14, 16)
      doc.setFontSize(11)
      doc.setTextColor(79, 70, 229)
      doc.text(courseName, 14, 23)
      doc.setFontSize(8)
      doc.setTextColor(107, 114, 128)
      doc.text(`Generated: ${new Date().toLocaleString()}  ·  Sessions: ${sessions.length}  ·  Students: ${studentSummaries.length}`, 14, 29)

      // Table data
      const head = [
        ['Student', ...sessions.map((s, i) => s.topic ? `S${i+1}\n${s.topic}` : `S${i+1}\n${formatDate(s.date)}`), 'P', 'A', 'U', '%'],
      ]
      const body = studentSummaries.map(s => [
        s.studentName,
        ...sessions.map(session => getStudentStatus(session, s.id)),
        s.presentCount, s.absentCount, s.unmarkedCount, `${s.attendancePercent}%`
      ])

      autoTable(doc, {
        head,
        body,
        startY: 34,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { halign: 'left', fontStyle: 'bold', cellWidth: 40 },
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const val = String(data.cell.raw)
            if (val === 'P') { data.cell.styles.textColor = [5, 150, 105]; data.cell.styles.halign = 'center' }
            else if (val === 'A') { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.halign = 'center' }
            else if (val === 'U') { data.cell.styles.textColor = [156, 163, 175]; data.cell.styles.halign = 'center' }
            else if (val.endsWith('%')) {
              const n = parseFloat(val)
              data.cell.styles.textColor = n >= 75 ? [5, 150, 105] : n >= 50 ? [217, 119, 6] : [220, 38, 38]
              data.cell.styles.halign = 'center'
              data.cell.styles.fontStyle = 'bold'
            }
          }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 },
      })

      doc.save(`Attendance-${courseName}-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (e) {
      console.error('PDF export failed:', e)
      alert('PDF export failed. Try the Print option instead.')
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Attendance - ${courseName}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#111}
        @media print{@page{size:A4 landscape;margin:15mm} button{display:none!important}}
      </style>
    </head><body>${buildPrintHTML(courseName, sessions, studentSummaries)}</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 600)
    setOpen(false)
  }

  const ACTIONS = [
    { label: 'Export CSV',  icon: FileSpreadsheet, action: exportCSV,    color: '#34d399', desc: '.csv spreadsheet' },
    { label: 'Export PDF',  icon: Download,        action: exportPDF,    color: '#818cf8', desc: 'styled PDF file'  },
    { label: 'Print',       icon: Printer,         action: handlePrint,  color: '#38bdf8', desc: 'browser print'    },
  ]

  return (
    <div className="relative">
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all"
        style={{
          background: open ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
          border: `1px solid rgba(99,102,241,${open ? '0.4' : '0.25'})`,
          color: '#818cf8',
          boxShadow: open ? '0 4px 20px rgba(99,102,241,0.25)' : 'none',
        }}>
        {exporting
          ? <><span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" /> Exporting...</>
          : <><FileText className="w-4 h-4" /> Export <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: open ? 'rotate(180deg)' : 'none' }} /></>
        }
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-30 w-52 rounded-2xl overflow-hidden"
              style={{ background: 'rgba(7,14,33,0.98)', border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(129,140,248,0.05) inset' }}>
              <div className="absolute top-0 left-0 right-0 h-[1px]"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(129,140,248,0.5),transparent)' }} />
              <div className="p-1.5">
                {ACTIONS.map(a => (
                  <motion.button key={a.label} whileHover={{ x: 2 }}
                    onClick={a.action}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors group"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.1)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      style={{ background: `${a.color}15`, border: `1px solid ${a.color}28` }}>
                      <a.icon className="w-4 h-4" style={{ color: a.color }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold" style={{ color: '#e2e8f0' }}>{a.label}</p>
                      <p className="text-[10px]" style={{ color: '#475569' }}>{a.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}