import { useState } from "react"
import { useParams, Navigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings, Users, ChevronLeft,
  Megaphone, ClipboardCheck, FolderOpen,
  ClipboardList, BookMarked, Mic, BarChart3,
} from "lucide-react"

import EditCourseModal from "../components/EditCourseModal"
import CourseMembersList from "../components/CourseMembersList"
import CourseInfoCard from "../components/CourseInfoCard"
import AttendanceTab from "../components/AttendanceTab"
import { useCourseDetail } from "../hooks/useCourseDetail"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { COURSE_TABS } from "@/config/constants"
import BrandLoader from "@/components/ui/BrandLoader"
import { cn } from "@/utils/cn"

import AnnouncementFeed from "@/features/announcements/components/AnnouncementFeed"
import MaterialsTab from "@/features/materials/components/MaterialsTab"
import AssignmentsTab from "@/features/assignments/components/AssignmentsTab"
import CTTab from "@/features/ct/components/CTTab"
import PresentationsTab from "@/features/presentations/components/PresentationsTab"
import MarksTab from "@/features/marks/components/MarksTab"

const TABS = [
  { key: COURSE_TABS.STREAM,        label: "Stream",        icon: Megaphone       },
  { key: COURSE_TABS.ATTENDANCE,    label: "Attendance",    icon: ClipboardCheck  },
  { key: COURSE_TABS.MATERIALS,     label: "Materials",     icon: FolderOpen      },
  { key: COURSE_TABS.ASSIGNMENTS,   label: "Assignments",   icon: ClipboardList   },
  { key: COURSE_TABS.CT,            label: "CT",            icon: BookMarked      },
  { key: COURSE_TABS.PRESENTATIONS, label: "Presentations", icon: Mic             },
  { key: COURSE_TABS.MARKS,         label: "Marks",         icon: BarChart3       },
  { key: COURSE_TABS.MEMBERS,       label: "Members",       icon: Users           },
]

export default function CourseDetailPage() {
  const { courseId, tab } = useParams()
  const { user }          = useAuthStore()
  const teacher           = isTeacher(user?.role ?? "Student")
  const { course, isLoading, isError, updateCourse, isUpdating } = useCourseDetail(courseId!)
  useCourseMembers(courseId!)    // prefetch members for other tabs
  const [editOpen, setEditOpen] = useState(false)

  if (!tab) return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />

  if (isLoading) {
    return <BrandLoader variant="page" label="Loading course…" />
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h2 className="font-display text-lg font-semibold text-foreground">Course not found</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          This course may have been removed, or you no longer have access to it.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl mt-5 text-sm font-semibold bg-primary text-primary-foreground hover:brightness-105 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </div>
    )
  }

  const isOwner = teacher && course.teacherId === user?.id

  const renderTab = () => {
    switch (tab) {
      case COURSE_TABS.STREAM:        return <AnnouncementFeed courseId={courseId!} />
      case COURSE_TABS.ATTENDANCE:    return <AttendanceTab courseId={courseId!} courseName={course.title} />
      case COURSE_TABS.MATERIALS:     return <MaterialsTab courseId={courseId!} />
      case COURSE_TABS.ASSIGNMENTS:   return <AssignmentsTab courseId={courseId!} />
      case COURSE_TABS.CT:            return <CTTab courseId={courseId!} />
      case COURSE_TABS.PRESENTATIONS: return <PresentationsTab courseId={courseId!} />
      case COURSE_TABS.MARKS:         return <MarksTab courseId={courseId!} courseTitle={course.title} />
      case COURSE_TABS.MEMBERS:       return <CourseMembersList courseId={courseId!} course={course} />
      default: return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />
    }
  }

  return (
    <div className="min-h-full">
      {/* ── Sticky header (breadcrumb + title + tabs) ── */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        {/* Breadcrumb row */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-10 flex items-center gap-2 text-xs">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-medium">Courses</span>
          </Link>
          <span className="text-border">/</span>
          <span className="font-medium text-foreground truncate">{course.title}</span>
        </div>

        {/* Title row */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-4 flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {course.courseCode && (
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider">
                  {course.courseCode}
                </span>
              )}
              {course.courseType && (
                <span className="pill pill-brand">{course.courseType}</span>
              )}
              {course.semester && (
                <span className="text-xs text-muted-foreground">{course.semester}</span>
              )}
            </div>
            <h1 className="font-display text-xl lg:text-2xl font-bold tracking-tight text-foreground leading-tight mt-1">
              {course.title}
            </h1>
          </div>

          {isOwner && (
            <button
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-muted hover:bg-subtle border border-border text-foreground text-xs font-semibold transition-colors focus-ring"
            >
              <Settings className="h-3.5 w-3.5" />
              Edit course
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
          <nav
            className="flex items-center gap-0.5 overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none" }}
            aria-label="Course sections"
          >
            {TABS.map(t => {
              const active = tab === t.key
              return (
                <Link
                  key={t.key}
                  to={`/courses/${courseId}/${t.key}`}
                  className={cn(
                    "relative inline-flex items-center gap-2 h-11 px-3.5 whitespace-nowrap shrink-0",
                    "text-[13px] font-semibold transition-colors",
                    "border-b-2",
                    active
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:border-border-strong",
                  )}
                >
                  <t.icon className="h-4 w-4" strokeWidth={active ? 2.25 : 2} />
                  <span>{t.label}</span>
                </Link>
              )
            })}
          </nav>
          {/* Fade edges on mobile where tabs scroll */}
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent" aria-hidden />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Primary content */}
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {renderTab()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Info sidebar — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-[170px]">
              <CourseInfoCard course={course} showJoinCode={isOwner} />
            </div>
          </aside>
        </div>
      </div>

      <EditCourseModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        course={course}
        onSubmit={(data: any) =>
          updateCourse(data, { onSuccess: () => setEditOpen(false) })
        }
        isLoading={isUpdating}
      />
    </div>
  )
}
