import { useState, useEffect } from 'react'
import { CheckCircle2, RefreshCw, Send } from 'lucide-react'
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
        <div className="space-y-6">

            {/* Formula Builder */}
            <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-foreground">Grading Formula</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {formula ? 'Saved — edit and re-save to update' : 'Define how final marks are calculated'}
                        </p>
                    </div>
                    {formula && !isFormulaLoading && <Badge variant="success">Saved</Badge>}
                </div>

                <div className="space-y-2">
                    {COMPONENTS.map(comp => {
                        const cfg = config[comp.key]
                        return (
                            <div key={comp.key}
                                className={`rounded-xl border transition-all ${cfg.enabled ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20'}`}>
                                <div className="flex items-center justify-between p-3">
                                    <div className="flex items-center gap-2.5">
                                        <span>{comp.icon}</span>
                                        <span className="text-sm font-medium text-foreground">{comp.label}</span>
                                        {cfg.enabled && (
                                            <span className="text-xs text-primary font-semibold">
                                                {parseFloat(cfg.maxMarks) || 0} marks
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setComp(comp.key, { enabled: !cfg.enabled })}
                                        className={`relative w-9 h-5 rounded-full transition-colors ${cfg.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${cfg.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {cfg.enabled && (
                                    <div className="px-3 pb-3 flex items-center gap-4 flex-wrap">
                                        {comp.showRule && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-xs text-muted-foreground">Count:</span>
                                                <select value={cfg.selectionRule}
                                                    onChange={e => setComp(comp.key, { selectionRule: e.target.value as SelectionRule })}
                                                    className="h-7 rounded-lg border border-border bg-background text-xs px-2 focus:outline-none focus:ring-2 focus:ring-primary/50">
                                                    {RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-muted-foreground">Worth:</span>
                                            <input type="number" min="1" value={cfg.maxMarks}
                                                onChange={e => setComp(comp.key, { maxMarks: e.target.value })}
                                                className="w-16 h-7 rounded-lg border border-border bg-background text-xs px-2 text-center focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                            <span className="text-xs text-muted-foreground">marks</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-sm">
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-bold text-foreground">{totalMarks > 0 ? `${totalMarks} marks` : '—'}</span>
                    </p>
                    <Button leftIcon={<CheckCircle2 className="w-4 h-4" />} loading={isSaving}
                        onClick={handleSave} disabled={enabled.length === 0}>
                        Save Formula
                    </Button>
                </div>
            </div>

            {/* Results */}
            {formula && (
                <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h2 className="font-semibold text-foreground">Results</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {hasMarks
                                    ? `${marks.length} student${marks.length !== 1 ? 's' : ''} · out of ${formula.totalMarks} marks`
                                    : 'No marks calculated yet'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button size="sm" variant="secondary"
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                                loading={isCalculating} onClick={() => calculate()}>
                                {hasMarks ? 'Recalculate' : 'Calculate Marks'}
                            </Button>
                            {hasMarks && !isPublished && (
                                <Button size="sm" leftIcon={<Send className="w-4 h-4" />}
                                    loading={isPublishing} onClick={() => publish()}>
                                    Publish Results
                                </Button>
                            )}
                            {isPublished && (
                                <div className="flex items-center gap-2">
                                    <Badge variant="success">Published</Badge>
                                    <ExportFinalMarksButton
                                        marks={marks}
                                        formula={formula}
                                        courseTitle={courseTitle}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {isMarksLoading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />)}
                        </div>
                    ) : hasMarks ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border">
                                        <th className="text-left py-2 pr-4 font-semibold">Student</th>
                                        {formula.components.map(c => (
                                            <th key={c.componentType} className="text-center py-2 px-3 font-semibold">
                                                {c.componentType}
                                                <span className="block font-normal normal-case text-muted-foreground">/{c.maxMarks}</span>
                                            </th>
                                        ))}
                                        <th className="text-center py-2 px-3 font-semibold">
                                            Total
                                            <span className="block font-normal normal-case text-muted-foreground">/{formula.totalMarks}</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marks.map((m, idx) => {
                                        let bd: Record<string, { earned: number }> = {}
                                        try { bd = JSON.parse(m.breakdownJson) } catch {}
                                        return (
                                            <tr key={m.studentId} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                                                <td className="py-2.5 pr-4">
                                                    <p className="font-medium text-foreground">{m.studentName}</p>
                                                </td>
                                                {formula.components.map(c => (
                                                    <td key={c.componentType} className="text-center py-2.5 px-3 text-foreground">
                                                        {bd[c.componentType] != null ? bd[c.componentType].earned.toFixed(1) : '—'}
                                                    </td>
                                                ))}
                                                <td className="text-center py-2.5 px-3 font-bold text-foreground">
                                                    {m.finalMark.toFixed(1)}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">
                            Click "Calculate Marks" to generate results.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
