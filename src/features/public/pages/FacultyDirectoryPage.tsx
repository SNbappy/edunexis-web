import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Search, Users, X } from "lucide-react"
import PublicTeacherCard from "../components/PublicTeacherCard"
import { useFacultyList, useFacultyDepartments } from "../hooks/useFaculty"
import { Reveal, RevealLines, REVEAL_VIEWPORT, EASE } from "@/components/ui/motion"

/**
 * Faculty directory.
 *
 * Rebuilt to match the public design system: a proper hero with the shared
 * line-reveal heading, brand glows, and staggered card entrances.
 *
 * The grid is deliberately `auto-fill` with a fixed minimum rather than a
 * fixed 4-column layout. With one or two teachers the old grid left three
 * empty columns, which read as a broken page rather than a small directory.
 */
export default function FacultyDirectoryPage() {
  const [department, setDepartment] = useState<string | undefined>(undefined)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: faculty, isLoading, isError } = useFacultyList(department)
  const { data: departments } = useFacultyDepartments()

  const filtered = useMemo(() => {
    if (!faculty) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return faculty
    return faculty.filter(t =>
      t.fullName.toLowerCase().includes(q) ||
      (t.designation ?? "").toLowerCase().includes(q) ||
      (t.headline ?? "").toLowerCase().includes(q)
    )
  }, [faculty, searchQuery])

  // Hide department chips when only 0 or 1 departments — avoids looking like
  // we're prioritizing one specific department.
  const showChips = (departments?.length ?? 0) > 1
  const hasFilter = Boolean(searchQuery || department)

  return (
    <div className="bg-white text-stone-900">
      {/*
        A working header, not a marketing hero.

        This page exists to find a person, so a full-viewport centred splash
        was spending ~500px on a sentence nobody needs before they can search.
        Title and search sit on one line, filters and count on the next, and
        the grid starts immediately.
      */}
      <section className="relative overflow-hidden border-b border-stone-200/80">
        <div aria-hidden className="pointer-events-none absolute -top-40 left-1/3 h-[360px] w-[360px] rounded-full bg-teal-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <Reveal y={16}>
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.18em] text-teal-700">
                  Faculty directory
                </p>
                <h1 className="mt-2 font-display text-[30px] font-extrabold leading-tight tracking-tight text-stone-900 sm:text-[36px]">
                  Find a teacher
                </h1>
              </div>
            </Reveal>

            <Reveal y={16} delay={0.08}>
              <div className="relative w-full lg:w-[360px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Name, designation or focus…"
                  className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-10 text-[13.5px] text-stone-900 outline-none transition-all placeholder:text-stone-400 focus:border-teal-400 focus:shadow-[0_6px_18px_-8px_rgba(13,148,136,0.35)] focus:ring-2 focus:ring-teal-500/15"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search"
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </Reveal>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {showChips && (
                <>
                  <FilterChip active={!department} onClick={() => setDepartment(undefined)}>
                    All departments
                  </FilterChip>
                  {departments!.map(d => (
                    <FilterChip key={d} active={department === d} onClick={() => setDepartment(d)}>
                      {d}
                    </FilterChip>
                  ))}
                </>
              )}
            </div>
            {!isLoading && !isError && filtered.length > 0 && (
              <span className="text-[13px] text-stone-500">
                {filtered.length} {filtered.length === 1 ? "teacher" : "teachers"}
                {department ? ` in ${department}` : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Results ─────────────────────────────────────────────── */}
      <section className="relative pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl border border-stone-200 bg-stone-50" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="Could not load the directory"
              body="Something went wrong reaching the server. Refreshing usually fixes it."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={hasFilter ? "No matches" : "No public profiles yet"}
              body={
                hasFilter
                  ? "Try a different name, designation or department."
                  : "Teachers appear here once they make their profile public from Settings."
              }
            />
          ) : (
            /*
              Every profile gets the same card. A spotlight for whoever happens
              to be first would rank colleagues by list order, which isn't a
              judgement this page should be making.

              auto-fill with a fixed minimum keeps cards a sensible size and
              lets them wrap, so a short directory reads as a short directory
              rather than a broken grid.
            */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {filtered.map((t, i) => (
                <motion.div
                  key={t.slug}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.06, ease: EASE }}
                >
                  <PublicTeacherCard teacher={t} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-all " +
        (active
          ? "bg-gradient-to-b from-teal-700 to-teal-900 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_6px_16px_-8px_rgba(13,148,136,0.7)]"
          : "border border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:text-stone-900")
      }
    >
      {children}
    </button>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Reveal>
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-stone-50/60 px-8 py-14 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
          <Users className="h-5 w-5" strokeWidth={2} />
        </span>
        <h2 className="mt-5 font-display text-[18px] font-bold text-stone-900">{title}</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-stone-600">{body}</p>
      </div>
    </Reveal>
  )
}
