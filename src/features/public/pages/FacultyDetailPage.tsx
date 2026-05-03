import { useParams, Link, useNavigate } from "react-router-dom"
import {
  MapPin, Clock, BookOpen, GraduationCap, FileText,
  Globe, ArrowLeft, Lock, ExternalLink,
} from "lucide-react"
import { FaLinkedinIn, FaGithub, FaXTwitter, FaFacebookF } from "react-icons/fa6"
import { useFacultyBySlug } from "../hooks/useFaculty"
import type { PublicCourseDto } from "@/types/auth.types"

function csvList(csv: string | null) {
  if (!csv) return []
  return csv.split(",").map(s => s.trim()).filter(Boolean)
}

const SOCIAL_LINKS = [
  { key: "linkedInUrl", label: "LinkedIn", Icon: FaLinkedinIn, color: "bg-[#0A66C2] text-white" },
  { key: "gitHubUrl", label: "GitHub", Icon: FaGithub, color: "bg-[#181717] text-white dark:bg-[#2a2a2a]" },
  { key: "twitterUrl", label: "X / Twitter", Icon: FaXTwitter, color: "bg-black text-white" },
  { key: "facebookUrl", label: "Facebook", Icon: FaFacebookF, color: "bg-[#1877F2] text-white" },
] as const

export default function FacultyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: profile, isLoading, isFetched } = useFacultyBySlug(slug)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-48 animate-pulse rounded-3xl bg-card" />
        <div className="mt-6 h-12 w-1/2 animate-pulse rounded-xl bg-card" />
        <div className="mt-3 h-4 w-2/3 animate-pulse rounded-lg bg-card" />
        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-card" />
          <div className="h-96 animate-pulse rounded-2xl bg-card" />
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

  const initials = profile.fullName
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(s => s[0]?.toUpperCase()).join("")

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Back link */}
      <Link
        to="/faculty"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All faculty
      </Link>

      {/* Hero */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-card">
        {/* Cover */}
        <div className="relative h-32 sm:h-44 lg:h-52 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500">
          {profile.coverPhotoUrl ? (
            <img
              src={profile.coverPhotoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        {/* Identity */}
        <div className="relative px-5 pb-6 pt-0 sm:px-8 sm:pb-7">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profile.profilePhotoUrl ? (
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  className="h-24 w-24 shrink-0 rounded-2xl border-4 border-card object-cover sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-teal-100 text-2xl font-bold text-teal-700 sm:h-28 sm:w-28 dark:bg-teal-950/40 dark:text-teal-300">
                  {initials || "T"}
                </div>
              )}
              <div className="min-w-0 pb-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {profile.fullName}
                </h1>
                {profile.designation ? (
                  <p className="mt-0.5 text-[13.5px] font-semibold text-muted-foreground">
                    {profile.designation}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {profile.headline ? (
            <p className="mt-5 text-[14px] italic text-muted-foreground">
              {profile.headline}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px]">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
              <MapPin className="h-3 w-3" />
              {profile.department}
            </span>
            {profile.coursesTaught > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                <BookOpen className="h-3 w-3" />
                {profile.coursesTaught} active {profile.coursesTaught === 1 ? "course" : "courses"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Body grid: main + sidebar */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Bio */}
          {profile.bio ? (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <h2 className="font-display text-[15px] font-bold text-foreground">About</h2>
              <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            </section>
          ) : null}

          {/* Research interests + fields of work */}
          {(research.length > 0 || fieldsOfWork.length > 0) ? (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <h2 className="font-display text-[15px] font-bold text-foreground">Research & expertise</h2>
              {research.length > 0 ? (
                <div className="mt-4">
                  <p className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Research interests
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {research.map(r => (
                      <span
                        key={r}
                        className="rounded-lg bg-teal-50 px-2.5 py-1 text-[12px] font-semibold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {fieldsOfWork.length > 0 ? (
                <div className="mt-5">
                  <p className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fields of work
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {fieldsOfWork.map(f => (
                      <span
                        key={f}
                        className="rounded-lg bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Education */}
          {profile.education.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-foreground" />
                <h2 className="font-display text-[15px] font-bold text-foreground">Education</h2>
              </div>
              <ul className="mt-4 space-y-4">
                {profile.education.map(e => (
                  <li key={e.id} className="border-l-2 border-teal-500 pl-4">
                    <p className="font-display text-[13.5px] font-bold text-foreground">{e.degree}</p>
                    <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                      {e.fieldOfStudy} Ãƒâ€šÃ‚Â· {e.institution}
                    </p>
                    <p className="mt-0.5 text-[11.5px] font-mono text-muted-foreground">
                      {e.startYear}{e.endYear ? ` ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ ${e.endYear}` : " ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“ present"}
                    </p>
                    {e.description ? (
                      <p className="mt-1.5 text-[12.5px] text-muted-foreground">{e.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Publications */}
          {profile.publications.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-foreground" />
                <h2 className="font-display text-[15px] font-bold text-foreground">Publications</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {profile.publications.map(p => (
                  <li key={p.id} className="rounded-xl border border-border p-3.5">
                    <p className="font-display text-[13.5px] font-bold text-foreground">{p.title}</p>
                    <p className="mt-0.5 text-[12px] text-muted-foreground">{p.authors}</p>
                    <p className="mt-1 text-[11.5px] text-muted-foreground">
                      {p.venue ? `${p.venue} Ãƒâ€šÃ‚Â· ` : ""}{p.year} Ãƒâ€šÃ‚Â· {p.type}
                    </p>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-bold text-teal-700 hover:underline dark:text-teal-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View paper
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Courses */}
          {(activeCourses.length > 0 || archivedCourses.length > 0) ? (
            <section className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-foreground" />
                <h2 className="font-display text-[15px] font-bold text-foreground">Courses</h2>
              </div>
              {activeCourses.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {activeCourses.map(c => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-display text-[13px] font-bold text-foreground">{c.title}</p>
                        <p className="mt-0.5 text-[11.5px] font-mono text-muted-foreground">
                          {c.courseCode} Ãƒâ€šÃ‚Â· {c.semester}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-teal-50 px-2 py-0.5 text-[10.5px] font-bold uppercase text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                        Active
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {archivedCourses.length > 0 ? (
                <details className="mt-4">
                  <summary className="cursor-pointer text-[12px] font-semibold text-muted-foreground hover:text-foreground">
                    {archivedCourses.length} archived {archivedCourses.length === 1 ? "course" : "courses"}
                  </summary>
                  <ul className="mt-3 space-y-2">
                    {archivedCourses.map(c => (
                      <li
                        key={c.id}
                        className="rounded-xl border border-border px-3.5 py-2.5 opacity-70"
                      >
                        <p className="truncate font-display text-[13px] font-bold text-foreground">{c.title}</p>
                        <p className="mt-0.5 text-[11.5px] font-mono text-muted-foreground">
                          {c.courseCode} Ãƒâ€šÃ‚Â· {c.semester}
                        </p>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>
          ) : null}
        </div>

        {/* Sidebar column */}
        <aside className="space-y-6">
          {/* Office info */}
          {(profile.officeLocation || profile.officeHours) ? (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-[13px] font-bold text-foreground">Office</h3>
              {profile.officeLocation ? (
                <div className="mt-3 flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-[12.5px] text-foreground">{profile.officeLocation}</p>
                </div>
              ) : null}
              {profile.officeHours ? (
                <div className="mt-2.5 flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <p className="text-[12.5px] text-foreground">{profile.officeHours}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Links */}
          {(profile.websiteUrl || SOCIAL_LINKS.some(s => (profile as any)[s.key])) ? (
            <section className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-[13px] font-bold text-foreground">Links</h3>
              <div className="mt-3 space-y-2">
                {profile.websiteUrl ? (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white">
                      <Globe className="h-3.5 w-3.5" />
                    </span>
                    Personal website
                  </a>
                ) : null}
                {SOCIAL_LINKS.map(({ key, label, Icon, color }) => {
                  const url = (profile as any)[key]
                  if (!url) return null
                  return (
                      <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-border px-3 py-2 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      <span className={"flex h-7 w-7 items-center justify-center rounded-lg " + color}>
                        <Icon className="h-3 w-3" />
                      </span>
                      {label}
                    </a>
                  )
                })}
              </div>
            </section>
          ) : null}

          {/* Contact CTA */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[12.5px] font-bold text-foreground">Contact details are private</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">
                  Email and phone are only shared with course members.
                </p>
                <Link
                  to="/login"
                  className="mt-3 inline-flex text-[11.5px] font-bold text-teal-700 hover:underline dark:text-teal-300"
                >
                  Sign in to contact
                </Link>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
