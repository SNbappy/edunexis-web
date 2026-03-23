import { motion } from 'framer-motion'
import type { GradebookSummaryDto } from '@/types/marks.types'

interface Props { summary: GradebookSummaryDto }

const GRADE_COLORS: Record<string, string> = {
    'A+': '#34d399', 'A': '#4ade80', 'A-': '#2dd4bf',
    'B+': '#60a5fa', 'B': '#38bdf8', 'B-': '#22d3ee',
    'C+': '#fbbf24', 'C': '#f59e0b',
    'D': '#fb923c',  'F': '#f87171',
}

export default function GradeDistributionChart({ summary }: Props) {
    const dist  = summary.gradeDistribution
    const total = dist.reduce((s, d) => s + d.count, 0)
    if (total === 0) return null

    return (
        <div className="rounded-2xl p-5 space-y-4"
            style={{ background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <h3 className="text-sm font-bold" style={{ color: '#e2e8f0' }}>Grade Distribution</h3>
            <div className="space-y-2.5">
                {dist.map((d, i) => {
                    const pct   = total > 0 ? (d.count / total) * 100 : 0
                    const color = GRADE_COLORS[d.grade] ?? '#818cf8'
                    return (
                        <div key={d.grade} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-6 text-right shrink-0" style={{ color }}>{d.grade}</span>
                            <div className="flex-1 h-6 rounded-lg overflow-hidden" style={{ background: 'rgba(99,102,241,0.08)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                                    className="h-full rounded-lg flex items-center justify-end pr-2"
                                    style={{ background: `${color}33`, borderRight: `2px solid ${color}` , minWidth: d.count > 0 ? '2rem' : 0 }}
                                >
                                    {d.count > 0 && (
                                        <span className="text-xs font-bold" style={{ color }}>{d.count}</span>
                                    )}
                                </motion.div>
                            </div>
                            <span className="text-xs w-10 text-right shrink-0" style={{ color: '#475569' }}>
                                {pct.toFixed(0)}%
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
