import { useState } from "react"
import { useParams, Navigate, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Settings, Users, ChevronLeft, MoreHorizontal,
  Archive, ArchiveRestore,
  Megaphone, ClipboardCheck, FolderOpen,
  ClipboardList, BookMarked, Mic, BarChart3,
} from "lucide-react"

import CourseMembersList from "../components/CourseMembersList"
import CourseInfoCard from "../components/CourseInfoCard"
import AttendanceTab from "../components/AttendanceTab"
import ConfirmActionModal from "../components/ConfirmActionModal"
import { useCourseDetail } from "../hooks/useCourseDetail"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { useCourses } from "../hooks/useCourses"
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

type PendingAction = "archive" | "unarchive" | null

export default function CourseDetailPage() {
  const { courseId, tab } = useParams()
  const navigate          = useNavigate()
  const { user }          = useAuthStore()
  const teacher           = isTeacher(user?.role ?? "Student")

  const { course, isLoading, isError } = useCourseDetail(courseId!)
  useCourseMembers(courseId!)

  const {
    archiveCourse, unarchiveCourse,
    isArchiving, isUnarchiving,
  } = useCourses()

  const [menuOpen,      setMenuOpen]      = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  if (!tab) return <Navigate to={`/courses/${courseId}/${COURSE_TABS.STREAM}`} replace />

  if (isLoading) return <BrandLoader variant="page" label="Loading course…" />

  if (isError || !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Course not found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          This course may have been removed, or you no longer have access to it.
        </p>
        <Link
          to="/courses"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </div>
    )
  }

  const isOwner = teacher && course.teacherId === user?.id

  const handleArchive = () => {
    archiveCourse(course.id, {
      onSuccess: () => {
        setPendingAction(null)
        navigate("/courses")
      },
    } as any)
  }

  const handleUnarchive = () => {
    unarchiveCourse(course.id, {
      onSuccess: () => setPendingAction(null),
    } as any)
  }

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
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        {/* Breadcrumb */}
        <div className="mx-auto flex h-10 max-w-7xl items-center gap-2 px-5 text-xs lg:px-8">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="font-medium">Courses</span>
          </Link>
          <span className="text-border">/</span>
          <span className="truncate font-medium text-foreground">{course.title}</span>
        </div>

        {/* Title row */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-4 lg:px-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {course.courseCode && (
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  {course.courseCode}
                </span>
              )}
              {course.courseType && (
                <span className="pill pill-brand">{course.courseType}</span>
              )}
              {course.semester && (
                <span className="text-xs text-muted-foreground">{course.semester}</span>
              )}
              {course.isArchived && (
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  <Archive className="h-3 w-3" />
                  Archived
                </span>
              )}
            </div>
            <h1 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight text-foreground lg:text-2xl">
              {course.title}
            </h1>
          </div>

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                to={`/courses/${courseId}/edit`}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-muted px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-subtle focus-ring"
              >
                <Settings className="h-3.5 w-3.5" />
                Edit course
              </Link>

              {/* Actions menu */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted text-foreground transition-colors hover:bg-subtle"
                  aria-label="More actions"
                  aria-expanded={menuOpen}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <>
                    {/* backdrop to close on outside click */}
                    <button
                      aria-hidden
                      className="fixed inset-0 z-30 cursor-default"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-40 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                      {course.isArchived ? (
                        <button
                          onClick={() => { setMenuOpen(false); setPendingAction("unarchive") }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-stone-50"
                        >
                          <ArchiveRestore className="h-4 w-4 text-teal-600" />
                          Restore course
                        </button>
                      ) : (
                        <button
                          onClick={() => { setMenuOpen(false); setPendingAction("archive") }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-stone-50"
                        >
                          <Archive className="h-4 w-4 text-stone-600" />
                          Archive course
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
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
                    "relative inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap px-3.5",
                    "text-[13px] font-semibold transition-colors",
                    "border-b-2",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  <t.icon className="h-4 w-4" strokeWidth={active ? 2.25 : 2} />
                  <span>{t.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" aria-hidden />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
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

          <aside className="hidden lg:block">
            <div className="sticky top-[170px]">
              <CourseInfoCard course={course} showJoinCode={!!isOwner} />
            </div>
          </aside>
        </div>
      </div>

      {/* ── Archive / Unarchive confirmation ── */}
      <ConfirmActionModal
        isOpen={pendingAction === "archive"}
        onClose={() => setPendingAction(null)}
        onConfirm={handleArchive}
        title="Archive this course?"
        description="Students will lose access to this course, but all records (attendance, grades, submissions) will be preserved. You can restore it anytime."
        confirmLabel="Archive course"
        tone="warning"
        isLoading={isArchiving}
      />

      <ConfirmActionModal
        isOpen={pendingAction === "unarchive"}
        onClose={() => setPendingAction(null)}
        onConfirm={handleUnarchive}
        title="Restore this course?"
        description="Students will regain access to the course and all its content."
        confirmLabel="Restore course"
        tone="primary"
        isLoading={isUnarchiving}
      />
    </div>
  )
}
