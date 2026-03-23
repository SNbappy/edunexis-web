import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import gsap from "gsap"
import {
  BookOpen, Users, Bell, TrendingUp, ChevronRight,
  Plus, Clock, Zap, Award, BarChart3, GraduationCap,
  ArrowUpRight, Layers, Target, Flame, Calendar,
  Activity, Star, CheckCircle2
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useCourses } from "@/features/courses/hooks/useCourses"
import { isTeacher } from "@/utils/roleGuard"
import { ROUTES } from "@/config/constants"
import ThreeHeroCanvas from "@/components/three/ThreeHeroCanvas"

const CARD_GLOW = [
  { color: "#3b82f6", shadow: "rgba(59,130,246,0.3)",  bg: "rgba(30,58,138,0.3)",  border: "rgba(59,130,246,0.22)" },
  { color: "#34d399", shadow: "rgba(52,211,153,0.25)", bg: "rgba(5,150,105,0.2)",  border: "rgba(52,211,153,0.22)" },
  { color: "#f59e0b", shadow: "rgba(245,158,11,0.25)", bg: "rgba(217,119,6,0.2)",  border: "rgba(245,158,11,0.22)" },
  { color: "#a78bfa", shadow: "rgba(167,139,250,0.25)",bg: "rgba(124,58,237,0.2)", border: "rgba(167,139,250,0.22)" },
]

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const pad = (n: number) => String(n).padStart(2, "0")
  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />
      <span className="text-[12px] font-bold font-mono" style={{ color: "#94a3b8" }}>
        {pad(time.getHours())}:{pad(time.getMinutes())}:{pad(time.getSeconds())}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { courses, isLoading } = useCourses()
  const teacher = isTeacher(user?.role ?? "Student")

  const firstName = user?.profile?.fullName?.split(" ")[0] ?? "there"
  const hour = new Date().getHours()
  const timeLabel = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening"
  const timeGreeting = hour < 12 ? "Rise & shine" : hour < 17 ? "Hope your day is going well" : "Great work today"
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  // Effect 1: Hero elements — always present on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".dash-hero-text",
        { opacity: 0, y: 28, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", stagger: 0.1 }
      )
      gsap.fromTo(".action-btn",
        { opacity: 0, x: -16, scale: 0.95 },
        { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.5)", stagger: 0.07, delay: 0.42 }
      )
    })
    return () => ctx.revert()
  }, [])

  // Effect 2: Data-dependent elements — wait for courses to load
  useEffect(() => {
    if (isLoading) return
    const ctx = gsap.context(() => {
      const statCards = gsap.utils.toArray<HTMLElement>(".stat-card")
      if (statCards.length) {
        gsap.fromTo(statCards,
          { opacity: 0, y: 44, scale: 0.93 },
          { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: "power3.out", stagger: 0.09, delay: 0.1 }
        )
        gsap.to(".stat-glow", {
          opacity: 0.65, duration: 2.2, repeat: -1, yoyo: true, ease: "sine.inOut", stagger: 0.55
        })
      }
      const courseCards = gsap.utils.toArray<HTMLElement>(".course-card")
      if (courseCards.length) {
        gsap.fromTo(courseCards,
          { opacity: 0, y: 28, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out", stagger: 0.08, delay: 0.2 }
        )
      }
    })
    return () => ctx.revert()
  }, [isLoading, courses])

  const totalCourses = courses.length
  const activeCourses = courses.filter((c: any) => !c.isArchived).length
  const recentCourses = courses.slice(0, 6)

  const STATS = teacher
    ? [
        { label: "Total Courses",  value: totalCourses, icon: BookOpen,   idx: 0, trend: "+2 this month" },
        { label: "Total Students", value: courses.reduce((a: number, c: any) => a + (c.enrolledCount ?? (c as any).memberCount ?? (c as any).membersCount ?? (c as any).enrolledCount ?? 0), 0), icon: Users, idx: 1, trend: "across all courses" },
        { label: "Active Courses", value: activeCourses, icon: Flame,     idx: 2, trend: `${totalCourses - activeCourses} archived` },
        { label: "Avg Engagement", value: "87%",         icon: TrendingUp, idx: 3, trend: "? 4% this week" },
      ]
    : [
        { label: "Enrolled",      value: totalCourses,  icon: BookOpen, idx: 0, trend: "active courses" },
        { label: "In Progress",   value: activeCourses, icon: Target,   idx: 1, trend: "keep going!" },
        { label: "Achievements",  value: 0,             icon: Award,    idx: 2, trend: "complete tasks" },
        { label: "Hours Learned", value: "—",           icon: Clock,    idx: 3, trend: "coming soon" },
      ]

  const ACTIONS = teacher
    ? [
        { label: "Create Course",  icon: Plus,      to: ROUTES.COURSES, accent: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
        { label: "View Analytics", icon: BarChart3,  to: ROUTES.COURSES, accent: "#34d399", glow: "rgba(52,211,153,0.3)" },
        { label: "My Courses",     icon: Layers,     to: ROUTES.COURSES, accent: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
      ]
    : [
        { label: "Join a Course",  icon: Plus,          to: ROUTES.COURSES, accent: "#3b82f6", glow: "rgba(59,130,246,0.35)" },
        { label: "Browse Courses", icon: GraduationCap, to: ROUTES.COURSES, accent: "#34d399", glow: "rgba(52,211,153,0.3)" },
        { label: "My Progress",    icon: TrendingUp,    to: ROUTES.COURSES, accent: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
      ]

  return (
    <div className="min-h-full relative"
      style={{ background: "linear-gradient(180deg,#060d1f 0%,#07102b 60%,#060d1f 100%)" }}>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(37,99,235,0.07) 0%,transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle,rgba(52,211,153,0.04) 0%,transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div className="relative z-10 p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* -- Hero Banner -- */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg,rgba(8,20,60,0.92) 0%,rgba(6,13,31,0.95) 100%)",
            border: "1px solid rgba(59,130,246,0.18)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(59,130,246,0.12)",
            minHeight: 210,
          }}>

          {/* THREE.JS STAR CANVAS — interactive gold square particles */}
          <ThreeHeroCanvas />

          {/* Subtle grid overlay on top of canvas */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)",
              backgroundSize: "54px 54px",
              maskImage: "linear-gradient(to right,transparent,black 15%,black 85%,transparent)",
              zIndex: 1,
            }} />

          {/* Fade edges */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(to right,rgba(6,13,31,0.6) 0%,transparent 25%,transparent 75%,rgba(6,13,31,0.6) 100%)",
            zIndex: 2,
          }} />

          <div className="relative p-8 flex flex-col lg:flex-row lg:items-center gap-6" style={{ zIndex: 3 }}>
            <div className="flex-1 space-y-4">
              <div className="dash-hero-text flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(37,99,235,0.2)", border: "1px solid rgba(59,130,246,0.3)" }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />
                  <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#60a5fa" }}>
                    Good {timeLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(59,130,246,0.12)" }}>
                  <Calendar className="w-3 h-3" style={{ color: "#475569" }} />
                  <span className="text-[11px] font-semibold" style={{ color: "#475569" }}>{today}</span>
                </div>
                <LiveClock />
              </div>

              <div className="dash-hero-text">
                <h1 className="text-3xl lg:text-[2.6rem] font-extrabold tracking-tight leading-tight"
                  style={{ background: "linear-gradient(135deg,#fff 0%,#93c5fd 55%,#34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Welcome back, {firstName}!
                </h1>
                <p className="text-[13.5px] font-medium mt-2" style={{ color: "#475569" }}>
                  {timeGreeting}. {teacher
                    ? `You have ${activeCourses} active course${activeCourses !== 1 ? "s" : ""} — keep inspiring.`
                    : `You are enrolled in ${totalCourses} course${totalCourses !== 1 ? "s" : ""} — keep learning!`}
                </p>
              </div>

              <div className="dash-hero-text flex flex-wrap gap-2.5">
                {ACTIONS.map(a => (
                  <Link key={a.label} to={a.to}>
                    <motion.div
                      className="action-btn flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] cursor-pointer select-none"
                      style={{ background: `${a.accent}15`, border: `1px solid ${a.accent}30`, color: a.accent }}
                      whileHover={{ scale: 1.05, y: -2, boxShadow: `0 6px 20px ${a.glow}` }}
                      whileTap={{ scale: 0.96 }}>
                      <a.icon className="w-4 h-4" strokeWidth={2.5} />
                      {a.label}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-4">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg,#1d4ed8 0%,#06b6d4 100%)",
                  boxShadow: "0 8px 36px rgba(37,99,235,0.55), 0 0 0 1px rgba(59,130,246,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}>
                <GraduationCap className="w-10 h-10 text-white" strokeWidth={1.5} />
                <div className="absolute -inset-1 rounded-3xl"
                  style={{ background: "conic-gradient(from 0deg,rgba(59,130,246,0.3),rgba(6,182,212,0.3),transparent,rgba(59,130,246,0.3))", filter: "blur(6px)", zIndex: -1 }} />
              </motion.div>
              <div className="text-center">
                <p className="text-[13px] font-extrabold" style={{ color: "#e2e8f0" }}>{user?.role ?? "Student"}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#3b82f6" }}>{user?.profile?.fullName}</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <Activity className="w-3 h-3" style={{ color: "#34d399" }} />
                <span className="text-[11px] font-bold" style={{ color: "#34d399" }}>Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* -- Stats -- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => {
            const g = CARD_GLOW[s.idx]
            return (
              <motion.div key={s.label}
                className="stat-card relative rounded-2xl p-5 flex flex-col gap-2 overflow-hidden cursor-default"
                style={{ background: `linear-gradient(135deg,${g.bg} 0%,rgba(6,13,31,0.6) 100%)`, border: `1px solid ${g.border}`, boxShadow: `0 4px 24px ${g.shadow}` }}
                whileHover={{ scale: 1.03, y: -3, boxShadow: `0 12px 40px ${g.shadow}` }}>
                <div className="stat-glow absolute -top-4 -right-4 w-20 h-20 rounded-full pointer-events-none opacity-40"
                  style={{ background: `radial-gradient(circle,${g.color}40 0%,transparent 70%)`, filter: "blur(12px)" }} />
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${g.color}18`, border: `1px solid ${g.border}` }}>
                    <s.icon className="w-5 h-5" style={{ color: g.color }} strokeWidth={2} />
                  </div>
                  <TrendingUp className="w-3.5 h-3.5 opacity-30" style={{ color: g.color }} />
                </div>
                <div>
                  <p className="text-[26px] font-extrabold leading-none" style={{ color: "#f1f5f9" }}>
                    {isLoading ? (
                      <span className="inline-block w-12 h-6 rounded-lg animate-pulse" style={{ background: `${g.color}20` }} />
                    ) : s.value}
                  </p>
                  <p className="text-[12px] font-bold mt-1" style={{ color: "#64748b" }}>{s.label}</p>
                </div>
                <p className="text-[10.5px] font-semibold" style={{ color: `${g.color}90` }}>{s.trend}</p>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: `linear-gradient(90deg,${g.color}50,transparent)` }} />
              </motion.div>
            )
          })}
        </div>

        {/* -- Courses + Side Panel -- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[17px] font-extrabold" style={{ color: "#e2e8f0" }}>
                  {teacher ? "Your Courses" : "Enrolled Courses"}
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: "#475569" }}>
                  {recentCourses.length} shown &middot; {activeCourses} active
                </p>
              </div>
              <Link to={ROUTES.COURSES}>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-bold cursor-pointer"
                  style={{ background: "rgba(30,58,138,0.25)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}>
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </motion.div>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-36 rounded-2xl animate-pulse"
                    style={{ background: "rgba(30,58,138,0.12)", border: "1px solid rgba(59,130,246,0.07)" }} />
                ))}
              </div>
            ) : recentCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 rounded-2xl"
                style={{ background: "rgba(10,22,40,0.4)", border: "1px dashed rgba(59,130,246,0.15)" }}>
                <BookOpen className="w-10 h-10 mb-3" style={{ color: "rgba(59,130,246,0.25)" }} strokeWidth={1} />
                <p className="text-[15px] font-bold" style={{ color: "#334155" }}>No courses yet</p>
                <p className="text-[13px] mt-1 mb-4" style={{ color: "#475569" }}>
                  {teacher ? "Create your first course" : "Join a course to begin"}
                </p>
                <Link to={ROUTES.COURSES}>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer"
                    style={{ background: "linear-gradient(135deg,#1d4ed8,#2563eb)", color: "#fff", boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}>
                    <Plus className="w-4 h-4" /> {teacher ? "Create Course" : "Join a Course"}
                  </motion.div>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentCourses.map((course: any, i: number) => {
                  const g = CARD_GLOW[i % 4]
                  return (
                    <Link key={course.id} to={`/courses/${course.id}/stream`}>
                      <motion.div
                        className="course-card relative rounded-2xl p-5 cursor-pointer overflow-hidden group"
                        style={{
                          background: "linear-gradient(135deg,rgba(10,22,40,0.8) 0%,rgba(6,13,31,0.92) 100%)",
                          border: `1px solid ${g.border}`,
                          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
                        }}
                        whileHover={{ scale: 1.025, y: -4, borderColor: g.color + "55", boxShadow: `0 16px 48px ${g.shadow}` }}
                        transition={{ duration: 0.2 }}>
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{ background: `linear-gradient(105deg,transparent 30%,${g.color}06 50%,transparent 70%)` }} />
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: g.bg, border: `1px solid ${g.border}` }}>
                            <BookOpen className="w-5 h-5" style={{ color: g.color }} strokeWidth={2} />
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: g.color }} />
                        </div>
                        <h3 className="text-[14px] font-bold leading-snug mb-1 line-clamp-2" style={{ color: "#e2e8f0" }}>
                          {course.title ?? course.name ?? "Untitled Course"}
                        </h3>
                        <p className="text-[11.5px] line-clamp-1 mb-3" style={{ color: "#475569" }}>
                          {(course as any).description ?? (course as any).section ?? "No description"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" style={{ color: "#475569" }} />
                            <span className="text-[11px] font-semibold" style={{ color: "#475569" }}>
                              {course.enrolledCount ?? (course as any).memberCount ?? (course as any).membersCount ?? (course as any).enrolledCount ?? (course as any).totalMembers ?? 0} members
                            </span>
                          </div>
                          {(course as any).isArchived ?? false ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(71,85,105,0.2)", color: "#64748b", border: "1px solid rgba(71,85,105,0.25)" }}>
                              Archived
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${g.color}15`, color: g.color, border: `1px solid ${g.color}28` }}>
                              <CheckCircle2 className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ background: `linear-gradient(90deg,transparent,${g.color}60,transparent)` }} />
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5"
              style={{ background: "rgba(10,22,40,0.65)", border: "1px solid rgba(59,130,246,0.1)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4" style={{ color: "#f59e0b" }} />
                <h3 className="text-[13px] font-extrabold" style={{ color: "#e2e8f0" }}>Quick Stats</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Courses Active",  val: activeCourses, color: "#3b82f6", pct: Math.min((activeCourses / Math.max(totalCourses, 1)) * 100, 100) },
                  { label: "Completion Rate", val: "—",           color: "#34d399", pct: 0 },
                  { label: "Total Members",   val: courses.reduce((a: number, c: any) => a + (c.enrolledCount ?? (c as any).memberCount ?? (c as any).membersCount ?? (c as any).enrolledCount ?? 0), 0), color: "#a78bfa", pct: 60 },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11.5px] font-semibold" style={{ color: "#64748b" }}>{row.label}</span>
                      <span className="text-[11.5px] font-bold" style={{ color: row.color }}>{row.val}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(59,130,246,0.08)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${row.pct}%` }}
                        transition={{ duration: 1.2, delay: 0.8, ease: "circOut" }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${row.color},${row.color}80)` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/notifications">
              <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-5 cursor-pointer"
                style={{ background: "rgba(30,58,138,0.2)", border: "1px solid rgba(59,130,246,0.15)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" style={{ color: "#3b82f6" }} />
                    <span className="text-[13px] font-extrabold" style={{ color: "#e2e8f0" }}>Notifications</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />
                </div>
                <p className="text-[11.5px]" style={{ color: "#475569" }}>Check your latest updates and announcements.</p>
              </motion.div>
            </Link>

            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: "rgba(6,13,31,0.65)", border: "1px solid rgba(59,130,246,0.07)" }}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: "#3b82f6" }} />
                <span className="text-[11.5px] font-semibold" style={{ color: "#475569" }}>EduNexis v2.0</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34d399" }} />
                <span className="text-[10.5px] font-bold" style={{ color: "#34d399" }}>All systems up</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



