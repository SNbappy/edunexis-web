import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserCheck, UserX, Clock, UserMinus, AlertTriangle } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useCourseMembers } from "../hooks/useCourseMembers"
import { usePublicProfile } from "@/features/profile/hooks/usePublicProfile"
import { useAuthStore } from "@/store/authStore"
import { isTeacher } from "@/utils/roleGuard"
import type { CourseMemberDto, CourseDto } from "@/types/course.types"

interface CourseMembersListProps {
  courseId: string
  course?: CourseDto
}

type FilterTab = "all" | "students" | "requests"

export default function CourseMembersList({ courseId, course }: CourseMembersListProps) {
  const { user } = useAuthStore()
  const teacher = isTeacher(user?.role ?? "Student")
  const navigate = useNavigate()

  const {
    members, joinRequests, isMembersLoading, isRequestsLoading,
    removeMember, isRemoving, reviewRequest, isReviewing,
  } = useCourseMembers(courseId)
  const { data: teacherProfile } = usePublicProfile(course?.teacherId)

  const [confirmTarget, setConfirmTarget] = useState<CourseMemberDto | null>(null)
  const [searchParams] = useSearchParams()
  const initialFilter = (searchParams.get("view") === "requests" ? "requests" : "all") as FilterTab
  const [filter, setFilter] = useState<FilterTab>(initialFilter)

  const handleVisitProfile = (userId: string, memberData: object) =>
    navigate("/users/" + userId, { state: { member: memberData } })

  const pendingRequests = joinRequests.filter((r: any) => r.status === "Pending")
  const pendingCount = pendingRequests.length

  const FILTERS: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All", count: members.length || undefined },
    { key: "students", label: "Students", count: members.length || undefined },
    ...(teacher
      ? [{ key: "requests" as FilterTab, label: "Requests", count: pendingCount || undefined }]
      : []),
  ]

  if (isMembersLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="h-16 animate-pulse rounded-2xl border border-border bg-muted/40" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-muted/40" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
              <Users className="h-4 w-4" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-[15px] font-bold text-foreground">
                Members
              </h2>
              <p className="text-[11.5px] text-muted-foreground">
                {members.length > 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-300">
                    {members.length} student{members.length !== 1 ? "s" : ""} enrolled
                  </span>
                ) : (
                  <span>No students yet</span>
                )}
                {teacher && pendingCount > 0 && (
                  <span className="text-amber-700 dark:text-amber-300">
                    {" · " + pendingCount + " pending"}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1">
            {FILTERS.map(tab => {
              const active = filter === tab.key
              return (
                <motion.button
                  key={tab.key}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(tab.key)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors " +
                    (active
                      ? "bg-card text-teal-700 shadow-sm dark:text-teal-300"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold " +
                      (active
                        ? "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300"
                        : tab.key === "requests"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                          : "bg-card text-muted-foreground")
                    }>
                      {tab.count}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Join Requests */}
        {teacher && (filter === "all" || filter === "requests") && (
          <AnimatePresence>
            {isRequestsLoading ? (
              <div className="h-16 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ) : pendingCount > 0 ? (
              <motion.div
                key="requests"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-amber-200 bg-card shadow-sm dark:border-amber-800"
              >
                <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40">
                  <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
                    Join requests
                  </span>
                  <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                    {pendingCount}
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {pendingRequests.map((req: any, i: number) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20"
                    >
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border-2 border-amber-300 dark:border-amber-700">
                        <Avatar src={req.profilePhotoUrl} name={req.studentName} size="sm" className="h-full w-full rounded-none" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {req.studentName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {req.studentEmail}
                        </p>
                      </div>
                      {req.studentIdNumber && (
                        <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:block">
                          {req.studentIdNumber}
                        </span>
                      )}
                      <div className="flex shrink-0 items-center gap-1.5">
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => reviewRequest({ requestId: req.id, status: "Approved" })}
                          disabled={isReviewing}
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                        >
                          <UserCheck className="h-3 w-3" />
                          Approve
                        </motion.button>
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.95 }}
                          onClick={() => reviewRequest({ requestId: req.id, status: "Rejected" })}
                          disabled={isReviewing}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-950/60"
                        >
                          <UserX className="h-3 w-3" />
                          Reject
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : filter === "requests" ? (
              <motion.div
                key="no-requests"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-10 text-center"
              >
                <Clock className="mb-2 h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-[13px] font-bold text-foreground">No pending requests</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        )}

        {/* Instructor */}
        {course && (filter === "all" || filter === "students") && (
          <div>
            <p className="mb-2 px-1 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Instructor
            </p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleVisitProfile(course.teacherId, {
                userId: course.teacherId,
                fullName: course.teacherName,
                role: "Teacher",
              })}
              whileHover={{ y: -1 }}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 transition-shadow hover:shadow-md dark:border-teal-800 dark:bg-teal-950/40"
            >
              <div className="relative shrink-0">
                <div className="h-10 w-10 overflow-hidden rounded-xl border-2 border-teal-300 dark:border-teal-700">
                  <Avatar
                    src={teacherProfile?.profilePhotoUrl ?? course.teacherProfilePhotoUrl}
                    name={teacherProfile?.fullName ?? course.teacherName ?? "Instructor"}
                    size="md"
                    className="h-full w-full rounded-none"
                  />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-teal-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-foreground">
                  {teacherProfile?.fullName ?? course.teacherName ?? "Course Instructor"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Course teacher
                </p>
              </div>
              <span className="rounded-full border border-teal-200 bg-teal-100 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-teal-700 dark:border-teal-700 dark:bg-teal-900/60 dark:text-teal-300">
                Teacher
              </span>
            </motion.div>
          </div>
        )}

        {/* Students */}
        {(filter === "all" || filter === "students") && (
          members.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-14 text-center">
              <Users className="mb-3 h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
              <p className="font-display text-[15px] font-bold text-foreground">
                No students yet
              </p>
              <p className="mt-1 text-[12.5px] text-muted-foreground">
                Approve join requests to add students.
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-2 px-1 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Students ({members.length})
              </p>
              <div className="space-y-2">
                <AnimatePresence>
                  {members.map((m: any, i: number) => (
                    <motion.div
                      key={m.userId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: Math.min(i * 0.03, 0.3) }}
                      onClick={() => handleVisitProfile(m.userId, m)}
                      whileHover={{ y: -1 }}
                      className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-colors hover:border-teal-200 dark:hover:border-teal-800"
                    >
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border-2 border-teal-200 dark:border-teal-800">
                        <Avatar src={m.profilePhotoUrl} name={m.fullName} size="sm" className="h-full w-full rounded-none" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-foreground">
                          {m.fullName}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {m.email}
                        </p>
                      </div>
                      {m.studentId && (
                        <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:block">
                          {m.studentId}
                        </span>
                      )}
                      {teacher && (
                        <motion.button
                          type="button"
                          whileTap={{ scale: 0.9 }}
                          onClick={e => { e.stopPropagation(); setConfirmTarget(m) }}
                          aria-label={"Remove " + m.fullName}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-red-600 opacity-0 transition-all hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-950/40"
                        >
                          <UserMinus className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )
        )}
      </div>

      {/* Confirm remove modal */}
      <Modal
        isOpen={!!confirmTarget}
        onClose={() => setConfirmTarget(null)}
        title="Remove student"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/40">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-[13px] text-red-900 dark:text-red-200">
              Remove <strong className="font-bold">{confirmTarget?.fullName}</strong> from this course?
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setConfirmTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={isRemoving}
              onClick={() =>
                confirmTarget &&
                removeMember(confirmTarget.userId, {
                  onSuccess: () => setConfirmTarget(null),
                })
              }
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}