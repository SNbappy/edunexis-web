import { NavLink, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COURSE_TABS } from '@/config/constants'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import {
    Megaphone, UserCheck, FolderOpen, ClipboardList,
    FileText, Presentation, BarChart3, Users,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const tabs = [
    { key: COURSE_TABS.STREAM, label: 'Stream', icon: <Megaphone className="w-4 h-4" /> },
    { key: COURSE_TABS.ATTENDANCE, label: 'Attendance', icon: <UserCheck className="w-4 h-4" /> },
    { key: COURSE_TABS.MATERIALS, label: 'Materials', icon: <FolderOpen className="w-4 h-4" /> },
    { key: COURSE_TABS.ASSIGNMENTS, label: 'Assignments', icon: <ClipboardList className="w-4 h-4" /> },
    { key: COURSE_TABS.CT, label: 'CT', icon: <FileText className="w-4 h-4" /> },
    { key: COURSE_TABS.PRESENTATIONS, label: 'Presentations', icon: <Presentation className="w-4 h-4" /> },
    { key: COURSE_TABS.MARKS, label: 'Marks', icon: <BarChart3 className="w-4 h-4" /> },
    { key: COURSE_TABS.MEMBERS, label: 'Members', icon: <Users className="w-4 h-4" /> },
]

export default function CourseTabNav() {
    const { courseId } = useParams()
    const { user } = useAuthStore()
    const teacher = isTeacher(user?.role ?? 'Student')

    const visibleTabs = tabs.filter((t) => {
        if (t.key === COURSE_TABS.MEMBERS) return teacher
        return true
    })

    return (
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border px-6 bg-card">
            {visibleTabs.map((tab) => (
                <NavLink
                    key={tab.key}
                    to={`/courses/${courseId}/${tab.key}`}
                    className={({ isActive }) => cn(
                        'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px',
                        isActive
                            ? 'text-primary border-primary'
                            : 'text-muted-foreground border-transparent hover:text-foreground hover:border-border'
                    )}
                >
                    {tab.icon}
                    {tab.label}
                </NavLink>
            ))}
        </div>
    )
}
