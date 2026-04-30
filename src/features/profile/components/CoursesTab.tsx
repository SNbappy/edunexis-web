import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, Archive } from "lucide-react"
import type { PublicProfileDto } from "@/types/auth.types"
import { isTeacher } from "@/utils/roleGuard"
import ProfileCoursesList from "./ProfileCoursesList"

interface CoursesTabProps {
    profile: PublicProfileDto
    isSelf: boolean
}

export default function CoursesTab({ profile: p, isSelf }: CoursesTabProps) {
    const teacher = isTeacher(p.role)
    const total = p.runningCoursesCount + p.archivedCoursesCount

    // Split the preview list. We only have 6 courses preview from /profile/{id};
    // for the full list users navigate to /users/:id/courses.
    const running = p.courses.filter(c => !c.isArchived)
    const archived = p.courses.filter(c => c.isArchived)

    if (total === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
                <p className="mt-4 font-display text-[15px] font-semibold text-foreground">
                    {teacher ? "No courses taught yet" : "No enrolled courses"}
                </p>
                <p className="mt-1.5 text-[13px] text-muted-foreground">
                    {isSelf
                        ? (teacher
                            ? "Courses you create will appear here."
                            : "Courses you join will appear here.")
                        : (teacher
                            ? "This teacher hasn't created any courses yet."
                            : "This student isn't enrolled in any courses you can see.")}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {running.length > 0 && (
                <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-teal-600" />
                            <h2 className="font-display text-[15px] font-bold text-foreground">
                                Running
                            </h2>
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                                {p.runningCoursesCount}
                            </span>
                        </div>
                    </div>
                    <ProfileCoursesList
                        courses={running}
                        isSelf={isSelf}
                        isTeacher={teacher}
                    />
                </section>
            )}

            {archived.length > 0 && (
                <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Archive className="h-4 w-4 text-muted-foreground" />
                            <h2 className="font-display text-[15px] font-bold text-foreground">
                                Archived
                            </h2>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                                {p.archivedCoursesCount}
                            </span>
                        </div>
                    </div>
                    <ProfileCoursesList
                        courses={archived}
                        isSelf={isSelf}
                        isTeacher={teacher}
                    />
                </section>
            )}

            {total > p.courses.length && (
                <div className="flex justify-center">
                    <Link
                        to={`/users/${p.userId}/courses`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-[13px] font-bold text-foreground transition-colors hover:border-teal-300 hover:bg-teal-50 dark:hover:border-teal-700 dark:hover:bg-teal-950/30"
                    >
                        View all {total} courses
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            )}
        </div>
    )
}