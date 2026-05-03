import { useMemo, useState } from "react"
import { Search, Users } from "lucide-react"
import PublicTeacherCard from "../components/PublicTeacherCard"
import { useFacultyList, useFacultyDepartments } from "../hooks/useFaculty"

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* Compact hero */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Faculty
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground sm:text-[14px]">
          Teachers across departments running their courses with EduNexis.
        </p>
      </div>

      {/* Search + filter row */}
      <div className="mx-auto mt-6 max-w-2xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, designation, or headline..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-[13.5px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>

      {/* Chips — only when 2+ departments */}
      {showChips ? (
        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setDepartment(undefined)}
            className={
              "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors " +
              (!department
                ? "bg-teal-600 text-white"
                : "border border-border bg-card text-foreground hover:bg-muted")
            }
          >
            All
          </button>
          {departments!.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setDepartment(d)}
              className={
                "rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors " +
                (department === d
                  ? "bg-teal-600 text-white"
                  : "border border-border bg-card text-foreground hover:bg-muted")
              }
            >
              {d}
            </button>
          ))}
        </div>
      ) : null}

      {/* Results */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-[14px] text-muted-foreground">
              Could not load faculty. Try refreshing.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-lg font-bold text-foreground">
              {searchQuery || department ? "No matches" : "Faculty directory is empty"}
            </h2>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {searchQuery || department
                ? "Try a different search term or department."
                : "Be the first to make your profile public from Settings."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-[12px] text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "teacher" : "teachers"}
              {department ? ` in ${department}` : ""}
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map(t => (
                <PublicTeacherCard key={t.slug} teacher={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}