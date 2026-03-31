import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Search, Grid3X3, List, Plus, Users,
  TrendingUp, Layers, X, LogIn, BookMarked, Archive
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { useCourses } from "@/features/courses/hooks/useCourses"
import CourseCard from "@/features/courses/components/CourseCard"
import { ROUTES } from "@/config/constants"

type ViewMode = "grid" | "list"
type SortMode = "name" | "newest" | "students" | "progress"

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "name",     label: "Name A–Z" },
  { value: "newest",   label: "Newest First" },
  { value: "students", label: "Most Students" },
  { value: "progress", label: "Progress" },
]

export default function CoursesListPage() {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const navigate = useNavigate()

  const { courses = [], isLoading } = useCourses()

  const [search, setSearch] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [sort, setSort] = useState<SortMode>("newest")

  const totalStudents = useMemo(
    () => courses.reduce((s: number, c: any) => s + (c.memberCount ?? 0), 0),
    [courses]
  )
  const totalTasks = useMemo(
    () => courses.reduce((s: number, c: any) => s + (c.assignmentCount ?? 0), 0),
    [courses]
  )
  const avgProgress = useMemo(() => {
    const withProg = courses.filter((c: any) => c.progress != null)
    if (!withProg.length) return null
    return Math.round(
      withProg.reduce((s: number, c: any) => s + c.progress, 0) / withProg.length
    )
  }, [courses])

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
      case "name":
        list.sort((a, b) => a.title?.localeCompare(b.title ?? "") ?? 0)
        break
      case "students":
        list.sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0))
        break
      case "progress":
        list.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))
        break
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        )
        break
    }
    return list
  }, [courses, search, sort])

  const STATS = [
    {
      label: "My Courses",
      value: courses.length,
      icon: BookMarked,
      gradient: "linear-gradient(135deg,#1d4ed8,#0891b2)",
      glow: "rgba(29,78,216,0.3)",
      text: "#93c5fd",
      bg: "rgba(29,78,216,0.1)",
    },
    {
      label: teacher ? "Total Students" : "Assignments",
      value: teacher ? totalStudents : totalTasks,
      icon: teacher ? Users : Layers,
      gradient: "linear-gradient(135deg,#7c3aed,#4f46e5)",
      glow: "rgba(124,58,237,0.3)",
      text: "#c4b5fd",
      bg: "rgba(124,58,237,0.1)",
    },
    {
      label: teacher ? "Total Tasks" : "Avg. Progress",
      value: teacher ? totalTasks : (avgProgress !== null ? `${avgProgress}%` : "—"),
      icon: teacher ? Archive : TrendingUp,
      gradient: "linear-gradient(135deg,#0e7490,#0369a1)",
      glow: "rgba(6,182,212,0.3)",
      text: "#67e8f9",
      bg: "rgba(6,182,212,0.1)",
    },
  ]

  return (
    <div
      className="min-h-full pb-10"
      style={{
        background: "linear-gradient(180deg,#0d1b35 0%,#0a1628 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Hero header */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg,rgba(13,30,60,0.9) 0%,rgba(10,20,45,0.95) 100%)",
          borderBottom: "1px solid rgba(59,130,246,0.1)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-16 right-1/4 w-72 h-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(29,78,216,0.12) 0%,transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <div
            className="absolute -bottom-8 left-1/3 w-56 h-56 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <div className="relative px-6 lg:px-8 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#1d4ed8,#0891b2)",
                    boxShadow: "0 4px 16px rgba(29,78,216,0.45)",
                  }}
                >
                  <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <h1
                  className="text-[22px] font-extrabold"
                  style={{ color: "#e2e8f0" }}
                >
                  {teacher ? "My Courses" : "Learning Hub"}
                </h1>
                {courses.length > 0 && (
                  <span
                    className="px-2.5 py-1 rounded-xl text-[12px] font-bold"
                    style={{
                      background: "rgba(29,78,216,0.2)",
                      color: "#93c5fd",
                      border: "1px solid rgba(59,130,246,0.25)",
                    }}
                  >
                    {courses.length}
                  </span>
                )}
              </div>
              <p
                className="text-[13px] ml-12"
                style={{ color: "#475569" }}
              >
                {teacher
                  ? "Create, manage and track your courses"
                  : "Continue your learning journey"}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-12 sm:ml-0">
              {!teacher && (
                <Link to="/courses/join">
                  <motion.div
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-[13px]"
                    style={{
                      background: "rgba(6,182,212,0.12)",
                      border: "1px solid rgba(6,182,212,0.25)",
                      color: "#22d3ee",
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Join Course
                  </motion.div>
                </Link>
              )}
              {teacher && (
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate("/courses/create")}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl font-bold text-[13px] text-white"
                  style={{
                    background: "linear-gradient(135deg,#1d4ed8,#0891b2)",
                    boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  New Course
                </motion.button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-3"
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: s.bg,
                  border: `1px solid ${s.text}20`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: s.gradient,
                    boxShadow: `0 4px 12px ${s.glow}`,
                  }}
                >
                  <s.icon className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[18px] font-extrabold leading-tight"
                    style={{ color: s.text }}
                  >
                    {isLoading ? "—" : s.value}
                  </p>
                  <p
                    className="text-[10.5px] font-semibold truncate"
                    style={{ color: "#475569" }}
                  >
                    {s.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Toolbar */}
      <div
        className="px-6 lg:px-8 py-4 flex flex-wrap items-center gap-3"
        style={{
          borderBottom: "1px solid rgba(99,102,241,0.08)",
          background: "rgba(10,18,38,0.6)",
        }}
      >
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#334155" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full h-10 rounded-xl pl-10 pr-4 text-[13px] font-medium outline-none transition-all"
            style={{
              background: "rgba(13,24,42,0.8)",
              border: "1px solid rgba(59,130,246,0.12)",
              color: "#e2e8f0",
            }}
          />
          <AnimatePresence>
            {search && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "rgba(59,130,246,0.15)" }}
              >
                <X style={{ width: 11, height: 11, color: "#60a5fa" }} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="h-10 rounded-xl px-3 text-[12.5px] font-semibold outline-none cursor-pointer"
          style={{
            background: "rgba(13,24,42,0.8)",
            border: "1px solid rgba(59,130,246,0.12)",
            color: "#94a3b8",
          }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{
            background: "rgba(13,24,42,0.8)",
            border: "1px solid rgba(59,130,246,0.1)",
          }}
        >
          {(
            [
              ["grid", Grid3X3],
              ["list", List],
            ] as const
          ).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
              style={{
                background:
                  view === v ? "rgba(29,78,216,0.3)" : "transparent",
                border:
                  view === v
                    ? "1px solid rgba(59,130,246,0.3)"
                    : "1px solid transparent",
              }}
            >
              <Icon
                style={{
                  width: 15,
                  height: 15,
                  color: view === v ? "#60a5fa" : "#475569",
                }}
              />
            </button>
          ))}
        </div>

        <span
          className="text-[12px] font-medium ml-auto"
          style={{ color: "#334155" }}
        >
          {filtered.length} of {courses.length} courses
        </span>
      </div>

      {/* Content */}
      <div className="px-6 lg:px-8 pt-6">
        {isLoading && (
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                : "space-y-3"
            }
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl animate-pulse ${
                  view === "grid" ? "h-64" : "h-20"
                }`}
                style={{
                  background: "rgba(13,24,42,0.6)",
                  border: "1px solid rgba(59,130,246,0.06)",
                }}
              />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 text-center"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background:
                  "linear-gradient(135deg,rgba(29,78,216,0.15),rgba(6,182,212,0.1))",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              {search ? (
                <Search
                  className="w-8 h-8"
                  style={{ color: "#334155" }}
                  strokeWidth={1.5}
                />
              ) : (
                <BookOpen
                  className="w-8 h-8"
                  style={{ color: "#334155" }}
                  strokeWidth={1.5}
                />
              )}
            </motion.div>
            <h3
              className="text-[17px] font-extrabold mb-2"
              style={{ color: "#334155" }}
            >
              {search
                ? "No courses found"
                : teacher
                ? "No courses yet"
                : "You are not enrolled yet"}
            </h3>
            <p
              className="text-[13px] mb-6 max-w-xs"
              style={{ color: "#1e3a5f" }}
            >
              {search
                ? `No results for "${search}". Try a different keyword.`
                : teacher
                ? "Create your first course and start teaching."
                : "Join a course using an invite code to get started."}
            </p>
            {!search &&
              (teacher ? (
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate("/courses/create")}
                  className="flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-[13.5px] text-white"
                  style={{
                    background:
                      "linear-gradient(135deg,#1d4ed8,#0891b2)",
                    boxShadow:
                      "0 4px 20px rgba(29,78,216,0.4)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create Course
                </motion.button>
              ) : (
                <Link to="/courses/join">
                  <motion.div
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 h-11 px-6 rounded-xl font-bold text-[13.5px] text-white"
                    style={{
                      background:
                        "linear-gradient(135deg,#1d4ed8,#0891b2)",
                      boxShadow:
                        "0 4px 20px rgba(29,78,216,0.4)",
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    Join a Course
                  </motion.div>
                </Link>
              ))}
          </motion.div>
        )}

        {!isLoading && filtered.length > 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={
                view === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  : "space-y-2.5"
              }
            >
              {filtered.map((course: any, i: number) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i}
                  isTeacher={teacher}
                  viewMode={view}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
