import { ArrowRight } from "lucide-react"
import type { PublicProfileDto, UserPublicationDto } from "@/types/auth.types"
import { isTeacher } from "@/utils/roleGuard"
import ChipList from "./ChipList"
import ProfileCoursesList from "./ProfileCoursesList"
import PublicationItem from "./PublicationItem"
import SectionHeader from "./SectionHeader"

interface OverviewTabProps {
  profile: PublicProfileDto
  isSelf: boolean
  onSeeAllCourses?: () => void
  onSeeResearch?: () => void
}

export default function OverviewTab(props: OverviewTabProps) {
  const { profile: p, isSelf, onSeeAllCourses, onSeeResearch } = props
  const teacher = isTeacher(p.role)
  const recentPubs: UserPublicationDto[] = p.publications.slice(0, 3)
  const totalCourses = p.runningCoursesCount + p.archivedCoursesCount
  const topCourses = p.courses.slice(0, 4)

  const seeAllCoursesAction = (totalCourses > topCourses.length && onSeeAllCourses) ? (
    <button
      type="button"
      onClick={onSeeAllCourses}
      className="inline-flex items-center gap-1 text-[12px] font-bold text-teal-700 transition-colors hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
    >
      View all ({totalCourses})
      <ArrowRight className="h-3 w-3" />
    </button>
  ) : undefined

  const seeAllPubsAction = (p.publications.length > recentPubs.length && onSeeResearch) ? (
    <button
      type="button"
      onClick={onSeeResearch}
      className="inline-flex items-center gap-1 text-[12px] font-bold text-teal-700 transition-colors hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
    >
      View all ({p.publications.length})
      <ArrowRight className="h-3 w-3" />
    </button>
  ) : undefined

  const seeMoreResearchAction = onSeeResearch ? (
    <button
      type="button"
      onClick={onSeeResearch}
      className="inline-flex items-center gap-1 text-[12px] font-bold text-teal-700 transition-colors hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300"
    >
      See more
      <ArrowRight className="h-3 w-3" />
    </button>
  ) : undefined

  return (
    <div className="space-y-5">
      {/* Biography - first, full attention */}
      {p.bio ? (
        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6 sm:p-7">
          <SectionHeader title="Biography" />
          <p className="whitespace-pre-wrap text-[15px] leading-7 text-foreground">
            {p.bio}
          </p>
        </section>
      ) : isSelf ? (
        <section className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 sm:p-7">
          <SectionHeader title="Biography" />
          <p className="text-[14px] text-muted-foreground">
            Your biography will appear here. Click {"\u201C"}Edit profile{"\u201D"} above to add one.
          </p>
        </section>
      ) : null}

      {/* Research interests (teacher only) */}
      {teacher && p.researchInterestsCsv ? (
        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6 sm:p-7">
          <SectionHeader title="Research interests" action={seeMoreResearchAction} />
          <ChipList csv={p.researchInterestsCsv} variant="teal" />
        </section>
      ) : null}

      {/* Recent publications (teacher only) */}
      {teacher && recentPubs.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6 sm:p-7">
          <SectionHeader
            title="Recent publications"
            count={p.publications.length}
            action={seeAllPubsAction}
          />
          <div className="space-y-2">
            {recentPubs.map(item => (
              <PublicationItem key={item.id} publication={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured courses */}
      {topCourses.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6 sm:p-7">
          <SectionHeader
            title={teacher ? "Teaching" : "Enrolled courses"}
            count={totalCourses}
            action={seeAllCoursesAction}
          />
          <ProfileCoursesList
            courses={topCourses}
            isSelf={isSelf}
            isTeacher={teacher}
          />
        </section>
      ) : null}

      {/* Fields of work (teacher only) */}
      {teacher && p.fieldsOfWorkCsv ? (
        <section className="rounded-2xl border border-border bg-card shadow-sm ring-1 ring-stone-200/50 dark:ring-white/5 p-6 sm:p-7">
          <SectionHeader title="Fields of work" />
          <ChipList csv={p.fieldsOfWorkCsv} variant="violet" />
        </section>
      ) : null}
    </div>
  )
}