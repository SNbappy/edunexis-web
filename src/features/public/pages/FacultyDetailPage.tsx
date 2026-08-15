import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, BookOpen, GraduationCap, FileText, MapPin } from "lucide-react"
import { useFacultyBySlug } from "../hooks/useFaculty"
import PublicFacultyTabs, { type FacultyTabKey } from "../components/PublicFacultyTabs"
import { getInitials } from "@/utils/names"
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
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-white" />
          <div className="space-y-5">
            <div className="h-12 w-72 animate-pulse rounded-xl bg-white" />
            <div className="h-48 animate-pulse rounded-2xl bg-white" />
            <div className="h-32 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </div>
    )
  }

  if (isFetched && !profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-2xl font-bold text-stone-900">Faculty not found</h1>
        <p className="mt-2 text-[14px] text-stone-500">
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

  const totalCourses = activeCourses.length + archivedCourses.length

  return (
    <div className="pb-16">
      {/* ── Ink hero ────────────────────────────────────────────────
          This page previously reused the dashboard's profile layout: a
          sticky card beside a tab column. On a public page that put a
          small name in a small card and, for any teacher without a bio,
          left the entire right-hand column empty — the first thing a
          visitor saw was a void.

          Identity now lives in the brand surface, at the scale the rest
          of the public site uses, and the body below is a single column
          so it can never be half-blank. */}
      <section className="relative overflow-hidden bg-teal-950">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-48 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(45,212,191,0.5) 0%, rgba(45,212,191,0.12) 45%, transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-5 lg:px-6">
          <Link
            to="/faculty"
            className="mb-8 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-teal-100/70 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All faculty
          </Link>

          <div className="flex flex-col gap-8 sm:flex-row sm:items-end">
            {/* Portrait */}
            <div className="h-36 w-36 shrink-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06] shadow-2xl sm:h-44 sm:w-44">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-5xl font-extrabold tracking-tight text-white/85">
                  {getInitials(profile.fullName)}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {profile.department ? (
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-teal-300/80">
                  {profile.department}
                </p>
              ) : null}

              <h1 className="mt-2 font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[42px]">
                {profile.fullName}
              </h1>

              {profile.designation ? (
                <p className="mt-2 text-[15px] font-semibold text-teal-300">
                  {profile.designation}
                </p>
              ) : null}

              {profile.headline ? (
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-teal-100/70">
                  {profile.headline}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-baseline gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                  <span className="font-display text-[16px] font-extrabold tabular-nums text-white">
                    {totalCourses}
                  </span>
                  <span className="text-[12.5px] text-teal-100/70">
                    {totalCourses === 1 ? "course" : "courses"}
                  </span>
                </span>
                {profile.publications.length > 0 ? (
                  <span className="inline-flex items-baseline gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-sm">
                    <span className="font-display text-[16px] font-extrabold tabular-nums text-white">
                      {profile.publications.length}
                    </span>
                    <span className="text-[12.5px] text-teal-100/70">
                      {profile.publications.length === 1 ? "publication" : "publications"}
                    </span>
                  </span>
                ) : null}
                {profile.officeLocation ? (
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[12.5px] text-teal-100/80 backdrop-blur-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.officeLocation}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────
          Same max-width and padding as the hero, so the tabs line up with
          the name above them. A narrower body would have read as an
          indent rather than as a measure. */}
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-5 lg:px-6">
        <div className="mb-6">
          <PublicFacultyTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>

        {activeTab === "overview" ? (
          <OverviewPane
            profile={profile}
            research={research}
            fieldsOfWork={fieldsOfWork}
            activeCourses={activeCourses}
          />
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
  )
}

/* ── Tab panes ────────────────────────────────────────────────────── */

function OverviewPane({ profile, research, fieldsOfWork, activeCourses }: any) {
  /* Overview used to render nothing at all when a teacher had no bio, no
     research and no education — which is the common case for a freshly
     created account, and produced a completely blank page. It now always
     has something true to say: what they are currently teaching. */
  const hasAnyDetail =
    Boolean(profile.bio) ||
    research.length > 0 ||
    fieldsOfWork.length > 0 ||
    profile.education.length > 0

  return (
    <div className="space-y-5">
      {profile.bio ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-stone-900">About</h2>
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-stone-500">
            {profile.bio}
          </p>
        </section>
      ) : null}

      {/* Currently teaching — the one thing a visitor looking up a
          lecturer almost always wants. */}
      {activeCourses.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-stone-900" />
            <h2 className="font-display text-[15px] font-bold text-stone-900">
              Currently teaching
            </h2>
          </div>
          <ul className="mt-4 space-y-2">
            {activeCourses.slice(0, 4).map((c: PublicCourseDto) => (
              <CourseRow key={c.id} course={c} active />
            ))}
          </ul>
        </section>
      ) : null}

      {!hasAnyDetail && activeCourses.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-stone-200 bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-stone-400" />
          <p className="mt-3 font-display text-[15px] font-bold text-stone-900">
            Profile coming soon
          </p>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-stone-500">
            {profile.fullName} hasn't added a biography or research details yet.
            Courses will appear here once they start teaching.
          </p>
        </section>
      ) : null}

      {(research.length > 0 || fieldsOfWork.length > 0) ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-stone-900">Research highlights</h2>
          {research.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-stone-500">
                Research interests
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {research.map((r: string) => (
                  <span
                    key={r}
                    className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11.5px] font-semibold text-teal-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {fieldsOfWork.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-stone-500">
                Fields of work
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {fieldsOfWork.map((f: string) => (
                  <span
                    key={f}
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700"
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
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-stone-900" />
            <h2 className="font-display text-[15px] font-bold text-stone-900">Education</h2>
          </div>
          <ul className="mt-4 space-y-4">
            {profile.education.map((e: any) => (
              <li key={e.id} className="border-l-2 border-teal-500 pl-4">
                <p className="font-display text-[13.5px] font-bold text-stone-900">{e.degree}</p>
                <p className="mt-0.5 text-[12.5px] text-stone-500">
                  {e.fieldOfStudy} | {e.institution}
                </p>
                <p className="mt-0.5 text-[11.5px] font-mono text-stone-500">
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
      <section className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-stone-500" />
        <p className="mt-3 text-[13px] text-stone-500">No courses to display yet.</p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      {active.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-stone-900" />
            <h2 className="font-display text-[15px] font-bold text-stone-900">Active courses</h2>
          </div>
          <ul className="mt-4 space-y-2">
            {active.map(c => <CourseRow key={c.id} course={c} active />)}
          </ul>
        </section>
      ) : null}

      {archived.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-stone-500">Past courses</h2>
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
        "flex items-center justify-between rounded-xl border border-stone-200 px-4 py-3 " +
        (active ? "" : "opacity-70")
      }
    >
      <div className="min-w-0">
        <p className="truncate font-display text-[13px] font-bold text-stone-900">{course.title}</p>
        <p className="mt-0.5 text-[11.5px] font-mono text-stone-500">
          {course.courseCode} | {course.semester}
        </p>
      </div>
      {active ? (
        <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold uppercase text-teal-700">
          Active
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10.5px] font-bold uppercase text-stone-600">
          Archived
        </span>
      )}
    </div>
  )
}

function ResearchPane({ research, fields, publications }: { research: string[]; fields: string[]; publications: any[] }) {
  if (research.length === 0 && fields.length === 0 && publications.length === 0) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-12 text-center">
        <FileText className="mx-auto h-8 w-8 text-stone-500" />
        <p className="mt-3 text-[13px] text-stone-500">No research details to display yet.</p>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      {(research.length > 0 || fields.length > 0) ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-stone-900">Areas of focus</h2>
          {research.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-stone-500">
                Research interests
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {research.map(r => (
                  <span
                    key={r}
                    className="rounded-lg bg-teal-50 px-2.5 py-1 text-[11.5px] font-semibold text-teal-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {fields.length > 0 ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-stone-500">
                Fields of work
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {fields.map(f => (
                  <span
                    key={f}
                    className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-700"
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
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-stone-900" />
            <h2 className="font-display text-[15px] font-bold text-stone-900">Publications</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {publications.map(p => (
              <li key={p.id} className="rounded-xl border border-stone-200 p-4">
                <p className="font-display text-[13.5px] font-bold text-stone-900">{p.title}</p>
                <p className="mt-0.5 text-[12px] text-stone-500">{p.authors}</p>
                <p className="mt-1 text-[11.5px] text-stone-500">
                  {p.venue ? p.venue + " | " : ""}{p.year} | {p.type}
                </p>
                {p.url ? (
                  <Link
                    to={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    reloadDocument
                    className="mt-2 inline-flex text-[11.5px] font-bold text-teal-700 hover:underline"
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
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-stone-900">About</h2>
          <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-stone-500">
            {profile.bio}
          </p>
        </section>
      ) : null}

      {(profile.officeLocation || profile.officeHours) ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-display text-[15px] font-bold text-stone-900">Office</h2>
          <div className="mt-3 space-y-2.5">
            {profile.officeLocation ? (
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-500" />
                <p className="text-[13px] text-stone-900">{profile.officeLocation}</p>
              </div>
            ) : null}
            {profile.officeHours ? (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[12px] font-bold uppercase text-stone-500">
                  Hours:
                </span>
                <p className="text-[13px] text-stone-900">{profile.officeHours}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {profile.education.length > 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-stone-900" />
            <h2 className="font-display text-[15px] font-bold text-stone-900">Education</h2>
          </div>
          <ul className="mt-4 space-y-4">
            {profile.education.map((e: any) => (
              <li key={e.id} className="border-l-2 border-teal-500 pl-4">
                <p className="font-display text-[13.5px] font-bold text-stone-900">{e.degree}</p>
                <p className="mt-0.5 text-[12.5px] text-stone-500">
                  {e.fieldOfStudy} | {e.institution}
                </p>
                <p className="mt-0.5 text-[11.5px] font-mono text-stone-500">
                  {e.startYear}{e.endYear ? " - " + e.endYear : " - present"}
                </p>
                {e.description ? (
                  <p className="mt-1.5 text-[12.5px] text-stone-500">{e.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}