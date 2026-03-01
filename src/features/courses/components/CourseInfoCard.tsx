import { BookOpen, User, Hash, GraduationCap, Calendar, Clock, Award } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { CourseDto } from '@/types/course.types'

interface Props { course: CourseDto }

export default function CourseInfoCard({ course }: Props) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Info</h3>

            <div className="space-y-3">
                {[
                    { icon: <Hash className="w-3.5 h-3.5" />, label: 'Code', value: course.courseCode },
                    { icon: <User className="w-3.5 h-3.5" />, label: 'Teacher', value: course.teacherName },
                    { icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Department', value: course.department },
                    { icon: <Calendar className="w-3.5 h-3.5" />, label: 'Session', value: course.academicSession },
                    { icon: <GraduationCap className="w-3.5 h-3.5" />, label: 'Semester', value: course.semester },
                    { icon: <Award className="w-3.5 h-3.5" />, label: 'Credits', value: `${course.creditHours} Credit Hours` },
                    { icon: <Clock className="w-3.5 h-3.5" />, label: 'Type', value: course.courseType },
                    ...(course.section ? [{ icon: <BookOpen className="w-3.5 h-3.5" />, label: 'Section', value: course.section }] : []),
                ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            {item.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                            <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Joining code */}
            {course.joiningCode && (
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1">
                    <p className="text-xs text-muted-foreground">Joining Code</p>
                    <p className="text-lg font-bold text-primary font-mono tracking-widest">{course.joiningCode}</p>
                    <p className="text-xs text-muted-foreground">Share with students to join</p>
                </div>
            )}

            {course.description && (
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">About</p>
                    <p className="text-xs text-foreground/80 leading-relaxed">{course.description}</p>
                </div>
            )}
        </div>
    )
}
