import { useState } from "react"
import { useParams, Navigate, Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft, Users,
  Megaphone, ClipboardCheck, FolderOpen,
  ClipboardList, BookMarked, FileCheck2, BarChart3,
} from "lucide-react"

import CourseHeader from "../components/CourseHeader"
import CourseTabNav, { type CourseTabItem } from "../components/CourseTabNav"
import CourseMembersList from "../components/CourseMembersList"
import AttendanceTab from "../components/AttendanceTab"
import ConfirmActionModal from "../components/ConfirmActionModal"
import { useCourseDetail } from "../hooks/useCourseDetail"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { useCourses } from "../hooks/useCourses"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import { COURSE_TABS } from "@/config/constants"
import BrandLoader from "@/components/ui/BrandLoader"

import AnnouncementFeed from "@/features/announcements/components/AnnouncementFeed"
import MaterialsTab from "@/features/materials/components/MaterialsTab"
import AssignmentsTab from "@/features/assignments/components/AssignmentsTab"
import CTTab from "@/features/ct/components/CTTab"
import PresentationsTab from "@/features/presentations/components/PresentationsTab"
import MarksTab from "@/features/marks/components/MarksTab"

type PendingAction = "archive" | "unarchive" | null

export default function CourseDetailPage() {
  const { courseId, tab } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")

  const { course, isLoading, isFetched } = useCourseDetail(courseId!)
  const { members, joinRequests } = useCourseMembers(courseId!)

  const { archiveCourse, unarchiveCourse, isArchiving, isUnarchiving } = useCourses()

  const [pendingAction, setPendingAction] = useState<PendingAction>(null)

  if (!tab) return <Navigate to={"/courses/" + courseId + "/" + COURSE_TABS.STREAM} replace />

  if (isLoading) return <BrandLoader variant="page" label="Loading course…" />

  if (isFetched && !course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h2 className="font-display text-lg font-semibold text-foreground">Course not found</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          This course may have been removed, or you no longer have access to it.
        </p>
        <Link
          to="/courses"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to courses
        </Link>
      </div>
    )
  }

  const isOwner = teacher && course.teacherId === user?.id

  /* Pending join requests count — only teachers have this data; 0 for students. */
  const pendingRequestCount = joinRequests.filter((r: any) => r.status === "Pending").length

  /* Tab list with contextual badges. Pending join requests show on Members. */
  const tabs: CourseTabItem[] = [
    { key: COURSE_TABS.STREAM, label: "Stream", icon: Megaphone },
    { key: COURSE_TABS.ATTENDANCE, label: "Attendance", icon: ClipboardCheck },
    { key: COURSE_TABS.MATERIALS, label: "Materials", icon: FolderOpen },
    { key: COURSE_TABS.ASSIGNMENTS, label: "Assignments", icon: ClipboardList },
    { key: COURSE_TABS.CT, label: "CT", icon: BookMarked },
    { key: COURSE_TABS.PRESENTATIONS, label: "Other tests", icon: FileCheck2 },
    { key: COURSE_TABS.MARKS, label: "Marks", icon: BarChart3 },
    {
      key: COURSE_TABS.MEMBERS,
      label: "Members",
      icon: Users,
      badge: isOwner ? pendingRequestCount : undefined,
    },
  ]

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
      case COURSE_TABS.STREAM: return <AnnouncementFeed courseId={courseId!} />
      case COURSE_TABS.ATTENDANCE: return <AttendanceTab courseId={courseId!} courseName={course.title} />
      case COURSE_TABS.MATERIALS: return <MaterialsTab courseId={courseId!} />
      case COURSE_TABS.ASSIGNMENTS: return <AssignmentsTab courseId={courseId!} />
      case COURSE_TABS.CT: return <CTTab courseId={courseId!} />
      case COURSE_TABS.PRESENTATIONS: return <PresentationsTab courseId={courseId!} />
      case COURSE_TABS.MARKS: return <MarksTab courseId={courseId!} courseTitle={course.title} />
      case COURSE_TABS.MEMBERS: return <CourseMembersList courseId={courseId!} course={course} />
      default: return <Navigate to={"/courses/" + courseId + "/" + COURSE_TABS.STREAM} replace />
    }
  }

  return (
    <div className="min-h-full">
      {/* Hero header with course identity */}
      <CourseHeader
        course={course}
        isOwner={!!isOwner}
        memberCount={members.length || course.memberCount}
        onArchive={() => setPendingAction("archive")}
        onUnarchive={() => setPendingAction("unarchive")}
      />

      {/* Sticky tab navigation */}
      <CourseTabNav
        courseId={courseId!}
        tabs={tabs}
        activeTab={tab}
      />

      {/* Tab content */}
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Archive / Unarchive confirmation */}
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
