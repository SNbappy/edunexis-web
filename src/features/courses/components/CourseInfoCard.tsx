import { motion } from 'framer-motion'
import { Copy, Check, Users, BookOpen, Clock, Hash } from 'lucide-react'
import { useState } from 'react'
import Badge from '@/components/ui/Badge'
import type { CourseDto } from '@/types/course.types'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

interface Props { course: CourseDto }

export default function CourseInfoCard({ course }: Props) {
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')
    const [copied, setCopied] = useState(false)

    const copyCode = async () => {
        await navigator.clipboard.writeText(course.joiningCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{course.title}</h3>
                    <Badge variant={course.courseType === 'Lab' ? 'cyan' as never : 'default'}>{course.courseType}</Badge>
                </div>
                {course.description && <p className="text-sm text-muted-foreground">{course.description}</p>}
            </div>

            <div className="space-y-2 text-sm">
                {[
                    { icon: <Hash className="w-3.5 h-3.5" />, label: course.courseCode },
                    { icon: <BookOpen className="w-3.5 h-3.5" />, label: `${course.creditHours} Credits · ${course.semester}` },
                    { icon: <Users className="w-3.5 h-3.5" />, label: `${course.memberCount} Students` },
                    { icon: <Clock className="w-3.5 h-3.5" />, label: course.academicSession },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            {teacher && (
                <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Joining Code</p>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted border border-border">
                        <span className="font-mono font-bold text-primary flex-1 tracking-widest text-sm">{course.joiningCode}</span>
                        <button
                            onClick={copyCode}
                            className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
                        >
                            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">Share this code with students to join</p>
                </div>
            )}
        </motion.div>
    )
}
