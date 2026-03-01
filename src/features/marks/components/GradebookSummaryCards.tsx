import { motion } from 'framer-motion'
import { Users, TrendingUp, Award, TrendingDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { GradebookSummaryDto } from '@/types/marks.types'

interface Props { summary: GradebookSummaryDto }

function getGradeColor(pct: number) {
    if (pct >= 80) return 'text-emerald-500'
    if (pct >= 70) return 'text-blue-500'
    if (pct >= 60) return 'text-amber-500'
    return 'text-destructive'
}

export default function GradebookSummaryCards({ summary }: Props) {
    const cards = [
        {
            label: 'Total Students',
            value: summary.totalStudents,
            icon: <Users className="w-5 h-5" />,
            bg: 'bg-indigo-500/10',
            color: 'text-indigo-500',
        },
        {
            label: 'Class Average',
            value: `${summary.averagePercentage.toFixed(1)}%`,
            icon: <TrendingUp className="w-5 h-5" />,
            bg: 'bg-emerald-500/10',
            color: getGradeColor(summary.averagePercentage),
        },
        {
            label: 'Highest Score',
            value: `${summary.highestPercentage.toFixed(1)}%`,
            icon: <Award className="w-5 h-5" />,
            bg: 'bg-amber-500/10',
            color: 'text-amber-500',
        },
        {
            label: 'Lowest Score',
            value: `${summary.lowestPercentage.toFixed(1)}%`,
            icon: <TrendingDown className="w-5 h-5" />,
            bg: 'bg-rose-500/10',
            color: 'text-rose-500',
        },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="glass-card rounded-2xl p-4 space-y-2"
                >
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.bg)}>
                        <span className={card.color}>{card.icon}</span>
                    </div>
                    <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                </motion.div>
            ))}
        </div>
    )
}
