import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  BookOpen, Users, TrendingUp, Plus, Clock,
  Award, GraduationCap, ArrowUpRight, Target, Flame,
  Calendar, ChevronRight, Sparkles, Bell,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { useCourses } from "@/features/courses/hooks/useCourses"
import { isTeacher } from "@/utils/roleGuard"
import { ROUTES } from "@/config/constants"

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25,0.46,0.45,0.94], delay },
})

function LiveClock({ dark }: { dark: boolean }) {
  const [t, setT] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id) }, [])
  const p = (n: number) => String(n).padStart(2, "0")
  return (
    <span className="font-mono text-[12px]" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
      {p(t.getHours())}:{p(t.getMinutes())}:{p(t.getSeconds())}
    </span>
  )
}

const PALETTE = [
  { color: "#6366f1", light: "#eef2ff", border: "#c7d2fe", darkBg: "rgba(99,102,241,0.12)",  darkBorder: "rgba(99,102,241,0.25)", text: "#4338ca" },
  { color: "#0891b2", light: "#ecfeff", border: "#a5f3fc", darkBg: "rgba(8,145,178,0.12)",   darkBorder: "rgba(6,182,212,0.25)",  text: "#0e7490" },
  { color: "#d97706", light: "#fffbeb", border: "#fde68a", darkBg: "rgba(217,119,6,0.12)",   darkBorder: "rgba(251,191,36,0.25)", text: "#b45309" },
  { color: "#059669", light: "#ecfdf5", border: "#a7f3d0", darkBg: "rgba(5,150,105,0.12)",   darkBorder: "rgba(16,185,129,0.25)", text: "#047857" },
]

export default function DashboardPage() {
  const { user }   = useAuthStore()
  const { dark }   = useThemeStore()
  const { courses, isLoading } = useCourses()
  const teacher    = isTeacher(user?.role ?? "Student")

  const firstName     = user?.profile?.fullName?.split(" ")[0] ?? "there"
  const hour          = new Date().getHours()
  const greeting      = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  const today         = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  const totalCourses  = courses.length
  const activeCourses = courses.filter((c: any) => !c.isArchived).length
  const totalStudents = courses.reduce((a: number, c: any) => a + (c.enrolledCount ?? c.memberCount ?? c.membersCount ?? 0), 0)
  const recent        = courses.slice(0, 6)

  // Theme-aware card style
  const card = {
    background:          dark ? "rgba(16,24,44,0.7)"  : "rgba(255,255,255,0.85)",
    backdropFilter:      "blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
  }
  const cardBorder = (color?: string) => dark
    ? `1px solid ${color ?? "rgba(99,102,241,0.15)"}`
    : `1px solid ${color ?? "#e5e7eb"}`

  const textMain  = dark ? "#e2e8f8" : "#111827"
  const textSub   = dark ? "#8896c8" : "#6b7280"
  const textMuted = dark ? "#5a6a9a" : "#9ca3af"

  const STATS = teacher
    ? [
        { label: "Total Courses",  value: totalCourses,   icon: BookOpen,   ...PALETTE[0], sub: "+2 this month"     },
        { label: "Total Students", value: totalStudents,  icon: Users,      ...PALETTE[1], sub: "all courses"       },
        { label: "Active Courses", value: activeCourses,  icon: Flame,      ...PALETTE[2], sub: `${totalCourses - activeCourses} archived` },
        { label: "Avg Engagement", value: "87%",          icon: TrendingUp, ...PALETTE[3], sub: "+4% this week"     },
      ]
    : [
        { label: "Enrolled",       value: totalCourses,   icon: BookOpen,   ...PALETTE[0], sub: "active courses"    },
        { label: "In Progress",    value: activeCourses,  icon: Target,     ...PALETTE[1], sub: "keep going!"       },
        { label: "Achievements",   value: 0,              icon: Award,      ...PALETTE[2], sub: "complete tasks"    },
        { label: "Hours Learned",  value: "--",           icon: Clock,      ...PALETTE[3], sub: "coming soon"       },
      ]

  return (
    <div className="min-h-full p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* -- Hero banner -- */}
      <motion.div {...fade(0)}
        className="relative rounded-3xl overflow-hidden p-7 lg:p-8"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #0891b2 100%)",
          boxShadow: "0 8px 40px rgba(99,102,241,0.35)",
        }}
      >
        {/* Decoration circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
          <div className="absolute top-8 right-32 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
          <div className="absolute -bottom-10 left-1/3 w-40 h-40 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="absolute top-0 left-0 right-0 bottom-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                {greeting}
              </span>
              <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>{today}</span>
              <LiveClock dark={true} />
            </div>
            <h1 className="text-[28px] lg:text-[34px] font-extrabold text-white tracking-tight leading-tight mb-1.5">
              Welcome back, {firstName}!
            </h1>
            <p className="text-[14px] mb-5" style={{ color: "rgba(255,255,255,0.72)" }}>
              {teacher
                ? `You have ${activeCourses} active course${activeCourses !== 1 ? "s" : ""} - keep inspiring your students.`
                : `You are enrolled in ${totalCourses} course${totalCourses !== 1 ? "s" : ""} - keep learning!`}
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={teacher ? "/courses/create" : ROUTES.COURSES}>
                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold cursor-pointer"
                  style={{ background: "white", color: "#6366f1", boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}>
                  <Plus style={{ width: 15, height: 15 }} strokeWidth={2.5} />
                  {teacher ? "Create Course" : "Join Course"}
                </motion.div>
              </Link>
              <Link to={ROUTES.COURSES}>
                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.18)", color: "white", border: "1px solid rgba(255,255,255,0.28)" }}>
                  <BookOpen style={{ width: 15, height: 15 }} strokeWidth={2} />
                  {teacher ? "My Courses" : "Browse Courses"}
                </motion.div>
              </Link>
            </div>
          </div>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:flex w-24 h-24 rounded-3xl items-center justify-center shrink-0"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", backdropFilter: "blur(10px)" }}
          >
            <GraduationCap className="w-12 h-12 text-white" strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>

      {/* -- Stats -- */}
      <motion.div {...fade(0.06)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            whileHover={{ y: -3, boxShadow: `0 12px 32px ${s.color}28` }}
            className="rounded-2xl p-5 cursor-default"
            style={{
              ...card,
              border: cardBorder(dark ? s.darkBorder : s.border),
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: dark ? s.darkBg : s.light }}>
                <s.icon style={{ width: 18, height: 18, color: s.color }} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: dark ? s.darkBg : s.light, color: s.color }}>
                {s.sub}
              </span>
            </div>
            <p className="text-[28px] font-extrabold leading-none" style={{ color: textMain }}>
              {isLoading
                ? <span className="inline-block w-12 h-7 rounded-lg animate-pulse" style={{ background: dark ? s.darkBg : s.light }} />
                : s.value}
            </p>
            <p className="text-[12px] font-medium mt-1" style={{ color: textSub }}>{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* -- Courses + Side panel -- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Courses */}
        <motion.div {...fade(0.12)} className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: textMain }}>
                {teacher ? "Your Courses" : "Enrolled Courses"}
              </h2>
              <p className="text-[12px] mt-0.5" style={{ color: textMuted }}>
                {recent.length} shown - {activeCourses} active
              </p>
            </div>
            <Link to={ROUTES.COURSES}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer"
                style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", color: "#6366f1", border: cardBorder(dark ? "rgba(99,102,241,0.3)" : "#c7d2fe") }}>
                View all <ArrowUpRight style={{ width: 13, height: 13 }} />
              </motion.div>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl animate-pulse"
                  style={{ background: dark ? "rgba(99,102,241,0.08)" : "#f3f4f6" }} />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
              style={{ ...card, border: `2px dashed ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff" }}>
                <BookOpen style={{ width: 24, height: 24, color: "#6366f1" }} strokeWidth={1.5} />
              </div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: textMain }}>No courses yet</p>
              <p className="text-[13px] mb-5" style={{ color: textSub }}>
                {teacher ? "Create your first course to get started" : "Join a course to begin learning"}
              </p>
              <Link to={teacher ? "/courses/create" : ROUTES.COURSES}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer text-white"
                  style={{ background: "#6366f1", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                  <Plus style={{ width: 15, height: 15 }} />
                  {teacher ? "Create Course" : "Join a Course"}
                </motion.div>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recent.map((course: any, i: number) => {
                const p = PALETTE[i % 4]
                return (
                  <Link key={course.id} to={`/courses/${course.id}/stream`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.14 + i * 0.05 }}
                      whileHover={{ y: -3, boxShadow: `0 12px 32px ${p.color}22` }}
                      className="group rounded-2xl p-5 cursor-pointer"
                      style={{ ...card, border: cardBorder(dark ? p.darkBorder : p.border) }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: dark ? p.darkBg : p.light }}>
                          <BookOpen style={{ width: 17, height: 17, color: p.color }} strokeWidth={2} />
                        </div>
                        <ChevronRight style={{ width: 15, height: 15, color: textMuted }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className="text-[14px] font-semibold line-clamp-2 leading-snug mb-1"
                        style={{ color: textMain }}>
                        {course.title ?? course.name ?? "Untitled Course"}
                      </h3>
                      <p className="text-[12px] line-clamp-1 mb-3" style={{ color: textMuted }}>
                        {course.description ?? course.courseCode ?? course.section ?? "No description"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users style={{ width: 13, height: 13, color: textMuted }} />
                          <span className="text-[11px]" style={{ color: textMuted }}>
                            {course.enrolledCount ?? course.memberCount ?? course.membersCount ?? 0} members
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          style={course.isArchived
                            ? { background: dark ? "rgba(255,255,255,0.06)" : "#f3f4f6", color: textMuted }
                            : { background: dark ? p.darkBg : p.light, color: p.color }
                          }>
                          {course.isArchived ? "Archived" : "Active"}
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Right panel */}
        <motion.div {...fade(0.18)} className="space-y-4">

          {/* Profile card */}
          <div className="rounded-2xl p-5" style={{ ...card, border: cardBorder() }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-[16px] font-bold text-white shrink-0"
                style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)" }}>
                {(user?.profile?.fullName ?? user?.email ?? "U").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold leading-tight truncate" style={{ color: textMain }}>
                  {user?.profile?.fullName ?? "User"}
                </p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: textMuted }}>
                  {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full shrink-0"
                style={{ background: dark ? "rgba(16,185,129,0.15)" : "#ecfdf5", border: dark ? "1px solid rgba(16,185,129,0.3)" : "1px solid #a7f3d0" }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
                <span className="text-[10px] font-bold" style={{ color: "#10b981" }}>Online</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Courses", val: totalCourses,  ...PALETTE[0] },
                { label: "Active",  val: activeCourses, ...PALETTE[3] },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center"
                  style={{ background: dark ? s.darkBg : s.light, border: cardBorder(dark ? s.darkBorder : s.border) }}>
                  <p className="text-[22px] font-extrabold" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[11px] mt-0.5 font-medium" style={{ color: dark ? s.color + "bb" : s.text }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <Link to="/notifications">
            <motion.div whileHover={{ y: -2 }}
              className="rounded-2xl p-4 cursor-pointer flex items-center gap-3"
              style={{ ...card, border: cardBorder() }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff" }}>
                <Bell style={{ width: 18, height: 18, color: "#6366f1" }} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold" style={{ color: textMain }}>Notifications</p>
                <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>Check latest updates</p>
              </div>
              <ArrowUpRight style={{ width: 14, height: 14, color: textMuted }} />
            </motion.div>
          </Link>

          {/* System status */}
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{ ...card, border: cardBorder() }}>
            <div className="flex items-center gap-2">
              <Sparkles style={{ width: 14, height: 14, color: "#6366f1" }} />
              <span className="text-[12px] font-semibold" style={{ color: textSub }}>EduNexis v2.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#10b981" }} />
              <span className="text-[11px] font-semibold" style={{ color: "#10b981" }}>All systems up</span>
            </div>
          </div>

          {/* Date */}
          <div className="rounded-2xl p-4"
            style={{ background: dark ? "rgba(99,102,241,0.1)" : "linear-gradient(135deg,#eef2ff,#ecfeff)", border: cardBorder(dark ? "rgba(99,102,241,0.2)" : "#c7d2fe") }}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar style={{ width: 14, height: 14, color: "#6366f1" }} />
              <span className="text-[12px] font-bold" style={{ color: "#6366f1" }}>Today</span>
            </div>
            <p className="text-[12px] font-medium" style={{ color: textSub }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
