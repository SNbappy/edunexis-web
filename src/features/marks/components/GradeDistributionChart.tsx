import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { GradebookSummaryDto } from '@/types/marks.types'

interface Props { summary: GradebookSummaryDto }

const GRADE_COLORS: Record<string, string> = {
    'A+': 'bg-emerald-500',
    'A': 'bg-emerald-400',
    'A-': 'bg-teal-400',
    'B+': 'bg-blue-500',
    'B': 'bg-blue-400',
    'B-': 'bg-cyan-400',
    'C+': 'bg-amber-400',
    'C': 'bg-amber-500',
    'D': 'bg-orange-500',
    'F': 'bg-rose-500',
}

export default function GradeDistributionChart({ summary }: Props) {
    const dist = summary.gradeDistribution
    const total = dist.reduce((s, d) => s + d.count, 0)
    if (total === 0) return null

    return (
        <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Grade Distribution</h3>

            {/* Bar chart */}
            <div className="space-y-2.5">
                {dist.map((d, i) => {
                    const pct = total > 0 ? (d.count / total) * 100 : 0
                    const barColor = GRADE_COLORS[d.grade] ?? 'bg-primary'
                    return (
                        <div key={d.grade} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-foreground w-6 text-right shrink-0">{d.grade}</span>
                            <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ delay: i * 0.05, duration: 0.6, ease: 'easeOut' }}
                                    className={cn('h-full rounded-lg flex items-center justify-end pr-2', barColor)}
                                    style={{ minWidth: d.count > 0 ? '2rem' : 0 }}
                                >
                                    {d.count > 0 && (
                                        <span className="text-xs text-white font-bold">{d.count}</span>
                                    )}
                                </motion.div>
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
                                {pct.toFixed(0)}%
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
