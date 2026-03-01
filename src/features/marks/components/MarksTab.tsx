import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Table2, RefreshCw } from 'lucide-react'
import Button from '@/components/ui/Button'
import Tabs from '@/components/ui/Tabs'
import { SkeletonCard } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import GradebookTable from './GradebookTable'
import GradebookSummaryCards from './GradebookSummaryCards'
import GradeDistributionChart from './GradeDistributionChart'
import ExportMarksButton from './ExportMarksButton'
import MyGradesView from './MyGradesView'
import { useGradebook } from '../hooks/useGradebook'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail'

interface Props { courseId: string }
type ViewTab = 'table' | 'charts'

export default function MarksTab({ courseId }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const { gradebook, isGradebookLoading, exportGradebook } = useGradebook(courseId)
    const { course } = useCourseDetail(courseId)
    const [view, setView] = useState<ViewTab>('table')

    // Students get their own view
    if (!teacher) return <MyGradesView courseId={courseId} />

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Gradebook</h2>
                    {gradebook && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {gradebook.rows.length} students · last updated just now
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {gradebook && (
                        <ExportMarksButton
                            gradebook={gradebook}
                            onExportExcel={exportGradebook}
                            courseTitle={course?.title}
                        />
                    )}
                    <Tabs
                        variant="boxed"
                        tabs={[
                            { key: 'table', label: 'Table', icon: <Table2 className="w-3.5 h-3.5" /> },
                            { key: 'charts', label: 'Charts', icon: <BarChart3 className="w-3.5 h-3.5" /> },
                        ]}
                        active={view}
                        onChange={(k) => setView(k as ViewTab)}
                    />
                </div>
            </motion.div>

            {/* Loading */}
            {isGradebookLoading && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} className="h-24" />)}
                    </div>
                    <SkeletonCard className="h-80" />
                </div>
            )}

            {/* Empty */}
            {!isGradebookLoading && !gradebook && (
                <EmptyState
                    icon={<BarChart3 className="w-8 h-8" />}
                    title="No gradebook data yet"
                    description="Add assignments, CT events, or presentations and grade them to see the gradebook"
                />
            )}

            {/* Gradebook content */}
            {gradebook && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Summary cards always visible */}
                    <GradebookSummaryCards summary={gradebook.summary} />

                    {view === 'table' ? (
                        <GradebookTable gradebook={gradebook} />
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <GradeDistributionChart summary={gradebook.summary} />

                            {/* Per-component averages */}
                            <div className="glass-card rounded-2xl p-5 space-y-4">
                                <h3 className="text-sm font-semibold text-foreground">Component Averages</h3>
                                <div className="space-y-3">
                                    {[
                                        ...gradebook.summary.columnTotals.assignments.map((a) => ({
                                            label: a.title, avg: a.average, total: a.totalMarks, icon: '📝',
                                        })),
                                        ...gradebook.summary.columnTotals.ctEvents.map((ct) => ({
                                            label: ct.title, avg: ct.average, total: ct.totalMarks, icon: '🧾',
                                        })),
                                        ...gradebook.summary.columnTotals.presentations.map((p) => ({
                                            label: p.title, avg: p.average, total: p.totalMarks, icon: '🎤',
                                        })),
                                    ].map((item, i) => {
                                        const pct = item.total > 0 ? (item.avg / item.total) * 100 : 0
                                        return (
                                            <div key={i} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground truncate max-w-[200px]">
                                                        {item.icon} {item.label}
                                                    </span>
                                                    <span className="font-semibold text-foreground shrink-0 ml-2">
                                                        {item.avg > 0 ? item.avg.toFixed(1) : '—'}/{item.total}
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ delay: i * 0.05, duration: 0.6 }}
                                                        className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' :
                                                                pct >= 60 ? 'bg-blue-500' :
                                                                    pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {gradebook.summary.columnTotals.assignments.length === 0 &&
                                        gradebook.summary.columnTotals.ctEvents.length === 0 &&
                                        gradebook.summary.columnTotals.presentations.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-4">No graded components yet</p>
                                        )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
