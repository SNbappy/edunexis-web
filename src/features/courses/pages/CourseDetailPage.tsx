import { useState } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, Users, Eye, EyeOff, Plus,
  BookOpen, ChevronLeft, Megaphone, ClipboardCheck,
  FolderOpen, ClipboardList, BookMarked, Mic, BarChart3,
  GraduationCap, Layers, ChevronDown, ChevronUp
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Spinner from '@/components/ui/Spinner'
import EditCourseModal from '../components/EditCourseModal'
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
  { key: COURSE_TABS.STREAM,        label: 'Stream',        icon: Megaphone,      color: '#818cf8' },
  { key: COURSE_TABS.ATTENDANCE,    label: 'Attendance',    icon: ClipboardCheck, color: '#34d399' },
  { key: COURSE_TABS.MATERIALS,     label: 'Materials',     icon: FolderOpen,     color: '#fbbf24' },
  { key: COURSE_TABS.ASSIGNMENTS,   label: 'Assignments',   icon: ClipboardList,  color: '#f472b6' },
  { key: COURSE_TABS.CT,            label: 'CT',            icon: BookMarked,     color: '#a78bfa' },
  { key: COURSE_TABS.PRESENTATIONS, label: 'Presentations', icon: Mic,            color: '#38bdf8' },
  { key: COURSE_TABS.MARKS,         label: 'Marks',         icon: BarChart3,      color: '#fb923c' },
  { key: COURSE_TABS.MEMBERS,       label: 'Members',       icon: Users,          color: '#4ade80' },
]

function JoinCodeBadge({ code }: { code: string }) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied]   = useState(false)
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer select-none"
      style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
      <span className="text-[10px] font-semibold" style={{ color: 'rgba(129,140,248,0.55)' }}>Code</span>
      <span className="w-px h-3 opacity-20" style={{ background: '#818cf8' }} />
      {visible
        ? <button onClick={copy} className="text-[11px] font-black font-mono tracking-widest" style={{ color: copied ? '#34d399' : '#818cf8' }}>
            {copied ? 'Copied!' : code}
          </button>
        : <span className="text-[11px] font-black font-mono tracking-widest" style={{ color: 'rgba(129,140,248,0.25)' }}>{'•'.repeat(code.length)}</span>
      }
      <button onClick={() => setVisible(v => !v)} style={{ color: 'rgba(129,140,248,0.4)' }}>
        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
    </div>
  )
}

function AttendanceTab({ courseId, courseName }: { courseId: string; courseName?: string }) {
  const { user }   = useAuthStore()
  const teacher    = isTeacher(user?.role ?? 'Student')
  const [takeOpen, setTakeOpen] = useState(false)
  const [editSession, setEditSession] = useState<import('@/types/attendance.types').AttendanceSessionDto | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const { sessions, members, isSessionsLoading, takeAttendance, isTaking, editAttendance, isEditing, deleteSession } = useAttendance(courseId)
  const { data: stats } = useAttendanceStats(courseId)
  if (!teacher) return <StudentAttendanceView courseId={courseId} />
  return (
    <div className="space-y-5">
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
          <div className="flex items-center p-1 rounded-xl gap-1" style={{ background: 'rgba(6,13,31,0.7)', border: '1px solid rgba(99,102,241,0.15)' }}>
            {(['list', 'calendar'] as const).map((key) => (
              <motion.button key={key} whileTap={{ scale: 0.95 }} onClick={() => setView(key)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{ background: view === key ? 'rgba(99,102,241,0.25)' : 'transparent', color: view === key ? '#818cf8' : '#475569', border: view === key ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </motion.button>
            ))}
          </div>
          <AttendanceExportButton courseId={courseId} courseName={courseName ?? 'Course'} />
          <motion.button whileHover={{ scale: 1.04, boxShadow: '0 6px 24px rgba(99,102,241,0.45)' }} whileTap={{ scale: 0.97 }}
            onClick={() => setTakeOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', color: '#fff', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
            <Plus className="w-4 h-4" /> Take Attendance
          </motion.button>
        </div>
      </div>
      {stats && <AttendanceStatsCard totalSessions={stats.totalSessions} averageAttendance={stats.averageAttendance} totalStudents={stats.studentSummaries?.length} lastSessionDate={stats.lastSessionDate} />}
      {isSessionsLoading
        ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(99,102,241,0.06)' }} />)}</div>
        : view === 'list'
          ? <AttendanceRecordsList sessions={sessions} onEdit={(id) => setEditSession(sessions.find(s => s.id === id) ?? null)} onDelete={deleteSession} />
          : <AttendanceCalendar sessions={sessions} />
      }
      {editSession && (
        <TakeAttendanceSheet isOpen={!!editSession} onClose={() => setEditSession(null)}
          members={members} courseId={courseId}
          initialDate={editSession.date} initialTopic={editSession.topic}
          initialStatuses={Object.fromEntries(editSession.records.map(r => [r.studentId, r.status as import('@/types/attendance.types').AttendanceStatus]))}
          onSubmit={(data) => { editAttendance({ sessionId: editSession.id, data: { topic: data.topic, entries: data.records.map(r => ({ studentId: r.studentId, status: r.status })) } }); setEditSession(null) }}
          isLoading={isEditing} />
      )}
      <TakeAttendanceSheet isOpen={takeOpen} onClose={() => setTakeOpen(false)}
        members={members} courseId={courseId}
        onSubmit={(data) => takeAttendance(data, { onSuccess: () => setTakeOpen(false) })}
        isLoading={isTaking} />
    </div>
  )
}

export default function CourseDetailPage() {
  const { courseId, tab } = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuthStore()
  const teacher           = isTeacher(user?.role ?? 'Student')
  const { course, isLoading, isError, updateCourse, isUpdating } = useCourseDetail(courseId!)
  const { members }       = useCourseMembers(courseId!)
  const [editOpen, setEditOpen]         = useState(false)
  const [heroExpanded, setHeroExpanded] = useState(false)

  if (!tab) return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />

  if (isLoading) return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
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
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <p style={{ color: '#475569' }}>Course not found.</p>
    </div>
  )

  const realMemberCount = members.length
  const teacherInitial  = (course.teacherName ?? 'T').trim().split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'T'
  const typeGradient    = course.courseType === 'Lab'
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
      case COURSE_TABS.MEMBERS:       return <CourseMembersList courseId={courseId!} course={course} />
      default:                        return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />
    }
  }

  return (
    <div className="min-h-full" style={{ background: 'linear-gradient(180deg,#060d1f 0%,#07102b 60%,#060d1f 100%)' }}>

      {/* ══════════════════════════════════════════════
          STICKY HEADER  (3 layers)
      ══════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20" style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>

        {/* ── Layer 1: Breadcrumb bar ── */}
        <div style={{ background: 'rgba(6,13,31,0.88)', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8 h-9 flex items-center gap-2">
            <button onClick={() => navigate('/courses')}
              className="flex items-center gap-1 text-[11px] font-semibold transition-colors shrink-0"
              style={{ color: '#334155' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#818cf8'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#334155'}>
              <ChevronLeft className="w-3.5 h-3.5" /> Courses
            </button>
            <span style={{ color: '#1e293b' }}>/</span>
            <span className="text-[11px] font-semibold truncate" style={{ color: '#475569' }}>{course.title}</span>
            <span className="text-[10px] font-mono ml-0.5 shrink-0" style={{ color: '#334155' }}>{course.courseCode}</span>

            {/* Right actions */}
            <div className="ml-auto flex items-center gap-2">
              {teacher && course.joiningCode && <JoinCodeBadge code={course.joiningCode} />}
              {teacher && course.teacherId === user?.id && (
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                  <Settings className="w-3 h-3" /> Edit
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* ── Layer 2: Course identity bar ── */}
        <div style={{ background: 'rgba(6,13,31,0.94)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8 py-3 flex items-center gap-4">

            {/* Color accent dot matching course type */}
            <div className="w-1 h-10 rounded-full shrink-0"
              style={{ background: course.courseType === 'Lab' ? 'linear-gradient(180deg,#34d399,#059669)' : 'linear-gradient(180deg,#818cf8,#4f46e5)' }} />

            {/* Title + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[18px] font-extrabold tracking-tight leading-none" style={{ color: '#f1f5f9' }}>
                  {course.title}
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-widest shrink-0"
                  style={{ background: course.courseType === 'Lab' ? 'rgba(52,211,153,0.12)' : 'rgba(99,102,241,0.15)', border: course.courseType === 'Lab' ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(99,102,241,0.25)', color: course.courseType === 'Lab' ? '#34d399' : '#818cf8' }}>
                  {course.courseType}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#d97706' }}>
                  {course.creditHours} cr
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[11px] font-bold font-mono" style={{ color: '#4f46e5' }}>{course.courseCode}</span>
                <span className="text-[10px]" style={{ color: '#1e293b' }}>·</span>
                <span className="text-[11px]" style={{ color: '#334155' }}>{course.department}</span>
                <span className="text-[10px]" style={{ color: '#1e293b' }}>·</span>
                <span className="text-[11px]" style={{ color: '#334155' }}>{course.semester}</span>
                {course.section && <>
                  <span className="text-[10px]" style={{ color: '#1e293b' }}>·</span>
                  <span className="text-[11px]" style={{ color: '#334155' }}>§{course.section}</span>
                </>}
              </div>
            </div>

            {/* Stats pills */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {/* Teacher */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                  style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.5),rgba(6,182,212,0.3))', color: '#c7d2fe' }}>
                  {teacherInitial}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: '#64748b' }}>{course.teacherName || 'Instructor'}</span>
              </div>

              {/* Members */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(74,222,128,0.15)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
                <span className="text-[12px] font-semibold" style={{ color: '#64748b' }}>{realMemberCount}</span>
              </div>

              {/* Session / semester pill */}
              <div className="px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>{course.academicSession}</span>
              </div>
            </div>

            {/* Expand toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setHeroExpanded(v => !v)}
              className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: heroExpanded ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: heroExpanded ? '#818cf8' : '#475569',
              }}
              title={heroExpanded ? 'Collapse details' : 'Expand details'}>
              {heroExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* ── Expandable detail panel ── */}
        <AnimatePresence initial={false}>
          {heroExpanded && (
            <motion.div
              key="hero-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ overflow: 'hidden', background: 'rgba(6,13,31,0.97)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>

              {/* Cover strip */}
              <div className="relative h-36 lg:h-48 overflow-hidden">
                {course.coverImageUrl
                  ? <img src={course.coverImageUrl} alt="" className="w-full h-full object-cover opacity-60" />
                  : <div className="w-full h-full opacity-70" style={{ background: typeGradient }} />
                }
                <div className="absolute inset-0 pointer-events-none"
                  style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,transparent 0%,rgba(6,13,31,0.97) 100%)' }} />
              </div>

              {/* Detail grid */}
              <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-5 -mt-10 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Department', value: course.department,      color: '#818cf8' },
                    { label: 'Semester',   value: course.semester,        color: '#34d399' },
                    { label: 'Session',    value: course.academicSession, color: '#fbbf24' },
                    { label: 'Credits',    value: `${course.creditHours} hours`, color: '#f472b6' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl px-4 py-3"
                      style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${item.color}18` }}>
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: item.color + '80' }}>{item.label}</p>
                      <p className="text-[13px] font-bold truncate" style={{ color: '#cbd5e1' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
                {course.description && (
                  <div className="mt-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(10,22,40,0.8)', border: '1px solid rgba(99,102,241,0.1)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(129,140,248,0.4)' }}>About</p>
                    <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>{course.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Layer 3: Tab navigation ── */}
        <div style={{ background: 'rgba(6,13,31,0.96)', borderBottom: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
          <div className="max-w-6xl mx-auto px-5 lg:px-8">
            <nav className="flex items-center gap-0.5 overflow-x-auto no-scrollbar py-1">
              {TABS.map((t) => {
                const active = tab === t.key
                const Icon   = t.icon
                return (
                  <Link key={t.key} to={`/courses/${courseId}/${t.key}`}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all relative shrink-0"
                    style={{ background: active ? `${t.color}12` : 'transparent', color: active ? t.color : 'rgba(100,116,139,0.7)', border: active ? `1px solid ${t.color}25` : '1px solid transparent' }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#94a3b8' }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(100,116,139,0.7)' }}>
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

      </div>{/* end sticky */}

      {/* ── Tab Content ── */}
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
