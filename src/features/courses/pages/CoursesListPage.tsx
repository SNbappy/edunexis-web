import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Search, Grid3X3, List, Plus, Users,
  TrendingUp, Layers, X, BookMarked, Archive,
  LogIn, ChevronRight,
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import { useCourses } from "@/features/courses/hooks/useCourses"
import CourseCard from "@/features/courses/components/CourseCard"
import { ROUTES } from "@/config/constants"

type ViewMode = "grid" | "list"
type SortMode = "name" | "newest" | "students"

const PALETTE = [
  { color: "#6366f1", light: "#eef2ff", darkBg: "rgba(99,102,241,0.12)", border: "#c7d2fe", darkBorder: "rgba(99,102,241,0.25)" },
  { color: "#0891b2", light: "#ecfeff", darkBg: "rgba(8,145,178,0.12)",  border: "#a5f3fc", darkBorder: "rgba(6,182,212,0.25)"  },
  { color: "#d97706", light: "#fffbeb", darkBg: "rgba(217,119,6,0.12)",  border: "#fde68a", darkBorder: "rgba(251,191,36,0.25)" },
]

export default function CoursesListPage() {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const navigate  = useNavigate()
  const { courses = [], isLoading } = useCourses()

  const [search, setSearch] = useState("")
  const [view,   setView]   = useState<ViewMode>("grid")
  const [sort,   setSort]   = useState<SortMode>("newest")

  const totalStudents = useMemo(() => courses.reduce((s: number, c: any) => s + (c.memberCount ?? 0), 0), [courses])
  const totalTasks    = useMemo(() => courses.reduce((s: number, c: any) => s + (c.assignmentCount ?? 0), 0), [courses])

  const filtered = useMemo(() => {
    let list = [...courses]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c: any) =>
        c.title?.toLowerCase().includes(q) ||
        c.courseCode?.toLowerCase().includes(q) ||
        c.teacherName?.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case "name":    list.sort((a, b) => a.title?.localeCompare(b.title ?? "") ?? 0); break
      case "students": list.sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0)); break
      case "newest":  list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()); break
    }
    return list
  }, [courses, search, sort])

  // Theme tokens
  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#8896c8" : "#6b7280"
  const textMuted = dark ? "#5a6a9a" : "#9ca3af"
  const cardBg    = dark ? "rgba(16,24,44,0.7)"  : "rgba(255,255,255,0.85)"
  const cardBlur  = "blur(20px)"
  const borderCol = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const inputBg   = dark ? "rgba(255,255,255,0.05)" : "#f9fafb"
  const hoverBg   = dark ? "rgba(99,102,241,0.08)" : "#f9fafb"

  const STATS = [
    { label: "My Courses",    value: courses.length,  icon: BookMarked, ...PALETTE[0] },
    { label: teacher ? "Total Students" : "Assignments", value: teacher ? totalStudents : totalTasks, icon: teacher ? Users : Layers, ...PALETTE[1] },
    { label: teacher ? "Total Tasks"    : "Active",     value: teacher ? totalTasks : courses.filter((c: any) => !c.isArchived).length, icon: teacher ? Archive : TrendingUp, ...PALETTE[2] },
  ]

  return (
    <div className="min-h-full">
      {/* -- Page header -- */}
      <div className="px-6 lg:px-8 pt-7 pb-5 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[24px] font-extrabold tracking-tight" style={{ color: textMain }}>
              {teacher ? "My Courses" : "Enrolled Courses"}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: textMuted }}>
              {courses.length} course{courses.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className="flex items-center gap-2">
            {teacher ? (
              <Link to="/courses/create">
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer text-white"
                  style={{ background: "#6366f1", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                  <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} /> Create Course
                </motion.div>
              </Link>
            ) : (
              <Link to="/courses/join">
                <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer text-white"
                  style={{ background: "#6366f1", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                  <LogIn style={{ width: 15, height: 15 }} strokeWidth={2.5} /> Join Course
                </motion.div>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-4 mb-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.05 }}
              whileHover={{ y: -2, boxShadow: `0 8px 24px ${s.color}22` }}
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: cardBg, backdropFilter: cardBlur, WebkitBackdropFilter: cardBlur, border: `1px solid ${dark ? s.darkBorder : s.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: dark ? s.darkBg : s.light }}>
                <s.icon style={{ width: 18, height: 18, color: s.color }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[22px] font-extrabold leading-none" style={{ color: textMain }}>{s.value}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: textMuted }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search + filter bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: textMuted }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="w-full h-10 pl-9 pr-9 rounded-xl text-[13px] font-medium outline-none transition-all"
              style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textMain }}
              onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
              onBlur={e => { e.target.style.borderColor = borderCol; e.target.style.boxShadow = "none" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: textMuted }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value as SortMode)}
            className="h-10 px-3 rounded-xl text-[13px] font-medium outline-none transition-all"
            style={{ background: inputBg, border: `1px solid ${borderCol}`, color: textMain }}>
            <option value="newest">Newest First</option>
            <option value="name">Name A-Z</option>
            <option value="students">Most Students</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center rounded-xl overflow-hidden"
            style={{ border: `1px solid ${borderCol}`, background: inputBg }}>
            {(["grid", "list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="w-9 h-10 flex items-center justify-center transition-all"
                style={{ background: view === v ? (dark ? "rgba(99,102,241,0.2)" : "#eef2ff") : "transparent", color: view === v ? "#6366f1" : textMuted }}>
                {v === "grid" ? <Grid3X3 style={{ width: 15, height: 15 }} /> : <List style={{ width: 15, height: 15 }} />}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* -- Course list -- */}
      <div className="px-6 lg:px-8 pb-10 max-w-7xl mx-auto">
        {isLoading ? (
          <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-3"}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl animate-pulse"
                style={{ height: view === "grid" ? 220 : 80, background: dark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 rounded-2xl"
            style={{ background: cardBg, backdropFilter: cardBlur, WebkitBackdropFilter: cardBlur, border: `2px dashed ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}` }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff" }}>
              <BookOpen style={{ width: 28, height: 28, color: "#6366f1" }} strokeWidth={1.5} />
            </div>
            <p className="text-[16px] font-bold mb-1" style={{ color: textMain }}>
              {search ? "No courses found" : "No courses yet"}
            </p>
            <p className="text-[13px] mb-6" style={{ color: textSub }}>
              {search ? `No results for "${search}"` : teacher ? "Create your first course to get started" : "Join a course to begin learning"}
            </p>
            {!search && (
              <Link to={teacher ? "/courses/create" : "/courses/join"}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer text-white"
                  style={{ background: "#6366f1", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                  <Plus style={{ width: 15, height: 15 }} />
                  {teacher ? "Create Course" : "Join a Course"}
                </motion.div>
              </Link>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={view}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-3"}>
              {filtered.map((course: any, i: number) => (
                <CourseCard key={course.id} course={course} index={i}
                  isTeacher={teacher} viewMode={view} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
