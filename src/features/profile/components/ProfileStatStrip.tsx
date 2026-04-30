import { BookOpen, Archive, FileText, GraduationCap } from "lucide-react"
import type { PublicProfileDto } from "@/types/auth.types"

interface ProfileStatStripProps {
    profile: PublicProfileDto
}

interface Stat {
    icon: React.ElementType
    label: string
    value: number
}

export default function ProfileStatStrip({ profile: p }: ProfileStatStripProps) {
    const teacher = p.role === "Teacher"

    const stats: Stat[] = []

    // Courses (running)
    if (p.runningCoursesCount > 0) {
        stats.push({
            icon: BookOpen,
            label: teacher ? "Active courses" : "Enrolled",
            value: p.runningCoursesCount,
        })
    }

    // Archived
    if (p.archivedCoursesCount > 0) {
        stats.push({
            icon: Archive,
            label: teacher ? "Past courses" : "Completed",
            value: p.archivedCoursesCount,
        })
    }

    // Publications (teachers)
    if (teacher && p.publications.length > 0) {
        stats.push({
            icon: FileText,
            label: "Publications",
            value: p.publications.length,
        })
    }

    // Education entries
    if (p.education.length > 0) {
        stats.push({
            icon: GraduationCap,
            label: "Education",
            value: p.education.length,
        })
    }

    if (stats.length === 0) return null

    return (
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-4">
            {stats.map(s => {
                const Icon = s.icon
                return (
                    <div key={s.label} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
                            <Icon className="h-5 w-5" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-display text-xl font-bold leading-none text-foreground">
                                {s.value}
                            </p>
                            <p className="mt-1 truncate text-[11.5px] font-medium text-muted-foreground">
                                {s.label}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}