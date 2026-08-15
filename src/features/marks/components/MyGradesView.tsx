import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { StatRing } from '@/components/ui/charts'
import { GRADE_SCALE } from '@/config/constants'
import { ICON_STROKE, SURFACE, TEXT } from '@/components/ui/appTokens'
import { useMarks } from '../hooks/useMarks'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface Props { courseId: string }

/**
 * A student's own result for a course.
 *
 * The grade comes from GRADE_SCALE, the single scale the rest of the app
 * uses. This screen previously computed its own with different cut-offs
 * — 80 for A+, 70 for A — against an official scale of 90 for A+ and 85
 * for A. A student on 82% was told "A+" when the university scale gives
 * "A-", on the one screen where being wrong matters most.
 */
function gradeFor(percent: number) {
    return GRADE_SCALE.find(g => percent >= g.min) ?? GRADE_SCALE[GRADE_SCALE.length - 1]
}

export default function MyGradesView({ courseId }: Props) {
    const { user }                          = useAuthStore()
    const { marks, isMarksLoading, formula } = useMarks(courseId)

    if (isMarksLoading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <SkeletonCard className="h-40" />
                <SkeletonCard className="h-36" />
            </div>
        )
    }

    const myMark = marks.find(m => m.studentId === user?.id)

    if (!myMark || !myMark.isPublished) {
        return (
            <EmptyState
                variant="panel"
                icon={<TrendingUp strokeWidth={ICON_STROKE} />}
                title="Results aren't published yet"
                description="When your teacher publishes final marks for this course, your result and a breakdown of how it was calculated will appear here."
            />
        )
    }

    let bd: Record<string, { earned: number; maxMarks: number }> = {}
    try { bd = JSON.parse(myMark.breakdownJson) } catch { /* ignore */ }

    const totalMarks = formula?.totalMarks ?? 0
    const pct        = totalMarks > 0 ? (myMark.finalMark / totalMarks) * 100 : 0
    const grade      = gradeFor(pct)
    const passing    = pct >= 40

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl space-y-4"
        >
            {/* Result. The ring carries the percentage, the numerals carry the
                marks, and the grade letter is stated once with its label and
                GPA so there is no ambiguity about which scale produced it. */}
            <div className={cn(SURFACE.cardLifted, 'p-5 sm:p-6')}>
                <div className="flex flex-wrap items-center gap-6">
                    <StatRing
                        value={pct}
                        size={92}
                        stroke={8}
                        tone={passing ? 'success' : 'destructive'}
                    />

                    <div className="min-w-0 flex-1">
                        <p className={TEXT.eyebrow}>Final result</p>
                        <div className="mt-1.5 flex items-end gap-2">
                            <span className="font-display text-[38px] font-extrabold leading-none tabular-nums text-foreground">
                                {myMark.finalMark.toFixed(1)}
                            </span>
                            <span className="mb-1 text-[15px] text-muted-foreground">
                                / {totalMarks}
                            </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                                className={cn(
                                    'inline-flex items-center rounded-lg border px-2.5 py-1 font-display text-[15px] font-extrabold',
                                    passing
                                        ? 'border-success/25 bg-success-soft text-success'
                                        : 'border-destructive/25 bg-destructive-soft text-destructive',
                                )}
                            >
                                {grade.grade}
                            </span>
                            <span className={TEXT.muted}>
                                {grade.label} · GPA {grade.gpa.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown — how the total was reached, component by component. */}
            {Object.keys(bd).length > 0 && (
                <div className={cn(SURFACE.card, 'p-5')}>
                    <p className={cn(TEXT.eyebrow, 'mb-3.5')}>How this was calculated</p>

                    <div className="space-y-3.5">
                        {Object.entries(bd).map(([type, data]) => {
                            const compPct = data.maxMarks > 0 ? (data.earned / data.maxMarks) * 100 : 0
                            return (
                                <div key={type} className="space-y-1.5">
                                    <div className="flex items-baseline justify-between gap-3 text-[13px]">
                                        <span className="font-medium text-foreground">{type}</span>
                                        <span className="tabular-nums text-muted-foreground">
                                            <span className="font-semibold text-foreground">
                                                {data.earned.toFixed(1)}
                                            </span>
                                            {' / '}{data.maxMarks}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${compPct}%` }}
                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                            className={cn(
                                                'h-full rounded-full',
                                                compPct >= 40 ? 'bg-primary' : 'bg-destructive',
                                            )}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    )
}
