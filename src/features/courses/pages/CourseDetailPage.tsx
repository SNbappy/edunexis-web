import { useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Plus, Users, Eye, EyeOff,
  BookOpen, ChevronLeft, Megaphone, ClipboardCheck,
  FolderOpen, ClipboardList, BookMarked, Mic, BarChart3,
  GraduationCap, Layers
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import Tabs from '@/components/ui/Tabs'
import EditCourseModal from '../components/EditCourseModal'
import JoinRequestsPanel from '../components/JoinRequestsPanel'
import CourseMembersList from '../components/CourseMembersList'
import { useCourseDetail } from '../hooks/useCourseDetail'
import { useCourseMembers } from '../hooks/useCourseMembers'
import { useAuthStore } from '@/store/authStore'
import { isTeacher } from '@/utils/roleGuard'
import { COURSE_TABS } from '@/config/constants'
import AnnouncementFeed from '@/features/announcements/components/AnnouncementFeed'
import AttendanceRecordsList from '@/features/attendance/components/AttendanceRecordsList'
import AttendanceCalendar from '@/features/attendance/components/AttendanceCalendar'
import AttendanceStatsCard from '@/features/attendance/components/AttendanceStatsCard'
import TakeAttendanceSheet from '@/features/attendance/components/TakeAttendanceSheet'
import AttendanceExportButton from '@/features/attendance/components/AttendanceExportButton'
import StudentAttendanceView from '@/features/attendance/components/StudentAttendanceView'
import { useAttendance } from '@/features/attendance/hooks/useAttendance'
import { useAttendanceStats } from '@/features/attendance/hooks/useAttendanceStats'
import MaterialsTab from '@/features/materials/components/MaterialsTab'
import AssignmentsTab from '@/features/assignments/components/AssignmentsTab'
import CTTab from '@/features/ct/components/CTTab'
import PresentationsTab from '@/features/presentations/components/PresentationsTab'
import MarksTab from '@/features/marks/components/MarksTab'

const TABS = [
  { key: COURSE_TABS.STREAM,        label: 'Stream',       icon: Megaphone,      color: '#818cf8' },
  { key: COURSE_TABS.ATTENDANCE,    label: 'Attendance',   icon: ClipboardCheck, color: '#34d399' },
  { key: COURSE_TABS.MATERIALS,     label: 'Materials',    icon: FolderOpen,     color: '#fbbf24' },
  { key: COURSE_TABS.ASSIGNMENTS,   label: 'Assignments',  icon: ClipboardList,  color: '#f472b6' },
  { key: COURSE_TABS.CT,            label: 'CT',           icon: BookMarked,     color: '#a78bfa' },
  { key: COURSE_TABS.PRESENTATIONS, label: 'Presentations',icon: Mic,            color: '#38bdf8' },
  { key: COURSE_TABS.MARKS,         label: 'Marks',        icon: BarChart3,      color: '#fb923c' },
  { key: COURSE_TABS.MEMBERS,       label: 'Members',      icon: Users,          color: '#4ade80' },
]

// â”€â”€ Join Code Badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function JoinCodeBadge({ code }: { code: string }) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
      style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
      <span className="text-[11px] font-semibold" style={{ color: 'rgba(129,140,248,0.6)' }}>Code:</span>
      {visible
        ? <button onClick={copy}
            className="text-[12px] font-black font-mono tracking-widest transition-colors"
            style={{ color: copied ? '#34d399' : '#818cf8' }}>
            {copied ? 'Copied!' : code}
          </button>
        : <span className="text-[12px] font-black font-mono tracking-widest select-none"
            style={{ color: 'rgba(129,140,248,0.3)' }}>
            {'*'.repeat(code.length)}
          </span>
      }
      <button onClick={() => setVisible(v => !v)}
        className="ml-0.5 transition-colors"
        style={{ color: 'rgba(129,140,248,0.5)' }}>
        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  )
}

// â”€â”€ Attendance Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AttendanceTab({ courseId, courseName }: { courseId: string; courseName?: string }) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? 'Student')
  const [takeOpen, setTakeOpen] = useState(false)
  const [editSession, setEditSession] = useState<import('@/types/attendance.types').AttendanceSessionDto | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const { sessions, members, isSessionsLoading, takeAttendance, isTaking, editAttendance, isEditing, deleteSession } = useAttendance(courseId)
  const { data: stats } = useAttendanceStats(courseId)

  if (!teacher) return <StudentAttendanceView courseId={courseId} />

  return (
    <div className="space-y-5">
      {/* ── Premium Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl"
        style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.3),rgba(6,182,212,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <GraduationCap className="w-4 h-4" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <h2 className="text-[15px] font-extrabold" style={{ color: '#e2e8f0' }}>Attendance</h2>
            <p className="text-[11px]" style={{ color: '#475569' }}>{sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl gap-1"
            style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
            {([['list', 'List'], ['calendar', 'Calendar']] as const).map(([key, label]) => (
              <motion.button key={key} whileTap={{ scale: 0.95 }}
                onClick={() => setView(key)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{
                  background: view === key ? 'rgba(99,102,241,0.25)' : 'transparent',
                  color: view === key ? '#818cf8' : '#475569',
                  border: view === key ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
                  boxShadow: view === key ? '0 2px 12px rgba(99,102,241,0.2)' : 'none',
                }}>
                {label}
              </motion.button>
            ))}
          </div>
          <AttendanceExportButton courseId={courseId} courseName={courseName ?? 'Course'} />
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setTakeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
            <Plus className="w-4 h-4" /> Take Attendance
          </motion.button>
        </div>
      </div>
      {stats && (
        <AttendanceStatsCard totalSessions={stats.totalSessions} averageAttendance={stats.averageAttendance}
          totalStudents={stats.studentSummaries?.length} lastSessionDate={stats.lastSessionDate} />
      )}
      {isSessionsLoading
        ? <div className="space-y-3">{[1,2,3].map(i =>
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(99,102,241,0.06)' }} />
          )}</div>
        : view === 'list'
          ? <AttendanceRecordsList sessions={sessions}
              onEdit={(id) => setEditSession(sessions.find(s => s.id === id) ?? null)}
              onDelete={deleteSession} />
          : <AttendanceCalendar sessions={sessions} />
      }
      {editSession && (
        <TakeAttendanceSheet isOpen={!!editSession} onClose={() => setEditSession(null)}
          members={members} courseId={courseId}
          initialDate={editSession.date} initialTopic={editSession.topic}
          initialStatuses={Object.fromEntries(editSession.records.map(r =>
            [r.studentId, r.status as import('@/types/attendance.types').AttendanceStatus]))}
          onSubmit={(data) => {
            editAttendance({ sessionId: editSession.id, data: { topic: data.topic, entries: data.records.map(r => ({ studentId: r.studentId, status: r.status })) } })
            setEditSession(null)
          }}
          isLoading={isEditing} />
      )}
      <TakeAttendanceSheet isOpen={takeOpen} onClose={() => setTakeOpen(false)}
        members={members} courseId={courseId}
        onSubmit={(data) => takeAttendance(data, { onSuccess: () => setTakeOpen(false) })}
        isLoading={isTaking} />
    </div>
  )
}

// â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CourseDetailPage() {
  const { courseId, tab } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? 'Student')
  const { course, isLoading, isError, updateCourse, isUpdating } = useCourseDetail(courseId!)
  const { members } = useCourseMembers(courseId!)
  const [editOpen, setEditOpen] = useState(false)

  if (!tab) return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />

  if (isLoading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]"
      style={{ background: 'linear-gradient(180deg,#060d1f 0%,#07102b 100%)' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <Layers className="w-6 h-6 animate-pulse" style={{ color: '#818cf8' }} />
        </div>
        <Spinner size="lg" className="text-indigo-400" />
      </div>
    </div>
  )
  if (isError || !course) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]"
      style={{ background: 'linear-gradient(180deg,#060d1f 0%,#07102b 100%)' }}>
      <p style={{ color: '#475569' }}>Course not found.</p>
    </div>
  )

  // Real member count from members hook (DTO field is stale)
  const realMemberCount = members.length
  const teacherInitial = (course.teacherName ?? 'T').trim().split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'T'

  const typeGradient = course.courseType === 'Lab'
    ? 'linear-gradient(135deg,#064e3b 0%,#065f46 40%,#0c4a6e 100%)'
    : 'linear-gradient(135deg,#1e1b4b 0%,#3730a3 35%,#4f46e5 65%,#2e1065 100%)'

  const renderTab = () => {
    switch (tab) {
      case COURSE_TABS.STREAM:        return <AnnouncementFeed courseId={courseId!} />
      case COURSE_TABS.ATTENDANCE:    return <AttendanceTab courseId={courseId!} courseName={course?.title} />
      case COURSE_TABS.MATERIALS:     return <MaterialsTab courseId={courseId!} />
      case COURSE_TABS.ASSIGNMENTS:   return <AssignmentsTab courseId={courseId!} />
      case COURSE_TABS.CT:            return <CTTab courseId={courseId!} />
      case COURSE_TABS.PRESENTATIONS: return <PresentationsTab courseId={courseId!} />
      case COURSE_TABS.MARKS:         return <MarksTab courseId={courseId!} courseTitle={course?.title} />
      case COURSE_TABS.MEMBERS:
        return (
          <div className="space-y-6">
            {teacher && (
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#e2e8f0' }}>
                  <Users className="w-4 h-4" style={{ color: '#818cf8' }} /> Pending Join Requests
                </h3>
                <JoinRequestsPanel courseId={courseId!} />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold mb-3" style={{ color: '#e2e8f0' }}>Course Members</h3>
              <CourseMembersList courseId={courseId!} course={course} />
            </div>
          </div>
        )
      default: return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />
    }
  }

  return (
    <div className="min-h-full relative"
      style={{ background: 'linear-gradient(180deg,#060d1f 0%,#07102b 60%,#060d1f 100%)' }}>

      {/* Ambient glows matching dashboard */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(79,70,229,0.08) 0%,transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/4 right-0 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(6,182,212,0.04) 0%,transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* â”€â”€ HERO BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="relative">
        {/* Cover image */}
        <div className="relative h-52 lg:h-64 overflow-hidden">
          {course.coverImageUrl
            ? <img src={course.coverImageUrl} alt="" className="w-full h-full object-cover" />
            : <div className="w-full h-full" style={{ background: typeGradient }} />
          }
          {/* Grid overlay like dashboard hero */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
            }} />
          {/* Fade to page bg */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom,rgba(6,13,31,0.15) 0%,rgba(6,13,31,0.6) 55%,#060d1f 100%)' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right,rgba(6,13,31,0.55) 0%,transparent 55%)' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8">
          <div className="-mt-24 pb-0">

            {/* Back button */}
            <button onClick={() => navigate('/courses')}
              className="flex items-center gap-1.5 mb-4 text-[12px] font-semibold transition-colors"
              style={{ color: 'rgba(148,163,184,0.45)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(148,163,184,0.45)'}>
              <ChevronLeft className="w-3.5 h-3.5" /> All Courses
            </button>

            {/* Type + credit badges */}
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest"
                style={{
                  background: course.courseType === 'Lab' ? 'rgba(52,211,153,0.12)' : 'rgba(99,102,241,0.15)',
                  border: course.courseType === 'Lab' ? '1px solid rgba(52,211,153,0.3)' : '1px solid rgba(99,102,241,0.3)',
                  color: course.courseType === 'Lab' ? '#34d399' : '#818cf8',
                }}>
                {course.courseType}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                {course.creditHours} Credits
              </span>
            </div>

            {/* Title â€” gradient text like dashboard */}
            <h1 className="text-[26px] lg:text-[32px] font-extrabold tracking-tight leading-tight mb-1"
              style={{
                background: 'linear-gradient(135deg,#fff 0%,#c7d2fe 55%,#818cf8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
              {course.title}
            </h1>

            {/* Meta row */}
            <div className="flex items-center gap-2.5 flex-wrap mb-5 text-[12px]" style={{ color: '#475569' }}>
              <span className="flex items-center gap-1.5 font-bold font-mono" style={{ color: '#6366f1' }}>
                <BookOpen className="w-3 h-3" />{course.courseCode}
              </span>
              <span className="w-1 h-1 rounded-full opacity-40" style={{ background: '#818cf8' }} />
              <span>{course.department}</span>
              <span className="w-1 h-1 rounded-full opacity-40" style={{ background: '#818cf8' }} />
              <span>{course.semester}</span>
              <span className="w-1 h-1 rounded-full opacity-40" style={{ background: '#818cf8' }} />
              <span>{course.academicSession}</span>
              {course.section && <>
                <span className="w-1 h-1 rounded-full opacity-40" style={{ background: '#818cf8' }} />
                <span>Section {course.section}</span>
              </>}
            </div>

            {/* Bottom action row */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-5">
              <div className="flex items-center gap-2 flex-wrap">

                {/* Teacher chip */}
                <motion.div whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0"
                    style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.4),rgba(6,182,212,0.25))', border: '1px solid rgba(99,102,241,0.4)', color: '#c7d2fe' }}>
                    {teacherInitial}
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: '#94a3b8' }}>
                    {course.teacherName || 'Instructor'}
                  </span>
                </motion.div>

                {/* Members pill */}
                <motion.div whileHover={{ scale: 1.03 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(74,222,128,0.2)', boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                  <Users className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
                  <span className="text-[12px] font-semibold" style={{ color: '#94a3b8' }}>
                    {realMemberCount} member{realMemberCount !== 1 ? 's' : ''}
                  </span>
                </motion.div>

                {teacher && course.joiningCode && <JoinCodeBadge code={course.joiningCode} />}
              </div>

              {/* Edit button */}
              {teacher && course.teacherId === user?.id && (
                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }} whileTap={{ scale: 0.97 }}
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                  <Settings className="w-4 h-4" /> Edit Course
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* â”€â”€ TAB NAVIGATION â”€â”€ */}
        <div className="sticky top-0 z-20"
          style={{ background: 'rgba(6,13,31,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8">
            <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1">
              {TABS.map((t) => {
                const active = tab === t.key
                const Icon = t.icon
                return (
                  <Link key={t.key} to={`/courses/${courseId}/${t.key}`}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all relative shrink-0"
                    style={{
                      background: active ? `${t.color}14` : 'transparent',
                      color: active ? t.color : 'rgba(100,116,139,0.75)',
                      border: active ? `1px solid ${t.color}28` : '1px solid transparent',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(100,116,139,0.75)' }}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">{t.label}</span>
                    {active && (
                      <motion.div layoutId="tab-indicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                        style={{ background: t.color }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* â”€â”€ TAB CONTENT â”€â”€ */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 py-7">
        <AnimatePresence mode="wait">
          <motion.div key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}>
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      <EditCourseModal isOpen={editOpen} onClose={() => setEditOpen(false)} course={course}
        onSubmit={(data) => updateCourse(data, { onSuccess: () => setEditOpen(false) })} isLoading={isUpdating} />
    </div>
  )
}
