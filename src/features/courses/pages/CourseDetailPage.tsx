import { useState } from "react"
import { useParams, Navigate, useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings, Users, Eye, EyeOff, Plus, BookOpen,
  ChevronLeft, Megaphone, ClipboardCheck, FolderOpen,
  ClipboardList, BookMarked, Mic, BarChart3, GraduationCap,
  Layers, ChevronDown, ChevronUp, Copy, Check,
} from "lucide-react"
import Spinner from "@/components/ui/Spinner"
import EditCourseModal from "../components/EditCourseModal"
import CourseMembersList from "../components/CourseMembersList"
import { useCourseDetail } from "../hooks/useCourseDetail"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { useAuthStore } from "@/store/authStore"
import { useThemeStore } from "@/store/themeStore"
import { isTeacher } from "@/utils/roleGuard"
import { COURSE_TABS } from "@/config/constants"
import AnnouncementFeed from "@/features/announcements/components/AnnouncementFeed"
import AttendanceRecordsList from "@/features/attendance/components/AttendanceRecordsList"
import AttendanceCalendar from "@/features/attendance/components/AttendanceCalendar"
import AttendanceStatsCard from "@/features/attendance/components/AttendanceStatsCard"
import TakeAttendanceSheet from "@/features/attendance/components/TakeAttendanceSheet"
import AttendanceExportButton from "@/features/attendance/components/AttendanceExportButton"
import StudentAttendanceView from "@/features/attendance/components/StudentAttendanceView"
import { useAttendance } from "@/features/attendance/hooks/useAttendance"
import { useAttendanceStats } from "@/features/attendance/hooks/useAttendanceStats"
import MaterialsTab from "@/features/materials/components/MaterialsTab"
import AssignmentsTab from "@/features/assignments/components/AssignmentsTab"
import CTTab from "@/features/ct/components/CTTab"
import PresentationsTab from "@/features/presentations/components/PresentationsTab"
import MarksTab from "@/features/marks/components/MarksTab"

const TABS = [
  { key: COURSE_TABS.STREAM,        label: "Stream",        icon: Megaphone,      color: "#6366f1" },
  { key: COURSE_TABS.ATTENDANCE,    label: "Attendance",    icon: ClipboardCheck, color: "#059669" },
  { key: COURSE_TABS.MATERIALS,     label: "Materials",     icon: FolderOpen,     color: "#d97706" },
  { key: COURSE_TABS.ASSIGNMENTS,   label: "Assignments",   icon: ClipboardList,  color: "#db2777" },
  { key: COURSE_TABS.CT,            label: "CT",            icon: BookMarked,     color: "#7c3aed" },
  { key: COURSE_TABS.PRESENTATIONS, label: "Presentations", icon: Mic,            color: "#0891b2" },
  { key: COURSE_TABS.MARKS,         label: "Marks",         icon: BarChart3,      color: "#d97706" },
  { key: COURSE_TABS.MEMBERS,       label: "Members",       icon: Users,          color: "#059669" },
]

// Join code badge
function JoinCodeBadge({ code, dark }: { code: string; dark: boolean }) {
  const [visible, setVisible] = useState(false)
  const [copied,  setCopied]  = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl cursor-pointer select-none"
      style={{ background: dark ? "rgba(99,102,241,0.12)" : "#eef2ff", border: dark ? "1px solid rgba(99,102,241,0.25)" : "1px solid #c7d2fe" }}>
      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: dark ? "rgba(165,180,252,0.6)" : "#818cf8" }}>Code</span>
      <span className="w-px h-3" style={{ background: dark ? "rgba(99,102,241,0.3)" : "#c7d2fe" }} />
      {visible
        ? <button onClick={copy} className="text-[11px] font-black font-mono tracking-widest" style={{ color: copied ? "#059669" : "#6366f1" }}>
            {copied ? "Copied!" : code}
          </button>
        : <span className="text-[11px] font-black font-mono" style={{ color: dark ? "rgba(99,102,241,0.25)" : "#c7d2fe" }}>
            {"*".repeat(code.length)}
          </span>
      }
      <button onClick={() => setVisible(v => !v)} style={{ color: dark ? "rgba(165,180,252,0.5)" : "#818cf8" }}>
        {visible ? <EyeOff style={{ width: 12, height: 12 }} /> : <Eye style={{ width: 12, height: 12 }} />}
      </button>
    </div>
  )
}

// Attendance tab
function AttendanceTab({ courseId, courseName }: { courseId: string; courseName?: string }) {
  const { user }  = useAuthStore()
  const { dark }  = useThemeStore()
  const teacher   = isTeacher(user?.role ?? "Student")
  const [takeOpen, setTakeOpen]       = useState(false)
  const [editSession, setEditSession] = useState<any>(null)
  const [view, setView]               = useState<"list" | "calendar">("list")
  const { sessions, members, isSessionsLoading, takeAttendance, isTaking, editAttendance, isEditing, deleteSession } = useAttendance(courseId)
  const { data: stats } = useAttendanceStats(courseId)

  const cardBg  = dark ? "rgba(16,24,44,0.7)"  : "rgba(255,255,255,0.85)"
  const border  = dark ? "rgba(99,102,241,0.15)" : "#e5e7eb"
  const textMain= dark ? "#e2e8f8" : "#111827"
  const textSub = dark ? "#8896c8" : "#6b7280"

  if (!teacher) return <StudentAttendanceView courseId={courseId} />
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl"
        style={{ background: cardBg, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${border}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: dark ? "rgba(5,150,105,0.15)" : "#ecfdf5", border: dark ? "1px solid rgba(5,150,105,0.25)" : "1px solid #a7f3d0" }}>
            <GraduationCap style={{ width: 16, height: 16, color: "#059669" }} />
          </div>
          <div>
            <h2 className="text-[15px] font-bold" style={{ color: textMain }}>Attendance</h2>
            <p className="text-[11px]" style={{ color: textSub }}>{sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-xl gap-1"
            style={{ background: dark ? "rgba(255,255,255,0.04)" : "#f3f4f6", border: `1px solid ${border}` }}>
            {(["list", "calendar"] as const).map(k => (
              <motion.button key={k} whileTap={{ scale: 0.95 }} onClick={() => setView(k)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{ background: view === k ? (dark ? "rgba(99,102,241,0.2)" : "#eef2ff") : "transparent", color: view === k ? "#6366f1" : textSub }}>
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </motion.button>
            ))}
          </div>
          <AttendanceExportButton courseId={courseId} courseName={courseName ?? "Course"} />
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setTakeOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#0891b2)", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
            <Plus style={{ width: 15, height: 15 }} /> Take Attendance
          </motion.button>
        </div>
      </div>
      {stats && <AttendanceStatsCard totalSessions={stats.totalSessions} averageAttendance={stats.averageAttendance} totalStudents={stats.studentSummaries?.length} lastSessionDate={stats.lastSessionDate} />}
      {isSessionsLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: dark ? "rgba(99,102,241,0.06)" : "#f3f4f6" }} />)}</div>
        : view === "list"
          ? <AttendanceRecordsList sessions={sessions} onEdit={(id) => setEditSession(sessions.find((s: any) => s.id === id) ?? null)} onDelete={deleteSession} />
          : <AttendanceCalendar sessions={sessions} />
      }
      {editSession && (
        <TakeAttendanceSheet isOpen={!!editSession} onClose={() => setEditSession(null)}
          members={members} courseId={courseId}
          initialDate={editSession.date} initialTopic={editSession.topic}
          initialStatuses={Object.fromEntries(editSession.records.map((r: any) => [r.studentId, r.status]))}
          onSubmit={(data: any) => { editAttendance({ sessionId: editSession.id, data: { topic: data.topic, entries: data.records.map((r: any) => ({ studentId: r.studentId, status: r.status })) } }); setEditSession(null) }}
          isLoading={isEditing} />
      )}
      <TakeAttendanceSheet isOpen={takeOpen} onClose={() => setTakeOpen(false)}
        members={members} courseId={courseId}
        onSubmit={(data: any) => takeAttendance(data, { onSuccess: () => setTakeOpen(false) })}
        isLoading={isTaking} />
    </div>
  )
}

export default function CourseDetailPage() {
  const { courseId, tab } = useParams()
  const { user }          = useAuthStore()
  const { dark }          = useThemeStore()
  const teacher           = isTeacher(user?.role ?? "Student")
  const { course, isLoading, isError, updateCourse, isUpdating } = useCourseDetail(courseId!)
  const { members }       = useCourseMembers(courseId!)
  const [editOpen,      setEditOpen]      = useState(false)
  const [heroExpanded,  setHeroExpanded]  = useState(false)

  // Theme tokens
  const bg      = dark ? "rgb(11,17,32)"           : "rgb(248,249,255)"
  const cardBg  = dark ? "rgba(16,24,44,0.85)"     : "rgba(255,255,255,0.95)"
  const blur    = "blur(20px)"
  const border  = dark ? "rgba(99,102,241,0.15)"   : "#e5e7eb"
  const divider = dark ? "rgba(99,102,241,0.1)"    : "#f3f4f6"
  const textMain= dark ? "#e2e8f8"                 : "#111827"
  const textSub = dark ? "#8896c8"                 : "#6b7280"
  const textMuted=dark ? "#5a6a9a"                 : "#9ca3af"

  if (!tab) return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />

  if (isLoading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: dark ? "rgba(99,102,241,0.15)" : "#eef2ff", border: `1px solid ${dark ? "rgba(99,102,241,0.25)" : "#c7d2fe"}` }}>
          <Layers style={{ width: 22, height: 22, color: "#6366f1" }} className="animate-pulse" />
        </div>
        <p className="text-[13px]" style={{ color: textSub }}>Loading course...</p>
      </div>
    </div>
  )

  if (isError || !course) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <p style={{ color: textSub }}>Course not found.</p>
    </div>
  )

  const realMemberCount = members.length
  const isLab           = course.courseType === "Lab"
  const accentColor     = isLab ? "#059669" : "#6366f1"
  const bannerGrad      = isLab
    ? "linear-gradient(135deg,#047857 0%,#0891b2 100%)"
    : "linear-gradient(135deg,#4f46e5 0%,#0891b2 100%)"

  const renderTab = () => {
    switch (tab) {
      case COURSE_TABS.STREAM:        return <AnnouncementFeed courseId={courseId!} />
      case COURSE_TABS.ATTENDANCE:    return <AttendanceTab courseId={courseId!} courseName={course?.title} />
      case COURSE_TABS.MATERIALS:     return <MaterialsTab courseId={courseId!} />
      case COURSE_TABS.ASSIGNMENTS:   return <AssignmentsTab courseId={courseId!} />
      case COURSE_TABS.CT:            return <CTTab courseId={courseId!} />
      case COURSE_TABS.PRESENTATIONS: return <PresentationsTab courseId={courseId!} />
      case COURSE_TABS.MARKS:         return <MarksTab courseId={courseId!} courseTitle={course?.title} />
      case COURSE_TABS.MEMBERS:       return <CourseMembersList courseId={courseId!} course={course} />
      default:                        return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />
    }
  }

  return (
    <div className="min-h-full" style={{ background: bg }}>

      {/* -- Sticky header -- */}
      <div className="sticky top-0 z-20">

        {/* Breadcrumb bar */}
        <div style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, borderBottom: `1px solid ${divider}` }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8 h-10 flex items-center gap-2">
            <Link to={COURSE_TABS.STREAM ? "/courses" : "/courses"}
              className="flex items-center gap-1.5 transition-colors"
              style={{ color: textMuted }}
              onMouseEnter={e => (e.currentTarget.style.color = "#6366f1")}
              onMouseLeave={e => (e.currentTarget.style.color = textMuted)}>
              <ChevronLeft style={{ width: 14, height: 14 }} />
              <span className="text-[12px] font-medium">Courses</span>
            </Link>
            <span style={{ color: dark ? "rgba(255,255,255,0.15)" : "#e5e7eb" }}>/</span>
            <span className="text-[12px] font-medium truncate" style={{ color: textSub }}>{course.title}</span>
            {course.courseCode && (
              <span className="text-[11px] font-mono shrink-0 px-1.5 py-0.5 rounded"
                style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", color: "#6366f1" }}>
                {course.courseCode}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {teacher && course.joiningCode && <JoinCodeBadge code={course.joiningCode} dark={dark} />}
              {teacher && course.teacherId === user?.id && (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
                  style={{ background: dark ? "rgba(99,102,241,0.1)" : "#eef2ff", border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "#c7d2fe"}`, color: "#6366f1" }}>
                  <Settings style={{ width: 13, height: 13 }} /> Edit
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Course identity bar */}
        <div style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, borderBottom: `1px solid ${divider}` }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-3 flex items-center gap-4">
            {/* Accent bar */}
            <div className="w-1 h-10 rounded-full shrink-0"
              style={{ background: bannerGrad }} />

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[18px] font-extrabold tracking-tight leading-none" style={{ color: textMain }}>
                  {course.title}
                </h1>
                {course.courseType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wide shrink-0"
                    style={{ background: dark ? (isLab ? "rgba(5,150,105,0.15)" : "rgba(99,102,241,0.15)") : (isLab ? "#ecfdf5" : "#eef2ff"), color: accentColor, border: `1px solid ${dark ? `${accentColor}30` : (isLab ? "#a7f3d0" : "#c7d2fe")}` }}>
                    {course.courseType}
                  </span>
                )}
                {course.creditHours && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0"
                    style={{ background: dark ? "rgba(217,119,6,0.12)" : "#fffbeb", color: "#d97706", border: dark ? "1px solid rgba(217,119,6,0.25)" : "1px solid #fde68a" }}>
                    {course.creditHours} cr
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {course.courseCode && <span className="text-[11px] font-bold font-mono" style={{ color: accentColor }}>{course.courseCode}</span>}
                {course.department && <><span style={{ color: textMuted }}>·</span><span className="text-[11px]" style={{ color: textSub }}>{course.department}</span></>}
                {course.semester   && <><span style={{ color: textMuted }}>·</span><span className="text-[11px]" style={{ color: textSub }}>{course.semester}</span></>}
              </div>
            </div>

            {/* Pills */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: dark ? "rgba(99,102,241,0.08)" : "#f9fafb", border: `1px solid ${border}` }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 text-white"
                  style={{ background: bannerGrad }}>
                  {(course.teacherName ?? "T").charAt(0).toUpperCase()}
                </div>
                <span className="text-[12px] font-medium" style={{ color: textSub }}>{course.teacherName ?? "Instructor"}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: dark ? "rgba(5,150,105,0.08)" : "#ecfdf5", border: dark ? "1px solid rgba(5,150,105,0.2)" : "1px solid #a7f3d0" }}>
                <Users style={{ width: 13, height: 13, color: "#059669" }} />
                <span className="text-[12px] font-semibold" style={{ color: "#059669" }}>{realMemberCount}</span>
              </div>
              {course.academicSession && (
                <div className="px-2.5 py-1.5 rounded-xl"
                  style={{ background: dark ? "rgba(217,119,6,0.08)" : "#fffbeb", border: dark ? "1px solid rgba(217,119,6,0.2)" : "1px solid #fde68a" }}>
                  <span className="text-[11px] font-semibold" style={{ color: "#d97706" }}>{course.academicSession}</span>
                </div>
              )}
            </div>

            {/* Expand toggle */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setHeroExpanded(v => !v)}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{ background: heroExpanded ? (dark ? "rgba(99,102,241,0.2)" : "#eef2ff") : (dark ? "rgba(255,255,255,0.04)" : "#f9fafb"), border: `1px solid ${dark ? "rgba(99,102,241,0.2)" : "#e5e7eb"}`, color: heroExpanded ? "#6366f1" : textMuted }}>
              {heroExpanded ? <ChevronUp style={{ width: 15, height: 15 }} /> : <ChevronDown style={{ width: 15, height: 15 }} />}
            </motion.button>
          </div>
        </div>

        {/* Expandable detail panel */}
        <AnimatePresence initial={false}>
          {heroExpanded && (
            <motion.div key="panel"
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}
              style={{ overflow: "hidden", background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, borderBottom: `1px solid ${divider}` }}>

              {/* Cover */}
              <div className="relative h-28 overflow-hidden">
                {course.coverImageUrl
                  ? <img src={course.coverImageUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  : <div className="w-full h-full" style={{ background: bannerGrad, opacity: 0.7 }} />
                }
                <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 0%, ${dark ? "rgba(16,24,44,0.95)" : "rgba(255,255,255,0.95)"} 100%)` }} />
              </div>

              {/* Detail grid */}
              <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-5 -mt-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Department", value: course.department,            color: "#6366f1" },
                    { label: "Semester",   value: course.semester,              color: "#059669" },
                    { label: "Session",    value: course.academicSession,       color: "#d97706" },
                    { label: "Credits",    value: `${course.creditHours} hours`,color: "#db2777" },
                  ].filter(i => i.value).map(item => (
                    <div key={item.label} className="rounded-xl px-4 py-3"
                      style={{ background: dark ? `${item.color}10` : `${item.color}08`, border: `1px solid ${item.color}22` }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: `${item.color}99` }}>{item.label}</p>
                      <p className="text-[13px] font-bold truncate" style={{ color: textSub }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {course.description && (
                  <div className="mt-3 px-4 py-3 rounded-xl"
                    style={{ background: dark ? "rgba(99,102,241,0.06)" : "#f9fafb", border: `1px solid ${border}` }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: dark ? "rgba(99,102,241,0.45)" : "#9ca3af" }}>About</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: textSub }}>{course.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab navigation */}
        <div style={{ background: cardBg, backdropFilter: blur, WebkitBackdropFilter: blur, borderBottom: `1px solid ${divider}`, boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.05)" }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8">
            <nav className="flex items-center gap-0.5 overflow-x-auto py-1" style={{ scrollbarWidth: "none" }}>
              {TABS.map(t => {
                const active = tab === t.key
                return (
                  <Link key={t.key} to={`/courses/${courseId}/${t.key}`}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all relative shrink-0"
                    style={{
                      background: active ? (dark ? `${t.color}18` : `${t.color}10`) : "transparent",
                      color: active ? t.color : textMuted,
                      border: active ? `1px solid ${t.color}28` : "1px solid transparent",
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = textSub }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = textMuted }}
                  >
                    <t.icon style={{ width: 15, height: 15 }} strokeWidth={active ? 2.5 : 2} />
                    <span className="hidden sm:inline">{t.label}</span>
                    {active && (
                      <motion.div layoutId="tab-line"
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                        style={{ background: t.color }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 py-7">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      <EditCourseModal isOpen={editOpen} onClose={() => setEditOpen(false)} course={course}
        onSubmit={(data: any) => updateCourse(data, { onSuccess: () => setEditOpen(false) })} isLoading={isUpdating} />
    </div>
  )
}
