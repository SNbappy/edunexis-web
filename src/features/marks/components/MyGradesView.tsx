import { motion } from 'framer-motion'
import { TrendingUp, Star } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { useMarks } from '../hooks/useMarks'
import { useAuthStore } from '@/store/authStore'

interface Props { courseId: string }

export default function MyGradesView({ courseId }: Props) {
    const { user }                          = useAuthStore()
    const { marks, isMarksLoading, formula } = useMarks(courseId)

    if (isMarksLoading) {
        return (
            <div className="space-y-4 max-w-2xl mx-auto">
                <SkeletonCard className="h-40" />
                <SkeletonCard className="h-36" />
            </div>
        )
    }

    const myMark = marks.find(m => m.studentId === user?.id)

    if (!myMark || !myMark.isPublished) {
        return (
            <EmptyState
                icon={<TrendingUp className="w-8 h-8" />}
                title="No grades yet"
                description="Your grades will appear here once your teacher publishes results"
            />
        )
    }

    let bd: Record<string, { earned: number; maxMarks: number }> = {}
    try { bd = JSON.parse(myMark.breakdownJson) } catch {}

    const totalMarks = formula?.totalMarks ?? 0
    const pct        = totalMarks > 0 ? (myMark.finalMark / totalMarks) * 100 : 0
    const grade      = pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F'
    const gradeColor = pct >= 70 ? 'success' : pct >= 50 ? 'warning' : 'destructive'

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-4">

            {/* Score card */}
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Final Result</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-4xl font-bold text-foreground">{myMark.finalMark.toFixed(1)}</span>
                            <span className="text-lg text-muted-foreground mb-1">/ {totalMarks}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Badge variant={gradeColor as any} className="text-lg px-4 py-1 font-bold">{grade}</Badge>
                        <span className="text-xs text-muted-foreground">{pct.toFixed(1)}%</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                </div>
            </div>

            {/* Breakdown */}
            {Object.keys(bd).length > 0 && (
                <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Breakdown</p>
                    {Object.entries(bd).map(([type, data]) => {
                        const compPct = data.maxMarks > 0 ? (data.earned / data.maxMarks) * 100 : 0
                        return (
                            <div key={type} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-foreground font-medium">{type}</span>
                                    <span className="text-muted-foreground font-semibold">
                                        {data.earned.toFixed(1)}
                                        <span className="font-normal"> / {data.maxMarks}</span>
                                    </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${compPct}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${compPct >= 70 ? 'bg-emerald-500' : compPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </motion.div>
    )
}
