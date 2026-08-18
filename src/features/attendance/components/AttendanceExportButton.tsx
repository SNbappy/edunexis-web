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
  members?: Array<{ userId: string; studentId?: string | null; fullName: string }>
}

/**
 * One student's mark for one session, as a single letter.
 *
 * Takes the *user id*, which on a summary row is `studentId` — there is no
 * `id` field on AttendanceSummaryDto. Passing `s.id` here silently resolved
 * to undefined, matched no record, and fell through to "U", so every cell in
 * every export read "unmarked" regardless of what was actually registered.
 */
function getStudentStatus(s: AttendanceSessionDto, userId: string) {
  return s.records.find(r => r.studentId === userId)?.status?.[0] ?? "U"
}

const STATUS_LEGEND = [
  { key: "P", label: "Present", rgb: [5, 150, 105] as [number, number, number], hex: "#059669", bg: "#ecfdf5" },
  { key: "A", label: "Absent", rgb: [220, 38, 38] as [number, number, number], hex: "#dc2626", bg: "#fef2f2" },
  { key: "U", label: "Not marked", rgb: [148, 163, 184] as [number, number, number], hex: "#94a3b8", bg: "#f8fafc" },
]

/** Colour ramp shared by the PDF and the print sheet, matching the app. */
function percentRgb(n: number): [number, number, number] {
  if (n >= 75) return [5, 150, 105]
  if (n >= 50) return [217, 119, 6]
  return [220, 38, 38]
}
function percentHex(n: number): string {
  return n >= 75 ? "#059669" : n >= 50 ? "#d97706" : "#dc2626"
}

/**
 * Print sheet.
 *
 * Deliberately mirrors the PDF: same key, same status tinting, same three
 * summary cards under the register, same footer. A teacher printing rather than
 * downloading should hand in a document that looks like the same report, not a
 * second design.
 */
function buildPrintHTML(
  letterheadHtml: string,
  sessions: AttendanceSessionDto[],
  studentSummaries: any[],
  meta: { courseCode?: string | null; courseName: string },
) {
  const TEAL = "#0f766e"

  const legend = STATUS_LEGEND.map(l =>
    `<span style="display:inline-flex;align-items:center;gap:6px;margin-right:18px">
       <span style="width:9px;height:9px;border-radius:50%;background:${l.hex};display:inline-block"></span>
       <strong style="color:${l.hex};font-size:11px">${l.key}</strong>
       <span style="color:#475569;font-size:11px">= ${l.label}</span>
     </span>`
  ).join("")

  const sessionHeaders = sessions.map((s, i) =>
    `<th style="padding:6px 4px;border:1px solid ${TEAL};font-size:10px;background:${TEAL};color:#fff;white-space:nowrap;font-weight:700">
       S${i + 1}<br/><span style="font-weight:400;opacity:.85">${formatDate(s.date, "dd MMM")}</span>
     </th>`
  ).join("")

  const rows = studentSummaries.map((s, ri) => {
    const statusCells = sessions.map(session => {
      const st = getStudentStatus(session, s.studentId)
      const l = STATUS_LEGEND.find(x => x.key === st)!
      return `<td style="text-align:center;color:${l.hex};font-weight:700;font-size:11.5px;padding:6px 4px;border:1px solid #e2e8f0;background:${l.bg}">${st}</td>`
    }).join("")
    const rowBg = ri % 2 === 0 ? "#ffffff" : "#f8fafc"
    return `<tr style="background:${rowBg}">
      <td style="padding:6px 8px;border:1px solid #e2e8f0;font-size:10px;color:#94a3b8;text-align:center">${ri + 1}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:11.5px;font-weight:700;white-space:nowrap;font-family:ui-monospace,monospace">${s.rollNumber || "—"}</td>
      <td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:11.5px;white-space:nowrap">${s.studentName}</td>
      ${statusCells}
      <td style="text-align:center;color:#059669;font-weight:700;padding:6px;border:1px solid #e2e8f0;font-size:11.5px">${s.presentCount}</td>
      <td style="text-align:center;color:#dc2626;font-weight:700;padding:6px;border:1px solid #e2e8f0;font-size:11.5px">${s.absentCount}</td>
      <td style="text-align:center;color:#94a3b8;font-weight:600;padding:6px;border:1px solid #e2e8f0;font-size:11.5px">${s.unmarkedCount}</td>
      <td style="text-align:center;color:${percentHex(s.attendancePercent)};font-weight:800;padding:6px;border:1px solid #e2e8f0;font-size:12px">${s.attendancePercent}%</td>
    </tr>`
  }).join("")

  const classAvg = Math.round(
    studentSummaries.reduce((t: number, s: any) => t + s.attendancePercent, 0) /
    (studentSummaries.length || 1),
  )
  const card = (label: string, value: string, color: string) =>
    `<div style="flex:1;border:1px solid #e2e8f0;background:#f8fafc;border-radius:6px;padding:10px 14px">
       <div style="font-size:9px;letter-spacing:.06em;color:#64748b;font-weight:600">${label.toUpperCase()}</div>
       <div style="font-size:18px;font-weight:800;color:${color};margin-top:3px">${value}</div>
     </div>`

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#0f172a;padding:22px">
      ${letterheadHtml}

      <div style="margin:0 0 10px 0;display:flex;align-items:center;flex-wrap:wrap">
        <strong style="font-size:10px;letter-spacing:.06em;color:#64748b;margin-right:14px">KEY</strong>
        ${legend}
        <span style="color:#94a3b8;font-size:10.5px">Percentage: green &ge; 75%, amber 50–74%, red &lt; 50%</span>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="padding:6px 4px;border:1px solid ${TEAL};font-size:10px;background:${TEAL};color:#fff">#</th>
            <th style="text-align:left;padding:6px 10px;border:1px solid ${TEAL};font-size:10.5px;background:${TEAL};color:#fff;min-width:70px">Student ID</th>
            <th style="text-align:left;padding:6px 10px;border:1px solid ${TEAL};font-size:10.5px;background:${TEAL};color:#fff;min-width:150px">Name</th>
            ${sessionHeaders}
            <th style="padding:6px;border:1px solid ${TEAL};font-size:10.5px;background:${TEAL};color:#fff">P</th>
            <th style="padding:6px;border:1px solid ${TEAL};font-size:10.5px;background:${TEAL};color:#fff">A</th>
            <th style="padding:6px;border:1px solid ${TEAL};font-size:10.5px;background:${TEAL};color:#fff">U</th>
            <th style="padding:6px;border:1px solid ${TEAL};font-size:10.5px;background:${TEAL};color:#fff">%</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display:flex;gap:10px;margin-top:14px;page-break-inside:avoid">
        ${card("Students", String(studentSummaries.length), "#1f2937")}
        ${card("Sessions", String(sessions.length), "#1f2937")}
        ${card("Class average", `${classAvg}%`, percentHex(classAvg))}
      </div>

      <div style="margin-top:14px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#94a3b8;font-size:10px">
        <span>${[meta.courseCode, meta.courseName].filter(Boolean).join(" · ")} · Attendance report</span>
        <span>Generated ${new Date().toLocaleString()}</span>
      </div>
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
    // Everything goes through this so a topic containing a comma, a quote or a
    // newline cannot shift every following column. The old version quoted only
    // the two name fields and emitted the rest raw.
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const line = (cells: unknown[]) => cells.map(q).join(",")

    const classAvg = Math.round(
      sorted.reduce((t: number, s: any) => t + s.attendancePercent, 0) / (sorted.length || 1),
    )

    const out: string[] = []

    // Letterhead
    out.push(...getCsvLetterheadRows(letterhead).map(r => line(r)))

    // Key, so the single letters in the grid are readable on their own
    out.push(line(["Key"]))
    STATUS_LEGEND.forEach(l => out.push(line([l.key, l.label])))
    out.push(line([]))

    // Session reference \u2014 number, date and topic, so the S1..Sn columns below
    // stay narrow without losing what each one was.
    out.push(line(["Session", "Date", "Topic"]))
    sessions.forEach((s, i) =>
      out.push(line([`S${i + 1}`, formatDate(s.date, "dd MMM yyyy"), s.topic ?? ""])),
    )
    out.push(line([]))

    // Register
    out.push(line([
      "#", "Student ID", "Name",
      ...sessions.map((_, i) => `S${i + 1}`),
      "Present", "Absent", "Not marked", "Attendance %",
    ]))
    sorted.forEach((s: any, i: number) =>
      out.push(line([
        i + 1,
        s.rollNumber,
        s.studentName,
        ...sessions.map(session => getStudentStatus(session, s.studentId)),
        s.presentCount, s.absentCount, s.unmarkedCount,
        // A bare number, not "83%" \u2014 a percent sign makes Excel treat the whole
        // column as text and refuse to average it.
        s.attendancePercent,
      ])),
    )

    // Summary, matching the PDF and print sheet
    out.push(line([]))
    out.push(line(["Summary"]))
    out.push(line(["Students", sorted.length]))
    out.push(line(["Sessions", sessions.length]))
    out.push(line(["Class average %", classAvg]))

    const blob = new Blob(["\uFEFF" + out.join("\r\n")], { type: "text/csv;charset=utf-8;" })
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
      const PAGE_W = 297
      const PAGE_H = 210
      const M = 14
      let y = await addPdfLetterhead(doc, letterhead, PAGE_W)

      const classAvg = Math.round(
        sorted.reduce((t: number, s: any) => t + s.attendancePercent, 0) / (sorted.length || 1),
      )

      /* ── Legend ───────────────────────────────────────────────────
         The table is a grid of single letters; without this the reader
         has to infer what P/A/U mean. */
      doc.setFont("helvetica", "bold")
      doc.setFontSize(7.5)
      doc.setTextColor(100, 116, 139)
      doc.text("KEY", M, y + 3)
      let lx = M + 12
      STATUS_LEGEND.forEach(l => {
        doc.setFillColor(...l.rgb)
        doc.circle(lx + 1.4, y + 1.9, 1.4, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7.5)
        doc.setTextColor(...l.rgb)
        doc.text(l.key, lx + 4.6, y + 3)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(71, 85, 105)
        doc.text(`= ${l.label}`, lx + 8.4, y + 3)
        lx += 8.4 + doc.getTextWidth(`= ${l.label}`) + 8
      })
      doc.setFont("helvetica", "normal")
      doc.setFontSize(7.5)
      doc.setTextColor(148, 163, 184)
      doc.text("Percentage column: green >= 75%, amber 50-74%, red < 50%", lx + 2, y + 3)
      y += 8

      const head = [
        ["#", "Student ID", "Name",
          ...sessions.map((s, i) =>
            `S${i + 1}\n${formatDate(s.date, "dd MMM")}`),
          "P", "A", "U", "%"],
      ]
      const body = sorted.map((s: any, i: number) => [
        String(i + 1),
        s.rollNumber || "—",
        s.studentName,
        ...sessions.map(session => getStudentStatus(session, s.studentId)),
        s.presentCount, s.absentCount, s.unmarkedCount, `${s.attendancePercent}%`,
      ])

      const firstSessionCol = 3
      const lastSessionCol = firstSessionCol + sessions.length - 1

      autoTable(doc, {
        head, body,
        startY: y,
        theme: "grid",
        styles: {
          font: "helvetica",
          lineColor: [226, 232, 240],
          lineWidth: 0.15,
          textColor: [31, 41, 55],
          valign: "middle",
        },
        headStyles: {
          fillColor: [15, 118, 110],
          textColor: 255,
          fontSize: 7.5,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          cellPadding: { top: 2.4, bottom: 2.4, left: 1, right: 1 },
          lineColor: [13, 148, 136],
        },
        bodyStyles: { fontSize: 8, cellPadding: { top: 2, bottom: 2, left: 2, right: 2 } },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { halign: "center", cellWidth: 8, textColor: [148, 163, 184], fontSize: 7 },
          1: { halign: "left", cellWidth: 22, fontStyle: "bold" },
          2: { halign: "left", cellWidth: 42 },
        },
        didParseCell: (data) => {
          const col = data.column.index
          // Status grid: tint the whole cell, not just the glyph, so the
          // pattern of absences is visible when scanning a column.
          if (data.section === "body" && col >= firstSessionCol && col <= lastSessionCol) {
            const v = String(data.cell.raw)
            const l = STATUS_LEGEND.find(x => x.key === v)
            data.cell.styles.halign = "center"
            data.cell.styles.fontStyle = "bold"
            if (l) {
              data.cell.styles.textColor = l.rgb
              data.cell.styles.fillColor =
                v === "P" ? [236, 253, 245] : v === "A" ? [254, 242, 242] : [248, 250, 252]
            }
          }
          if (data.section === "body" && col > lastSessionCol) {
            data.cell.styles.halign = "center"
            const v = String(data.cell.raw)
            if (v.endsWith("%")) {
              data.cell.styles.textColor = percentRgb(parseFloat(v))
              data.cell.styles.fontStyle = "bold"
              data.cell.styles.fontSize = 8.5
            }
          }
        },
        margin: { left: M, right: M, bottom: 16 },
      })

      /* ── Summary, under the register ──────────────────────────────
         Placed after the table rather than before it: the register is
         the report, and totals read as a conclusion drawn from the
         rows above rather than a dashboard the reader must scroll
         past to reach the data. */
      let sy = (doc as any).lastAutoTable?.finalY ?? y
      const cards: Array<[string, string, [number, number, number]]> = [
        ["Students", String(sorted.length), [31, 41, 55]],
        ["Sessions", String(sessions.length), [31, 41, 55]],
        ["Class average", `${classAvg}%`, percentRgb(classAvg)],
      ]
      const cardW = (PAGE_W - M * 2 - 6 * 2) / 3
      const cardH = 16

      // Start a page if the band would collide with the footer rule.
      if (sy + 8 + cardH > PAGE_H - 16) {
        doc.addPage()
        sy = 18
      } else {
        sy += 8
      }

      cards.forEach(([label, value, rgb], i) => {
        const x = M + i * (cardW + 6)
        doc.setFillColor(248, 250, 252)
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.2)
        doc.roundedRect(x, sy, cardW, cardH, 1.6, 1.6, "FD")
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(100, 116, 139)
        doc.text(label.toUpperCase(), x + 4, sy + 5.6)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.setTextColor(...rgb)
        doc.text(value, x + 4, sy + 12.6)
      })

      /* ── Footer on every page ─────────────────────────────────── */
      const pages = doc.getNumberOfPages()
      for (let p = 1; p <= pages; p++) {
        doc.setPage(p)
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.2)
        doc.line(M, PAGE_H - 11, PAGE_W - M, PAGE_H - 11)
        doc.setFont("helvetica", "normal")
        doc.setFontSize(7.5)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `${[courseCode, courseName].filter(Boolean).join(" · ")}  ·  Attendance report`,
          M, PAGE_H - 7,
        )
        doc.text(`Page ${p} of ${pages}`, PAGE_W - M, PAGE_H - 7, { align: "right" })
      }

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
    </head><body>${buildPrintHTML(getHtmlLetterhead(letterhead), sessions, sorted, { courseCode, courseName })}</body></html>`)
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