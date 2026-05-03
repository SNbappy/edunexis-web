import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, BookOpen, GraduationCap, FileText, MapPin } from "lucide-react"
import { useFacultyBySlug } from "../hooks/useFaculty"
import PublicFacultyIdentityCard from "../components/PublicFacultyIdentityCard"
import PublicFacultyTabs, { type FacultyTabKey } from "../components/PublicFacultyTabs"
import type { PublicCourseDto } from "@/types/auth.types"

function csvList(csv: string | null): string[] {
  if (!csv) return []
  return csv.split(",").map(s => s.trim()).filter(Boolean)
}

export default function FacultyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: profile, isLoading, isFetched } = useFacultyBySlug(slug)
  const [activeTab, setActiveTab] = useState<FacultyTabKey>("overview")

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 lg:px-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-card" />
          <div className="space-y-5">
            <div className="h-12 w-72 animate-pulse rounded-xl bg-card" />
            <div className="h-48 animate-pulse rounded-2xl bg-card" />
            <div className="h-32 animate-pulse rounded-2xl bg-card" />
          </div>
        </div>
      </div>
    )
  }

  if (isFetched && !profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-foreground">Faculty not found</h1>
        <p className="mt-2 text-[14px] text-muted-foreground">
          This profile may not exist or is no longer public.
        </p>
        <button
          type="button"
          onClick={() => navigate("/faculty")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-[13px] font-bold text-white hover:bg-teal-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse all faculty
        </button>
      </div>
    )
  }

  if (!profile) return null

  const research = csvList(profile.researchInterestsCsv)
  const fieldsOfWork = csvList(profile.fieldsOfWorkCsv)
  const activeCourses = profile.courses.filter((c: PublicCourseDto) => !c.isArchived)
  const archivedCourses = profile.courses.filter((c: PublicCourseDto) => c.isArchived)

  // Mirror the dashboard tab structure exactly: Overview, Courses, Research (teachers only), About.
  // Courses tab always shows even when empty (will display empty state inside).
  // Research tab always shows for faculty (this is a public-faculty-only page, so teacher === true).
  const tabs: { key: FacultyTabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "courses", label: "Courses" },
    { key: "research", label: "Research" },
    { key: "about", label: "About" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-5 lg:px-6">
      {/* Back link */}
      <Link
        to="/faculty"
        className="mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All faculty
      </Link>

      {/* Two-column body — mirrors the dashboard ProfilePage layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Identity card (sticky on desktop) */}
        <div className="lg:sticky lg:top-5 lg:self-start">
          <PublicFacultyIdentityCard profile={profile} />
        </div>

        {/* Right column: tabs + tab content */}
        <div className="min-w-0">
          <div className="mb-5 overflow-x-auto">
            <PublicFacultyTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          </div>

          {activeTab === "overview" ? (
            <OverviewPane profile={profile} research={research} fieldsOfWork={fieldsOfWork} />
          ) : null}
          {activeTab === "courses" ? (
            <CoursesPane active={activeCourses} archived={archivedCourses} />
          ) : null}
          {activeTab === "research" ? (
            <ResearchPane research={research} fields={fieldsOfWork} publications={profile.publications} />
          ) : null}
          {activeTab === "about" ? (
            <AboutPane profile={profile} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

/* ── Tab panes ────────────────────────────────────────────────────── */

function OverviewPane({ profile, research, fieldsOfWork }: any) {
  return (
    <div className="space-y-5">
      {profile.bio ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">About</h2>
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        </section>
      ) : null}

      {(research.length > 0 || fieldsOfWork.length > 0) ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">Research highlights</h2>
          {research.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Research interests
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {research.map((r: string) => (
                  <span
                    key={r}
                    className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11.5px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {fieldsOfWork.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Fields of work
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {fieldsOfWork.map((f: string) => (
                  <span
                    key={f}
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {profile.education.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-foreground" />
            <h2 className="font-display text-[15px] font-bold text-foreground">Education</h2>
          </div>
          <ul className="mt-4 space-y-4">
            {profile.education.map((e: any) => (
              <li key={e.id} className="border-l-2 border-teal-500 pl-4">
                <p className="font-display text-[13.5px] font-bold text-foreground">{e.degree}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {e.fieldOfStudy} | {e.institution}
                </p>
                <p className="mt-0.5 text-[11.5px] font-mono text-muted-foreground">
                  {e.startYear}{e.endYear ? " - " + e.endYear : " - present"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function CoursesPane({ active, archived }: { active: PublicCourseDto[]; archived: PublicCourseDto[] }) {
  if (active.length === 0 && archived.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-12 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-[13px] text-muted-foreground">No courses to display yet.</p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      {active.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-foreground" />
            <h2 className="font-display text-[15px] font-bold text-foreground">Active courses</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {active.map(c => <CourseRow key={c.id} course={c} active />)}
          </ul>
        </section>
      ) : null}

      {archived.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-muted-foreground">Past courses</h2>
          <ul className="mt-3 space-y-2">
            {archived.map(c => <CourseRow key={c.id} course={c} active={false} />)}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function CourseRow({ course, active }: { course: PublicCourseDto; active: boolean }) {
  // Course rows are read-only — no link, no clickable state. Public viewers
  // can see what's offered but cannot enter the course.
  return (
    <div
      className={
        "flex items-center justify-between rounded-xl border border-border px-4 py-3 " +
        (active ? "" : "opacity-70")
      }
    >
      <div className="min-w-0">
        <p className="truncate font-display text-[13px] font-bold text-foreground">{course.title}</p>
        <p className="mt-0.5 text-[11.5px] font-mono text-muted-foreground">
          {course.courseCode} | {course.semester}
        </p>
      </div>
      {active ? (
        <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold uppercase text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
          Active
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10.5px] font-bold uppercase text-stone-600 dark:bg-stone-900/60 dark:text-stone-400">
          Archived
        </span>
      )}
    </div>
  )
}

function ResearchPane({ research, fields, publications }: { research: string[]; fields: string[]; publications: any[] }) {
  if (research.length === 0 && fields.length === 0 && publications.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-12 text-center">
        <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-[13px] text-muted-foreground">No research details to display yet.</p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      {(research.length > 0 || fields.length > 0) ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">Areas of focus</h2>
          {research.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Research interests
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {research.map(r => (
                  <span
                    key={r}
                    className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11.5px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {fields.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Fields of work
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {fields.map(f => (
                  <span
                    key={f}
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {publications.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground" />
            <h2 className="font-display text-[15px] font-bold text-foreground">Publications</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {publications.map(p => (
              <li key={p.id} className="rounded-xl border border-border p-4">
                <p className="font-display text-[13.5px] font-bold text-foreground">{p.title}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">{p.authors}</p>
                <p className="mt-1 text-[11.5px] text-muted-foreground">
                  {p.venue ? p.venue + " | " : ""}{p.year} | {p.type}
                </p>
                {p.url ? (
                  <Link
                    to={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    reloadDocument
                    className="mt-2 inline-flex text-[11.5px] font-bold text-teal-700 hover:underline dark:text-teal-300"
                  >
                    View paper
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function AboutPane({ profile }: { profile: any }) {
  return (
    <div className="space-y-5">
      {profile.bio ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">About</h2>
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        </section>
      ) : null}

      {(profile.officeLocation || profile.officeHours) ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-[15px] font-bold text-foreground">Office</h2>
          <div className="mt-3 space-y-2.5">
            {profile.officeLocation ? (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <p className="text-[13px] text-foreground">{profile.officeLocation}</p>
              </div>
            ) : null}
            {profile.officeHours ? (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[12px] font-bold uppercase text-muted-foreground">
                  Hours:
                </span>
                <p className="text-[13px] text-foreground">{profile.officeHours}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {profile.education.length > 0 ? (
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-foreground" />
            <h2 className="font-display text-[15px] font-bold text-foreground">Education</h2>
          </div>
          <ul className="mt-4 space-y-4">
            {profile.education.map((e: any) => (
              <li key={e.id} className="border-l-2 border-teal-500 pl-4">
                <p className="font-display text-[13.5px] font-bold text-foreground">{e.degree}</p>
                <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                  {e.fieldOfStudy} | {e.institution}
                </p>
                <p className="mt-0.5 text-[11.5px] font-mono text-muted-foreground">
                  {e.startYear}{e.endYear ? " - " + e.endYear : " - present"}
                </p>
                {e.description ? (
                  <p className="mt-1.5 text-[12.5px] text-muted-foreground">{e.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}