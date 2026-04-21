import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, RefreshCw, Send, BarChart3 } from "lucide-react"
import toast from "react-hot-toast"
import Button from "@/components/ui/Button"
import { useMarks } from "../hooks/useMarks"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import MyGradesView from "./MyGradesView"
import ExportFinalMarksButton from "./ExportFinalMarksButton"
import type { FormulaComponentType, SelectionRule } from "@/types/marks.types"

interface Props { courseId: string; courseTitle?: string }
interface ComponentConfig { enabled: boolean; selectionRule: SelectionRule; maxMarks: string }
interface FormulaState {
  ct: ComponentConfig; assignment: ComponentConfig
  presentation: ComponentConfig; attendance: ComponentConfig
}

const DEFAULT: FormulaState = {
  ct:           { enabled: false, selectionRule: "Best3", maxMarks: "10" },
  assignment:   { enabled: false, selectionRule: "Best2", maxMarks: "10" },
  presentation: { enabled: false, selectionRule: "All",   maxMarks: "10" },
  attendance:   { enabled: false, selectionRule: "All",   maxMarks: "8"  },
}

const COMPONENTS: { key: keyof FormulaState; label: string; icon: string; type: FormulaComponentType; showRule: boolean }[] = [
  { key: "ct",           label: "Class Tests (CT)", icon: "CT",  type: "CT",           showRule: true  },
  { key: "assignment",   label: "Assignments",      icon: "ASN", type: "Assignment",   showRule: true  },
  { key: "presentation", label: "Presentations",    icon: "PRE", type: "Presentation", showRule: true  },
  { key: "attendance",   label: "Attendance",       icon: "ATT", type: "Attendance",   showRule: false },
]

const RULES: { value: SelectionRule; label: string }[] = [
  { value: "Best1", label: "Best 1"       },
  { value: "Best2", label: "Best 2"       },
  { value: "Best3", label: "Best 3"       },
  { value: "All",   label: "Average of all" },
]

const COMP_COLORS = {
  ct:           { color: "#7c3aed", light: "#f5f3ff", darkBg: "rgba(124,58,237,0.12)", border: "#ddd6fe", darkBorder: "rgba(124,58,237,0.25)" },
  assignment:   { color: "#db2777", light: "#fdf2f8", darkBg: "rgba(219,39,119,0.12)", border: "#fbcfe8", darkBorder: "rgba(219,39,119,0.25)" },
  presentation: { color: "#0891b2", light: "#ecfeff", darkBg: "rgba(8,145,178,0.12)",  border: "#a5f3fc", darkBorder: "rgba(6,182,212,0.25)"  },
  attendance:   { color: "#059669", light: "#ecfdf5", darkBg: "rgba(5,150,105,0.12)",  border: "#a7f3d0", darkBorder: "rgba(5,150,105,0.25)"  },
}

export default function MarksTab({ courseId, courseTitle }: Props) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")

  const { formula, isFormulaLoading, marks, isMarksLoading,
          saveFormula, isSaving, calculate, isCalculating, publish, isPublishing } = useMarks(courseId)

  const [config, setConfig] = useState<FormulaState>(DEFAULT)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!formula || loaded) return
    const next = { ...DEFAULT }
    formula.components.forEach((c: any) => {
      const key = (c.componentType === "CT" ? "ct"
        : c.componentType === "Assignment"   ? "assignment"
        : c.componentType === "Presentation" ? "presentation"
        : "attendance") as keyof FormulaState
      next[key] = { enabled: true, selectionRule: c.selectionRule, maxMarks: String(c.maxMarks) }
    })
    setConfig(next)
    setLoaded(true)
  }, [formula, loaded])

  if (!teacher) return <MyGradesView courseId={courseId} />

  const enabled    = COMPONENTS.filter(c => config[c.key].enabled)
  const totalMarks = enabled.reduce((s, c) => s + (parseFloat(config[c.key].maxMarks) || 0), 0)
  const isPublished= marks.length > 0 && marks.every((m: any) => m.isPublished)
  const hasMarks   = marks.length > 0

  const handleSave = () => {
    if (enabled.length === 0) { toast.error("Enable at least one component."); return }
    saveFormula({
      totalMarks,
      components: enabled.map(c => ({
        componentType: c.type,
        selectionRule: config[c.key].selectionRule,
        maxMarks:      parseFloat(config[c.key].maxMarks) || 0,
        weightPercent: totalMarks > 0 ? ((parseFloat(config[c.key].maxMarks) || 0) / totalMarks) * 100 : 0,
      })),
    })
  }

  const setComp = (key: keyof FormulaState, patch: Partial<ComponentConfig>) =>
    setConfig(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  // Theme
  const cardBg   = dark ? "rgba(16,24,44,0.75)" : "rgba(255,255,255,0.92)"
  const blur     = "blur(20px)"
  const border   = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const divider  = dark ? "rgba(99,102,241,0.1)"  : "#f3f4f6"
  const textMain = dark ? "#e2e8f8" : "#111827"
  const textSub  = dark ? "#8896c8" : "#6b7280"
  const textMuted= dark ? "#5a6a9a" : "#9ca3af"
  const inputBg  = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"
  const inputBorder = dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: dark ? "rgba(217,119,6,0.15)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a" }}>
            <BarChart3 style={{ width: 16, height: 16, color: "#d97706" }} strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Marks & Grading</h2>
            <p className="text-[11px]" style={{ color: textSub }}>
              {isPublished
                ? <span style={{ color: "#059669" }}>Results published - {marks.length} students</span>
                : formula
                  ? <span>Formula saved - {hasMarks ? `${marks.length} calculated` : "not calculated"}</span>
                  : <span>No formula set</span>
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {formula && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => calculate()} disabled={isCalculating}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold disabled:opacity-40"
              style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #c7d2fe", color: "#6366f1" }}>
              <RefreshCw style={{ width: 13, height: 13 }} className={isCalculating ? "animate-spin" : ""} />
              {hasMarks ? "Recalculate" : "Calculate"}
            </motion.button>
          )}
          {hasMarks && !isPublished && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => publish()} disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
              <Send style={{ width: 13, height: 13 }} /> Publish Results
            </motion.button>
          )}
          {isPublished && formula && (
            <ExportFinalMarksButton marks={marks} formula={formula} courseTitle={courseTitle} />
          )}
        </div>
      </motion.div>

      {/* Formula Builder */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${divider}` }}>
          <div>
            <h3 className="text-[14px] font-bold" style={{ color: textMain }}>Grading Formula</h3>
            <p className="text-[11px] mt-0.5" style={{ color: textSub }}>
              {formula ? "Saved - edit and re-save to update" : "Define how final marks are calculated"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {formula && !isFormulaLoading && (
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                style={{ background: dark ? "rgba(5,150,105,0.15)" : "#ecfdf5", color: "#059669", border: dark ? "1px solid rgba(5,150,105,0.25)" : "1px solid #a7f3d0" }}>
                Saved
              </span>
            )}
            {totalMarks > 0 && (
              <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff", color: "#6366f1", border: dark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #c7d2fe" }}>
                {totalMarks} total marks
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-2">
          {COMPONENTS.map((comp, i) => {
            const cfg = config[comp.key]
            const col = COMP_COLORS[comp.key]
            return (
              <motion.div key={comp.key}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: cfg.enabled ? (dark ? col.darkBg : col.light) : (dark ? "rgba(255,255,255,0.02)" : "#f9fafb"),
                  border: cfg.enabled ? `1px solid ${dark ? col.darkBorder : col.border}` : `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f3f4f6"}`,
                }}>
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-lg"
                      style={{ background: cfg.enabled ? (dark ? col.darkBg : col.light) : (dark ? "rgba(255,255,255,0.06)" : "#f3f4f6"), color: cfg.enabled ? col.color : textMuted }}>
                      {comp.icon}
                    </span>
                    <span className="text-[13px] font-semibold"
                      style={{ color: cfg.enabled ? textMain : textMuted }}>
                      {comp.label}
                    </span>
                    {cfg.enabled && (
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                        style={{ background: dark ? col.darkBg : col.light, color: col.color }}>
                        {parseFloat(cfg.maxMarks) || 0} marks
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setComp(comp.key, { enabled: !cfg.enabled })}
                    className="relative w-9 h-5 rounded-full transition-all shrink-0"
                    style={{ background: cfg.enabled ? col.color : (dark ? "rgba(255,255,255,0.1)" : "#e5e7eb") }}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled ? "left-[18px]" : "left-0.5"}`} />
                  </button>
                </div>
                {cfg.enabled && (
                  <div className="px-4 pb-3 flex items-center gap-4 flex-wrap"
                    style={{ borderTop: `1px solid ${dark ? col.darkBorder : col.border}` }}>
                    {comp.showRule && (
                      <div className="flex items-center gap-1.5 pt-2.5">
                        <span className="text-[12px] font-medium" style={{ color: textSub }}>Count:</span>
                        <select value={cfg.selectionRule}
                          onChange={e => setComp(comp.key, { selectionRule: e.target.value as SelectionRule })}
                          className="h-7 rounded-lg text-[12px] px-2 outline-none"
                          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMain }}>
                          {RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 pt-2.5">
                      <span className="text-[12px] font-medium" style={{ color: textSub }}>Worth:</span>
                      <input type="number" min="1" value={cfg.maxMarks}
                        onChange={e => setComp(comp.key, { maxMarks: e.target.value })}
                        className="w-16 h-7 rounded-lg text-[12px] px-2 text-center outline-none"
                        style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textMain }} />
                      <span className="text-[12px] font-medium" style={{ color: textSub }}>marks</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center justify-end px-5 py-3 gap-3"
          style={{ borderTop: `1px solid ${divider}` }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleSave} disabled={enabled.length === 0 || isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
            <CheckCircle2 style={{ width: 14, height: 14 }} />
            {isSaving ? "Saving..." : "Save Formula"}
          </motion.button>
        </div>
      </div>

      {/* Results Table */}
      {formula && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, border: `1px solid ${border}` }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: `1px solid ${divider}` }}>
            <div>
              <h3 className="text-[14px] font-bold" style={{ color: textMain }}>Calculated Results</h3>
              <p className="text-[11px] mt-0.5" style={{ color: textSub }}>
                {hasMarks
                  ? `${marks.length} student${marks.length !== 1 ? "s" : ""} - out of ${formula.totalMarks} marks`
                  : "No marks calculated yet - click Calculate above"}
              </p>
            </div>
            {isPublished && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: dark ? "rgba(5,150,105,0.15)" : "#ecfdf5", color: "#059669", border: dark ? "1px solid rgba(5,150,105,0.25)" : "1px solid #a7f3d0" }}>
                Published
              </span>
            )}
          </div>
          <div className="p-4">
            {isMarksLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 rounded-xl animate-pulse"
                    style={{ background: dark ? "rgba(99,102,241,0.06)" : "#f3f4f6" }} />
                ))}
              </div>
            ) : hasMarks ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${divider}` }}>
                      <th className="text-left py-2 pr-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>Student</th>
                      {formula.components.map((c: any) => (
                        <th key={c.componentType} className="text-center py-2 px-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: textMuted }}>
                          {c.componentType}
                          <span className="block font-normal normal-case text-[10px]" style={{ color: textMuted }}>/{c.maxMarks}</span>
                        </th>
                      ))}
                      <th className="text-center py-2 px-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: "#6366f1" }}>
                        Total
                        <span className="block font-normal normal-case text-[10px]" style={{ color: textSub }}>/{formula.totalMarks}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m: any, idx: number) => {
                      let bd: Record<string, { earned: number }> = {}
                      try { bd = JSON.parse(m.breakdownJson) } catch {}
                      const pct = formula.totalMarks > 0 ? (m.finalMark / formula.totalMarks) * 100 : 0
                      const scoreColor = pct >= 80 ? "#059669" : pct >= 70 ? "#6366f1" : pct >= 60 ? "#d97706" : "#ef4444"
                      return (
                        <motion.tr key={m.studentId}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }}
                          style={{
                            borderBottom: `1px solid ${divider}`,
                            background: idx % 2 === 0 ? (dark ? "rgba(99,102,241,0.03)" : "rgba(99,102,241,0.02)") : "transparent",
                          }}>
                          <td className="py-3 pr-4">
                            <p className="text-[13px] font-semibold" style={{ color: textMain }}>{m.studentName}</p>
                          </td>
                          {formula.components.map((c: any) => (
                            <td key={c.componentType} className="text-center py-3 px-3 text-[13px]" style={{ color: textSub }}>
                              {bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(1) : "-"}
                            </td>
                          ))}
                          <td className="text-center py-3 px-3">
                            <span className="text-[13px] font-bold tabular-nums" style={{ color: scoreColor }}>
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
              <div className="text-center py-10 text-[13px]" style={{ color: textSub }}>
                Click "Calculate" in the toolbar to generate results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
