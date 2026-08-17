import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { StatRing } from '@/components/ui/charts'
import { ICON_STROKE, SURFACE, TEXT } from '@/components/ui/appTokens'
import { useMarks } from '../hooks/useMarks'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/cn'

interface Props { courseId: string }

/**
 * A student's own result for a course.
 *
 * Reports marks and percentage only. It used to derive a letter grade and GPA
 * from GRADE_SCALE, which read as the official result — it is not. The
 * university computes the transcript; a course page stating "A-" and "GPA 3.5"
 * is at best a guess and at worst contradicts the record a student is graded
 * on. The percentage is what this course actually produced, so that is what it
 * shows.
 */

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
    const passing    = pct >= 40

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl space-y-4"
        >
            {/* Result: marks out of total, and the percentage on the ring.
                No letter grade, no GPA and no "Below Average" wording. A course
                result is one input to a transcript the university computes; a
                letter and a GPA shown here look authoritative and would be read
                as the official grade, which this is not. The percentage is the
                fact the course actually produced. */}
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
                                    'inline-flex items-center rounded-lg border px-2.5 py-1 font-display text-[15px] font-extrabold tabular-nums',
                                    passing
                                        ? 'border-success/25 bg-success-soft text-success'
                                        : 'border-destructive/25 bg-destructive-soft text-destructive',
                                )}
                            >
                                {pct.toFixed(1)}%
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
