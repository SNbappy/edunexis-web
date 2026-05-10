import type jsPDF from "jspdf"

export const UNIVERSITY_NAME = "Jashore University of Science and Technology"
export const LOGO_PUBLIC_PATH = "/just-logo.png"

export interface LetterheadOpts {
  reportTitle: string
  courseCode?: string | null
  courseTitle?: string | null
  semester?: string | null
  department?: string | null
  studentCount?: number
  sessionCount?: number
}

let cachedLogo: string | null | undefined

/** Loads the university logo as a data URL once, caches the result. */
export async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogo !== undefined) return cachedLogo
  try {
    const res = await fetch(LOGO_PUBLIC_PATH)
    if (!res.ok) { cachedLogo = null; return null }
    const blob = await res.blob()
    cachedLogo = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader()
      fr.onload = () => resolve(fr.result as string)
      fr.onerror = reject
      fr.readAsDataURL(blob)
    })
    return cachedLogo
  } catch {
    cachedLogo = null
    return null
  }
}

function courseLineText(opts: LetterheadOpts): string {
  const parts: string[] = []
  if (opts.courseCode || opts.courseTitle) {
    parts.push("Course: " + [opts.courseCode, opts.courseTitle].filter(Boolean).join(" - "))
  }
  if (opts.semester) parts.push("Semester: " + opts.semester)
  if (opts.studentCount !== undefined) parts.push("Students: " + opts.studentCount)
  if (opts.sessionCount !== undefined) parts.push("Sessions: " + opts.sessionCount)
  return parts.join("  |  ")
}

/**
 * Adds the university letterhead to a PDF document.
 * Returns the Y position (mm) where the report content can begin.
 * Pass the doc page width in mm; A4 landscape = 297, portrait = 210.
 */
export async function addPdfLetterhead(
  doc: jsPDF,
  opts: LetterheadOpts,
  pageWidthMm: number = 297,
): Promise<number> {
  const leftX = 14
  const rightX = pageWidthMm - 14
  let y = 12

  const logo = await loadLogoDataUrl()
  if (logo) {
    try { doc.addImage(logo, "PNG", leftX, y, 18, 18) } catch { /* image load can fail; ignore */ }
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(31, 31, 31)
  doc.text(UNIVERSITY_NAME, leftX + 22, y + 7)

  if (opts.department) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(75, 85, 99)
    doc.text("Department of " + opts.department, leftX + 22, y + 13)
  }

  y += 22

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  doc.line(leftX, y, rightX, y)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(13, 148, 136)
  doc.text(opts.reportTitle, leftX, y)
  y += 6

  const courseLine = courseLineText(opts)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(75, 85, 99)
  if (courseLine) { doc.text(courseLine, leftX, y); y += 5 }

  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text("Generated: " + new Date().toLocaleString(), leftX, y)
  y += 6

  return y
}

/** HTML letterhead for the print/window.print() flow. */
export function getHtmlLetterhead(opts: LetterheadOpts): string {
  const courseLine = courseLineText(opts).replace(/\|/g, "&middot;")
  const dept = opts.department ? "Department of " + opts.department : ""
  return `
    <div style="display:flex;align-items:center;gap:18px;padding-bottom:14px;border-bottom:2px solid #e5e7eb;margin-bottom:18px">
      <img src="${LOGO_PUBLIC_PATH}" alt="JUST" style="width:62px;height:62px;object-fit:contain;flex-shrink:0" onerror="this.style.display='none'" />
      <div>
        <h1 style="margin:0;font-size:18px;font-weight:700;color:#111">${UNIVERSITY_NAME}</h1>
        ${dept ? `<p style="margin:2px 0 0 0;font-size:12px;color:#6b7280">${dept}</p>` : ""}
      </div>
    </div>
    <div style="margin-bottom:16px">
      <h2 style="margin:0 0 4px 0;font-size:15px;font-weight:600;color:#0d9488">${opts.reportTitle}</h2>
      ${courseLine ? `<p style="margin:0;font-size:12px;color:#374151">${courseLine}</p>` : ""}
      <p style="margin:4px 0 0 0;font-size:11px;color:#6b7280">Generated: ${new Date().toLocaleString()}</p>
    </div>`
}

/** CSV header rows. Each row is a single-cell array (no commas inside the leading lines). */
export function getCsvLetterheadRows(opts: LetterheadOpts): string[][] {
  const rows: string[][] = []
  rows.push([UNIVERSITY_NAME])
  if (opts.department) rows.push(["Department of " + opts.department])
  rows.push([""])
  rows.push([opts.reportTitle])
  if (opts.courseCode || opts.courseTitle) {
    rows.push(["Course: " + [opts.courseCode, opts.courseTitle].filter(Boolean).join(" - ")])
  }
  if (opts.semester) rows.push(["Semester: " + opts.semester])
  if (opts.studentCount !== undefined) rows.push(["Students: " + opts.studentCount])
  if (opts.sessionCount !== undefined) rows.push(["Sessions: " + opts.sessionCount])
  rows.push(["Generated: " + new Date().toLocaleString()])
  rows.push([""])
  return rows
}