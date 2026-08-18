import { useState, useEffect, useMemo } from "react"
import { RefreshCw, Send, Lock, EyeOff } from "lucide-react"
import toast from "react-hot-toast"
import { useMarks } from "../hooks/useMarks"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import MyGradesView from "./MyGradesView"
import ExportFinalMarksButton from "./ExportFinalMarksButton"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Skeleton from "@/components/ui/Skeleton"
import EmptyState from "@/components/ui/EmptyState"
import { Switch, FIELD_BASE, fieldState } from "@/components/ui/field"
import { DistributionBar } from "@/components/ui/charts"
import { ICON_STROKE, SURFACE, TEXT } from "@/components/ui/appTokens"
import { cn } from "@/utils/cn"
import type { FormulaComponentType, SelectionRule } from "@/types/marks.types"
import { useCourseReadOnly } from "@/features/courses/context/CourseReadOnly"

interface MarksTabProps { courseId: string; courseTitle?: string; courseCode?: string; semester?: string; department?: string }
interface ComponentConfig { enabled: boolean; selectionRule: SelectionRule; maxMarks: string }
interface FormulaState {
  ct: ComponentConfig; assignment: ComponentConfig
  presentation: ComponentConfig; attendance: ComponentConfig
}

const DEFAULT_FORMULA: FormulaState = {
  ct: { enabled: false, selectionRule: "Best3", maxMarks: "10" },
  assignment: { enabled: false, selectionRule: "Best2", maxMarks: "10" },
  presentation: { enabled: false, selectionRule: "All", maxMarks: "10" },
  attendance: { enabled: false, selectionRule: "All", maxMarks: "8" },
}

interface ComponentMeta {
  key: keyof FormulaState
  label: string
  abbr: string
  type: FormulaComponentType
  showRule: boolean
}

/**
 * The four components no longer carry a colour each.
 *
 * They previously got teal / violet / amber / emerald, with a tinted row, a
 * tinted badge and a matching toggle — four hues that encode nothing beyond
 * "this is the second row". The abbreviation already identifies the component,
 * and removing the tints frees colour to mean one thing on this screen: a
 * failing total.
 */
const COMPONENTS: ComponentMeta[] = [
  { key: "ct",           label: "Class tests",  abbr: "CT",  type: "CT",           showRule: true  },
  { key: "assignment",   label: "Assignments",  abbr: "ASN", type: "Assignment",   showRule: true  },
  { key: "presentation", label: "Other tests",  abbr: "OT",  type: "Presentation", showRule: true  },
  { key: "attendance",   label: "Attendance",   abbr: "ATT", type: "Attendance",   showRule: false },
]

const RULES: { value: SelectionRule; label: string }[] = [
  { value: "Best1", label: "Best 1" },
  { value: "Best2", label: "Best 2" },
  { value: "Best3", label: "Best 3" },
  { value: "All",   label: "Average of all" },
]

export default function MarksTab({ courseId, courseTitle, courseCode, semester, department }: MarksTabProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const readOnly = useCourseReadOnly()

  const {
    formula, isFormulaLoading,
    marks, isMarksLoading,
    saveFormula, isSaving,
    calculate, isCalculating,
    publish, isPublishing,
    unpublish, isUnpublishing,
  } = useMarks(courseId)
  const { members } = useAttendance(courseId)

  const [config, setConfig] = useState<FormulaState>(DEFAULT_FORMULA)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!formula || loaded) return
    const next = { ...DEFAULT_FORMULA }
    formula.components.forEach((c: any) => {
      const key = (c.componentType === "CT" ? "ct"
        : c.componentType === "Assignment" ? "assignment"
          : c.componentType === "Presentation" ? "presentation"
            : "attendance") as keyof FormulaState
      next[key] = { enabled: true, selectionRule: c.selectionRule, maxMarks: String(c.maxMarks) }
    })
    setConfig(next)
    setLoaded(true)
  }, [formula, loaded])

  /** Student IDs by user id, so the results table can key on the roll number. */
  const studentIdOf = useMemo(() => {
    const map: Record<string, string> = {}
    ;(members ?? []).forEach((m: any) => {
      if (m.studentId) map[m.userId] = m.studentId
    })
    return map
  }, [members])

  /**
   * Gradebook order.
   *
   * By student ID, matching the roster and the attendance sheet. The API
   * returns calculation order, so the same class appeared in a different order
   * on every screen — and a mark sheet that does not run in roll order is
   * almost unusable for transcribing to the university's own forms.
   */
  /**
   * Grade bands for the distribution bar. Thresholds follow GRADE_SCALE's
   * shape rather than even quarters, so the bands mean something to a
   * teacher: a fail, a pass, a good result, a top result.
   */
  const distribution = useMemo(() => {
    const total = formula?.totalMarks ?? 0
    const pct = (m: any) => (total > 0 ? (m.finalMark / total) * 100 : 0)
    const band = (lo: number, hi: number) =>
      marks.filter((m: any) => pct(m) >= lo && pct(m) < hi).length

    return [
      { label: "Below 40", count: band(0, 40),   className: "bg-destructive" },
      { label: "40–59",    count: band(40, 60),  className: "bg-warning" },
      { label: "60–79",    count: band(60, 80),  className: "bg-primary/60" },
      { label: "80+",      count: band(80, 1e9), className: "bg-success" },
    ]
  }, [marks, formula])

  const sortedMarks = useMemo(
    () =>
      [...marks].sort((a: any, b: any) =>
        (studentIdOf[a.studentId] ?? "").localeCompare(
          studentIdOf[b.studentId] ?? "", undefined, { numeric: true },
        ) || (a.studentName ?? "").localeCompare(b.studentName ?? ""),
      ),
    [marks, studentIdOf],
  )

  if (!teacher) return <MyGradesView courseId={courseId} />

  const enabled = COMPONENTS.filter(c => config[c.key].enabled)
  const totalMarks = enabled.reduce((s, c) => s + (parseFloat(config[c.key].maxMarks) || 0), 0)
  const isPublished = marks.length > 0 && marks.every((m: any) => m.isPublished)
  const hasMarks = marks.length > 0

  const isFormulaDirty = useMemo(() => {
    if (!formula) return true
    for (const comp of COMPONENTS) {
      const cfg = config[comp.key]
      const savedComp = formula.components?.find((c: any) => c.componentType === comp.type)
      if (cfg.enabled !== !!savedComp) return true
      if (cfg.enabled && savedComp) {
        if (comp.showRule && cfg.selectionRule !== savedComp.selectionRule) return true
        if ((parseFloat(cfg.maxMarks) || 0) !== Number(savedComp.maxMarks)) return true
      }
    }
    return false
  }, [config, formula])

  const handleSave = () => {
    if (enabled.length === 0) {
      toast.error("Enable at least one component.")
      return
    }
    saveFormula({
      totalMarks,
      components: enabled.map(c => ({
        componentType: c.type,
        selectionRule: config[c.key].selectionRule,
        maxMarks: parseFloat(config[c.key].maxMarks) || 0,
        weightPercent: totalMarks > 0 ? ((parseFloat(config[c.key].maxMarks) || 0) / totalMarks) * 100 : 0,
      })),
    })
  }

  const setComp = (key: keyof FormulaState, patch: Partial<ComponentConfig>) =>
    setConfig(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  return (
    <div className="space-y-4">
      {/* Toolbar. No "Marks & grading" heading — the tab bar above already
          names the section; this row carries state and actions only. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {isPublished
            ? <>Results published to <span className="font-semibold text-foreground">{marks.length}</span> students</>
            : formula
              ? hasMarks
                ? <>
                    <span className="font-semibold text-foreground">{marks.length}</span> calculated ·
                    {" "}not published, so students cannot see them yet
                  </>
                : <>Formula saved · not calculated yet</>
              : <>No grading formula set yet</>}
        </p>

        {/* The gradebook stays fully readable on an archived course; only
            publishing it is frozen. */}
        <div className="flex flex-wrap items-center gap-2">
          {hasMarks && !isPublished && !readOnly && (
            <Button onClick={() => publish()} loading={isPublishing} leftIcon={<Send strokeWidth={ICON_STROKE} />}>
              Publish results
            </Button>
          )}
          {hasMarks && isPublished && !readOnly && (
            <Button variant="secondary" onClick={() => unpublish()} loading={isUnpublishing} leftIcon={<EyeOff strokeWidth={ICON_STROKE} />}>
              Unpublish
            </Button>
          )}
          {/* Exporting is not the same act as publishing.
              This used to require publishing first, which forced a teacher to
              show every student their result before they could so much as print
              a copy for the department. Unpublished exports are watermarked
              DRAFT so one cannot be mistaken for a final result. */}
          {hasMarks && formula && (
            <ExportFinalMarksButton
              marks={marks} formula={formula}
              courseTitle={courseTitle} courseCode={courseCode}
              semester={semester} department={department}
              members={members} isPublished={isPublished}
            />
          )}
        </div>
      </div>

      {/* ── Grading formula ───────────────────────────────────────── */}
      <section className={cn(SURFACE.card, "overflow-hidden")}>
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h3 className={TEXT.section}>Grading formula</h3>
            <p className={cn(TEXT.muted, "mt-0.5")}>
              {formula
                ? "Saving recalculates every student's total straight away."
                : "Define how final marks are calculated."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formula && !isFormulaLoading && <Badge variant="success" size="sm">Saved</Badge>}
            <Badge variant={totalMarks > 0 ? "primary" : "neutral"} size="sm">
              {totalMarks} total marks
            </Badge>
          </div>
        </header>

        {isPublished && (
          <div className="mx-4 mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2.5 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span><strong>Final Marks Published:</strong> Grading formula is locked. Click <strong>Unpublish</strong> in the toolbar above if you need to modify the formula or recalculate marks.</span>
          </div>
        )}

        <ul className="divide-y divide-border">
          {COMPONENTS.map(comp => {
            const cfg = config[comp.key]
            /* Weight is what a formula is actually about, so it is shown
               alongside the raw marks rather than left for the reader to work
               out from four numbers and a total. */
            const weight = totalMarks > 0 && cfg.enabled
              ? Math.round(((parseFloat(cfg.maxMarks) || 0) / totalMarks) * 100)
              : 0

            return (
              <li key={comp.key} className={cn("px-4 py-3", !cfg.enabled && "bg-muted/30")}>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span
                    className={cn(
                      "inline-flex h-6 w-11 shrink-0 items-center justify-center rounded-md border font-mono text-[10.5px] font-bold",
                      cfg.enabled
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {comp.abbr}
                  </span>

                  <span className={cn(
                    "min-w-0 flex-1 text-[13.5px] font-semibold",
                    cfg.enabled ? "text-foreground" : "text-muted-foreground",
                  )}>
                    {comp.label}
                  </span>

                  {cfg.enabled && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      {comp.showRule && (
                        <label className="flex items-center gap-1.5">
                          <span className="text-[12px] text-muted-foreground">Count</span>
                          <select
                            value={cfg.selectionRule}
                            disabled={readOnly || isPublished}
                            onChange={e => setComp(comp.key, { selectionRule: e.target.value as SelectionRule })}
                            aria-label={`How many ${comp.label.toLowerCase()} to count`}
                            style={{ colorScheme: "light dark" }}
                            className={cn(FIELD_BASE, fieldState(false), "h-8 cursor-pointer px-2 text-[12.5px] disabled:opacity-60 disabled:cursor-not-allowed")}
                          >
                            {RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                        </label>
                      )}

                      <label className="flex items-center gap-1.5">
                        <span className="text-[12px] text-muted-foreground">Worth</span>
                        <input
                          type="number"
                          min="1"
                          value={cfg.maxMarks}
                          disabled={readOnly || isPublished}
                          onChange={e => setComp(comp.key, { maxMarks: e.target.value })}
                          aria-label={`Marks for ${comp.label.toLowerCase()}`}
                          className={cn(FIELD_BASE, fieldState(false), "h-8 w-16 px-2 text-center text-[12.5px] disabled:opacity-60 disabled:cursor-not-allowed")}
                        />
                        <span className="w-16 text-[12px] tabular-nums text-muted-foreground">
                          {weight > 0 ? `= ${weight}%` : "marks"}
                        </span>
                      </label>
                    </div>
                  )}

                  <Switch
                    checked={cfg.enabled}
                    onChange={next => setComp(comp.key, { enabled: next })}
                    disabled={readOnly || isPublished}
                    label={`${cfg.enabled ? "Disable" : "Enable"} ${comp.label}`}
                  />
                </div>
              </li>
            )
          })}
        </ul>

        {/* No save row on an archived course — the formula is still shown so
            anyone can see how the published marks were arrived at. */}
        {!readOnly && (
          <footer className="flex items-center justify-end border-t border-border bg-muted/40 px-4 py-3">
            {/* The label says what the button does.
                Saving already recalculates every total (see useMarks), but it
                still read "Save formula", so a teacher who changed a weight
                naturally went looking for a separate Recalculate afterwards —
                and if they missed it, assumed the on-screen totals were stale
                when they were not. */}
            <Button
              onClick={handleSave}
              disabled={isPublished || enabled.length === 0 || (!isFormulaDirty && hasMarks) || isSaving}
              loading={isSaving}
              leftIcon={<RefreshCw className={isSaving ? "animate-spin" : ""} strokeWidth={ICON_STROKE} />}
            >
              {hasMarks ? (isFormulaDirty ? "Save & recalculate" : "Saved & calculated") : "Save & calculate"}
            </Button>
          </footer>
        )}
      </section>

      {/* ── Results ───────────────────────────────────────────────── */}
      {formula && (
        <section className={cn(SURFACE.card, "overflow-hidden")}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h3 className={TEXT.section}>Calculated results</h3>
              <p className={cn(TEXT.muted, "mt-0.5")}>
                {hasMarks
                  ? `${marks.length} student${marks.length !== 1 ? "s" : ""} · out of ${formula.totalMarks} marks`
                  : "Not calculated yet."}
              </p>
            </div>
            {isPublished && <Badge variant="success" size="sm">Published</Badge>}
          </header>

          {/* How the class actually landed. A column of numbers cannot show
              whether the cohort is bunched at the top or spread thin, which
              is the first thing worth knowing before publishing. */}
          {hasMarks && (
            <div className="border-b border-border bg-muted/30 px-4 py-3.5">
              <p className={cn(TEXT.eyebrow, "mb-2.5")}>Spread of the class</p>
              <DistributionBar buckets={distribution} />
            </div>
          )}

          {isMarksLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10" rounded="lg" />)}
            </div>
          ) : hasMarks ? (
            /* The table scrolls inside its own container rather than widening
               the page — a formula with four components plus a total is already
               six columns before any student name. */
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className={cn(TEXT.eyebrow, "sticky left-0 z-10 bg-muted/40 px-4 py-2.5 text-left")}>
                      Student
                    </th>
                    {formula.components.map((c: any) => (
                      <th key={c.componentType} className={cn(TEXT.eyebrow, "px-3 py-2.5 text-right")}>
                        {c.componentType}
                        <span className="ml-1 font-normal normal-case tracking-normal opacity-70">
                          /{c.maxMarks}
                        </span>
                      </th>
                    ))}
                    <th className={cn(TEXT.eyebrow, "px-4 py-2.5 text-right text-primary")}>
                      Total
                      <span className="ml-1 font-normal normal-case tracking-normal opacity-70">
                        /{formula.totalMarks}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedMarks.map((m: any) => {
                    let bd: Record<string, { earned: number }> = {}
                    try { bd = JSON.parse(m.breakdownJson) } catch { /* ignore */ }
                    const pct  = formula.totalMarks > 0 ? (m.finalMark / formula.totalMarks) * 100 : 0
                    const fail = pct < 40
                    const sid  = studentIdOf[m.studentId]

                    return (
                      <tr key={m.studentId} className="transition-colors duration-120 hover:bg-muted/40">
                        <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                          {sid && (
                            <span className="mr-2 font-mono text-[12px] font-bold text-muted-foreground">
                              {sid}
                            </span>
                          )}
                          <span className="text-[13px] font-medium text-foreground">{m.studentName}</span>
                        </td>
                        {formula.components.map((c: any) => (
                          <td key={c.componentType} className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                            {bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(1) : "—"}
                          </td>
                        ))}
                        <td className="px-4 py-2.5 text-right">
                          {/* Only a fail is coloured. The old four-band scale
                              tinted every total, so nothing stood out. */}
                          <span className={cn(
                            "font-display text-[13.5px] font-bold tabular-nums",
                            fail ? "text-destructive" : "text-foreground",
                          )}>
                            {m.finalMark.toFixed(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<RefreshCw strokeWidth={ICON_STROKE} />}
              title="No marks calculated yet"
              description="Save your formula, then hit Calculate to pull in class tests, assignments and attendance."
              className="py-12"
            />
          )}
        </section>
      )}
    </div>
  )
}
