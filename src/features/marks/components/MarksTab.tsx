import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, RefreshCw, Send, BarChart3 } from "lucide-react"
import toast from "react-hot-toast"
import { useMarks } from "../hooks/useMarks"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import MyGradesView from "./MyGradesView"
import ExportFinalMarksButton from "./ExportFinalMarksButton"
import type { FormulaComponentType, SelectionRule } from "@/types/marks.types"

interface MarksTabProps { courseId: string; courseTitle?: string }
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
  /** Each component gets a tonal class set, picked to look distinct but unified */
  tone: "teal" | "violet" | "amber" | "emerald"
}

const COMPONENTS: ComponentMeta[] = [
  { key: "ct", label: "Class tests", abbr: "CT", type: "CT", showRule: true, tone: "teal" },
  { key: "assignment", label: "Assignments", abbr: "ASN", type: "Assignment", showRule: true, tone: "violet" },
  { key: "presentation", label: "Other tests", abbr: "OT", type: "Presentation", showRule: true, tone: "amber" },
  { key: "attendance", label: "Attendance", abbr: "ATT", type: "Attendance", showRule: false, tone: "emerald" },
]

const RULES: { value: SelectionRule; label: string }[] = [
  { value: "Best1", label: "Best 1" },
  { value: "Best2", label: "Best 2" },
  { value: "Best3", label: "Best 3" },
  { value: "All", label: "Average of all" },
]

interface ToneClasses {
  badgeBg: string
  badgeText: string
  toggleOn: string
  rowBg: string
  rowBorder: string
}

function getToneClasses(tone: ComponentMeta["tone"]): ToneClasses {
  switch (tone) {
    case "teal": return {
      badgeBg: "bg-teal-100 dark:bg-teal-950/50",
      badgeText: "text-teal-700 dark:text-teal-300",
      toggleOn: "bg-teal-600",
      rowBg: "bg-teal-50/60 dark:bg-teal-950/20",
      rowBorder: "border-teal-200 dark:border-teal-800",
    }
    case "violet": return {
      badgeBg: "bg-violet-100 dark:bg-violet-950/50",
      badgeText: "text-violet-700 dark:text-violet-300",
      toggleOn: "bg-violet-600",
      rowBg: "bg-violet-50/60 dark:bg-violet-950/20",
      rowBorder: "border-violet-200 dark:border-violet-800",
    }
    case "amber": return {
      badgeBg: "bg-amber-100 dark:bg-amber-950/50",
      badgeText: "text-amber-700 dark:text-amber-300",
      toggleOn: "bg-amber-600",
      rowBg: "bg-amber-50/60 dark:bg-amber-950/20",
      rowBorder: "border-amber-200 dark:border-amber-800",
    }
    case "emerald": return {
      badgeBg: "bg-emerald-100 dark:bg-emerald-950/50",
      badgeText: "text-emerald-700 dark:text-emerald-300",
      toggleOn: "bg-emerald-600",
      rowBg: "bg-emerald-50/60 dark:bg-emerald-950/20",
      rowBorder: "border-emerald-200 dark:border-emerald-800",
    }
  }
}

function getScoreClass(percent: number): string {
  if (percent >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (percent >= 70) return "text-teal-600 dark:text-teal-400"
  if (percent >= 60) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

export default function MarksTab({ courseId, courseTitle }: MarksTabProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const {
    formula, isFormulaLoading,
    marks, isMarksLoading,
    saveFormula, isSaving,
    calculate, isCalculating,
    publish, isPublishing,
  } = useMarks(courseId)

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

  if (!teacher) return <MyGradesView courseId={courseId} />

  const enabled = COMPONENTS.filter(c => config[c.key].enabled)
  const totalMarks = enabled.reduce((s, c) => s + (parseFloat(config[c.key].maxMarks) || 0), 0)
  const isPublished = marks.length > 0 && marks.every((m: any) => m.isPublished)
  const hasMarks = marks.length > 0

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
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
            <BarChart3 className="h-4 w-4" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-[15px] font-bold text-foreground">
              Marks &amp; grading
            </h2>
            <p className="text-[11.5px] text-muted-foreground">
              {isPublished
                ? <span className="text-emerald-600 dark:text-emerald-400">Results published · {marks.length} students</span>
                : formula
                  ? <span>Formula saved · {hasMarks ? marks.length + " calculated" : "not calculated yet"}</span>
                  : <span>No formula set</span>
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {formula && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => calculate()}
              disabled={isCalculating}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-[12px] font-semibold text-foreground transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 dark:hover:border-teal-700 dark:hover:bg-teal-950/30 dark:hover:text-teal-300"
            >
              <RefreshCw className={"h-3 w-3 " + (isCalculating ? "animate-spin" : "")} />
              {hasMarks ? "Recalculate" : "Calculate"}
            </motion.button>
          )}

          {hasMarks && !isPublished && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => publish()}
              disabled={isPublishing}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_14px_-4px_rgba(20,184,166,0.6)] transition-colors hover:bg-teal-700 disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
              Publish results
            </motion.button>
          )}

          {isPublished && formula && (
            <ExportFinalMarksButton marks={marks} formula={formula} courseTitle={courseTitle} />
          )}
        </div>
      </motion.div>

      {/* Formula Builder */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-[14px] font-bold text-foreground">
              Grading formula
            </h3>
            <p className="mt-0.5 text-[11.5px] text-muted-foreground">
              {formula ? "Saved — edit and re-save to update" : "Define how final marks are calculated"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formula && !isFormulaLoading && (
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10.5px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Saved
              </span>
            )}
            {totalMarks > 0 && (
              <span className="rounded-lg border border-teal-200 bg-teal-50 px-2 py-1 text-[10.5px] font-bold text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300">
                {totalMarks} total marks
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 p-4">
          {COMPONENTS.map((comp, i) => {
            const cfg = config[comp.key]
            const tone = getToneClasses(comp.tone)

            return (
              <motion.div
                key={comp.key}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={
                  "overflow-hidden rounded-xl border transition-all " +
                  (cfg.enabled
                    ? tone.rowBg + " " + tone.rowBorder
                    : "border-border bg-muted/30")
                }
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className={
                      "inline-flex items-center justify-center rounded-lg px-2 py-0.5 text-[10.5px] font-extrabold " +
                      (cfg.enabled
                        ? tone.badgeBg + " " + tone.badgeText
                        : "bg-card text-muted-foreground")
                    }>
                      {comp.abbr}
                    </span>
                    <span className={
                      "text-[13px] font-semibold " +
                      (cfg.enabled ? "text-foreground" : "text-muted-foreground")
                    }>
                      {comp.label}
                    </span>
                    {cfg.enabled && (
                      <span className={"rounded-md px-1.5 py-0.5 text-[10.5px] font-bold " + tone.badgeBg + " " + tone.badgeText}>
                        {parseFloat(cfg.maxMarks) || 0} marks
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setComp(comp.key, { enabled: !cfg.enabled })}
                    aria-pressed={cfg.enabled}
                    aria-label={(cfg.enabled ? "Disable " : "Enable ") + comp.label}
                    className={
                      "relative h-5 w-9 shrink-0 rounded-full transition-colors " +
                      (cfg.enabled ? tone.toggleOn : "bg-stone-300 dark:bg-stone-700")
                    }
                  >
                    <span className={
                      "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all " +
                      (cfg.enabled ? "left-[18px]" : "left-0.5")
                    } />
                  </button>
                </div>

                {cfg.enabled && (
                  <div className={"flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-4 pb-3 pt-2.5 " + tone.rowBorder}>
                    {comp.showRule && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] font-semibold text-muted-foreground">Count:</span>
                        <select
                          value={cfg.selectionRule}
                          onChange={e => setComp(comp.key, { selectionRule: e.target.value as SelectionRule })}
                          className="h-7 rounded-lg border border-border bg-card px-2 text-[12px] text-foreground outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                        >
                          {RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-semibold text-muted-foreground">Worth:</span>
                      <input
                        type="number"
                        min="1"
                        value={cfg.maxMarks}
                        onChange={e => setComp(comp.key, { maxMarks: e.target.value })}
                        className="h-7 w-16 rounded-lg border border-border bg-card px-2 text-center text-[12px] text-foreground outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      />
                      <span className="text-[11.5px] font-semibold text-muted-foreground">marks</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border px-5 py-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={enabled.length === 0 || isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-[13px] font-bold text-white shadow-[0_4px_14px_-4px_rgba(20,184,166,0.6)] transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isSaving ? "Saving…" : "Save formula"}
          </motion.button>
        </div>
      </div>

      {/* Results Table */}
      {formula && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h3 className="font-display text-[14px] font-bold text-foreground">
                Calculated results
              </h3>
              <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                {hasMarks
                  ? marks.length + " student" + (marks.length !== 1 ? "s" : "") + " · out of " + formula.totalMarks + " marks"
                  : "No marks calculated yet — click Calculate above"
                }
              </p>
            </div>
            {isPublished && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10.5px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Published
              </span>
            )}
          </div>

          <div className="p-4">
            {isMarksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse rounded-xl border border-border bg-muted/40" />
                ))}
              </div>
            ) : hasMarks ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 pr-4 text-left text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                        Student
                      </th>
                      {formula.components.map((c: any) => (
                        <th
                          key={c.componentType}
                          className="px-3 py-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          {c.componentType}
                          <span className="block text-[9.5px] font-normal normal-case text-muted-foreground/80">
                            /{c.maxMarks}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2 text-center text-[10.5px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                        Total
                        <span className="block text-[9.5px] font-normal normal-case text-muted-foreground">
                          /{formula.totalMarks}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m: any, idx: number) => {
                      let bd: Record<string, { earned: number }> = {}
                      try { bd = JSON.parse(m.breakdownJson) } catch { /* ignore */ }
                      const pct = formula.totalMarks > 0 ? (m.finalMark / formula.totalMarks) * 100 : 0
                      const scoreClass = getScoreClass(pct)
                      return (
                        <motion.tr
                          key={m.studentId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                          className={
                            "border-b border-border transition-colors hover:bg-muted/40 " +
                            (idx % 2 === 0 ? "bg-muted/20" : "bg-transparent")
                          }
                        >
                          <td className="py-3 pr-4">
                            <p className="text-[13px] font-semibold text-foreground">
                              {m.studentName}
                            </p>
                          </td>
                          {formula.components.map((c: any) => (
                            <td
                              key={c.componentType}
                              className="px-3 py-3 text-center text-[13px] tabular-nums text-muted-foreground"
                            >
                              {bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(1) : "—"}
                            </td>
                          ))}
                          <td className="px-3 py-3 text-center">
                            <span className={"text-[13px] font-bold tabular-nums " + scoreClass}>
                              {m.finalMark.toFixed(1)}
                            </span>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-[13px] text-muted-foreground">
                Click "Calculate" in the toolbar to generate results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}