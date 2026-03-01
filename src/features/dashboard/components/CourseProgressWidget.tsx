import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight } from 'lucide-react'
import ProgressBar from '@/components/ui/ProgressBar'
import { useCourses } from '@/features/courses/hooks/useCourses'

export default function CourseProgressWidget() {
    const { courses, isLoading } = useCourses()
    const active = courses.filter((c) => !c.isArchived).slice(0, 5)

    return (
        <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> My Courses
                </h3>
                <Link to="/courses" className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                            <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-2 bg-muted rounded animate-pulse w-full" />
                        </div>
                    ))}
                </div>
            ) : active.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No active courses</p>
            ) : (
                <div className="space-y-4">
                    {active.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                        >
                            <Link to={`/courses/${c.id}`} className="block group">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-sm font-medium text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                                        {c.title}
                                    </p>
                                    <span className="text-xs text-muted-foreground shrink-0 ml-2 font-mono">{c.courseCode}</span>
                                </div>
                                <ProgressBar
                                    value={Math.floor(Math.random() * 60) + 30}
                                    size="sm"
                                    color="primary"
                                    animated={false}
                                    showPercent
                                    label={c.department}
                                />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
