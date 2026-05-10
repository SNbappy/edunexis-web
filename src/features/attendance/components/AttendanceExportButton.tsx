import InlineSpinner from "@/components/ui/InlineSpinner"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Printer, FileText, ChevronDown, FileSpreadsheet } from "lucide-react"
import { useAttendanceStats } from "../hooks/useAttendanceStats"
import { formatDate } from "@/utils/dateUtils"
import { cn } from "@/utils/cn"
import {
  addPdfLetterhead,
  getCsvLetterheadRows,
  getHtmlLetterhead,
  type LetterheadOpts,
} from "@/utils/exportLetterhead"
import type { AttendanceSessionDto } from "@/types/attendance.types"

interface Props {
  courseId: string
  courseName: string
  courseCode?: string | null
  semester?: string | null
  department?: string | null
  members?: Array<{ userId: string; studentId?: string; fullName: string }>
}

function getStudentStatus(s: AttendanceSessionDto, studentId: string) {
  return s.records.find(r => r.studentId === studentId)?.status?.[0] ?? "U"
}

function buildPrintHTML(letterheadHtml: string, sessions: AttendanceSessionDto[], studentSummaries: any[]) {
  const sessionHeaders = sessions.map((s, i) =>
    `<th style="padding:7px 8px;border:1px solid #ddd;font-size:11px;background:#f0fdfa;white-space:nowrap">
      ${s.topic ? `S${i + 1} - ${s.topic}` : `S${i + 1}<br/><small style="color:#888">${formatDate(s.date)}</small>`}
    </th>`
  ).join("")

  const rows = studentSummaries.map((s, ri) => {
    const statusCells = sessions.map(session => {
      const st = getStudentStatus(session, s.id)
      const color = st === "P" ? "#059669" : st === "A" ? "#dc2626" : "#9ca3af"
      const bg = st === "P" ? "#f0fdf4" : st === "A" ? "#fef2f2" : "#f9fafb"
      return `<td style="text-align:center;color:${color};font-weight:700;font-size:12px;padding:7px 4px;border:1px solid #e5e7eb;background:${bg}">${st}</td>`
    }).join("")
    const pctColor = s.attendancePercent >= 75 ? "#059669" : s.attendancePercent >= 50 ? "#d97706" : "#dc2626"
    const rowBg = ri % 2 === 0 ? "#ffffff" : "#f9fafb"
    return `<tr style="background:${rowBg}">
      <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;font-weight:700;white-space:nowrap;font-family:ui-monospace,monospace">${s.rollNumber}</td>
      <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;white-space:nowrap">${s.studentName}</td>
      ${statusCells}
      <td style="text-align:center;color:#059669;font-weight:700;padding:7px;border:1px solid #e5e7eb;font-size:12px">${s.presentCount}</td>
      <td style="text-align:center;color:#dc2626;font-weight:700;padding:7px;border:1px solid #e5e7eb;font-size:12px">${s.absentCount}</td>
      <td style="text-align:center;color:#9ca3af;font-weight:600;padding:7px;border:1px solid #e5e7eb;font-size:12px">${s.unmarkedCount}</td>
      <td style="text-align:center;color:${pctColor};font-weight:800;padding:7px;border:1px solid #e5e7eb;font-size:13px">${s.attendancePercent}%</td>
    </tr>`
  }).join("")

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111;padding:24px">
      ${letterheadHtml}
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="text-align:left;padding:9px 12px;border:1px solid #ddd;font-size:12px;background:#f0fdfa;min-width:80px">Student ID</th>
            <th style="text-align:left;padding:9px 12px;border:1px solid #ddd;font-size:12px;background:#f0fdfa;min-width:160px">Name</th>
            ${sessionHeaders}
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#dcfce7;color:#059669">P</th>
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#fee2e2;color:#dc2626">A</th>
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#f3f4f6;color:#6b7280">U</th>
            <th style="padding:8px;border:1px solid #ddd;font-size:11px;background:#f5f3ff;color:#7c3aed">%</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`
}

export default function AttendanceExportButton({
  courseId, courseName, courseCode, semester, department, members = [],
}: Props) {
  const { data: stats, isLoading } = useAttendanceStats(courseId)
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  if (isLoading || !stats?.sessions?.length || !stats?.studentSummaries?.length) return null
  const { sessions, studentSummaries } = stats

  // The DTO's `studentId` is actually the user's DB GUID. Real academic roll
  // numbers come from `members[].studentId`. Join them here so exports show
  // the roll teachers actually call out.
  const rollByUserId = new Map(members.map(m => [m.userId, m.studentId ?? ""]))
  const enriched = studentSummaries.map((s: any) => ({
    ...s,
    rollNumber: rollByUserId.get(s.studentId) ?? "",
  }))
  const sorted = [...enriched].sort((a: any, b: any) =>
    (a.rollNumber ?? "").localeCompare(b.rollNumber ?? "", undefined, { numeric: true }) ||
    a.studentName.localeCompare(b.studentName)
  )

  const letterhead: LetterheadOpts = {
    reportTitle: "Attendance report",
    courseCode, courseTitle: courseName, semester, department,
    studentCount: sorted.length,
    sessionCount: sessions.length,
  }

  const exportCSV = () => {
    const headerRows = getCsvLetterheadRows(letterhead)
      .map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))

    const headers = [
      "Student ID", "Name",
      ...sessions.map((s, i) => s.topic ? `S${i + 1}-${s.topic}` : `S${i + 1}-${formatDate(s.date)}`),
      "Present", "Absent", "Unmarked", "Attendance%",
    ]
    const rows = sorted.map((s: any) => [
      `"${s.rollNumber}"`,
      `"${s.studentName}"`,
      ...sessions.map(session => getStudentStatus(session, s.id)),
      s.presentCount, s.absentCount, s.unmarkedCount, `${s.attendancePercent}%`,
    ])
    const csv = [...headerRows, headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Attendance-${courseName}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const exportPDF = async () => {
    setExporting(true)
    setOpen(false)
    try {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ])

      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const startY = await addPdfLetterhead(doc, letterhead, 297)

      const head = [
        ["ID", "Name",
          ...sessions.map((s, i) => s.topic ? `S${i + 1}\n${s.topic}` : `S${i + 1}\n${formatDate(s.date)}`),
          "P", "A", "U", "%"],
      ]
      const body = sorted.map((s: any) => [
        s.rollNumber,
        s.studentName,
        ...sessions.map(session => getStudentStatus(session, s.id)),
        s.presentCount, s.absentCount, s.unmarkedCount, `${s.attendancePercent}%`,
      ])

      autoTable(doc, {
        head, body,
        startY,
        theme: "grid",
        headStyles: { fillColor: [13, 148, 136], textColor: 255, fontSize: 8, fontStyle: "bold", halign: "center" },
        bodyStyles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { halign: "left", fontStyle: "bold", cellWidth: 28 },
          1: { halign: "left", cellWidth: 50 },
        },
        didParseCell: (data) => {
          if (data.section === "body") {
            const val = String(data.cell.raw)
            if (val === "P") { data.cell.styles.textColor = [5, 150, 105]; data.cell.styles.halign = "center" }
            else if (val === "A") { data.cell.styles.textColor = [220, 38, 38]; data.cell.styles.halign = "center" }
            else if (val === "U") { data.cell.styles.textColor = [156, 163, 175]; data.cell.styles.halign = "center" }
            else if (val.endsWith("%")) {
              const n = parseFloat(val)
              data.cell.styles.textColor = n >= 75 ? [5, 150, 105] : n >= 50 ? [217, 119, 6] : [220, 38, 38]
              data.cell.styles.halign = "center"
              data.cell.styles.fontStyle = "bold"
            }
          }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14 },
      })

      doc.save(`Attendance-${courseName}-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (e) {
      console.error("PDF export failed:", e)
      alert("PDF export failed. Try the Print option instead.")
    } finally {
      setExporting(false)
    }
  }

  const handlePrint = () => {
    const w = window.open("", "_blank")
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Attendance - ${courseName}</title>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:system-ui,-apple-system,sans-serif;background:#fff;color:#111}
        @media print{@page{size:A4 landscape;margin:15mm} button{display:none!important}}
      </style>
    </head><body>${buildPrintHTML(getHtmlLetterhead(letterhead), sessions, sorted)}</body></html>`)
    w.document.close()
    setTimeout(() => w.print(), 700)
    setOpen(false)
  }

  const ACTIONS = [
    { label: "Export CSV", icon: FileSpreadsheet, action: exportCSV, desc: "Spreadsheet (.csv)",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" },
    { label: "Export PDF", icon: Download, action: exportPDF, desc: "Styled PDF file",
      iconWrap: "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400" },
    { label: "Print", icon: Printer, action: handlePrint, desc: "Browser print dialog",
      iconWrap: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400" },
  ]

  return (
    <div className={cn("relative", open ? "z-30" : "z-0")}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={exporting}
        className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-card border border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors focus-ring disabled:opacity-60"
      >
        {exporting ? (
          <>
            <InlineSpinner className="text-teal-500" />
            Exporting...
          </>
        ) : (
          <>
            <FileText className="h-3.5 w-3.5" strokeWidth={2.5} />
            Export
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} strokeWidth={2.5} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-11 z-30 w-60 rounded-xl bg-card border border-border shadow-lg overflow-hidden"
            >
              <div className="p-1.5">
                {ACTIONS.map(a => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    className="flex items-center gap-3 w-full px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className={cn("h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0", a.iconWrap)}>
                      <a.icon className="h-4 w-4" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-foreground leading-tight">{a.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}