import { Link, useParams, useLocation } from 'react-router-dom'
import {
    Megaphone, ClipboardCheck, FolderOpen,
    ClipboardList, BookMarked, Mic, BarChart3, Users,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { COURSE_TABS } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'

const TABS = [
    { key: COURSE_TABS.STREAM, label: 'Stream', icon: <Megaphone className="w-4 h-4" /> },
    { key: COURSE_TABS.ATTENDANCE, label: 'Attendance', icon: <ClipboardCheck className="w-4 h-4" /> },
    { key: COURSE_TABS.MATERIALS, label: 'Materials', icon: <FolderOpen className="w-4 h-4" /> },
    { key: COURSE_TABS.ASSIGNMENTS, label: 'Assignments', icon: <ClipboardList className="w-4 h-4" /> },
    { key: COURSE_TABS.CT, label: 'CT', icon: <BookMarked className="w-4 h-4" /> },
    { key: COURSE_TABS.PRESENTATIONS, label: 'Presentations', icon: <Mic className="w-4 h-4" /> },
    { key: COURSE_TABS.MARKS, label: 'Marks', icon: <BarChart3 className="w-4 h-4" /> },
    { key: COURSE_TABS.MEMBERS, label: 'Members', icon: <Users className="w-4 h-4" /> },
]

export default function CourseTabNav() {
    const { courseId, tab } = useParams()
    const { user } = useAuthStore()

    return (
        <nav className="flex items-center gap-1 px-6 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
                const active = tab === t.key
                return (
                    <Link
                        key={t.key}
                        to={`/courses/${courseId}/${t.key}`}
                        className={cn(
                            'flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all',
                            active
                                ? 'text-primary border-primary'
                                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                        )}
                    >
                        {t.icon}
                        <span className="hidden sm:inline">{t.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
