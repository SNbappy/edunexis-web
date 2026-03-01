import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, BookOpen, MoreVertical, Archive, Trash2, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import Badge from '@/components/ui/Badge'
import { cn } from '@/utils/cn'
import type { CourseSummaryDto } from '@/types/course.types'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

const COVER_GRADIENTS = [
    'from-indigo-600 via-violet-600 to-purple-700',
    'from-cyan-500 via-blue-500 to-indigo-600',
    'from-violet-600 via-purple-600 to-pink-600',
    'from-emerald-500 via-teal-500 to-cyan-600',
    'from-amber-500 via-orange-500 to-rose-500',
    'from-rose-500 via-pink-500 to-fuchsia-600',
]

function getCoverGradient(str: string) {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return COVER_GRADIENTS[Math.abs(hash) % COVER_GRADIENTS.length]
}

interface CourseCardProps {
    course: CourseSummaryDto
    index?: number
    onArchive?: (id: string) => void
    onDelete?: (id: string) => void
}

export default function CourseCard({ course, index = 0, onArchive, onDelete }: CourseCardProps) {
    const { user } = useAuthStore()
    const canManage = isTeacher(user?.role ?? 'Student')
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const gradient = getCoverGradient(course.id)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group glass-card rounded-2xl overflow-hidden hover:shadow-card-hover hover:border-primary/20 transition-all duration-300"
        >
            {/* Cover */}
            <Link to={`/courses/${course.id}`}>
                <div className={cn('h-36 bg-gradient-to-br relative overflow-hidden', gradient)}>
                    {course.coverImageUrl && !course.coverImageUrl.startsWith('#') ? (
                        <img src={course.coverImageUrl} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BookOpen className="w-12 h-12 text-white/30" />
                        </div>
                    )}
                    {/* Shimmer overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Course code chip */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/30 backdrop-blur-sm text-white text-xs font-mono font-bold">
                        {course.courseCode}
                    </div>
                    {/* Archive badge */}
                    {course.isArchived && (
                        <div className="absolute top-3 right-3">
                            <Badge variant="muted">Archived</Badge>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <Link to={`/courses/${course.id}`} className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {course.title}
                        </h3>
                    </Link>

                    {/* Actions menu */}
                    {canManage && (
                        <div className="relative shrink-0" ref={menuRef}>
                            <button
                                onClick={() => setMenuOpen((o) => !o)}
                                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            {menuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute right-0 top-full mt-1 w-44 glass-card rounded-xl shadow-xl border border-border z-20 overflow-hidden"
                                >
                                    <Link
                                        to={`/courses/${course.id}`}
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <Settings className="w-4 h-4" /> Manage Course
                                    </Link>
                                    {onArchive && (
                                        <button
                                            onClick={() => { onArchive(course.id); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                        >
                                            <Archive className="w-4 h-4" /> {course.isArchived ? 'Unarchive' : 'Archive'}
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={() => { onDelete(course.id); setMenuOpen(false) }}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Delete Course
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 shrink-0" />
                        {course.teacherName}
                    </p>
                    <div className="flex items-center justify-between">
                        <Badge variant="muted">{course.department}</Badge>
                        <span className="text-xs text-muted-foreground">{course.academicSession}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
