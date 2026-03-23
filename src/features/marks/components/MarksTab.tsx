import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, RefreshCw, Send, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useMarks } from '../hooks/useMarks'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import MyGradesView from './MyGradesView'
import ExportFinalMarksButton from './ExportFinalMarksButton'
import type { FormulaComponentType, SelectionRule } from '@/types/marks.types'

interface Props { courseId: string; courseTitle?: string }

interface ComponentConfig { enabled: boolean; selectionRule: SelectionRule; maxMarks: string }
interface FormulaState {
    ct: ComponentConfig; assignment: ComponentConfig
    presentation: ComponentConfig; attendance: ComponentConfig
}

const DEFAULT: FormulaState = {
    ct:           { enabled: false, selectionRule: 'Best3', maxMarks: '10' },
    assignment:   { enabled: false, selectionRule: 'Best2', maxMarks: '10' },
    presentation: { enabled: false, selectionRule: 'All',   maxMarks: '10' },
    attendance:   { enabled: false, selectionRule: 'All',   maxMarks: '8'  },
}

const COMPONENTS: { key: keyof FormulaState; label: string; icon: string; type: FormulaComponentType; showRule: boolean }[] = [
    { key: 'ct',           label: 'Class Tests (CT)', icon: '🧾', type: 'CT',           showRule: true  },
    { key: 'assignment',   label: 'Assignments',      icon: '📝', type: 'Assignment',   showRule: true  },
    { key: 'presentation', label: 'Presentations',    icon: '🎤', type: 'Presentation', showRule: true  },
    { key: 'attendance',   label: 'Attendance',       icon: '📅', type: 'Attendance',   showRule: false },
]

const RULES: { value: SelectionRule; label: string }[] = [
    { value: 'Best1', label: 'Best 1' },
    { value: 'Best2', label: 'Best 2' },
    { value: 'Best3', label: 'Best 3' },
    { value: 'All',   label: 'Average of all' },
]

export default function MarksTab({ courseId, courseTitle }: Props) {
    const { user } = useAuthStore()
    const teacher  = isTeacher(user?.role ?? 'Student')
    const { formula, isFormulaLoading, marks, isMarksLoading,
            saveFormula, isSaving, calculate, isCalculating, publish, isPublishing } = useMarks(courseId)

    const [config, setConfig] = useState<FormulaState>(DEFAULT)
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (!formula || loaded) return
        const next = { ...DEFAULT }
        formula.components.forEach(c => {
            const key = (c.componentType === 'CT' ? 'ct'
                : c.componentType === 'Assignment'   ? 'assignment'
                : c.componentType === 'Presentation' ? 'presentation'
                : 'attendance') as keyof FormulaState
            next[key] = { enabled: true, selectionRule: c.selectionRule, maxMarks: String(c.maxMarks) }
        })
        setConfig(next)
        setLoaded(true)
    }, [formula, loaded])

    if (!teacher) return <MyGradesView courseId={courseId} />

    const enabled    = COMPONENTS.filter(c => config[c.key].enabled)
    const totalMarks = enabled.reduce((s, c) => s + (parseFloat(config[c.key].maxMarks) || 0), 0)
    const isPublished = marks.length > 0 && marks.every(m => m.isPublished)
    const hasMarks    = marks.length > 0

    const handleSave = () => {
        if (enabled.length === 0) { toast.error('Enable at least one component.'); return }
        saveFormula({
            totalMarks,
            components: enabled.map(c => ({
                componentType: c.type,
                selectionRule: config[c.key].selectionRule,
                maxMarks:      parseFloat(config[c.key].maxMarks) || 0,
                weightPercent: totalMarks > 0
                    ? ((parseFloat(config[c.key].maxMarks) || 0) / totalMarks) * 100
                    : 0,
            })),
        })
    }

    const setComp = (key: keyof FormulaState, patch: Partial<ComponentConfig>) =>
        setConfig(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

    return (
        <div className="space-y-4 max-w-3xl mx-auto">

            {/* ── Premium Toolbar ── */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl flex-wrap"
                style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <BarChart3 className="w-4 h-4" style={{ color: '#818cf8' }} />
                    </div>
                    <div>
                        <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Marks & Grading</h2>
                        <p className="text-[11px]" style={{ color: '#475569' }}>
                            {isPublished
                                ? <span style={{ color: '#34d399' }}>Results published · {marks.length} students</span>
                                : formula
                                    ? <span>Formula saved · {hasMarks ? `${marks.length} calculated` : 'not calculated'}</span>
                                    : <span>No formula set</span>
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {formula && (
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => calculate()}
                            disabled={isCalculating}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-bold"
                            style={{ background: 'rgba(6,13,31,0.6)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}>
                            <RefreshCw className={`w-3.5 h-3.5 ${isCalculating ? 'animate-spin' : ''}`} />
                            {hasMarks ? 'Recalculate' : 'Calculate'}
                        </motion.button>
                    )}
                    {hasMarks && !isPublished && (
                        <motion.button
                            whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => publish()}
                            disabled={isPublishing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                            style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
                            <Send className="w-3.5 h-3.5" /> Publish Results
                        </motion.button>
                    )}
                    {isPublished && (
                        <ExportFinalMarksButton marks={marks} formula={formula!} courseTitle={courseTitle} />
                    )}
                </div>
            </motion.div>

            {/* ── Formula Builder ── */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b"
                    style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
                    <div>
                        <h3 className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Grading Formula</h3>
                        <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>
                            {formula ? 'Saved — edit and re-save to update' : 'Define how final marks are calculated'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {formula && !isFormulaLoading && (
                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                                ✓ Saved
                            </span>
                        )}
                        {totalMarks > 0 && (
                            <span className="text-[11px] font-bold px-2 py-1 rounded-lg"
                                style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}>
                                {totalMarks} total marks
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-4 space-y-2">
                    {COMPONENTS.map((comp, i) => {
                        const cfg = config[comp.key]
                        return (
                            <motion.div key={comp.key}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className="rounded-xl overflow-hidden transition-all"
                                style={{
                                    background: cfg.enabled ? 'rgba(79,70,229,0.1)' : 'rgba(6,13,31,0.4)',
                                    border: cfg.enabled ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.1)',
                                }}>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <span>{comp.icon}</span>
                                        <span className="text-sm font-semibold" style={{ color: cfg.enabled ? '#e2e8f0' : '#475569' }}>
                                            {comp.label}
                                        </span>
                                        {cfg.enabled && (
                                            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md"
                                                style={{ background: 'rgba(129,140,248,0.2)', color: '#818cf8' }}>
                                                {parseFloat(cfg.maxMarks) || 0} marks
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setComp(comp.key, { enabled: !cfg.enabled })}
                                        className="relative w-9 h-5 rounded-full transition-all shrink-0"
                                        style={{ background: cfg.enabled ? 'linear-gradient(135deg,#4f46e5,#06b6d4)' : 'rgba(71,85,105,0.4)' }}>
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {cfg.enabled && (
                                    <div className="px-4 pb-3 flex items-center gap-4 flex-wrap border-t"
                                        style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
                                        {comp.showRule && (
                                            <div className="flex items-center gap-1.5 pt-2.5">
                                                <span className="text-xs" style={{ color: '#475569' }}>Count:</span>
                                                <select value={cfg.selectionRule}
                                                    onChange={e => setComp(comp.key, { selectionRule: e.target.value as SelectionRule })}
                                                    className="h-7 rounded-lg text-xs px-2 focus:outline-none transition-all"
                                                    style={{ background: 'rgba(6,13,31,0.8)', border: '1px solid rgba(99,102,241,0.25)', color: '#e2e8f0' }}>
                                                    {RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 pt-2.5">
                                            <span className="text-xs" style={{ color: '#475569' }}>Worth:</span>
                                            <input type="number" min="1" value={cfg.maxMarks}
                                                onChange={e => setComp(comp.key, { maxMarks: e.target.value })}
                                                className="w-16 h-7 rounded-lg text-xs px-2 text-center focus:outline-none transition-all"
                                                style={{ background: 'rgba(6,13,31,0.8)', border: '1px solid rgba(99,102,241,0.25)', color: '#e2e8f0' }} />
                                            <span className="text-xs" style={{ color: '#475569' }}>marks</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                <div className="flex items-center justify-end px-5 py-3 border-t gap-3"
                    style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
                    <motion.button
                        whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleSave}
                        disabled={enabled.length === 0 || isSaving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold disabled:opacity-40"
                        style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isSaving ? 'Saving...' : 'Save Formula'}
                    </motion.button>
                </div>
            </div>

            {/* ── Results Table ── */}
            {formula && (
                <div className="rounded-2xl overflow-hidden"
                    style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div className="flex items-center justify-between px-5 py-4 border-b"
                        style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
                        <div>
                            <h3 className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Calculated Results</h3>
                            <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>
                                {hasMarks
                                    ? `${marks.length} student${marks.length !== 1 ? 's' : ''} · out of ${formula.totalMarks} marks`
                                    : 'No marks calculated yet — click Calculate above'}
                            </p>
                        </div>
                        {isPublished && <Badge variant="success">Published</Badge>}
                    </div>

                    <div className="p-4">
                        {isMarksLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-12 rounded-xl animate-pulse"
                                        style={{ background: 'rgba(99,102,241,0.06)' }} />
                                ))}
                            </div>
                        ) : hasMarks ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
                                            <th className="text-left py-2 pr-4 text-xs font-bold uppercase tracking-wider"
                                                style={{ color: '#475569' }}>Student</th>
                                            {formula.components.map(c => (
                                                <th key={c.componentType} className="text-center py-2 px-3 text-xs font-bold uppercase tracking-wider"
                                                    style={{ color: '#475569' }}>
                                                    {c.componentType}
                                                    <span className="block font-normal normal-case" style={{ color: '#334155' }}>/{c.maxMarks}</span>
                                                </th>
                                            ))}
                                            <th className="text-center py-2 px-3 text-xs font-bold uppercase tracking-wider"
                                                style={{ color: '#818cf8' }}>
                                                Total
                                                <span className="block font-normal normal-case" style={{ color: '#475569' }}>/{formula.totalMarks}</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marks.map((m, idx) => {
                                            let bd: Record<string, { earned: number }> = {}
                                            try { bd = JSON.parse(m.breakdownJson) } catch {}
                                            const pct = formula.totalMarks > 0 ? (m.finalMark / formula.totalMarks) * 100 : 0
                                            return (
                                                <motion.tr key={m.studentId}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: idx * 0.02 }}
                                                    className="border-b transition-colors"
                                                    style={{
                                                        borderColor: 'rgba(99,102,241,0.08)',
                                                        background: idx % 2 === 0 ? 'rgba(99,102,241,0.03)' : 'transparent',
                                                    }}>
                                                    <td className="py-3 pr-4">
                                                        <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{m.studentName}</p>
                                                    </td>
                                                    {formula.components.map(c => (
                                                        <td key={c.componentType} className="text-center py-3 px-3"
                                                            style={{ color: '#94a3b8' }}>
                                                            {bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(1) : '—'}
                                                        </td>
                                                    ))}
                                                    <td className="text-center py-3 px-3">
                                                        <span className="text-sm font-bold tabular-nums"
                                                            style={{ color: pct >= 80 ? '#34d399' : pct >= 70 ? '#60a5fa' : pct >= 60 ? '#fbbf24' : '#f87171' }}>
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
                            <div className="text-center py-10 text-sm" style={{ color: '#475569' }}>
                                Click "Calculate" in the toolbar to generate results.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
